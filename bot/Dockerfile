# Utiliser une image Node.js officielle
FROM node:18

# Créer un répertoire de travail pour l'application
WORKDIR /usr/src/app

# Copier le package.json et package-lock.json
COPY package*.json ./

# Installer les dépendances du projet
RUN npm install

# Copier tout le reste du projet dans le conteneur
COPY . .

# Exposer le port si nécessaire (si ton bot utilise un serveur web comme Express)
EXPOSE 3001

# Lancer l'application
CMD ["node", "app.js"]
