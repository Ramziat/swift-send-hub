import csv
from io import TextIOWrapper
from transfert.services import execute_p2p_transfer_via_sdk
from transfert.models import Transfer
from .models import BulkTransferJob

def process_bulk_file(job_id):
    """
    Lit le CSV, déclenche un transfert Mojaloop pour chaque ligne via la fonction de service.
    """
    try:
        job = BulkTransferJob.objects.get(id=job_id)
    except BulkTransferJob.DoesNotExist:
        return

    job.status = 'PROCESSING'
    job.save()
    
    sender_account = job.submitter
    total_count = 0
    completed_count = 0
    
    # TextIOWrapper pour lire le fichier uploadé (important pour gérer les fichiers sur le disque)
    file_content = TextIOWrapper(job.file.file, encoding='utf-8')
    reader = csv.DictReader(file_content)
    
    for row in reader:
        total_count += 1
        
        try:
            # --- MAPPAGE DIRECT DES COLONNES DU CSV ---
            # Colonnes: type_id, valeur_id, devise, montant, nom_complet
            receiver_id_type = row['type_id']
            receiver_id_value = row['valeur_id'] # Le numéro d'identification réel (MSISDN, etc.)
            amount = row['montant'] 
            currency = row['devise'] 
            note = f"Bulk: {row.get('nom_complet', 'N/A')} - Job {job.id}" 

            # --- APPEL À LA FONCTION DE SERVICE CORRIGÉE ---
            # La fonction execute_p2p_transfer_via_sdk doit utiliser la nouvelle signature
            sdk_result = execute_p2p_transfer_via_sdk(
                sender_msisdn=sender_account.msisdn,
                receiver_id_type=receiver_id_type,
                receiver_id_value=receiver_id_value,
                amount=amount,
                currency=currency,
                note=note
            )
            
            # Enregistrement de la trace locale du transfert individuel
            Transfer.objects.create(
                sender=sender_account,
                receiver_msisdn=receiver_id_value, 
                amount=amount,
                currency=currency, 
                bulk_job=job,
                transfer_id=sdk_result.get('transfer_id'),
                home_transaction_id=sdk_result['home_transaction_id'],
                status='MOJALOOP_COMPLETED' if sdk_result['success'] else 'FAILED',
                sdk_response_data=sdk_result.get('data') or sdk_result
            )
            
            if sdk_result['success']:
                completed_count += 1
            
        except KeyError as e:
            print(f"Erreur: Colonne manquante dans le CSV ({e}). Ligne {total_count} ignorée.")
        except Exception as e:
            print(f"Erreur fatale de traitement de ligne {total_count} pour Job {job.id}: {e}")
            
    # Mise à jour finale
    job.total_transfers = total_count
    job.transfers_completed = completed_count
    job.status = 'COMPLETED'
    job.save()