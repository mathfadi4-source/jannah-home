# Jannah Home

Site web de vente de matlas couette, draps de lit et parures — **sans paiement en ligne**.

Disponible en **français** (`/fr`) et **arabe** (`/ar`).

## Fonctionnalités

### Côté client
- Consulter les produits avec images, vidéos et prix
- Voir les promotions en cours
- Passer une commande avec : nom, adresse, email, téléphone, tailles couette/drap
- Changer la langue : Français / العربية

### Côté propriétaire (`/admin`)
- Mot de passe par défaut : `admin123` (modifiable dans `.env`)
- Gérer les commandes : statut **Nouvelle**, **En cours**, **Terminée**
- Ajouter/modifier/supprimer des produits (image, vidéo, prix, promo)
- Créer et gérer les promotions

### Notifications WhatsApp
- À chaque nouvelle commande, un message est envoyé au propriétaire : **+216 93 775 858**
- Configurer dans `.env` : `WHATSAPP_OWNER_PHONE` et `CALLMEBOT_API_KEY`

**Activer CallMeBot (gratuit) :**
1. Ajoutez **+34 694 17 28 99** dans vos contacts WhatsApp
2. Envoyez le message : `I allow callmebot to send me messages`
3. Vous recevez une clé API — mettez-la dans `.env` :
   ```
   CALLMEBOT_API_KEY="votre-cle"
   ```
4. Redémarrez le serveur (`npm run dev`)

## Démarrage local

