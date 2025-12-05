# Swift Send Hub

Bienvenue dans la documentation de **Swift Send Hub**.

Swift Send Hub est une application complète de transfert d'argent avec intégration Mojaloop, comprenant :

- 🖥️ **Frontend** : React + TypeScript + Vite + shadcn-ui
- ⚙️ **Backend** : Django REST Framework + Mojaloop SDK

## Fonctionnalités

- ✅ Envoi individuel de paiements (P2P)
- ✅ Paiements de masse via fichier CSV
- ✅ Historique et statistiques des transactions
- ✅ Confirmation vocale et notifications Web
- ✅ Export des rapports en CSV/PDF
- ✅ Mode simulation (sans SDK Mojaloop)

---

## Documentation

### Frontend

| Document | Description |
|----------|-------------|
| [Prise en main](usage.md) | Installation et configuration du frontend |

### Backend

| Document | Description |
|----------|-------------|
| [Vue d'ensemble](backend/README.md) | Architecture et présentation du backend |
| [Installation](backend/installation.md) | Guide d'installation complet |
| [Configuration](backend/configuration.md) | Variables d'environnement et paramètres |
| [Référence API](backend/api-reference.md) | Documentation des endpoints REST |
| [Modèles de données](backend/models.md) | Structure de la base de données |
| [Tests](backend/testing.md) | Guide de test avec exemples |
| [Intégration Mojaloop](backend/mojaloop-integration.md) | Connexion au réseau Mojaloop |

---

## Structure du projet

```
swift-send-hub/
├── frontend/                # Application React
│   ├── src/
│   │   ├── components/      # Composants UI
│   │   ├── pages/           # Pages (Index, SendMoney, BulkPayment)
│   │   ├── lib/             # Client API, i18n
│   │   └── utils/           # Helpers (CSV, PDF, notifications)
│   └── .env                 # Configuration frontend
├── backend/
│   └── sys_GP/              # Application Django
│       ├── sgp/             # Configuration Django
│       ├── transfert/       # App transferts P2P
│       ├── bulk_transfers/  # App transferts de masse
│       └── bulk_uploads/    # Fichiers CSV uploadés
└── docs/                    # Documentation
```

---

## Démarrage rapide

### Backend (Terminal 1)

```bash
cd backend/sys_GP
python manage.py runserver 8000
```

### Frontend (Terminal 2)

```bash
cd frontend
npm install
npm run dev
```

### Accès

- **Frontend** : http://localhost:8080
- **Backend API** : http://localhost:8000/api/v1/
- **Admin Django** : http://localhost:8000/admin/

---

## Technologies

| Couche | Technologies |
|--------|--------------|
| Frontend | React 18, TypeScript, Vite, TailwindCSS, shadcn-ui |
| Backend | Django 6.0, Django REST Framework, SQLite |
| Intégration | Mojaloop SDK Scheme Adapter | 
