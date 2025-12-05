# bulk_transfers/models.py
from django.db import models
from transfert.models import Account 

class BulkTransferJob(models.Model):
    STATUSES = (
        ('UPLOADED', 'Uploaded'),
        ('PROCESSING', 'Processing'),
        ('COMPLETED', 'Completed'),
        ('FAILED', 'Failed'),
    )

    file = models.FileField(upload_to='bulk_uploads/')
    submitter = models.ForeignKey(Account, on_delete=models.SET_NULL, null=True)
    status = models.CharField(max_length=20, choices=STATUSES, default='UPLOADED')
    created_at = models.DateTimeField(auto_now_add=True)
    total_transfers = models.IntegerField(default=0)
    transfers_completed = models.IntegerField(default=0)

    def __str__(self):
        return f"Bulk Job {self.id} - {self.status}"