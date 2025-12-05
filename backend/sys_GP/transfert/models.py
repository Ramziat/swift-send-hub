from django.db import models
import uuid

class Account(models.Model):
    """Simule le compte d'un DFSP client (l'Expéditeur)."""
    msisdn = models.CharField(max_length=15, unique=True)
    name = models.CharField(max_length=100)
    balance = models.DecimalField(max_digits=12, decimal_places=2, default=1000.00) # Solde local (pour l'affichage/la validation simulée)

    def __str__(self):
        return f"{self.name} ({self.msisdn})"

class Transfer(models.Model):
    """Trace une transaction unique à travers le SDK/Mojaloop."""
    STATE_CHOICES = (
        ('INITIATED', 'Initiated in Django'),
        ('MOJALOOP_COMPLETED', 'Transfer Completed on Hub'),
        ('FAILED', 'Transfer Failed'),
    )
    
    sender = models.ForeignKey(Account, on_delete=models.CASCADE, related_name='sent_transfers')
    receiver_msisdn = models.CharField(max_length=15)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    currency = models.CharField(max_length=3, default='XOF') 
    status = models.CharField(max_length=50, choices=STATE_CHOICES, default='INITIATED')

    bulk_job = models.ForeignKey(
        'bulk_transfers.BulkTransferJob', # Référence par chaîne avant la création
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True
    )
    
    # Identifiants du Protocole Mojaloop/SDK
    # Remarque sur les identifiants reçus du SDK/Mojaloop :
    # Le SDK peut renvoyer des identifiants au format non-UUID (par exemple encodage base32).
    # Pour éviter les erreurs de validation lors de l'enregistrement, nous stockons ces valeurs
    # dans des champs `CharField` (nullable) plutôt que des `UUIDField`.
    # `transfer_id`: identifiant renvoyé par le SDK pour le transfert (peut être non-UUID)
    transfer_id = models.CharField(max_length=128, null=True, blank=True)
    # `home_transaction_id`: identifiant de la transaction côté hub/SDK (peut être non-UUID)
    home_transaction_id = models.CharField(max_length=64, null=True, blank=True)
    # Devise du transfert (ex: 'USD', 'XOF')
    currency = models.CharField(max_length=10, default='USD')

    # Réponse brute du SDK pour le débogage
    sdk_response_data = models.JSONField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    note = models.CharField(max_length=255, default='Transfert P2P', blank=True)
    # Lien vers le Job de masse (voir section 3)
    bulk_job = models.ForeignKey('bulk_transfers.BulkTransferJob', on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self):
        return f"Transfert {self.id} ({self.status}) de {self.sender.msisdn} vers {self.receiver_msisdn}"