La base de données utilise **PostgreSQL**. Le plus simple en local : créez une base
gratuite sur [neon.tech](https://neon.tech), copiez l'URL de connexion dans un fichier
`.env` (voir `.env.example`), puis :

```bash
npm install
npm run db:push
npm run db:seed
npm run dev
```

> Astuce : vous pouvez aussi lancer une base Postgres locale via Docker
> (`docker compose up -d db`) et utiliser
> `DATABASE_URL="postgresql://jannah:jannah-local-password@localhost:5432/jannah"`.

| Page | URL |
|------|-----|
| Accueil (FR) | http://localhost:3000/fr |
| Accueil (AR) | http://localhost:3000/ar |
| Commander | http://localhost:3000/fr/commander |
| Admin | http://localhost:3000/admin |

Mot de passe admin : `admin123`

---

## Docker (pour un VPS / serveur)

Le projet inclut un `Dockerfile`, un `.dockerignore` et un `docker-compose.yml`. Le
`docker-compose.yml` lance **l'application + une base PostgreSQL** avec des **volumes
persistants** : la base de données et les fichiers téléversés (`public/uploads`)
survivent aux redémarrages et reconstructions.

**Prérequis :** [Docker](https://docs.docker.com/get-docker/) et Docker Compose installés.
L'image utilise **Bun** pour installer les dépendances (build plus rapide) et Node comme runtime.

**Étape 1 — Configurer les variables (optionnel)**

Créez un fichier `.env` à la racine (ne sera pas committé) :

```
ADMIN_PASSWORD="un-mot-de-passe-solide"
POSTGRES_PASSWORD="un-mot-de-passe-db"
WHATSAPP_OWNER_PHONE="21693775858"
CALLMEBOT_API_KEY="votre-cle"
SEED_ON_START="true"   # uniquement au PREMIER lancement (charge les données de démo)
```

**Étape 2 — Construire et lancer**

```bash
docker compose up -d --build
```

Le site est disponible sur http://localhost:3000. Le schéma de base de données est
appliqué automatiquement au démarrage (`prisma db push`).

> ⚠️ `SEED_ON_START=true` **réinitialise** les données (le script de seed efface tout).
> Mettez-le à `true` seulement au premier lancement, puis repassez-le à `false`.

**Commandes utiles**

```bash
docker compose logs -f        # voir les logs
docker compose down           # arrêter
docker compose down -v        # arrêter ET supprimer les données (volumes)
docker compose up -d --build  # reconstruire après une modification du code
```

Pour exposer le site sur Internet, placez un reverse proxy (Nginx, Traefik, Caddy)
devant le port `3000` et activez HTTPS.

---

## Déployer le site en ligne — 100% gratuit

La solution recommandée est **entièrement gratuite** et reste en ligne 24h/24 :

| Élément | Service gratuit | Quota gratuit |
|---------|-----------------|----------------|
| Hébergement du site | **Vercel** (plan Hobby) | suffisant pour une boutique |
| Base de données | **Neon** (PostgreSQL) | 0,5 Go |
| Images / vidéos | **Vercel Blob** | 1 Go |

### Option 1 — Vercel + Neon + Vercel Blob (recommandé, gratuit)

**Étape 1 — Créer la base de données gratuite (Neon)**
1. Allez sur [neon.tech](https://neon.tech) et créez un compte gratuit.
2. Créez un projet → copiez la **connection string** (commence par `postgresql://...`).

**Étape 2 — Envoyer le code sur GitHub**
1. Créez un compte sur [github.com](https://github.com) et un dépôt `jannah-home`.
2. Dans le dossier du projet :

```bash
git init
git add .
git commit -m "Initial commit - Jannah Home"
git branch -M main
git remote add origin https://github.com/VOTRE-NOM/jannah-home.git
git push -u origin main
```

**Étape 3 — Déployer sur Vercel**
1. Allez sur [vercel.com](https://vercel.com) et connectez-vous avec GitHub.
2. Cliquez **Add New Project** → sélectionnez votre dépôt `jannah-home`.
3. Dans **Environment Variables**, ajoutez :
   - `DATABASE_URL` = la connection string Neon de l'étape 1
   - `ADMIN_PASSWORD` = votre mot de passe sécurisé
   - `WHATSAPP_OWNER_PHONE` et `CALLMEBOT_API_KEY` (optionnel)
4. Cliquez **Deploy**.

Le fichier `vercel.json` exécute déjà `prisma generate && prisma db push && next build` : le schéma est donc créé automatiquement dans votre base Neon au premier déploiement.

**Étape 4 — Activer les uploads d'images (Vercel Blob, gratuit)**
1. Dans votre projet Vercel, onglet **Storage** → **Create Database** → **Blob**.
2. Reliez le store au projet. Vercel ajoute automatiquement la variable
   `BLOB_READ_WRITE_TOKEN`. Le code détecte ce token et stocke les fichiers sur Blob.
3. Cliquez **Redeploy** pour appliquer.

> Sans `BLOB_READ_WRITE_TOKEN`, les uploads échoueraient sur Vercel (système de fichiers
> en lecture seule). Avec le token, tout fonctionne automatiquement. En local/Docker, le
> code retombe sur le stockage disque (`public/uploads`).

**Étape 5 — Votre site est en ligne**

Vercel vous donne une URL comme `https://jannah-home.vercel.app`. Vous pouvez ajouter un
domaine personnalisé (ex: `jannahhome.tn`) dans **Settings → Domains**.

---

### Option 2 — VPS (serveur dédié)

Si vous avez un serveur (OVH, Contabo, etc.), le plus simple est **Docker** (voir la
section *Docker* plus haut) :

```bash
git clone https://github.com/VOTRE-NOM/jannah-home.git
cd jannah-home
docker compose up -d --build
```

Sinon, en installation manuelle (nécessite une base PostgreSQL et `DATABASE_URL` dans `.env`) :

```bash
npm install
npm run db:push
npm run db:seed
npm run build
npm start
```

Utilisez **PM2** pour garder le site actif :

```bash
npm install -g pm2
pm2 start npm --name "jannah-home" -- start
pm2 save
```

Configurez **Nginx** comme reverse proxy sur le port 3000.

---

## Changer le mot de passe admin

Modifier `ADMIN_PASSWORD` dans le fichier `.env` (local) ou dans les variables d'environnement de votre hébergeur (production).

## Langues

| Langue | URL |
|--------|-----|
| Français | `/fr` |
| Arabe (RTL) | `/ar` |

Le site détecte automatiquement la langue du navigateur à la première visite.
