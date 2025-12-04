# Swift Send Hub

Application web de transfert d’argent construite avec Vite, React, TypeScript, shadcn-ui et Tailwind CSS.

## Structure du projet

- `frontend/` — Application React (Vite)
- `docs/` — Documentation MkDocs (Material)
- `mkdocs.yml` — Configuration de la documentation
- `docker-compose.yml` — Orchestration (à venir)

## Développement

Le frontend se trouve dans `frontend/`.

```bash
git clone <YOUR_GIT_URL>
cd swift-send-hub

# Démarrer le frontend
cd frontend
npm install
npm run dev
```

## Technologies

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## Documentation

La documentation est gérée par MkDocs (Material). Fichiers dans `docs/` et config `mkdocs.yml` à la racine.

```bash
python -m pip install mkdocs mkdocs-material
mkdocs serve
```

## Intégration Backend (optionnel)

Configurer `.env` pour pointer vers un backend Django:

```
# À placer dans frontend/.env
VITE_API_BASE_URL=http://localhost:8000
VITE_API_INDIVIDUAL_PAYMENT_PATH=/api/payments/individual/
VITE_API_BULK_PAYMENT_PATH=/api/payments/bulk/
VITE_API_TRANSACTIONS_PATH=/api/transactions/
```

## Fonctionnalités clés

- Paiement individuel et en masse (CSV)
- Rapport détaillé avec filtres (Tous/Réussis/Échoués)
- Export du rapport en CSV/PDF
- Notifications Web et confirmation vocale
- Intégration possible avec backend Django (CORS + CSRF)

## Commits neutres

- Personnalisez l’auteur et l’email Git:
	```bash
	git config user.name "Votre Nom"
	git config user.email "vous@example.com"
	```
- Rédigez des messages de commit descriptifs sans mention d’outils.
- Supprimez toute référence publique à des plateformes tierces dans la doc si non souhaité.

```bash
# Frontend
npm run dev

# Backend (example)
python manage.py runserver 0.0.0.0:8000
```

With `VITE_API_BASE_URL` set, the app will use the backend endpoints. If not set, it falls back to local simulation for demo purposes.

## Déploiement

Vous pouvez déployer le frontend (build Vite) sur tout hébergeur statique (Netlify, Vercel, GitHub Pages) et brancher un backend Django séparément.
