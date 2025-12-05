# Intégration Mojaloop

Ce guide explique comment connecter Swift Send Hub au réseau Mojaloop pour effectuer de vrais transferts.

---

## Qu'est-ce que Mojaloop ?

**Mojaloop** est une plateforme open-source de paiements interopérables développée par la Fondation Gates. Elle permet aux institutions financières (banques, opérateurs mobile money) d'échanger des fonds de manière standardisée.

### Architecture simplifiée

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Swift Send Hub │────▶│  SDK Scheme     │────▶│   Mojaloop      │
│    (Backend)    │     │    Adapter      │     │     Switch      │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │                       │                       │
   Port 8000               Port 4001              Services K8s
```

- **Swift Send Hub** : Votre application backend Django
- **SDK Scheme Adapter** : Pont entre votre app et le switch Mojaloop
- **Mojaloop Switch** : Infrastructure centrale de routage des paiements

---

## Options de déploiement

| Option | Complexité | Recommandé pour |
|--------|------------|-----------------|
| 1. Mode Simulation | ⭐ Facile | Développement, tests rapides |
| 2. Mini-Loop (local) | ⭐⭐⭐ Moyen | Tests d'intégration complets |
| 3. Mojaloop Testing Toolkit | ⭐⭐ Moyen | Tests automatisés |
| 4. Cluster K8s complet | ⭐⭐⭐⭐⭐ Expert | Production, staging |

---

## Option 1 : Mode Simulation (Déjà configuré ✅)

Le mode simulation est **activé par défaut** dans Swift Send Hub.

```bash
# Vérifier le mode
grep SIMULATION_MODE backend/sys_GP/transfert/services.py

# Démarrer avec simulation
cd backend/sys_GP
python manage.py runserver 8000
```

**Avantages :**
- Aucune dépendance externe
- Tests instantanés
- Parfait pour le développement frontend

**Inconvénients :**
- Ne teste pas la vraie intégration Mojaloop

---

## Option 2 : Mini-Loop (Mojaloop local)

**Mini-Loop** est un installateur simplifié pour déployer Mojaloop sur votre machine.

### Prérequis

- **Ubuntu 22.04** (x86_64)
- **16 GB RAM** minimum
- **4 cœurs CPU** minimum
- **50 GB** espace disque

### Installation

```bash
# 1. Cloner mini-loop
git clone https://github.com/mojaloop/mini-loop.git

# 2. Installer Kubernetes + Mojaloop (~30 min)
sudo ./mini-loop/scripts/mini-loop-simple-install.sh

# 3. Recharger l'environnement
source $HOME/.bashrc

# 4. Vérifier l'installation
kubectl get pods -n mojaloop
```

### Vérification

```bash
# Tester avec helm
helm test ml --logs
```

### Configurer Swift Send Hub

```bash
# Désactiver le mode simulation
export SIMULATION_MODE=false
export MOJALOOP_SDK_URL=http://localhost:4001

cd backend/sys_GP
python manage.py runserver 8000
```

---

## Option 3 : SDK Scheme Adapter avec Docker (Testé ✅)

Cette option permet de tester l'intégration avec le SDK Mojaloop sans déployer un cluster complet.

### Structure des fichiers

```
mojaloop-test/
├── docker-compose.yml
├── scheme-adapter.env
└── backend.env
```

### docker-compose.yml

```yaml
services:
  redis:
    image: "redis:6-alpine"
    container_name: redis_mojaloop
    ports:
      - "6380:6379"  # Port 6380 si 6379 déjà utilisé
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 3s
      retries: 5

  # Version stable du SDK (v11.x - pas de Kafka requis)
  scheme-adapter:
    image: "mojaloop/sdk-scheme-adapter:v11.18.11"
    container_name: sdk_scheme_adapter
    env_file: ./scheme-adapter.env
    ports:
      - "4000:4000"  # Inbound API
      - "4001:4001"  # Outbound API (utilisé par Swift Send Hub)
    depends_on:
      redis:
        condition: service_healthy
    extra_hosts:
      - "host.docker.internal:host-gateway"
    restart: on-failure

  mock-backend:
    image: "mojaloop/sdk-mock-dfsp-backend"
    env_file: ./backend.env
    container_name: mock_dfsp_backend
    ports:
      - "23000:3000"
    depends_on:
      - scheme-adapter
```

> ⚠️ **Important** : Utilisez la version `v11.18.11` du SDK. Les versions récentes (`latest`) nécessitent Kafka.

### scheme-adapter.env

```bash
# Configuration SDK Scheme Adapter v11.x
DFSP_ID=swiftsend

