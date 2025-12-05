# Guide de Test

Ce guide présente différentes méthodes pour tester le backend Swift Send Hub.

---

## Prérequis

1. **Backend démarré** sur `http://localhost:8000`
2. **Compte expéditeur créé** avec le msisdn `22990001234`
3. **Mode simulation activé** (par défaut)

```bash
cd backend/sys_GP
python manage.py runserver 8000
```

---

## Tests avec cURL

### Test 1 : Vérifier que l'API est active

```bash
curl http://localhost:8000/api/v1/transfers/p2p/
```

**Résultat attendu :**

```json
{
  "message": "P2P Transfer API is up.",
  "test_json": {
    "sender_msisdn": "22990001234",
    "receiver_msisdn": "22997654321",
    "amount": "5000.00",
    "currency": "XOF",
    "note": "Test transfer"
  }
}
```

---

### Test 2 : Transfert P2P individuel

```bash
curl -X POST http://localhost:8000/api/v1/transfers/p2p/ \
  -H "Content-Type: application/json" \
  -d '{
    "sender_msisdn": "22990001234",
    "receiver_msisdn": "22997654321",
    "amount": "5000.00",
    "currency": "XOF",
    "note": "Test paiement individuel"
  }'
```

**Résultat attendu (succès) :**

```json
{
  "message": "Mojaloop P2P Transfer COMPLETED.",
  "transfer_id": "SIM-A1B2C3D4E5F6",
  "home_transaction_id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "MOJALOOP_COMPLETED",
  "amount": "5000.00",
  "currency": "XOF"
}
```

---

### Test 3 : Expéditeur inexistant

```bash
curl -X POST http://localhost:8000/api/v1/transfers/p2p/ \
  -H "Content-Type: application/json" \
  -d '{
    "sender_msisdn": "0000000000",
    "receiver_msisdn": "22997654321",
    "amount": "1000.00"
  }'
```

**Résultat attendu (erreur 404) :**

```json
{
  "error": "Sender account not found in local DB."
}
```

---

### Test 4 : Liste des transactions

```bash
curl http://localhost:8000/api/v1/transfers/
```

**Résultat attendu :**

```json
{
  "count": 2,
  "transfers": [
    {
      "id": 1,
      "sender_msisdn": "22990001234",
      "sender_name": "Test User",
      "receiver_msisdn": "22997654321",
      "amount": "5000.00",
      "currency": "XOF",
      "status": "MOJALOOP_COMPLETED",
      "created_at": "2025-12-05T01:30:00Z"
    }
  ]
}
```

---

## Tests de Transferts de Masse

### Test 5 : Créer un fichier CSV de test

```bash
cat > /tmp/test_bulk.csv << 'EOF'
type_id,valeur_id,devise,montant,nom_complet
MSISDN,22990112233,XOF,1000,Jean Dupont
MSISDN,22991234567,XOF,2500,Marie Martin
MSISDN,22992345678,XOF,5000,Pierre Bernard
EOF
```

### Test 6 : Upload et traitement du CSV

```bash
curl -X POST http://localhost:8000/api/v1/bulk/upload/ \
  -F "file=@/tmp/test_bulk.csv" \
  -F "sender_msisdn=22990001234"
```

**Résultat attendu :**

```json
{
  "message": "Bulk transfer job initiated and completed (synchronous mode).",
  "job_id": 1,
  "status": "COMPLETED",
  "total_processed": 3,
  "url_status": "/api/v1/bulk/status/1"
}
```

---

### Test 7 : Vérifier le statut du job

```bash
curl http://localhost:8000/api/v1/bulk/status/1/
```

**Résultat attendu :**

```json
{
  "job_id": 1,
  "statut_job": "COMPLETED",
  "message_execution": "Exécution terminée avec succès partiel : 3 réussis, 0 en échec.",
  "total_transfers": 3,
  "reussi_count": 3,
  "echoue_count": 0,
  "en_attente_count": 0,
  "tableau_details": [...]
}
```

---

### Test 8 : Exporter le rapport CSV

```bash
curl http://localhost:8000/api/v1/bulk/export/csv/1/ -o rapport.csv
cat rapport.csv
```

**Contenu du fichier :**

```csv
Bénéficiaire,Montant,Devise,Référence,Statut,Message erreur,Horodatage,ID transaction
22990112233,1000.00,XOF,Bulk: Jean Dupont - Job 1,MOJALOOP_COMPLETED,,2025-12-05 01:45:00,...
22991234567,2500.00,XOF,Bulk: Marie Martin - Job 1,MOJALOOP_COMPLETED,,2025-12-05 01:45:01,...
```

---

### Test 9 : Utiliser un fichier CSV existant

```bash
# Petit fichier (3 bénéficiaires)
curl -X POST http://localhost:8000/api/v1/bulk/upload/ \
  -F "file=@bulk_uploads/test_bulk.csv" \
  -F "sender_msisdn=22990001234"

# Fichier moyen (22 bénéficiaires)
curl -X POST http://localhost:8000/api/v1/bulk/upload/ \
  -F "file=@bulk_uploads/test_bulk_XAhcrvE.csv" \
  -F "sender_msisdn=22990001234"
```

---

## Tests avec Python

### Script de test complet

