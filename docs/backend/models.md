# Modèles de Données

## Diagramme des relations

```
┌─────────────┐       ┌─────────────────┐       ┌──────────────────┐
│   Account   │──1:N──│    Transfer     │──N:1──│  BulkTransferJob │
│  (Sender)   │       │  (Transaction)  │       │     (Job)        │
└─────────────┘       └─────────────────┘       └──────────────────┘
```

---

## Account (Compte)

**Fichier :** `transfert/models.py`

Représente un compte expéditeur autorisé à effectuer des transferts.

### Champs

| Champ | Type | Description |
|-------|------|-------------|
| `id` | AutoField | Identifiant unique (PK) |
| `msisdn` | CharField(15) | Numéro de téléphone (**unique**) |
| `name` | CharField(100) | Nom du titulaire |
| `balance` | DecimalField(12,2) | Solde simulé (défaut: 1000.00) |

### Définition Django

```python
class Account(models.Model):
    msisdn = models.CharField(max_length=15, unique=True)
    name = models.CharField(max_length=100)
    balance = models.DecimalField(
        max_digits=12, 
        decimal_places=2, 
        default=1000.00
    )

    def __str__(self):
        return f"{self.name} ({self.msisdn})"
```

### Exemples d'utilisation

```python
# Créer un compte
account = Account.objects.create(
    msisdn="22990001234",
    name="Jean Dupont",
    balance=500000
)

# Récupérer un compte
account = Account.objects.get(msisdn="22990001234")

# Vérifier si un compte existe
exists = Account.objects.filter(msisdn="22990001234").exists()
```

---

## Transfer (Transaction)

**Fichier :** `transfert/models.py`

Représente une transaction de transfert d'argent.

### Champs

| Champ | Type | Description |
|-------|------|-------------|
| `id` | AutoField | Identifiant unique (PK) |
| `sender` | ForeignKey(Account) | Compte expéditeur |
| `receiver_msisdn` | CharField(15) | Numéro du bénéficiaire |
| `amount` | DecimalField(12,2) | Montant transféré |
| `currency` | CharField(10) | Devise (défaut: `XOF`) |
| `status` | CharField(20) | Statut du transfert |
| `transfer_id` | CharField(100) | ID retourné par Mojaloop |
| `home_transaction_id` | CharField(100) | UUID unique de la transaction |
| `note` | TextField | Note/description |
| `bulk_job` | ForeignKey(BulkTransferJob) | Job parent (si bulk) |
| `sdk_response_data` | JSONField | Réponse complète du SDK |
| `created_at` | DateTimeField | Date de création |
| `updated_at` | DateTimeField | Date de mise à jour |

### Statuts possibles

```python
STATE_CHOICES = [
    ('INITIATED', 'Initiated'),
    ('PROCESSING', 'Processing'),
    ('MOJALOOP_COMPLETED', 'Mojaloop Completed'),
    ('FAILED', 'Failed'),
]
```

### Définition Django

```python
class Transfer(models.Model):
    STATE_CHOICES = [
        ('INITIATED', 'Initiated'),
        ('PROCESSING', 'Processing'),
        ('MOJALOOP_COMPLETED', 'Mojaloop Completed'),
        ('FAILED', 'Failed'),
    ]

    sender = models.ForeignKey(
        Account, 
        on_delete=models.CASCADE, 
        related_name='transfers'
    )
    receiver_msisdn = models.CharField(max_length=15)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    currency = models.CharField(max_length=10, default='XOF')
    status = models.CharField(
        max_length=20, 
        choices=STATE_CHOICES, 
        default='INITIATED'
    )
    transfer_id = models.CharField(max_length=100, blank=True, null=True)
    home_transaction_id = models.CharField(max_length=100, blank=True, null=True)
    note = models.TextField(blank=True, null=True)
    bulk_job = models.ForeignKey(
        'bulk_transfers.BulkTransferJob',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='transfers'
    )
    sdk_response_data = models.JSONField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Transfer {self.home_transaction_id}: {self.amount} {self.currency}"
```

