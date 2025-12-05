from django.urls import path
from .views import BulkTransferUploadAPIView, BulkTransferStatusAPIView, ExportBulkTransferCSV

urlpatterns = [
    path('bulk/upload/', BulkTransferUploadAPIView.as_view(), name='bulk-upload'),
    path('bulk/status/<int:job_id>/', BulkTransferStatusAPIView.as_view(), name='bulk-status'),

    path('bulk/export/csv/<int:job_id>/', ExportBulkTransferCSV.as_view(), name='bulk-export-csv'),
]