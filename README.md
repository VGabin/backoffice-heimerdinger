
# 🧠 Discord Bot + Dashboard + MySQL

Ce projet regroupe un **bot Discord** développé avec `discord.js`, un **dashboard web admin** en `Express + Pug`, et une **base de données MySQL**.  
Le tout est orchestré via **Docker Compose**, avec deux environnements : développement (`compose.yml`) et production (`compose-prod.yml`, prévu pour **Traefik**).

---

## 📁 Structure du projet

```plaintext
.
├── bot/              # Bot Discord en Node.js (discord.js)
├── db/               # Fichiers SQL d'initialisation de la base de données
├── web/              # Dashboard admin (Express + Pug)
├── compose.yml       # Docker Compose pour développement
├── compose-prod.yml  # Docker Compose pour production (avec Traefik)
└── .env.sample       # Exemple de configuration environnement
```

---

## ⚙️ Configuration `.env`

Copiez le fichier `.env.sample` en `.env` et remplissez les champs :

APP_URL=http://web:3000/

MYSQL_HOST=mysql
MYSQL_USER=user
MYSQL_PASSWORD=password
MYSQL_DATABASE=database

DISCORD_ID=        # OAuth2 Discord Application ID
DISCORD_SECRET=    # OAuth2 Secret
REDIRECT_URI=      # http://your-domain.com/callback
SESSION_SECRET=    # Secret de session pour express-session

STRIPE_SECRET=             # Clé secrète Stripe
STRIPE_WEBHOOK_SECRET=     # Secret du webhook Stripe

APP_ID=            # ID du bot Discord
DISCORD_TOKEN=     # Token du bot Discord
PUBLIC_KEY=        # Public Key du bot Discord (pour interactions)

AUTHORIZED_USERS=  # Liste d'ID utilisateurs Discord autorisés à accéder au dashboard

---

## 🚀 Lancement

### 🧪 Environnement de développement

docker-compose -f compose.yml up --build

- Le **bot Discord** tournera sur `localhost:3001`
- Le **dashboard web** sera accessible sur `http://localhost:3000`
- La **base de données MySQL** sera initialisée avec les schémas de `db/`

---

### 🌐 Environnement de production

Prévu pour une configuration avec **Traefik**. Assurez-vous que Traefik est bien configuré pour router les services.

docker-compose -f compose-prod.yml up -d

- Chaque service doit déclarer ses labels Traefik dans `compose-prod.yml`.
- Le port 443 doit être géré par Traefik pour SSL, redirections, etc.

---

## 🔐 Authentification & Permissions

- Seuls les utilisateurs listés dans `AUTHORIZED_USERS` peuvent se connecter au **dashboard admin**.
- L’authentification se fait via **OAuth2 Discord**.

---

## 📦 Services

| Service | Port  | Description                       |
|--------|-------|-----------------------------------|
| `web`  | 3000  | Dashboard admin (Express + Pug)   |
| `bot`  | 3001  | Bot Discord (Node.js, discord.js) |
| `mysql`| 3306  | Base de données MySQL 8.0+        |

---

## 🧾 Stripe

Le dashboard écoute sur un **webhook Stripe**. Vous devez configurer l'URL du webhook dans le dashboard Stripe :

https://your-domain.com/stripe/webhook

Utilisez `STRIPE_WEBHOOK_SECRET` pour vérifier la signature des appels entrants.

---

## ✅ Prérequis

- Docker
- Docker Compose
- (En prod) Traefik en reverse proxy

---

## 🙋‍♂️ Contribution

- VGabin
- VanhoveHugo

---

## 📝 Licence

MIT
