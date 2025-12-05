from django.shortcuts import render

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .services import execute_p2p_transfer_via_sdk 
from .models import Account, Transfer
from .serializers import P2PTransferSerializer, TransferListSerializer


class P2PTransferAPIView(APIView):
    """API pour les transferts P2P individuels"""
    
    def get(self, request):
        # Format JSON de test
        test_json = {
            "sender_msisdn": "22990001234",
            "receiver_msisdn": "22997654321",
            "amount": "5000.00",
            "currency": "XOF",
            "note": "Test transfer"
        }
        return Response({
            "message": "P2P Transfer API is up.",
            "test_json": test_json
        }, status=status.HTTP_200_OK)
    
    def post(self, request):
        serializer = P2PTransferSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        
        try:
            sender_account = Account.objects.get(msisdn=data['sender_msisdn'])
        except Account.DoesNotExist:
            return Response(
                {"error": "Sender account not found in local DB."},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Appel au service qui exécute le transfert via le SDK/Mojaloop
        sdk_result = execute_p2p_transfer_via_sdk(
            sender_msisdn=sender_account.msisdn,
            receiver_id_type="MSISDN",  # Type par défaut pour P2P
            receiver_id_value=data['receiver_msisdn'],
            amount=data['amount'],
            currency=data.get('currency', 'XOF'),
            note=data.get('note', 'Transfert P2P')
        )
        
        # Enregistrement de la trace locale (succès ou échec)
        new_transfer = Transfer.objects.create(
            sender=sender_account,
            receiver_msisdn=data['receiver_msisdn'],
            amount=data['amount'],
            currency=data.get('currency', 'XOF'),
            transfer_id=sdk_result.get('transfer_id'),
            home_transaction_id=sdk_result['home_transaction_id'],
            status='MOJALOOP_COMPLETED' if sdk_result['success'] else 'FAILED',
            sdk_response_data=sdk_result.get('data') or sdk_result,
            note=data.get('note', 'Transfert P2P')
        )

        if sdk_result['success']:
            return Response({
                "message": "Mojaloop P2P Transfer COMPLETED.",
                "transfer_id": new_transfer.transfer_id,
                "home_transaction_id": new_transfer.home_transaction_id,
                "status": new_transfer.status,
                "amount": str(new_transfer.amount),
                "currency": new_transfer.currency,
            }, status=status.HTTP_201_CREATED)
        else:
            return Response({
                "message": "Mojaloop P2P Transfer FAILED.",
                "details": sdk_result.get('error', 'Unknown error'),
                "home_transaction_id": new_transfer.home_transaction_id,
            }, status=status.HTTP_503_SERVICE_UNAVAILABLE)


class TransferListAPIView(APIView):
    """API pour lister les transactions"""
    
    def get(self, request):
        # Filtres optionnels
        sender_msisdn = request.query_params.get('sender_msisdn')
        status_filter = request.query_params.get('status')
        limit = int(request.query_params.get('limit', 50))
        
        queryset = Transfer.objects.all().order_by('-created_at')
        
        if sender_msisdn:
            queryset = queryset.filter(sender__msisdn=sender_msisdn)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        transfers = queryset[:limit]
        serializer = TransferListSerializer(transfers, many=True)
        
        return Response({
            "count": queryset.count(),
            "transfers": serializer.data
        }, status=status.HTTP_200_OK)