# Redis cache
CACHE_HOST=redis
CACHE_PORT=6379

# Endpoints
BACKEND_ENDPOINT=mock-backend:3000
PEER_ENDPOINT=mock-backend:3000

# Mojaloop endpoints (mode standalone - pointe vers mock)
ALS_ENDPOINT=mock-backend:3000
QUOTES_ENDPOINT=mock-backend:3000
TRANSFERS_ENDPOINT=mock-backend:3000

# Auto-accepter pour les tests
AUTO_ACCEPT_PARTY=true
AUTO_ACCEPT_QUOTES=true

# Désactiver la validation JWS pour les tests
VALIDATE_INBOUND_JWS=false
VALIDATE_INBOUND_PUT_PARTIES_JWS=false
JWS_SIGN=false
JWS_SIGN_PUT_PARTIES=false

# Outbound API (pour Swift Send Hub)
OUTBOUND_LISTEN_PORT=4001
INBOUND_LISTEN_PORT=4000

# Logging
LOG_LEVEL=info
```

### backend.env

```bash
OUTBOUND_ENDPOINT=http://scheme-adapter:4001
```

### Lancer les services

```bash
cd mojaloop-test

# Arrêter les anciens conteneurs si existants
docker compose down -v

# Démarrer
docker compose up -d

# Vérifier que Redis est healthy (~10 sec)
docker compose ps

# Voir les logs du SDK
docker compose logs -f scheme-adapter
```

### Configurer Swift Send Hub

```bash
# Lancer avec Mojaloop SDK
cd backend/sys_GP
SIMULATION_MODE=false python manage.py runserver 8000
```

Ou modifier directement `backend/sys_GP/transfert/services.py` :

```python
# Pour utiliser Mojaloop SDK
SIMULATION_MODE = os.environ.get("SIMULATION_MODE", "true").lower() == "true"
# Puis lancer avec: SIMULATION_MODE=false python manage.py runserver 8000
```

### Comportement attendu

Quand vous testez avec cette configuration :

| Étape | Log SDK | Signification |
|-------|---------|---------------|
| 1 | `Request passed validation` | ✅ Requête reçue |
| 2 | `Transfer is transitioning from none to start` | ✅ Transfert initialisé |
| 3 | `Executing HTTP GET: .../parties/MSISDN/...` | ✅ Recherche du bénéficiaire |
| 4 | `statusCode: 3204` | ⚠️ Bénéficiaire non trouvé (normal avec mock vide) |

> **Note** : L'erreur `3204 - Party not found` est **normale** car le mock-backend ne contient pas de parties enregistrées. Cela prouve que l'intégration fonctionne correctement.

### Exemple de logs SDK (succès d'intégration)

```json
{
  "msg": "Transfer fc0a4dc0-e18e-4863-a3b1-107338b7daaa is transitioning from start to payeeResolved",
  "ctx": {
    "app": "mojaloop-sdk-outbound-api",
    "request": { "path": "/transfers", "method": "POST" }
  }
}
```

Ces logs confirment que **Swift Send Hub communique bien avec le SDK Mojaloop**.

---

## Option 4 : Mojaloop Testing Toolkit (TTK)

Le **Testing Toolkit** permet de tester votre intégration avec des scénarios prédéfinis.

### Installation

```bash
# Via Docker
docker run -p 5050:5050 mojaloop/ml-testing-toolkit

# Accéder à l'interface
open http://localhost:5050
```

### Utilisation avec Swift Send Hub

1. Configurez le TTK pour pointer vers votre backend
2. Exécutez les collections de tests P2P
3. Vérifiez les résultats dans l'interface web

---

## Format des requêtes SDK

### Requête de transfert (Outbound API)

Swift Send Hub envoie ce format au SDK (`POST http://localhost:4001/transfers`) :

```json
{
  "homeTransactionId": "550e8400-e29b-41d4-a716-446655440000",
  "from": {
    "idType": "MSISDN",
    "idValue": "22990001234",
    "displayName": "Sender Name"
  },
  "to": {
    "idType": "MSISDN",
    "idValue": "22997654321"
  },
  "amountType": "SEND",
  "currency": "XOF",
  "amount": "5000",
  "transactionType": "TRANSFER",
  "note": "Payment note"
}
```

### Réponse du SDK (succès)

