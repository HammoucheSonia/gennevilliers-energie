"""Application Flask du prototype Gennevilliers Énergie.

Les données exposées sont entièrement fictives. Les connecteurs métiers sont
représentés par des contrats d'API prêts à être remplacés par les flux réels.
"""

from __future__ import annotations

import csv
import io
import os
from copy import deepcopy
from datetime import datetime, timezone
from typing import Any

from flask import Flask, Response, jsonify, request, send_from_directory
from werkzeug.exceptions import HTTPException

from demo_data import (
    ALERTS,
    FORECASTS,
    INTEGRATIONS,
    INVOICES,
    SAMPLE_CONSUMPTIONS,
    SITES,
)

APP_VERSION = "1.0.0-demo"
VALID_PERIODS = {"month": 1.0, "quarter": 2.86, "year": 11.7}
VALID_SCOPES = {
    "all": 1.0,
    "municipal": 0.61,
    "schools": 0.19,
    "sports": 0.14,
    "lighting": 0.06,
}
VALID_CATEGORIES = {"municipal", "school", "sport", "lighting"}
ACKNOWLEDGED_ALERTS: set[int] = set()


def utc_now() -> str:
    """Return a stable ISO-8601 UTC timestamp."""
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def api_response(data: Any, *, count: int | None = None, **metadata: Any):
    """Return every API payload with the same demonstration metadata."""
    meta = {
        "dataset": "demonstration",
        "generated_at": utc_now(),
        "version": APP_VERSION,
        **metadata,
    }
    if count is not None:
        meta["count"] = count
    return jsonify({"data": data, "meta": meta})


def json_error(message: str, status: int, *, code: str):
    return (
        jsonify(
            {
                "error": {"code": code, "message": message},
                "meta": {
                    "dataset": "demonstration",
                    "generated_at": utc_now(),
                    "version": APP_VERSION,
                },
            }
        ),
        status,
    )


def clamp_number(
    payload: dict[str, Any],
    field: str,
    *,
    default: float,
    minimum: float,
    maximum: float,
) -> float:
    try:
        value = float(payload.get(field, default))
    except (TypeError, ValueError) as exc:
        raise ValueError(f"Le champ « {field} » doit être numérique.") from exc
    if not minimum <= value <= maximum:
        raise ValueError(
            f"Le champ « {field} » doit être compris entre {minimum:g} et {maximum:g}."
        )
    return value


