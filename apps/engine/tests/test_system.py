import time

import jwt
import pytest
from cryptography.hazmat.primitives.asymmetric import ec
from fastapi.testclient import TestClient

from engine import auth
from engine.config import Settings, get_settings
from engine.main import create_app

SIGNING_KEY = ec.generate_private_key(ec.SECP256R1())
OTHER_KEY = ec.generate_private_key(ec.SECP256R1())


@pytest.fixture
def client(monkeypatch: pytest.MonkeyPatch) -> TestClient:
    # Stands in for the JWKS lookup against Supabase.
    monkeypatch.setattr(auth, "_signing_key", lambda token, settings: SIGNING_KEY.public_key())
    app = create_app()
    app.dependency_overrides[get_settings] = lambda: Settings(_env_file=None)
    return TestClient(app)


def make_token(key: object = SIGNING_KEY, algorithm: str = "ES256", **overrides: object) -> str:
    claims = {
        "sub": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
        "email": "eric@example.test",
        "role": "authenticated",
        "aud": "authenticated",
        "exp": int(time.time()) + 60,
    } | overrides
    return jwt.encode(claims, key, algorithm=algorithm)


def bearer(token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {token}"}


def test_health_needs_no_login(client: TestClient) -> None:
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_me_returns_the_signed_in_user(client: TestClient) -> None:
    response = client.get("/me", headers=bearer(make_token()))
    assert response.status_code == 200
    assert response.json() == {
        "id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
        "email": "eric@example.test",
    }


def test_me_without_token_is_rejected(client: TestClient) -> None:
    assert client.get("/me").status_code == 401


@pytest.mark.parametrize(
    "token",
    [
        pytest.param(make_token(exp=int(time.time()) - 60), id="expired"),
        pytest.param(make_token(key=OTHER_KEY), id="signed-by-someone-else"),
        pytest.param(make_token(aud="something-else"), id="wrong-audience"),
        pytest.param(make_token(role="anon", sub=""), id="anon-key"),
        pytest.param(
            make_token(key="a-shared-secret-with-at-least-32-characters", algorithm="HS256"),
            id="symmetric-algorithm",
        ),
        pytest.param(make_token(key="", algorithm="none"), id="unsigned"),
        pytest.param("not-a-jwt", id="garbage"),
    ],
)
def test_me_rejects_invalid_tokens(client: TestClient, token: str) -> None:
    assert client.get("/me", headers=bearer(token)).status_code == 401
