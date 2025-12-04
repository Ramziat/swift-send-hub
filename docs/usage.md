# Prise en main

## Prérequis
- Node.js et npm

## Installation
```bash
npm install
npm run dev
```

## Configuration de l'API (optionnel)
Copiez `.env.example` vers `.env` et ajustez:
```
VITE_API_BASE_URL=http://localhost:8000
VITE_API_INDIVIDUAL_PAYMENT_PATH=/api/payments/individual/
VITE_API_BULK_PAYMENT_PATH=/api/payments/bulk/
VITE_API_TRANSACTIONS_PATH=/api/transactions/
```

Si vous utilisez Django (session/cookies):
- `django-cors-headers` avec `CORS_ALLOW_CREDENTIALS = True`
- Autoriser l'origine Vite (ex. `http://localhost:5173`)
- `CSRF_TRUSTED_ORIGINS` et cookie `csrftoken`

## Lancer
```bash
npm run dev
```

## Utilisation
- Menu « Envoyer »: paiement individuel
- Menu « Masse »: import CSV, édition des bénéficiaires, envoi, rapport
- Modale de succès: filtres (Tous/Réussis/Échoués), export CSV/PDF, confirmation vocale

## Tests rapides
- Sans backend: la simulation est active automatiquement.
- Avec backend: définissez `VITE_API_BASE_URL` et démarrez votre serveur.