def create_app(test_config: dict[str, Any] | None = None) -> Flask:
    app = Flask(__name__, static_folder="dist", static_url_path="")
    app.config.from_mapping(
        MAX_CONTENT_LENGTH=1 * 1024 * 1024,
        JSON_SORT_KEYS=False,
        SECRET_KEY=os.environ.get("SECRET_KEY", "demo-only-not-for-production-data"),
    )
    if test_config:
        app.config.update(test_config)
    app.json.ensure_ascii = False

    @app.after_request
    def add_security_headers(response: Response) -> Response:
        response.headers.setdefault("X-Content-Type-Options", "nosniff")
        response.headers.setdefault("X-Frame-Options", "SAMEORIGIN")
        response.headers.setdefault("Referrer-Policy", "no-referrer")
        response.headers.setdefault(
            "Permissions-Policy",
            "camera=(), microphone=(), geolocation=(), payment=()",
        )
        response.headers.setdefault(
            "Content-Security-Policy",
            "default-src 'self'; "
            "img-src 'self' data:; "
            "style-src 'self' 'unsafe-inline'; "
            "script-src 'self'; "
            "connect-src 'self'; "
            "font-src 'self'; "
            "object-src 'none'; "
            "base-uri 'self'; "
            "frame-ancestors 'self'",
        )
        if request.path.startswith("/api/"):
            response.headers["Cache-Control"] = "no-store"
        elif request.path.endswith((".css", ".js", ".svg")):
            response.headers.setdefault("Cache-Control", "public, max-age=3600")
        return response

    @app.get("/")
    def index():
        return send_from_directory(app.static_folder, "index.html")

    @app.get("/api")
    def api_index():
        return api_response(
            {
                "name": "Gennevilliers Énergie — API de démonstration",
                "documentation": "/api/openapi.json",
                "health": "/api/health",
                "notice": (
                    "Aucune donnée réelle de la Ville n'est exposée par ce prototype."
                ),
            }
        )

    @app.get("/api/health")
    def health():
        return api_response(
            {
                "status": "ok",
                "service": "gennevilliers-energy-demo",
                "environment": os.environ.get("APP_ENV", "demonstration"),
            }
        )

    @app.get("/api/dashboard")
    def dashboard():
        scope = request.args.get("scope", "all")
        period = request.args.get("period", "month")
        if scope not in VALID_SCOPES:
            return json_error(
                "Périmètre inconnu.",
                400,
                code="invalid_scope",
            )
        if period not in VALID_PERIODS:
            return json_error(
                "Période inconnue.",
                400,
                code="invalid_period",
            )

        factor = VALID_SCOPES[scope] * VALID_PERIODS[period]
        site_counts = {
            "all": 169,
            "municipal": 118,
            "schools": 31,
            "sports": 18,
            "lighting": 51,
        }
        total_sites = site_counts[scope]
        result = {
            "scope": scope,
            "period": period,
            "kpis": {
                "energy_mwh": round(2480 * factor, 1),
                "cost_eur": round(412680 * factor, 2),
                "carbon_tco2e": round(286 * factor, 1),
                "sites_within_target": round(total_sites * 0.83),
                "sites_total": total_sites,
            },
            "reference_variance_pct": {
                "energy": -8.4,
                "cost": 3.1,
                "carbon": -11.2,
            },
            "active_alerts": 12,
        }
        return api_response(
            result,
            normalization=["weather_dju", "occupancy", "opening_hours"],
        )

    @app.get("/api/sites")
    def list_sites():
        category = request.args.get("category")
        search = request.args.get("q", "").strip().casefold()
        if category and category not in VALID_CATEGORIES:
            return json_error(
                "Catégorie de site inconnue.",
                400,
                code="invalid_category",
            )

        records = deepcopy(SITES)
        if category:
            records = [item for item in records if item["category"] == category]
        if search:
            records = [
                item
                for item in records
                if search
                in f"{item['id']} {item['name']} {item['area']}".casefold()
            ]
        return api_response(records, count=len(records), total_portfolio_sites=169)

    @app.get("/api/sites/<string:site_id>")
    def get_site(site_id: str):
        site = next((item for item in SITES if item["id"] == site_id), None)
        if site is None:
            return json_error("Site introuvable.", 404, code="site_not_found")
        detail = deepcopy(site)
        detail["sensors"] = {
            "indoor_temperature_c": 22.1,
            "outdoor_temperature_c": 8.4,
            "occupancy": 184,
            "instant_power_kw": 286,
        }
        detail["thermal_loss_signal"] = {
            "score": 74,
            "qualification": "suspicion",
            "regulatory_dpe": False,
            "requires_on_site_validation": True,
        }
        return api_response(detail)

    @app.get("/api/invoices")
    def list_invoices():
        status = request.args.get("status")
        valid_statuses = {"paid", "pending", "anomaly"}
        if status and status not in valid_statuses:
            return json_error(
                "Statut de paiement inconnu.",
                400,
                code="invalid_payment_status",
            )
        records = deepcopy(INVOICES)
        if status:
            records = [
                item for item in records if item["payment_status"] == status
            ]
        return api_response(
            records,
            count=len(records),
            reconciliation_rate_pct=96.7,
        )

    @app.get("/api/alerts")
    def list_alerts():
        level = request.args.get("level")
        if level and level not in {"critical", "warning"}:
            return json_error(
                "Niveau d'alerte inconnu.",
                400,
                code="invalid_alert_level",
            )
        records = deepcopy(ALERTS)
        if level:
            records = [item for item in records if item["level"] == level]
        for item in records:
            item["acknowledged"] = item["id"] in ACKNOWLEDGED_ALERTS
        return api_response(records, count=len(records), total_active_alerts=12)

    @app.post("/api/alerts/<int:alert_id>/acknowledge")
    def acknowledge_alert(alert_id: int):
        if not any(item["id"] == alert_id for item in ALERTS):
            return json_error("Alerte introuvable.", 404, code="alert_not_found")
        ACKNOWLEDGED_ALERTS.add(alert_id)
        return api_response(
            {
                "id": alert_id,
                "acknowledged": True,
                "audit_notice": (
                    "Acquittement limité à cette instance de démonstration."
                ),
            }
        )

    @app.post("/api/twin/simulate")
    def simulate_twin():
        payload = request.get_json(silent=True) or {}
        if not isinstance(payload, dict):
            return json_error(
                "Le corps JSON doit être un objet.",
                400,
                code="invalid_json",
            )
        try:
            temperature = clamp_number(
                payload,
                "temperature_c",
                default=22,
                minimum=18,
                maximum=24,
            )
            occupancy = clamp_number(
                payload,
                "occupancy",
                default=184,
                minimum=40,
                maximum=350,
            )
            opening_hours = clamp_number(
                payload,
                "opening_hours",
                default=14,
                minimum=7,
                maximum=18,
            )
        except ValueError as exc:
            return json_error(str(exc), 400, code="invalid_simulation_input")

        annual_energy = round(
            900
            + (temperature - 18) * 95
            + occupancy * 1.05
            + opening_hours * 25
        )
        baseline = 1957
        delta = round((annual_energy / baseline - 1) * 100, 1)
        instant_power = round(
            72
            + (temperature - 18) * 20
            + occupancy * 0.35
            + opening_hours * 5
        )
        drift_score = round(
            max(
                10,
                min(
                    98,
                    54
                    + (temperature - 20) * 6
                    + (opening_hours - 10) * 2
                    - (occupancy - 184) * 0.02,
                ),
            )
        )
        return api_response(
            {
                "inputs": {
                    "temperature_c": temperature,
                    "occupancy": occupancy,
                    "opening_hours": opening_hours,
                },
                "annual_energy_mwh": annual_energy,
                "baseline_variance_pct": delta,
                "instant_power_kw": instant_power,
                "drift_score": drift_score,
                "automatic_control_applied": False,
                "human_validation_required": True,
            }
        )

    @app.get("/api/forecast")
    def forecast():
        scenario = request.args.get("scenario", "central")
        try:
            horizon = int(request.args.get("horizon", "12"))
        except ValueError:
            horizon = -1
        if scenario not in FORECASTS:
            return json_error(
                "Scénario de prévision inconnu.",
                400,
                code="invalid_scenario",
            )
        if horizon not in {12, 24, 48}:
            return json_error(
                "L'horizon doit être de 12, 24 ou 48 mois.",
                400,
                code="invalid_horizon",
            )
        result = deepcopy(FORECASTS[scenario])
        multiplier = horizon / 12
        if horizon == 24:
            multiplier *= 1.02
        elif horizon == 48:
            multiplier *= 1.045
        result["horizon_months"] = horizon
        result["horizon_cost_meur"] = round(
            result["annual_cost_meur"] * multiplier,
            2,
        )
        result["uncertainty_pct"] = 7.8
        result["savings_guaranteed"] = False
        return api_response(
            result,
            assumptions=[
                "energy_prices",
                "weather_dju",
                "occupancy",
                "opening_hours",
                "validated_actions",
            ],
        )

    @app.get("/api/integrations")
    def integrations():
        return api_response(
            deepcopy(INTEGRATIONS),
            count=len(INTEGRATIONS),
            architecture="documented_connectors",
        )

    @app.post("/api/assistant")
    def assistant():
        payload = request.get_json(silent=True) or {}
        question = str(payload.get("question", "")).strip()
        if not question:
            return json_error(
                "Une question est requise.",
                400,
                code="question_required",
            )
        if len(question) > 500:
            return json_error(
                "La question est limitée à 500 caractères.",
                400,
                code="question_too_long",
            )

        lowered = question.casefold()
        if "centre nautique" in lowered or "dérive" in lowered:
            answer = (
                "Trois signaux concordent : charge nocturne +42 %, "
                "température supérieure de 2,1 °C à la consigne et absence "
                "de fréquentation entre 23 h et 5 h. Une vérification humaine "
                "de la programmation GTB est recommandée."
            )
            sources = ["enedis_demo", "gtb_demo", "occupancy_demo"]
        elif "facture" in lowered or "pay" in lowered:
            answer = (
                "Huit écarts de facturation sont signalés, pour 12 640 € à "
                "contrôler. Le cas prioritaire est l'École des Grésillons."
            )
            sources = ["invoice_demo", "grdf_demo"]
        elif "carbone" in lowered or "co2" in lowered:
            answer = (
                "La trajectoire carbone simulée atteint −34 % pour un objectif "
                "paramétré à −40 % en 2030."
            )
            sources = ["carbon_factors_demo", "consumptions_demo"]
        else:
            answer = (
                "Je peux expliquer une dérive, comparer des sites, contrôler "
                "une facture ou préparer une synthèse. Les recommandations "
                "restent toujours soumises à validation humaine."
            )
            sources = ["demonstration_dataset"]
        return api_response(
            {
                "answer": answer,
                "sources": sources,
                "human_validation_required": True,
                "public_model_training": False,
            }
        )

    @app.get("/api/export/consumptions.csv")
    def export_consumptions():
        buffer = io.StringIO()
        writer = csv.DictWriter(
            buffer,
            fieldnames=["site_id", "point_id", "timestamp", "value", "unit"],
            delimiter=";",
        )
        writer.writeheader()
        writer.writerows(SAMPLE_CONSUMPTIONS)
        content = "\ufeff" + buffer.getvalue()
        return Response(
            content,
            mimetype="text/csv; charset=utf-8",
            headers={
                "Content-Disposition": (
                    "attachment; filename=consommations_demo_gennevilliers.csv"
                ),
                "X-Dataset-Classification": "demonstration",
            },
        )

    @app.get("/api/openapi.json")
    def openapi_document():
        base_paths = {
            "/api/health": {"get": {"summary": "État du service"}},
            "/api/dashboard": {
                "get": {
                    "summary": "Indicateurs consolidés",
                    "parameters": [
                        {"name": "scope", "in": "query", "schema": {"type": "string"}},
                        {"name": "period", "in": "query", "schema": {"type": "string"}},
                    ],
                }
            },
            "/api/sites": {"get": {"summary": "Liste des sites"}},
            "/api/sites/{site_id}": {
                "get": {
                    "summary": "Détail d'un site",
                    "parameters": [
                        {
                            "name": "site_id",
                            "in": "path",
                            "required": True,
                            "schema": {"type": "string"},
                        }
                    ],
                }
            },
            "/api/invoices": {"get": {"summary": "Factures et rapprochements"}},
            "/api/alerts": {"get": {"summary": "Alertes énergétiques"}},
            "/api/twin/simulate": {
                "post": {"summary": "Simulation du jumeau énergétique"}
            },
            "/api/forecast": {"get": {"summary": "Prévisions budgétaires"}},
            "/api/integrations": {"get": {"summary": "État des connecteurs"}},
            "/api/assistant": {"post": {"summary": "Assistant métier encadré"}},
            "/api/export/consumptions.csv": {
                "get": {"summary": "Export réversible au format CSV"}
            },
        }
        return jsonify(
            {
                "openapi": "3.1.0",
                "info": {
                    "title": "Gennevilliers Énergie — API de démonstration",
                    "version": APP_VERSION,
                    "description": (
                        "Contrat technique fictif. Aucun flux réel de la Ville."
                    ),
                },
                "servers": [{"url": request.host_url.rstrip("/")}],
                "paths": base_paths,
            }
        )

    @app.errorhandler(413)
    def payload_too_large(_error):
        return json_error(
            "La requête dépasse la taille maximale autorisée.",
            413,
            code="payload_too_large",
        )

    @app.errorhandler(Exception)
    def handle_exception(error):
        if isinstance(error, HTTPException):
            if request.path.startswith("/api/"):
                return json_error(
                    error.description,
                    error.code or 500,
                    code=error.name.lower().replace(" ", "_"),
                )
            return error
        app.logger.exception("Unhandled application error")
        if request.path.startswith("/api/"):
            return json_error(
                "Une erreur interne est survenue.",
                500,
                code="internal_error",
            )
        return Response(
            "Une erreur interne est survenue.",
            status=500,
            mimetype="text/plain",
        )

    return app


app = create_app()


if __name__ == "__main__":
    app.run(
        host=os.environ.get("HOST", "127.0.0.1"),
        port=int(os.environ.get("PORT", "5000")),
        debug=os.environ.get("FLASK_DEBUG", "0") == "1",
    )
