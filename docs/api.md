# API & Backend

## Intégration Django

Le client HTTP (`src/lib/api.ts`) supporte:
- `credentials: 'include'` pour les cookies/session
- Envoi automatique du header CSRF (`X-CSRFToken`) si le cookie est présent

Endpoints utilisés (`src/lib/paymentApi.ts`):
- `POST /api/payments/individual/` { phone_number, full_name, amount }
- `POST /api/payments/bulk/` { recipients: [{ phone_number, full_name, amount }] }
- `GET /api/transactions/`

Si `VITE_API_BASE_URL` n'est pas défini, l'application simule les paiements.

## Exemple DRF minimal
```python
@api_view(["POST"]) 
def individual_payment(request):
    # TODO: exécuter le paiement
    return Response({"status": "success"})

@api_view(["POST"]) 
def bulk_payment(request):
    recipients = request.data.get("recipients", [])
    results = [{"phone_number": r.get("phone_number"), "status": "success"} for r in recipients]
    return Response({"status": "ok", "results": results})
```

## Rapport & export
Le rapport utilise `PaymentReportTable` et propose:
- Filtres (Tous, Réussis, Échoués)
- Export CSV (`utils/export.ts`)
- Export PDF (`utils/export.ts`, `jspdf`, `jspdf-autotable`)
