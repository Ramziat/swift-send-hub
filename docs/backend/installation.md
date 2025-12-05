# Installation du Backend

## Prérequis

- **Python** 3.10 ou supérieur
- **pip** (gestionnaire de paquets Python)
- **virtualenv** (recommandé)
- **SQLite** (inclus avec Python) ou **PostgreSQL** (production)

## Installation pas à pas

### 1. Cloner le projet

```bash
git clone <repository-url>
cd swift-send-hub/backend/sys_GP
```

### 2. Créer un environnement virtuel

```bash
# Créer l'environnement
python -m venv venv

# Activer l'environnement
# Linux/macOS:
source venv/bin/activate

# Windows:
venv\Scripts\activate
```

### 3. Installer les dépendances

```bash
pip install django djangorestframework django-cors-headers requests
```

Ou créer un fichier `requirements.txt` :

```txt
Django>=4.2
djangorestframework>=3.14
django-cors-headers>=4.3
requests>=2.31
```

Puis installer :

```bash
pip install -r requirements.txt
```

### 4. Appliquer les migrations

```bash
python manage.py makemigrations
python manage.py migrate
```

### 5. Créer un superutilisateur (optionnel)

```bash
python manage.py createsuperuser
```

### 6. Créer un compte expéditeur de test

```bash
python manage.py shell
```

```python
from transfert.models import Account

# Créer ou récupérer le compte
account, created = Account.objects.get_or_create(
    msisdn="22990001234",
    defaults={
        "name": "Test Sender",
        "balance": 1000000  # 1 000 000 XOF
    }
)
print(f"Compte {'créé' if created else 'existant'}: {account.name} ({account.msisdn})")
exit()
```

### 7. Lancer le serveur de développement

```bash
python manage.py runserver 8000
```

Le backend est accessible sur : **http://localhost:8000**

## Vérification de l'installation

### Test de l'API

```bash
curl http://localhost:8000/api/v1/transfers/p2p/
```

Réponse attendue :

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

### Interface d'administration

1. Accédez à **http://localhost:8000/admin/**
2. Connectez-vous avec le superutilisateur
3. Gérez les comptes et transactions

## Installation pour la production

### 1. Base de données PostgreSQL

Modifier `settings.py` :

```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'swift_send_db',
        'USER': 'postgres',
        'PASSWORD': 'your_password',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}
```

Installer le driver :

```bash
pip install psycopg2-binary
```

### 2. Variables d'environnement

Créer un fichier `.env` dans `backend/sys_GP/` :

```bash
DEBUG=False
SECRET_KEY=your-production-secret-key
ALLOWED_HOSTS=yourdomain.com,api.yourdomain.com
DATABASE_URL=postgres://user:pass@host:5432/dbname
SIMULATION_MODE=false
MOJALOOP_SDK_URL=http://your-mojaloop-sdk:4001
```

### 3. Fichiers statiques

```bash
python manage.py collectstatic
```

### 4. Serveur WSGI (Gunicorn)

```bash
pip install gunicorn
gunicorn sgp.wsgi:application --bind 0.0.0.0:8000
```

## Dépannage

### Erreur "No module named 'transfert'"

Vérifiez que vous êtes dans le bon répertoire :

```bash
cd backend/sys_GP
```

### Erreur CORS

Vérifiez que le frontend est autorisé dans `settings.py` :

```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:8080",
    "http://localhost:5173",
]
```

### Erreur de migration

Supprimez les fichiers de migration et la base de données :

```bash
rm -rf transfert/migrations/0*.py
rm -rf bulk_transfers/migrations/0*.py
rm db.sqlite3
python manage.py makemigrations
python manage.py migrate
```
