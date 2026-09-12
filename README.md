# Gennevilliers Énergie — prototype Flask

Prototype fonctionnel destiné à illustrer la solution proposée pour le marché
26DPB11. L’interface présente le pilotage multisite, les consommations, les
factures, les alertes, les prévisions, le jumeau énergétique, la formation et
la réversibilité.

Toutes les informations visibles sont fictives et portent la mention
« Données de démonstration ». Aucune donnée réelle de la Ville n’est incluse.

## Lancer le projet localement

Pré-requis : Python 3.12.

    python -m venv .venv
    source .venv/bin/activate
    pip install -r requirements-dev.txt
    flask --app app run --debug

Ouvrir ensuite http://127.0.0.1:5000.

## Lancer les tests

    pytest

## Déployer avec Gunicorn

    gunicorn --bind 0.0.0.0:8000 --workers 2 --threads 4 app:app

La variable PORT peut être utilisée par l’hébergeur :

    gunicorn --bind 0.0.0.0:$PORT --workers 2 --threads 4 app:app

## Déployer avec Docker

    docker build -t gennevilliers-energie-demo .
    docker run --rm -p 8000:8000 gennevilliers-energie-demo

Le contrôle de disponibilité est exposé sur /api/health.

## Déployer sur Render

Le fichier render.yaml permet de créer un Web Service. Connecter le dépôt,
choisir « New Blueprint Instance », puis vérifier que la route /api/health
répond avec le statut ok.

Pour une démonstration adressée au jury, utiliser uniquement des données
fictives et conserver l’accès en lecture seule. Les véritables identifiants
Enedis, GRDF, Suez, OPERAT, GTB/GTC et IoT ne doivent jamais être placés dans
le dépôt ; ils devront être configurés comme secrets chez l’hébergeur.

## API de démonstration

- GET /api/dashboard : indicateurs consolidés.
- GET /api/sites et GET /api/sites/{site_id} : patrimoine.
- GET /api/invoices : factures et rapprochements.
- GET /api/alerts : alertes.
- POST /api/twin/simulate : simulation énergie/température/fréquentation.
- GET /api/forecast : scénarios budgétaires.
- GET /api/integrations : connecteurs prévus.
- POST /api/assistant : assistant métier encadré.
- GET /api/export/consumptions.csv : exemple de réversibilité.
- GET /api/openapi.json : contrat OpenAPI 3.1.

## Sécurité du prototype

Le projet ajoute des en-têtes de sécurité, limite la taille des requêtes,
n’expose aucun secret, refuse les valeurs de simulation hors bornes et
désactive la mise en cache des API.

Pour la production contractuelle, ajouter l’authentification SSO/MFA, une
base persistante, l’audit centralisé, la gestion des rôles, les secrets
hébergés et les connecteurs certifiés.
# gennevilliers-energie