```json
{
  "homeTransactionId": "550e8400-e29b-41d4-a716-446655440000",
  "transferId": "b51ec534-ee48-4575-b6a9-ead2955b8069",
  "currentState": "COMPLETED",
  "fulfil": {
    "transferState": "COMMITTED",
    "completedTimestamp": "2025-12-05T02:30:00.000Z"
  }
}
```

### Réponse du SDK (échec)

```json
{
  "homeTransactionId": "550e8400-e29b-41d4-a716-446655440000",
  "currentState": "ERROR_OCCURRED",
  "lastError": {
    "httpStatusCode": 500,
    "mojaloopError": {
      "errorCode": "3100",
      "errorDescription": "Payee FSP not found"
    }
  }
}
```

---

## Tests de bout en bout

### 1. Préparer l'environnement

```bash
# Terminal 1 : Démarrer le SDK (Option 3)
cd mojaloop-test
docker-compose up

# Terminal 2 : Démarrer Swift Send Hub
cd backend/sys_GP
SIMULATION_MODE=false python manage.py runserver 8000

# Terminal 3 : Démarrer le frontend
cd frontend
npm run dev
```

### 2. Créer un compte expéditeur

```bash
cd backend/sys_GP
python manage.py shell
```

```python
from transfert.models import Account
Account.objects.get_or_create(
    msisdn="22990001234",
    defaults={"name": "Test Sender", "balance": 1000000}
)
exit()
```

### 3. Effectuer un transfert

```bash
curl -X POST http://localhost:8000/api/v1/transfers/p2p/ \
  -H "Content-Type: application/json" \
  -d '{
    "sender_msisdn": "22990001234",
    "receiver_msisdn": "22997654321",
    "amount": "1000.00",
    "currency": "XOF",
    "note": "Test Mojaloop"
  }'
```

### 4. Vérifier les logs

```bash
# Logs du SDK
docker-compose logs -f scheme-adapter

# Logs Django
# Visibles dans le terminal du serveur
```

---

## Dépannage

### Erreur "Connection refused" sur port 4001

Le SDK n'est pas démarré :

```bash
docker compose ps
docker compose up -d scheme-adapter
```

### Erreur "ECONNREFUSED" Redis dans les logs SDK

Le SDK démarre avant que Redis ne soit prêt. Solutions :

1. **Vérifier que Redis est healthy** :
```bash
docker compose ps
# Redis doit afficher "healthy"
```

2. **Utiliser le healthcheck** dans docker-compose.yml (déjà configuré dans Option 3)

3. **Redémarrer les services** :
```bash
docker compose down -v
docker compose up -d
```

### Erreur "Port 6379 already in use"

Un autre Redis tourne sur votre machine :

```bash
# Utiliser un port différent dans docker-compose.yml
ports:
  - "6380:6379"  # Port externe 6380
```

### Erreur "3204 - Party not found"

C'est **normal** avec le mock-backend vide ! Cela signifie que :
- ✅ Swift Send Hub communique avec le SDK
- ✅ Le SDK fonctionne correctement
- ⚠️ Le bénéficiaire n'existe pas dans le mock

Pour un vrai test de bout en bout, vous auriez besoin d'un cluster Mojaloop complet (Mini-Loop).

### Erreur "Sender account not found in local DB"

Créez le compte expéditeur dans Django :

```bash
cd backend/sys_GP
python manage.py shell
```

```python
from transfert.models import Account
Account.objects.get_or_create(
    msisdn="22990001234",
    defaults={"name": "Test Sender", "balance": 1000000}
)
exit()
```

### Erreur avec SDK version "latest" (Kafka required)

Les versions récentes du SDK nécessitent Kafka. Utilisez la version stable :

```yaml
scheme-adapter:
  image: "mojaloop/sdk-scheme-adapter:v11.18.11"
```

### Retour au mode simulation

```bash
cd backend/sys_GP
SIMULATION_MODE=true python manage.py runserver 8000
```

Ou sans variable d'environnement (simulation par défaut) :
```bash
python manage.py runserver 8000
```

---

## Ressources

- [Documentation Mojaloop](https://docs.mojaloop.io/)
- [SDK Scheme Adapter GitHub](https://github.com/mojaloop/sdk-scheme-adapter)
- [Mini-Loop GitHub](https://github.com/mojaloop/mini-loop)
- [Mojaloop Testing Toolkit](https://github.com/mojaloop/ml-testing-toolkit)
- [Postman Collections](https://github.com/mojaloop/postman)
- [Vidéo : Déployer Mojaloop](https://youtu.be/BpBbl2UuQxI)
- [Vidéo : Testing Toolkit](https://youtu.be/mGVZNAWDowg)
