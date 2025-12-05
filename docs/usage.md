# Prise en main du Frontend

## Prérequis

- **Node.js** 18+ et **npm**
- **Backend Django** démarré (voir [Installation Backend](backend/installation.md))

## Installation

```bash
cd frontend
npm install
```

## Configuration

Copiez `.env.example` vers `.env` :

```bash
cp ../.env.example .env
```

Contenu du fichier `.env` :

```bash
# Backend Django API
VITE_API_BASE_URL=http://localhost:8000

# Endpoints API
VITE_API_INDIVIDUAL_PAYMENT_PATH=/api/v1/transfers/p2p/
VITE_API_BULK_PAYMENT_PATH=/api/v1/bulk/upload/
VITE_API_TRANSACTIONS_PATH=/api/v1/transfers/

# CSRF Configuration
VITE_API_CSRF_COOKIE_NAME=csrftoken
VITE_API_CSRF_HEADER_NAME=X-CSRFToken

# Frontend origin
VITE_FRONTEND_ORIGIN=http://localhost:8080
```

## Lancer le frontend

```bash
npm run dev
```

L'application est accessible sur : **http://localhost:8080**

---

## Utilisation

### Paiement individuel

1. Cliquez sur **« Envoyer de l'argent »**
2. Remplissez le formulaire :
   - Numéro de téléphone du bénéficiaire
   - Nom complet
   - Montant (ou cliquez sur un montant prédéfini)
3. Cliquez sur **« Envoyer »**
4. Une modale de succès s'affiche avec confirmation vocale

### Paiement de masse

1. Cliquez sur **« Paiement groupé »**
2. Téléchargez l'exemple CSV ou uploadez votre fichier
3. Vérifiez la liste des bénéficiaires
4. Cliquez sur **« Envoyer les paiements »**
5. Consultez le rapport avec filtres (Tous/Réussis/Échoués)
6. Exportez en CSV ou PDF

### Format CSV attendu

```csv
type_id,valeur_id,devise,montant,nom_complet
MSISDN,22990112233,XOF,1000,Jean Dupont
MSISDN,22991234567,XOF,2500,Marie Martin
PERSONAL_ID,123456789,XOF,5000,Pierre Bernard
```

---

## Modes de fonctionnement

### Mode simulation (sans backend)

Si `VITE_API_BASE_URL` n'est pas défini, le frontend utilise automatiquement une simulation locale :
- Les paiements sont simulés avec 90% de succès
- Les données sont stockées dans `localStorage`

### Mode connecté (avec backend)

Avec `VITE_API_BASE_URL` configuré :
- Les paiements passent par l'API Django
- Le backend appelle le SDK Mojaloop (ou simule si `SIMULATION_MODE=true`)
- Les transactions sont enregistrées en base de données

---

## Dépannage

### Erreur CORS

Vérifiez que le backend autorise votre origine :

```python
# backend/sys_GP/sgp/settings.py
CORS_ALLOWED_ORIGINS = [
    "http://localhost:8080",
]
```

### Le paiement échoue (503)

Le SDK Mojaloop n'est pas disponible. Activez le mode simulation :

```bash
# Dans le backend
SIMULATION_MODE=true python manage.py runserver 8000
```

### Le compte expéditeur n'existe pas (404)

Créez un compte dans le backend :

```bash
cd backend/sys_GP
python manage.py shell
>>> from transfert.models import Account
>>> Account.objects.get_or_create(msisdn="22990001234", defaults={"name": "Test", "balance": 1000000})
```
