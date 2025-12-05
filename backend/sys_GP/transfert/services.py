# transfers/services.py (Version Corrigée)

import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry
import uuid
import json
import decimal
import os

# L'URL de votre SDK Scheme Adapter
SDK_URL = os.environ.get("MOJALOOP_SDK_URL", "http://localhost:4001")

# Mode simulation : si True, simule un succès sans appeler le SDK
# SIMULATION_MODE=true  → simulation (pas de SDK)
# SIMULATION_MODE=false → utilise vraiment Mojaloop SDK
SIMULATION_MODE = os.environ.get("SIMULATION_MODE", "true").lower() == "true"


def _make_requests_session_with_retries(total_retries=3, backoff_factor=0.5, status_forcelist=(500, 502, 503, 504)):
    session = requests.Session()
    retries = Retry(
        total=total_retries,
        backoff_factor=backoff_factor,
        status_forcelist=status_forcelist,
        allowed_methods=frozenset(['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD'])
    )
    adapter = HTTPAdapter(max_retries=retries)
    session.mount('http://', adapter)
    session.mount('https://', adapter)
    return session


# Signature adaptée pour le Bulk
def execute_p2p_transfer_via_sdk(sender_msisdn, receiver_id_type, receiver_id_value, amount, currency, note, home_transaction_id=None):
    """
    Exécute le flux Mojaloop complet (Parties, Quote, Transfer) via le SDK /transfers endpoint.
    Utilise le type d'ID et la valeur d'ID pour le destinataire, comme lu depuis le CSV.
    
    Si SIMULATION_MODE=true, simule un transfert réussi sans appeler le SDK.
    """
    
    if home_transaction_id is None:
        home_transaction_id = uuid.uuid4()

    try:
        amount_decimal = decimal.Decimal(str(amount))
        normalized = amount_decimal.normalize()
        amount_str = format(normalized, 'f')
        if '.' in amount_str:
            amount_str = amount_str.rstrip('0').rstrip('.')
    except decimal.InvalidOperation:
        amount_str = str(amount)
    
    # MODE SIMULATION : Retourne un succès simulé
    if SIMULATION_MODE:
        return {
            "success": True,
            "transfer_id": f"SIM-{uuid.uuid4().hex[:12].upper()}",
            "status": "COMPLETED",
            "data": {
                "transferId": f"SIM-{uuid.uuid4().hex[:12].upper()}",
                "currentState": "COMPLETED",
                "from": {"idType": "MSISDN", "idValue": sender_msisdn},
                "to": {"idType": receiver_id_type, "idValue": receiver_id_value},
                "amount": amount_str,
                "currency": currency,
                "note": note,
                "simulated": True
            },
            "home_transaction_id": str(home_transaction_id)
        }
    
    payload = {
        "from": {
            "displayName": "Django DFSP Client",
            "idType": "MSISDN", 
            "idValue": sender_msisdn
        },
        "to": {
            # Correction : Utilisation des variables dynamiques du Bulk
            "idType": receiver_id_type, 
            "idValue": receiver_id_value  
        },
        "amountType": "SEND",
        "currency": currency, 
        "amount": amount_str,
        "transactionType": "TRANSFER",
        "note": note,
        "homeTransactionId": str(home_transaction_id)
    }

    headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }

    session = _make_requests_session_with_retries()

    try:
        response = session.post(f"{SDK_URL}/transfers", json=payload, headers=headers, timeout=30)
        response.raise_for_status()

        sdk_data = response.json()

        return {
            "success": True,
            "transfer_id": sdk_data.get('transferId'),
            "status": sdk_data.get('currentState'),
            "data": sdk_data,
            "home_transaction_id": str(home_transaction_id)
        }

    except requests.exceptions.RequestException as e:
        error_text = None
        try:
            error_text = getattr(e.response, 'text', None) or str(e)
        except Exception:
            error_text = str(e)

        return {
            "success": False,
            "error": f"SDK Request Failed: {error_text}",
            "home_transaction_id": str(home_transaction_id)
        }