from django.urls import path
from transfert.views import P2PTransferAPIView, TransferListAPIView

urlpatterns = [
    path('transfers/p2p/', P2PTransferAPIView.as_view(), name='p2p-transfer'),
    path('transfers/', TransferListAPIView.as_view(), name='transfer-list'),
]
