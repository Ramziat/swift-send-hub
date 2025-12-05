# Référence API

## Base URL

```
http://localhost:8000/api/v1/
```

## Authentification

L'API utilise actuellement une authentification basée sur les cookies CSRF pour les requêtes POST. Les requêtes GET sont publiques.

---

## Transferts P2P

### GET /transfers/p2p/

Vérifie que l'API est active et retourne un exemple de payload.

**Requête :**

```bash
curl http://localhost:8000/api/v1/transfers/p2p/
```

**Réponse 200 OK :**

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

### POST /transfers/p2p/

Exécute un transfert P2P individuel.

**Requête :**

```bash
curl -X POST http://localhost:8000/api/v1/transfers/p2p/ \
  -H "Content-Type: application/json" \
  -d '{
    "sender_msisdn": "22990001234",
    "receiver_msisdn": "22997654321",
    "amount": "5000.00",
    "currency": "XOF",
    "note": "Paiement test"
  }'
```

**Paramètres :**

| Champ | Type | Requis | Description |
|-------|------|--------|-------------|
| `sender_msisdn` | string | ✅ | Numéro de téléphone de l'expéditeur (doit exister en base) |
| `receiver_msisdn` | string | ✅ | Numéro de téléphone du bénéficiaire |
| `amount` | decimal | ✅ | Montant à transférer |
| `currency` | string | ❌ | Devise (défaut: `XOF`) |
| `note` | string | ❌ | Note/description du transfert |

**Réponse 201 Created (Succès) :**

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

**Réponse 404 Not Found (Expéditeur inconnu) :**

```json
{
  "error": "Sender account not found in local DB."
}
```

**Réponse 503 Service Unavailable (SDK non disponible) :**

```json
{
  "message": "Mojaloop P2P Transfer FAILED.",
  "details": "SDK Request Failed: Connection refused",
  "home_transaction_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

---

### GET /transfers/

Liste toutes les transactions.

**Requête :**

```bash
curl http://localhost:8000/api/v1/transfers/
```

**Paramètres de requête (optionnels) :**

| Paramètre | Type | Description |
|-----------|------|-------------|
| `sender_msisdn` | string | Filtrer par expéditeur |
| `status` | string | Filtrer par statut (`MOJALOOP_COMPLETED`, `FAILED`, `PROCESSING`) |
| `limit` | int | Nombre maximum de résultats (défaut: 50) |

**Exemple avec filtres :**

```bash
curl "http://localhost:8000/api/v1/transfers/?sender_msisdn=22990001234&status=MOJALOOP_COMPLETED&limit=10"
```

**Réponse 200 OK :**

```json
{
  "count": 15,
  "transfers": [
    {
      "id": 1,
      "sender_msisdn": "22990001234",
      "sender_name": "Test User",
      "receiver_msisdn": "22997654321",
      "amount": "5000.00",
      "currency": "XOF",
      "status": "MOJALOOP_COMPLETED",
      "transfer_id": "SIM-A1B2C3D4E5F6",
      "home_transaction_id": "550e8400-e29b-41d4-a716-446655440000",
      "note": "Paiement test",
      "created_at": "2025-12-05T01:30:00Z"
    }
  ]
}
```

---

## Transferts de Masse (Bulk)

### POST /bulk/upload/

Upload un fichier CSV et lance le traitement des transferts.

**Requête :**

```bash
curl -X POST http://localhost:8000/api/v1/bulk/upload/ \
  -F "file=@recipients.csv" \
  -F "sender_msisdn=22990001234"
