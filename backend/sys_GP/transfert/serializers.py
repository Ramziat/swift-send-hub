from rest_framework import serializers
from .models import Transfer


class P2PTransferSerializer(serializers.Serializer):
    """Sérialiseur pour les transferts P2P"""
    sender_msisdn = serializers.CharField(max_length=15)
    receiver_msisdn = serializers.CharField(max_length=15)
    amount = serializers.DecimalField(max_digits=10, decimal_places=2)
    note = serializers.CharField(required=False, allow_blank=True, default='Transfert P2P')
    currency = serializers.CharField(max_length=10, required=False, default='XOF')


class TransferListSerializer(serializers.ModelSerializer):
    """Sérialiseur pour lister les transactions"""
    sender_msisdn = serializers.CharField(source='sender.msisdn', read_only=True)
    sender_name = serializers.CharField(source='sender.name', read_only=True)
    
    class Meta:
        model = Transfer
        fields = [
            'id',
            'sender_msisdn',
            'sender_name',
            'receiver_msisdn',
            'amount',
            'currency',
            'status',
            'transfer_id',
            'home_transaction_id',
            'note',
            'created_at',
        ]