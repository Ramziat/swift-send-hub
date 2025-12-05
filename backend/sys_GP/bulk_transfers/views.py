from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import BulkTransferJob
from .process_utils import process_bulk_file 
from .serializers import BulkTransferUploadSerializer, BulkTransferJobSerializer, TransferDetailSerializer
from transfert.models import Transfer 
from django.db.models import Q # Pour filtrer les statuts
from django.http import HttpResponse
import csv

class BulkTransferUploadAPIView(APIView):
    
    def post(self, request, *args, **kwargs):
        serializer = BulkTransferUploadSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # 1. Crée le Job et enregistre le fichier
        job = serializer.save()
        
        # 2. Déclenche le traitement (simulation synchrone pour le moment)
        try:
            # On lit le CSV AVANT traitement pour extraire la liste des bénéficiaires
            file_obj = job.file.open('r')
            import csv
            reader = csv.DictReader(file_obj)
            recipients = []
            total_amount = 0
            for row in reader:
                try:
                    recipients.append({
                        'phoneNumber': row.get('valeur_id', ''),
                        'fullName': row.get('nom_complet', ''),
                        'amount': float(row.get('montant', 0)),
                        'currency': row.get('devise', 'XOF'),
                    })
                    total_amount += float(row.get('montant', 0) or 0)
                except Exception:
                    pass
            file_obj.close()

            process_bulk_file(job.id)
            job.refresh_from_db() # Recharge le statut après l'exécution
        except Exception as e:
            job.status = 'FAILED'
            job.save()
            return Response({
                "message": "Bulk transfer job failed during processing.",
                "error": str(e),
                "job_id": job.id,
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # 3. Réponse enrichie
        return Response({
            "message": "Bulk transfer job initiated and completed (synchronous mode).",
            "job_id": job.id,
            "status": job.status,
            "total_processed": job.total_transfers,
            "total_amount": total_amount,
            "recipients": recipients,
            "url_status": f"/api/v1/bulk/status/{job.id}"
        }, status=status.HTTP_202_ACCEPTED)


class BulkTransferStatusAPIView(APIView):
    
    def get(self, request, job_id):
        try:
            job = BulkTransferJob.objects.get(id=job_id)
        except BulkTransferJob.DoesNotExist:
            return Response({"error": "Bulk job not found."}, status=status.HTTP_404_NOT_FOUND)
            
        # 1. Calcul des agrégations
        total_count = job.total_transfers
        
        # Filtre basé sur les statuts réels dans la DB (MOJALOOP_COMPLETED, FAILED, PROCESSING)
        successful_count = Transfer.objects.filter(
            bulk_job=job, 
            status='MOJALOOP_COMPLETED'
        ).count()
        
        failed_count = Transfer.objects.filter(
            bulk_job=job, 
            status='FAILED'
        ).count()
        
        pending_count = Transfer.objects.filter(
            bulk_job=job,
            status='PROCESSING' # ou tout statut 'en attente' défini
        ).count()

        # 2. Récupération des 10 dernières transactions pour l'affichage du tableau
        # Ordonner par date et prendre les 10 premières (ou les dernières)
        recent_transfers = Transfer.objects.filter(bulk_job=job).order_by('-created_at')[:10]
        details_data = TransferDetailSerializer(recent_transfers, many=True).data
        
        # 3. Construction du Rapport
        report_data = {
            "job_id": job.id,
            "statut_job": job.status,
            "message_execution": f"Exécution terminée avec succès partiel : {successful_count} réussis, {failed_count} en échec.",
            "total_transfers": total_count,
            "reussi_count": successful_count,
            "echoue_count": failed_count,
            "en_attente_count": pending_count,
            "tableau_details": details_data
        }
        
        return Response(report_data, status=status.HTTP_200_OK)
    

class ExportBulkTransferCSV(APIView):
    
    def get(self, request, job_id):
        try:
            job = BulkTransferJob.objects.get(id=job_id)
        except BulkTransferJob.DoesNotExist:
            return Response({"error": "Bulk job not found."}, status=status.HTTP_404_NOT_FOUND)

        # 1. Définition de la réponse HTTP
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = f'attachment; filename="Transfert_{job_id}_report.csv"'

        # 2. Récupération de toutes les transactions du Job
        transfers = Transfer.objects.filter(bulk_job=job).order_by('created_at')

        # 3. Création du writer CSV
        writer = csv.writer(response)
        
        # En-têtes (Assurez-vous qu'elles correspondent aux noms du CSV du rapport)
        writer.writerow(['Bénéficiaire', 'Montant', 'Devise', 'Référence', 'Statut', 'Message erreur', 'Horodatage', 'ID transaction'])
        
        # 4. Écriture des données
        for transfer in transfers:
            # Note: Vous devriez passer par le sérialiseur pour formater les champs
            # Pour l'exemple, nous utilisons les champs bruts du modèle
            row = [
                transfer.receiver_msisdn,
                str(transfer.amount),
                transfer.currency,
                transfer.note or 'N/A', # Utiliser note comme référence temporaire
                transfer.status,
                transfer.sdk_response_data.get('error', '') if transfer.sdk_response_data else '',
                transfer.created_at.strftime('%Y-%m-%d %H:%M:%S'),
                transfer.home_transaction_id,
            ]
            writer.writerow(row)

        return response