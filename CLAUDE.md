# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a customized fork of **GeoNode 3.2.0-unstable** — a Django-based geospatial CMS — extended by Skaphe/WaterProof with a suite of water-resource planning apps (`waterproof_*`) and Wagtail CMS integration. The current branch (`migration/django5.x`) is actively migrating from Django 2.2.16 toward Django 5.x.

- Python 3.8 | Django 2.2.16 (original) → 5.x (migration branch) | GeoServer 2.17.4
- GeoNode version: `(3, 2, 0, 'unstable', 0)` — see `geonode/__init__.py`
- Root URL conf: `geonode.urls` | Default settings: `geonode.settings`

## Development Commands

### Local (non-Docker)

```bash
pip install -r requirements.txt -r requirements_dev.txt
pip install -e .

python manage.py migrate
python manage.py runserver
python manage.py collectstatic --noinput

# Celery worker (separate terminal)
celery -A geonode.celery_app:app worker --loglevel=INFO
```

### Docker (primary workflow)

```bash
make up           # docker-compose up -d
make build        # rebuild django/celery images
make down         # bring stack down
make logs         # tail logs
make sync         # migrate + load fixtures in running container
make reset        # down → up → sync
make develop      # pull + build + up + sync
```

### Running Tests

```bash
# Smoke tests
make smoketest
# or directly:
docker-compose exec django python manage.py test geonode.tests.smoke \
  --noinput --nocapture --detailed-errors --verbosity=1 --failfast

# Unit tests
make unittest
# or directly:
docker-compose exec django python manage.py test \
  geonode.people.tests geonode.base.tests geonode.layers.tests \
  geonode.maps.tests geonode.proxy.tests geonode.security.tests \
  geonode.social.tests geonode.catalogue.tests geonode.documents.tests \
  geonode.api.tests geonode.groups.tests geonode.services.tests \
  geonode.geoserver.tests geonode.upload.tests geonode.tasks.tests \
  --noinput --failfast

# BDD / e2e tests (pytest-bdd + Firefox headless)
pytest  # runs geonode/tests/bdd/e2e/ as configured in pytest.ini
```

Test classes should extend `geonode.tests.base.GeoNodeBaseTestSupport`.

### Linting

```bash
flake8 .           # max-line-length=120, config in setup.cfg [flake8]
pre-commit run --all-files   # black + trailing-whitespace + yaml checks
```

Black version: `19.10b0`. Flake8 ignores `E122`, `E124`. Migrations, `*settings.py`, and `node_modules` are excluded from flake8.

## Architecture

### Settings

| File | Purpose |
|---|---|
| `geonode/settings.py` | Main settings, fully env-variable driven |
| `geonode/settings_localhost.py` | Local dev overrides |
| `geonode/local_settings.py` | Gitignored instance overrides (create from `.sample`) |

All runtime config comes from env vars. Copy `.env_dev` to `.env` for local Docker work; key vars: `DATABASE_URL`, `GEODATABASE_URL`, `GEOSERVER_LOCATION`, `BROKER_URL`, `SITEURL`.

### Django Apps

**GeoNode core** (`GEONODE_CORE_APPS`): `geonode.api`, `geonode.base`, `geonode.br`, `geonode.layers`, `geonode.maps`, `geonode.geoapps`, `geonode.documents`, `geonode.security`, `geonode.catalogue`

**GeoNode internal** (`GEONODE_INTERNAL_APPS`): `geonode.people`, `geonode.client`, `geonode.themes`, `geonode.proxy`, `geonode.social`, `geonode.groups`, `geonode.services`, `geonode.geoserver`, `geonode.upload`, `geonode.tasks`, `geonode.messaging`, `geonode.monitoring`

**WaterProof custom apps** (all under `geonode/`):

| App | URL prefix |
|---|---|
| `waterproof_intake` | `/intake/` |
| `waterproof_nbs_ca` | `/waterproof_nbs_ca/` |
| `waterproof_parameters` | `/parameters/` |
| `waterproof_treatment_plants` | `/treatment_plants/` |
| `waterproof_study_cases` | `/study_cases/` |
| `waterproof_study_cases_comparison` | `/study_cases_comparison/` |
| `waterproof_reports` | `/reports/` |
| `waterproof_fastflood` | `/fastflood/` |
| `waterproof_fastflood_reports` | `/fastflood/reports/` |
| `waterproof_common` | shared templatetags/utilities |
| `waterproof_wiki` | `/wiki/` |

**Wagtail CMS** mounted at `/cms/` (admin), `/docs/`, `/pages/`.

### Infrastructure

- **Database:** PostGIS (production/Docker) or SpatiaLite (local dev fallback). Two DB connections: `default` (app data) and `datastore` (geodata layers, enabled via `DEFAULT_BACKEND_DATASTORE=datastore`).
- **Message broker:** RabbitMQ at `BROKER_URL`; Celery app at `geonode.celery_app:app`
- **GeoServer:** Separate Java service; communicates via `GEOSERVER_LOCATION`. OAuth2 integration via `OAUTH2_CLIENT_ID/SECRET`.
- **Static files:** Collected to `geonode/static_root/`; source in each app's `static/` dir. Cache-busting via `STATIC_VERSION` env var (currently `2.0.1`).
- **MapStore client:** Lives under `src/django-geonode-mapstore-client/` (submodule). MapStore config app: `ms_waterproof_config`.

### Docker Stack

`docker-compose.yml` runs: `django` + `celery` + `nginx` + `geoserver` + `db` (PostGIS) + `rabbitmq`. The `entrypoint.sh` calls `invoke` tasks (`waitfordbs`, `migrations`, `statics`, `prepare`, `fixtures`, `geoserverfixture`) on container start.

Production WaterProof deployment: `scripts_docker/spcwaterproof/docker-compose.yml` (image `waterproof/spcwaterproof:django-3.2`).

## Migration Branch Notes

The `migration/django5.x` branch is upgrading Django compatibility. When making changes:
- There is a parallel project at `C:\ws\SKP\waterproof-next` scaffolding the Django 5.2 port (15 modules ported, `accounts.User` → `people_profile`).
- Pending: django-allauth 65.x settings format, template compatibility, and `--fake-initial` migrations against prod DB.
- The `geonode/waterproof_common` app was recently added to `INSTALLED_APPS` as part of this work.
