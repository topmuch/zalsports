# Guide de déploiement ZalSports sur Coolify

Ce guide détaille les étapes pour déployer l'application ZalSports sur une instance Coolify.

---

## 1. Prérequis

- **Coolify** installé et fonctionnel (v4.x ou supérieur)
- **Un domaine** configuré avec un enregistrement DNS pointant vers votre serveur Coolify
- **Accès au code source** via un dépôt Git (GitHub, GitLab, Gitea, etc.)
- **Docker** installé sur le serveur Coolify

---

## 2. Déploiement pas à pas

### Étape 1 : Préparer le dépôt Git

Assurez-vous que les fichiers suivants sont présents à la racine de votre dépôt :

```
├── Dockerfile
├── docker-compose.yml
├── coolify.yaml
├── .dockerignore
├── package.json
├── bun.lock
├── prisma/schema.prisma
└── src/
```

### Étape 2 : Créer le service dans Coolify

1. Connectez-vous à votre interface Coolify
2. Cliquez sur **+ Add New Resource** > **Public Repository** (ou Private si applicable)
3. Sélectionnez votre dépôt Git contenant le code ZalSports
4. Coolify détectera automatiquement le `Dockerfile` et la configuration

### Étape 3 : Configurer le build

1. Dans les paramètres du service, allez dans l'onglet **Build**
2. Vérifiez que le **Docker Build Context** est défini sur `.`
3. Vérifiez que le **Dockerfile Path** est `Dockerfile`

### Étape 4 : Configurer les variables d'environnement

Dans l'onglet **Environment**, ajoutez les variables suivantes :

| Variable | Valeur par défaut | Description |
|---|---|---|
| `DATABASE_URL` | `file:/app/data/zalsports.db` | Chemin de la base de données SQLite |
| `ADMIN_USERNAME` | `admin` | Nom d'utilisateur administrateur |
| `ADMIN_PASSWORD` | `zalsports2024` | Mot de passe administrateur |
| `ADMIN_SECRET` | `change-me-in-production` | Secret pour les tokens d'authentification |
| `NODE_ENV` | `production` | Environnement d'exécution |

### Étape 5 : Configurer le volume de données

1. Allez dans l'onglet **Volumes** du service
2. Ajoutez un volume :
   - **Source** : `zalsports_data`
   - **Destination** : `/app/data`

Ce volume persiste la base de données SQLite entre les redémarrages et mises à jour.

### Étape 6 : Configurer le domaine

1. Allez dans l'onglet **Domains**
2. Ajoutez votre domaine (ex : `zalsports.votre-domaine.com`)
3. Coolify configurera automatiquement le certificat SSL via Let's Encrypt

### Étape 7 : Déployer

1. Cliquez sur **Deploy** pour lancer le premier déploiement
2. Le build prendra quelques minutes (installation des dépendances, génération Prisma, build Next.js)
3. Une fois terminé, l'application sera accessible sur votre domaine

---

## 3. Variables d'environnement détaillées

### `DATABASE_URL`

Définit l'emplacement de la base de données SQLite. La valeur par défaut utilise un volume Docker persistant.

```
DATABASE_URL=file:/app/data/zalsports.db
```

### `ADMIN_USERNAME`

Nom d'utilisateur pour accéder au panneau d'administration. Changez-le pour une valeur personnalisée.

### `ADMIN_PASSWORD`

Mot de passe pour le compte administrateur. **Modifiez obligatoirement cette valeur en production.**

### `ADMIN_SECRET`

Secret utilisé pour la signature des tokens JWT. **Doit être une chaîne aléatoire longue et unique en production.**

Pour générer un secret sécurisé :

```bash
openssl rand -hex 32
```

---

## 4. Changer les identifiants administrateur

### Depuis l'interface Coolify

1. Allez dans le service ZalSports
2. Onglet **Environment**
3. Modifiez les variables :
   - `ADMIN_USERNAME` : votre nouveau nom d'utilisateur
   - `ADMIN_PASSWORD` : votre nouveau mot de passe
   - `ADMIN_SECRET` : un nouveau secret généré avec `openssl rand -hex 32`
4. Cliquez sur **Save** puis **Redeploy** pour appliquer les changements

### Depuis le fichier docker-compose.yml

Vous pouvez aussi modifier les valeurs par défaut dans `docker-compose.yml` et pousser les changements sur le dépôt Git. Coolify détectera le changement et proposera un redéploiement.

> ⚠️ **Important** : Ne commitez jamais de mots de passe ou secrets en clair dans le dépôt Git en production. Utilisez les variables d'environnement de Coolify pour les valeurs sensibles.

---

## 5. Persistance des données

L'application utilise une base de données SQLite stockée dans `/app/data/zalsports.db` à l'intérieur du conteneur.

Un volume Docker nommé `zalsports_data` est monté sur ce répertoire pour garantir :

- **La persistance** : les données survivent aux redémarrages du conteneur
- **La sécurité** : les données sont isolées dans un volume dédié
- **Les mises à jour** : lors d'un nouveau déploiement, les données existantes sont conservées

### Sauvegarder les données

Pour créer une sauvegarde de la base de données :

```bash
# Copier la base depuis le conteneur vers l'hôte
docker cp <nom_du_conteneur>:/app/data/zalsports.db ./backup-$(date +%Y%m%d).db
```

### Restaurer les données

```bash
docker cp ./backup-20240101.db <nom_du_conteneur>:/app/data/zalsports.db
docker restart <nom_du_conteneur>
```

---

## 6. Mettre à jour le déploiement

### Mise à jour automatique (recommandée)

1. Poussez vos modifications sur la branche principale du dépôt Git
2. Coolify détecte automatiquement le nouveau commit
3. Si l'option **Auto Deploy** est activée, le déploiement se lance automatiquement

### Mise à jour manuelle

1. Poussez vos modifications sur le dépôt Git
2. Dans l'interface Coolify, allez sur le service ZalSports
3. Cliquez sur **Deploy** pour forcer un redéploiement

### Rollback

En cas de problème après une mise à jour :

1. Allez dans l'onglet **Deploy** du service
2. Sélectionnez l'image précédente dans l'historique des déploiements
3. Cliquez sur **Redeploy** pour revenir à la version antérieure

---

## Dépannage

### Le conteneur ne démarre pas

- Vérifiez les logs dans Coolify (onglet **Logs**)
- Assurez-vous que le volume `zalsports_data` est bien monté
- Vérifiez les variables d'environnement

### Erreur de base de données

- Vérifiez que `DATABASE_URL` est correctement défini
- Assurez-vous que le volume `/app/data` est accessible en écriture
- Si nécessaire, supprimez le volume et redéployez pour recréer la base

### Problème de certificat SSL

- Vérifiez que le domaine DNS pointe bien vers le serveur Coolify
- Coolify doit pouvoir atteindre le port 80/443 pour la validation Let's Encrypt

---

## Architecture du conteneur

```
┌─────────────────────────────────┐
│  oven/bun:1-alpine (production) │
│                                  │
│  /app/server.js          (app)   │
│  /app/.next/static/       (ASSETS)│
│  /app/public/              (IMG)  │
│  /app/data/                (DB)   │
│    └── zalsports.db               │
│  /app/scripts/start.sh    (ENTRY)│
│                                  │
│  Port 3000                      │
└─────────────────────────────────┘
```