```python
#!/usr/bin/env python3
"""Script de test du backend Swift Send Hub"""

import requests
import json

BASE_URL = "http://localhost:8000/api/v1"

def test_api_health():
    """Test 1: Vérifier que l'API est active"""
    print("🧪 Test 1: API Health Check")
    response = requests.get(f"{BASE_URL}/transfers/p2p/")
    assert response.status_code == 200
    data = response.json()
    assert "message" in data
    print(f"   ✅ {data['message']}")

def test_p2p_transfer():
    """Test 2: Transfert P2P"""
    print("🧪 Test 2: Transfert P2P")
    payload = {
        "sender_msisdn": "22990001234",
        "receiver_msisdn": "22997654321",
        "amount": "1000.00",
        "currency": "XOF",
        "note": "Test Python"
    }
    response = requests.post(
        f"{BASE_URL}/transfers/p2p/",
        json=payload
    )
    print(f"   Status: {response.status_code}")
    data = response.json()
    if response.status_code == 201:
        print(f"   ✅ Transfer ID: {data.get('transfer_id')}")
    else:
        print(f"   ❌ Erreur: {data}")

def test_transfer_list():
    """Test 3: Liste des transferts"""
    print("🧪 Test 3: Liste des transferts")
    response = requests.get(f"{BASE_URL}/transfers/")
    assert response.status_code == 200
    data = response.json()
    print(f"   ✅ {data['count']} transferts trouvés")

def test_bulk_upload():
    """Test 4: Upload CSV"""
    print("🧪 Test 4: Upload CSV de masse")
    
    # Créer un CSV temporaire
    csv_content = """type_id,valeur_id,devise,montant,nom_complet
MSISDN,22990112233,XOF,500,Test User 1
MSISDN,22991234567,XOF,750,Test User 2"""
    
    files = {
        'file': ('test.csv', csv_content, 'text/csv')
    }
    data = {
        'sender_msisdn': '22990001234'
    }
    
    response = requests.post(
        f"{BASE_URL}/bulk/upload/",
        files=files,
        data=data
    )
    print(f"   Status: {response.status_code}")
    result = response.json()
    
    if response.status_code == 202:
        job_id = result.get('job_id')
        print(f"   ✅ Job ID: {job_id}")
        print(f"   ✅ Total: {result.get('total_processed')}")
        return job_id
    else:
        print(f"   ❌ Erreur: {result}")
        return None

def test_bulk_status(job_id):
    """Test 5: Statut du job"""
    print(f"🧪 Test 5: Statut du job {job_id}")
    response = requests.get(f"{BASE_URL}/bulk/status/{job_id}/")
    assert response.status_code == 200
    data = response.json()
    print(f"   ✅ Statut: {data['statut_job']}")
    print(f"   ✅ Réussis: {data['reussi_count']}")
    print(f"   ✅ Échoués: {data['echoue_count']}")

if __name__ == "__main__":
    print("=" * 50)
    print("🚀 Tests Backend Swift Send Hub")
    print("=" * 50)
    
    test_api_health()
    test_p2p_transfer()
    test_transfer_list()
    job_id = test_bulk_upload()
    if job_id:
        test_bulk_status(job_id)
    
    print("=" * 50)
    print("✅ Tous les tests terminés!")
```

### Exécuter le script

```bash
pip install requests
python test_backend.py
```

---

## Tests avec HTTPie

HTTPie est une alternative à cURL plus lisible.

```bash
pip install httpie
```

### Exemples

```bash
# GET - Vérifier l'API
http GET localhost:8000/api/v1/transfers/p2p/

# POST - Transfert P2P
http POST localhost:8000/api/v1/transfers/p2p/ \
  sender_msisdn=22990001234 \
  receiver_msisdn=22997654321 \
  amount=5000 \
  currency=XOF

# POST - Upload CSV (avec fichier)
http -f POST localhost:8000/api/v1/bulk/upload/ \
  file@/tmp/test_bulk.csv \
  sender_msisdn=22990001234

# GET - Statut du job
http GET localhost:8000/api/v1/bulk/status/1/
```

---

## Tests Django intégrés

### Créer des tests unitaires

**Fichier :** `transfert/tests.py`

```python
from django.test import TestCase
from rest_framework.test import APIClient
from .models import Account, Transfer

class TransferAPITest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.account = Account.objects.create(
            msisdn="22990001234",
            name="Test Account",
            balance=100000
        )

    def test_api_health(self):
        response = self.client.get('/api/v1/transfers/p2p/')
        self.assertEqual(response.status_code, 200)

    def test_p2p_transfer_success(self):
        data = {
            "sender_msisdn": "22990001234",
            "receiver_msisdn": "22997654321",
            "amount": "1000.00",
            "currency": "XOF"
        }
        response = self.client.post('/api/v1/transfers/p2p/', data, format='json')
        self.assertIn(response.status_code, [201, 503])

    def test_p2p_transfer_unknown_sender(self):
        data = {
            "sender_msisdn": "0000000000",
            "receiver_msisdn": "22997654321",
            "amount": "1000.00"
        }
        response = self.client.post('/api/v1/transfers/p2p/', data, format='json')
        self.assertEqual(response.status_code, 404)
```

### Exécuter les tests Django

```bash
python manage.py test transfert
python manage.py test bulk_transfers
python manage.py test  # Tous les tests
```

---

## Vérification en base de données

### Via Django Shell

```bash
python manage.py shell
```

```python
from transfert.models import Account, Transfer
from bulk_transfers.models import BulkTransferJob

# Comptes
Account.objects.all()

# Transferts récents
Transfer.objects.order_by('-created_at')[:5]

# Jobs de masse
BulkTransferJob.objects.all()

# Statistiques
print(f"Comptes: {Account.objects.count()}")
print(f"Transferts: {Transfer.objects.count()}")
print(f"Réussis: {Transfer.objects.filter(status='MOJALOOP_COMPLETED').count()}")
print(f"Échoués: {Transfer.objects.filter(status='FAILED').count()}")
```

### Via Django Admin

1. Accédez à **http://localhost:8000/admin/**
2. Connectez-vous avec le superutilisateur
3. Explorez les modèles Account et Transfer
