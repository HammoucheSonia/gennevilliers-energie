import pytest

from app import ACKNOWLEDGED_ALERTS, create_app


@pytest.fixture()
def client():
    ACKNOWLEDGED_ALERTS.clear()
    application = create_app({"TESTING": True})
    with application.test_client() as test_client:
        yield test_client


def test_home_serves_dashboard(client):
    response = client.get("/")
    assert response.status_code == 200
    assert "Gennevilliers Énergie".encode() in response.data


def test_health_is_explicitly_demo(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    payload = response.get_json()
    assert payload["data"]["status"] == "ok"
    assert payload["meta"]["dataset"] == "demonstration"
    assert response.headers["Cache-Control"] == "no-store"


def test_dashboard_filters_are_validated(client):
    response = client.get("/api/dashboard?scope=unknown&period=month")
    assert response.status_code == 400
    assert response.get_json()["error"]["code"] == "invalid_scope"


def test_site_detail_excludes_regulatory_claim(client):
    response = client.get("/api/sites/GEN-042")
    assert response.status_code == 200
    signal = response.get_json()["data"]["thermal_loss_signal"]
    assert signal["qualification"] == "suspicion"
    assert signal["regulatory_dpe"] is False
    assert signal["requires_on_site_validation"] is True


def test_twin_simulation_never_applies_automatic_control(client):
    response = client.post(
        "/api/twin/simulate",
        json={"temperature_c": 21, "occupancy": 180, "opening_hours": 12},
    )
    assert response.status_code == 200
    result = response.get_json()["data"]
    assert result["automatic_control_applied"] is False
    assert result["human_validation_required"] is True


def test_twin_rejects_out_of_range_temperature(client):
    response = client.post(
        "/api/twin/simulate",
        json={"temperature_c": 30, "occupancy": 180, "opening_hours": 12},
    )
    assert response.status_code == 400
    assert response.get_json()["error"]["code"] == "invalid_simulation_input"


def test_forecast_states_that_savings_are_not_guaranteed(client):
    response = client.get("/api/forecast?scenario=central&horizon=48")
    assert response.status_code == 200
    result = response.get_json()["data"]
    assert result["horizon_months"] == 48
    assert result["savings_guaranteed"] is False


def test_alert_acknowledgement_is_traceable(client):
    response = client.post("/api/alerts/1/acknowledge")
    assert response.status_code == 200
    assert response.get_json()["data"]["acknowledged"] is True
    alerts = client.get("/api/alerts").get_json()["data"]
    assert next(item for item in alerts if item["id"] == 1)["acknowledged"] is True


def test_csv_export_is_downloadable(client):
    response = client.get("/api/export/consumptions.csv")
    assert response.status_code == 200
    assert response.mimetype == "text/csv"
    assert "attachment;" in response.headers["Content-Disposition"]
    assert "GEN-042" in response.get_data(as_text=True)
