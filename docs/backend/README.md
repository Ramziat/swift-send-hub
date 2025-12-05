# Backend Swift Send Hub

## Vue d'ensemble

Le backend de Swift Send Hub est une **API REST Django** conçue pour gérer les transferts d'argent P2P (Person-to-Person) et les transferts de masse via intégration avec le **SDK Mojaloop**.

## Architecture

```
backend/sys_GP/
├── sgp/                    # Configuration Django principale
│   ├── settings.py         # Paramètres (DB, CORS, Apps)
│   ├── urls.py             # Routes principales
│   └── wsgi.py             # Point d'entrée WSGI
├── transfert/              # App: Transferts P2P individuels
│   ├── models.py           # Account, Transfer
│   ├── views.py            # P2PTransferAPIView, TransferListAPIView
│   ├── serializers.py      # Validation des données
│   ├── services.py         # Intégration SDK Mojaloop
│   └── urls.py             # Routes /api/v1/transfers/
├── bulk_transfers/         # App: Transferts de masse
│   ├── models.py           # BulkTransferJob
│   ├── views.py            # Upload, Status, Export CSV
│   ├── serializers.py      # Validation upload
│   ├── process_utils.py    # Traitement CSV
│   └── urls.py             # Routes /api/v1/bulk/
├── bulk_uploads/           # Stockage fichiers CSV uploadés
├── db.sqlite3              # Base de données SQLite
└── manage.py               # CLI Django
```

## Technologies utilisées

| Composant | Technologie                      |
|-----------|----------------------------------|
| Framework | Django 4.2.7                     |
| API REST | Django REST Framework            |
| Base de données | SQLite (dev) / PostgreSQL (prod) |
| Intégration | Mojaloop SDK Scheme Adapter      |
| CORS | django-cors-headers              |

## Fonctionnalités principales

### 1. Transferts P2P (Peer-to-Peer)
- Transfert individuel entre deux comptes
- Validation du compte expéditeur
- Appel au SDK Mojaloop pour exécution
- Enregistrement de la transaction avec statut

### 2. Transferts de masse (Bulk)
- Upload de fichier CSV avec liste de bénéficiaires
- Traitement synchrone des transferts
- Suivi du statut du job (UPLOADED → PROCESSING → COMPLETED)
- Export du rapport en CSV

### 3. Mode Simulation
- Fonctionne sans SDK Mojaloop
- Simule des transferts réussis pour les tests
- Activé par défaut (`SIMULATION_MODE=true`)

## Démarrage rapide

```bash
# 1. Accéder au répertoire backend
cd backend/sys_GP

# 2. Installer les dépendances
pip install -r requirements.txt

# 3. Appliquer les migrations
python manage.py migrate

# 4. Créer un compte expéditeur
python manage.py shell
>>> from transfert.models import Account
>>> Account.objects.get_or_create(msisdn="22990001234", defaults={"name": "Test User", "balance": 1000000})

# 5. Lancer le serveur
python manage.py runserver 8000
```

## Documentation détaillée

- [Installation](installation.md) - Guide d'installation complet
- [Configuration](configuration.md) - Variables d'environnement et paramètres
- [Référence API](api-reference.md) - Documentation des endpoints
- [Modèles de données](models.md) - Structure de la base de données
- [Tests](testing.md) - Guide de test avec exemples
- [Intégration Mojaloop](mojaloop-integration.md) - Connexion au réseau Mojaloop

## Liens utiles

- [Mojaloop Documentation](https://docs.mojaloop.io/)
- [Django REST Framework](https://www.django-rest-framework.org/)
- [Frontend Documentation](../index.md)
