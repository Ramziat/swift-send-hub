from rest_framework import serializers
from .models import BulkTransferJob
from transfert.models import Account, Transfer

class BulkTransferUploadSerializer(serializers.Serializer):
    """Sérialiseur pour valider l'upload du fichier et l'expéditeur."""
    file = serializers.FileField()
    sender_msisdn = serializers.CharField(max_length=15)

    def validate_sender_msisdn(self, value):
        try:
            Account.objects.get(msisdn=value)
        except Account.DoesNotExist:
            raise serializers.ValidationError("Sender account not found in local DB.")
        return value

    def create(self, validated_data):
        sender = Account.objects.get(msisdn=validated_data['sender_msisdn'])
        job = BulkTransferJob.objects.create(
            file=validated_data['file'],
            submitter=sender,
            status='UPLOADED'
        )
        return job

class BulkTransferJobSerializer(serializers.ModelSerializer):
    """Sérialiseur pour afficher l'état du Job."""
    class Meta:
        model = BulkTransferJob
        fields = '__all__'

#
class TransferDetailSerializer(serializers.ModelSerializer):
    """Sérialiseur pour les détails d'une transaction individuelle dans le rapport."""
    
    # Utilisez le nom de l'expéditeur au lieu de l'objet complet si disponible,
    # sinon, affichez le MSISDN
    beneficiary = serializers.CharField(source='receiver_msisdn') 
    montant = serializers.DecimalField(source='amount', max_digits=10, decimal_places=2)
    devise = serializers.CharField(source='currency')
    # Adaptation des champs de statut
    statut = serializers.CharField(source='status')
    horodatage = serializers.DateTimeField(source='created_at', format="%Y-%m-%d %H:%M:%S")
    id_transaction = serializers.CharField(source='home_transaction_id')
    message_erreur = serializers.SerializerMethodField()

    class Meta:
        model = Transfer
        # Champs requis pour l'affichage du rapport
        fields = ('beneficiary', 'montant', 'devise', 'note', 'statut', 
                  'message_erreur', 'horodatage', 'id_transaction')
        
    def get_message_erreur(self, obj):
        # Récupère l'erreur pertinente si le statut est 'FAILED' ou 'PROCESSING'
        if obj.status == 'FAILED' or obj.status == 'ERROR':
            # Cherchez un champ d'erreur dans sdk_response_data ou utilisez un champ local si vous l'avez
            error = obj.sdk_response_data.get('error') if obj.sdk_response_data else None
            return error or "Compte/Destinataire invalide pour le DFSP cible."
        return "" # Pas de message d'erreur si la transaction a réussi