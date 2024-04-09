## TP Back

### Fonctionnalités

- Connexion/Inscription utilisateur
- Recherche d'un logement selon tous les critère d'un DPE:
```
    "N°_département_(BAN)": number,
    "Date_réception_DPE": string,
    "Date_établissement_DPE": string,
    "Date_visite_diagnostiqueur": string,
    "Etiquette_GES": string,
    "Etiquette_DPE": string,
    "Année_construction": number,
    "Surface_habitable_logement": number,
    "Adresse_(BAN)": string,
    "Code_postal_(BAN)": number,
```
- Sauvegarde d'une recherche
- Récupération d'une recerche sauvegarder si les critères sont les même
- Suppression d'une requête
- Swagger sur l'endpoint `/api-docs`

### Utilisation

- Installer les dépendances avec `npm install`
- Builder le projet avec `npm run build`
- Et enfin lancer le avec `npm start`

DOCKER:

- Builder l'image avec `docker build --tag pjl2 .`
- Lancer le container avec `docker run -p 28122:8080 -e ACCESS_SECRET=secret -e REFRESH_SECRET=secret -e SALT_ROUND=10 -e MONGO_URL=url -e USE_UNIV_PROXY=false --name pjl2-container pjl2`

### Développement

- Installer les dépendances avec `npm install`
- Lancer le projet en mode développement avec `npm run dev`