```

**Paramètres (multipart/form-data) :**

| Champ | Type | Requis | Description |
|-------|------|--------|-------------|
| `file` | file | ✅ | Fichier CSV avec les bénéficiaires |
| `sender_msisdn` | string | ✅ | Numéro de l'expéditeur |

**Format du fichier CSV :**

```csv
type_id,valeur_id,devise,montant,nom_complet
MSISDN,22990112233,XOF,1000,Jean Dupont
MSISDN,22991234567,XOF,2500,Marie Martin
PERSONAL_ID,123456789,XOF,5000,Pierre Bernard
```

| Colonne | Description |
|---------|-------------|
| `type_id` | Type d'identifiant (`MSISDN`, `PERSONAL_ID`, `BUSINESS`) |
| `valeur_id` | Numéro/ID du bénéficiaire |
| `devise` | Code devise (`XOF`, `USD`) |
| `montant` | Montant à transférer |
| `nom_complet` | Nom du bénéficiaire |

**Réponse 202 Accepted :**

```json
{
  "message": "Bulk transfer job initiated and completed (synchronous mode).",
  "job_id": 5,
  "status": "COMPLETED",
  "total_processed": 3,
  "url_status": "/api/v1/bulk/status/5"
}
```

**Réponse 500 Internal Server Error :**

```json
{
  "message": "Bulk transfer job failed during processing.",
  "error": "Column 'montant' not found",
  "job_id": 5
}
```

---

### GET /bulk/status/{job_id}/

Récupère le statut détaillé d'un job de transfert de masse.

**Requête :**

```bash
curl http://localhost:8000/api/v1/bulk/status/5/
```

**Réponse 200 OK :**

```json
{
  "job_id": 5,
  "statut_job": "COMPLETED",
  "message_execution": "Exécution terminée avec succès partiel : 3 réussis, 0 en échec.",
  "total_transfers": 3,
  "reussi_count": 3,
  "echoue_count": 0,
  "en_attente_count": 0,
  "tableau_details": [
    {
      "beneficiary": "22990112233",
      "montant": "1000.00",
      "devise": "XOF",
      "statut": "MOJALOOP_COMPLETED",
      "horodatage": "2025-12-05 01:45:00",
      "id_transaction": "550e8400-e29b-41d4-a716-446655440000"
    },
    {
      "beneficiary": "22991234567",
      "montant": "2500.00",
      "devise": "XOF",
      "statut": "MOJALOOP_COMPLETED",
      "horodatage": "2025-12-05 01:45:01",
      "id_transaction": "550e8400-e29b-41d4-a716-446655440001"
    }
  ]
}
```

**Réponse 404 Not Found :**

```json
{
  "error": "Bulk job not found."
}
```

---

### GET /bulk/export/csv/{job_id}/

Exporte le rapport détaillé d'un job en fichier CSV.

**Requête :**

```bash
curl http://localhost:8000/api/v1/bulk/export/csv/5/ -o rapport.csv
```

**Réponse 200 OK :**

Télécharge un fichier CSV :

```csv
Bénéficiaire,Montant,Devise,Référence,Statut,Message erreur,Horodatage,ID transaction
22990112233,1000.00,XOF,Bulk: Jean Dupont - Job 5,MOJALOOP_COMPLETED,,2025-12-05 01:45:00,550e8400-...
22991234567,2500.00,XOF,Bulk: Marie Martin - Job 5,MOJALOOP_COMPLETED,,2025-12-05 01:45:01,550e8400-...
```

---

## Codes de statut HTTP

| Code | Signification |
|------|---------------|
| `200` | Succès (GET) |
| `201` | Ressource créée (POST) |
| `202` | Accepté, traitement en cours |
| `400` | Requête invalide (données manquantes ou incorrectes) |
| `404` | Ressource non trouvée |
| `500` | Erreur serveur interne |
| `503` | Service non disponible (SDK Mojaloop) |

## Statuts de transfert

| Statut | Description |
|--------|-------------|
| `INITIATED` | Transfert créé, en attente de traitement |
| `PROCESSING` | Transfert en cours d'exécution |
| `MOJALOOP_COMPLETED` | Transfert réussi via Mojaloop |
| `FAILED` | Transfert échoué |

## Statuts de job (Bulk)

| Statut | Description |
|--------|-------------|
| `UPLOADED` | Fichier uploadé, en attente de traitement |
| `PROCESSING` | Traitement des transferts en cours |
| `COMPLETED` | Tous les transferts ont été traités |
| `FAILED` | Échec du traitement du job |
