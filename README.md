# Ro AI

Ro AI est une application web React + Vite + TailwindCSS qui utilise un proxy local `chatgptfree.js` pour communiquer avec ChatGPT (via l'API tierce définie dans `chatgptfree.js`).

## Fonctionnalités

- Interface moderne, minimaliste, responsive
- Champ de saisie pour prompt
- Sélecteur de modèle (`chatgpt3` ou `chatgpt4`)
- Affichage conversationnel de l'historique
- État de chargement, message d'erreur
- Effacement historique
- Mode sombre/claire via Tailwind
- Auto scroll vers dernières réponses

## Fichiers clés

- `chatgptfree.js` : proxy API qui appelle `stablediffusion.fr/gpt3` et `gpt4`
- `server.js` : serveur Express local qui expose `/api/chat`
- `src/App.jsx` : interface utilisateur (UI) et logique client
- `src/main.jsx`, `src/index.css` : bootstrap React et styles Tailwind
- `tailwind.config.js`, `postcss.config.js` : configuration Tailwind

## Installation

1. Ouvrir un terminal dans le répertoire du projet `d:\Chat Bot AI`
2. Installer les dépendances :

```bash
npm install
```

3. Lancer le mode développement (frontend + backend) :

```bash
npm run dev
```

4. Aller sur `http://localhost:5173`

> Le backend tourne sur `http://localhost:5174` et sert l’endpoint `/api/chat`.

## Utilisation

1. Saisir un prompt.
2. Choisir le modèle (`chatgpt3` ou `chatgpt4`).
3. Cliquer sur « Envoyer ».
4. La réponse s’affiche sous forme de blocs dans le fil de discussion.

## Fonctionnement du script `chatgptfree.js`

- `onStart({req,res})` gère les requêtes `GET` et `POST`.
- Vérification de `prompt` et du modèle.
- Chargement de la page `referer` pour obtenir des cookies si nécessaires.
- Requête POST vers l’API externe (gpt3/gpt4) avec  headers personnalisés.
- Retour JSON `{"answer": data.message}`.

## Dépendances principales

- React
- React DOM
- Vite
- TailwindCSS
- Express
- Axios
- concurrently

## Bonus inclus

- Historique de conversation
- Mode sombre / clair (via Tailwind, en changeant la classe `dark` sur le body)
- Indicateur de chargement animé
- Scroll automatique vers la dernière réponse

## Notes

- En environnement de production, héberger `server.js` en backend et sécuriser l’accès à l’API externe.
- `chatgptfree.js` nécessite une URL externe (`stablediffusion.fr`) et doit être vérifiée pour robustesse et conformité avant usage.
