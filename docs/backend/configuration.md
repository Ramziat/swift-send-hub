# Configuration

## Fichier de configuration principal

**Fichier :** `sgp/settings.py`

---

## Variables d'environnement

### Mode Simulation

```bash
# Activer le mode simulation (défaut: true)
SIMULATION_MODE=true

# Désactiver pour utiliser le vrai SDK Mojaloop
SIMULATION_MODE=false
```

### SDK Mojaloop

```bash
# URL du SDK Scheme Adapter Mojaloop
MOJALOOP_SDK_URL=http://localhost:4001
```

### Django

```bash
# Mode debug (désactiver en production)
DEBUG=True

# Clé secrète (générer une nouvelle en production)
SECRET_KEY=your-secret-key

# Hôtes autorisés
ALLOWED_HOSTS=localhost,127.0.0.1
```

### Base de données (Production)

```bash
DATABASE_URL=postgres://user:password@host:5432/dbname
```

---

## Configuration Django (settings.py)

### Applications installées

```python
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'transfert',           # App transferts P2P
    'bulk_transfers',      # App transferts de masse
    'rest_framework',      # Django REST Framework
    'corsheaders',         # Gestion CORS
]
```

### Middleware

```python
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # CORS en premier
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]
```

### Configuration CORS

```python
# Origines autorisées
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:8080",
    "http://127.0.0.1:8080",
]

# Autoriser les cookies/credentials
CORS_ALLOW_CREDENTIALS = True

# Headers autorisés
CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]
```

### Configuration CSRF

```python
# Origines de confiance pour CSRF
CSRF_TRUSTED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:8080",
    "http://127.0.0.1:8080",
]
```

### Base de données

#### SQLite (Développement)

```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}
```

#### PostgreSQL (Production)

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

### Fichiers média (uploads)

```python
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'
```

---

## Configuration du service SDK

**Fichier :** `transfert/services.py`

```python
import os

# URL du SDK Mojaloop
SDK_URL = os.environ.get("MOJALOOP_SDK_URL", "http://localhost:4001")

# Mode simulation (défaut: true)
SIMULATION_MODE = os.environ.get("SIMULATION_MODE", "true").lower() == "true"
```

### Comportement selon le mode

| Mode | SDK_URL | Comportement |
|------|---------|--------------|
| `SIMULATION_MODE=true` | Ignoré | Simule des transferts réussis |
| `SIMULATION_MODE=false` | Utilisé | Appelle le SDK Mojaloop |

---

## Configuration des URLs

**Fichier :** `sgp/urls.py`

```python
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/', include('transfert.urls')),
    path('api/v1/', include('bulk_transfers.urls')),
]
```

### Routes disponibles

| Préfixe | Application | Description |
|---------|-------------|-------------|
| `/admin/` | Django Admin | Interface d'administration |
| `/api/v1/transfers/` | transfert | API transferts P2P |
| `/api/v1/bulk/` | bulk_transfers | API transferts de masse |

---

## Fichier .env (Exemple)

Créez un fichier `.env` dans `backend/sys_GP/` :

```bash
# Django
DEBUG=True
SECRET_KEY=django-insecure-change-this-in-production

# Hôtes
ALLOWED_HOSTS=localhost,127.0.0.1

# Mode simulation
SIMULATION_MODE=true

# SDK Mojaloop (ignoré si SIMULATION_MODE=true)
MOJALOOP_SDK_URL=http://localhost:4001

# Base de données (optionnel, défaut SQLite)
# DATABASE_URL=postgres://user:pass@localhost:5432/swift_send_db
```

### Charger les variables d'environnement

Installez `python-dotenv` :

```bash
pip install python-dotenv
```

Dans `settings.py` :

```python
from dotenv import load_dotenv
load_dotenv()

DEBUG = os.environ.get('DEBUG', 'True') == 'True'
SECRET_KEY = os.environ.get('SECRET_KEY', 'default-dev-key')
```

---

## Configuration de production

### Checklist de sécurité

1. ❌ `DEBUG = False`
2. ✅ Générer une nouvelle `SECRET_KEY`
3. ✅ Configurer `ALLOWED_HOSTS` avec les vrais domaines
4. ✅ Utiliser HTTPS
5. ✅ Configurer une vraie base de données (PostgreSQL)
6. ✅ `SIMULATION_MODE = false`
7. ✅ Configurer `MOJALOOP_SDK_URL` avec le vrai SDK

### Exemple settings production

```python
import os

DEBUG = False
SECRET_KEY = os.environ['SECRET_KEY']
ALLOWED_HOSTS = ['yourdomain.com', 'api.yourdomain.com']

# HTTPS
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True

# HSTS
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
```