### Exemples d'utilisation

```python
# Créer un transfert
transfer = Transfer.objects.create(
    sender=account,
    receiver_msisdn="22997654321",
    amount=5000,
    currency="XOF",
    status="MOJALOOP_COMPLETED",
    home_transaction_id="550e8400-e29b-41d4-a716-446655440000"
)

# Récupérer les transferts d'un compte
transfers = Transfer.objects.filter(sender__msisdn="22990001234")

# Filtrer par statut
successful = Transfer.objects.filter(status="MOJALOOP_COMPLETED")
failed = Transfer.objects.filter(status="FAILED")

# Transferts d'un job bulk
bulk_transfers = Transfer.objects.filter(bulk_job_id=5)
```

---

## BulkTransferJob (Job de masse)

**Fichier :** `bulk_transfers/models.py`

Représente un job de transferts de masse à partir d'un fichier CSV.

### Champs

| Champ | Type | Description |
|-------|------|-------------|
| `id` | AutoField | Identifiant unique (PK) |
| `file` | FileField | Fichier CSV uploadé |
| `submitter` | ForeignKey(Account) | Compte expéditeur |
| `status` | CharField(20) | Statut du job |
| `total_transfers` | IntegerField | Nombre total de lignes |
| `transfers_completed` | IntegerField | Nombre de transferts réussis |
| `created_at` | DateTimeField | Date de création |
| `updated_at` | DateTimeField | Date de mise à jour |

### Statuts possibles

```python
STATUS_CHOICES = [
    ('UPLOADED', 'Uploaded'),
    ('PROCESSING', 'Processing'),
    ('COMPLETED', 'Completed'),
    ('FAILED', 'Failed'),
]
```

### Définition Django

```python
class BulkTransferJob(models.Model):
    STATUS_CHOICES = [
        ('UPLOADED', 'Uploaded'),
        ('PROCESSING', 'Processing'),
        ('COMPLETED', 'Completed'),
        ('FAILED', 'Failed'),
    ]

    file = models.FileField(upload_to='bulk_uploads/')
    submitter = models.ForeignKey(
        'transfert.Account',
        on_delete=models.CASCADE,
        related_name='bulk_jobs'
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='UPLOADED'
    )
    total_transfers = models.IntegerField(default=0)
    transfers_completed = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"BulkJob {self.id}: {self.status} ({self.transfers_completed}/{self.total_transfers})"
```

### Exemples d'utilisation

```python
# Récupérer un job
job = BulkTransferJob.objects.get(id=5)

# Statistiques du job
print(f"Statut: {job.status}")
print(f"Total: {job.total_transfers}")
print(f"Réussis: {job.transfers_completed}")

# Transferts associés
transfers = job.transfers.all()
successful = job.transfers.filter(status="MOJALOOP_COMPLETED").count()
failed = job.transfers.filter(status="FAILED").count()
```

---

## Relations entre modèles

### Account → Transfer (1:N)

Un compte peut effectuer plusieurs transferts.

```python
# Tous les transferts d'un compte
account = Account.objects.get(msisdn="22990001234")
transfers = account.transfers.all()
```

### BulkTransferJob → Transfer (1:N)

Un job de masse contient plusieurs transferts.

```python
# Tous les transferts d'un job
job = BulkTransferJob.objects.get(id=5)
transfers = job.transfers.all()

# Ou en filtrant
transfers = Transfer.objects.filter(bulk_job=job)
```

### Account → BulkTransferJob (1:N)

Un compte peut soumettre plusieurs jobs de masse.

```python
# Tous les jobs d'un compte
account = Account.objects.get(msisdn="22990001234")
jobs = account.bulk_jobs.all()
```

---

## Migrations

### Créer les migrations

```bash
python manage.py makemigrations transfert
python manage.py makemigrations bulk_transfers
```

### Appliquer les migrations

```bash
python manage.py migrate
```

### Voir le SQL généré

```bash
python manage.py sqlmigrate transfert 0001
python manage.py sqlmigrate bulk_transfers 0001
```
