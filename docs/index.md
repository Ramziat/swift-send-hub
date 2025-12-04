# Swift Send Hub

Bienvenue dans la documentation de Swift Send Hub.

Swift Send Hub est une application web de transfert d'argent construite avec Vite, React, TypeScript et shadcn-ui. Elle prend en charge :

- Envoi individuel de paiements
- Paiements de masse (CSV)
- Historique et statistiques
- Confirmation vocale et notifications Web
- Export des rapports en CSV/PDF

## Structure du projet

```
src/
  components/
  pages/
  utils/
  lib/
```

- `components/payment/`: UI paiement (form, CSV, tableau, modale succès)
- `utils/`: helpers (formatage, export CSV/PDF, notifications, voix)
- `lib/`: client API (fetch wrapper + endpoints)

## Principales fonctionnalités

- Fallback sans backend (simulation) ou connexion à un backend Django via `.env`
- Rapport détaillé après paiements de masse avec filtres et export
- Notifications côté expéditeur et confirmation vocale

Pour démarrer, voir la page « Prise en main ». 
