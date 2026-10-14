from dataclasses import dataclass
from functools import lru_cache
from typing import Annotated, Any

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from engine.config import Settings, get_settings

_bearer = HTTPBearer(auto_error=False)
# Supabase signs access tokens with an asymmetric key and publishes the public half as JWKS.
# Symmetric algorithms are refused outright, so there is no shared secret to configure or leak.
_ALGORITHMS = {"ES256", "RS256"}


@dataclass(frozen=True)
class User:
    id: str
    email: str | None


@lru_cache
def _jwks_client(supabase_url: str) -> jwt.PyJWKClient:
    return jwt.PyJWKClient(f"{supabase_url}/auth/v1/.well-known/jwks.json", cache_keys=True)


def _signing_key(token: str, settings: Settings) -> Any:
    return _jwks_client(settings.supabase_url).get_signing_key_from_jwt(token).key


def _decode(token: str, settings: Settings) -> dict[str, Any]:
    algorithm = jwt.get_unverified_header(token).get("alg")
    if algorithm not in _ALGORITHMS:
        raise jwt.InvalidAlgorithmError(f"unsupported algorithm: {algorithm}")
    return jwt.decode(
        token,
        _signing_key(token, settings),
        algorithms=[algorithm],
        audience=settings.jwt_audience,
    )


def current_user(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(_bearer)],
    settings: Annotated[Settings, Depends(get_settings)],
) -> User:
    unauthorized = HTTPException(
        status.HTTP_401_UNAUTHORIZED,
        "Anmeldung erforderlich",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if credentials is None:
        raise unauthorized
    try:
        claims = _decode(credentials.credentials, settings)
    except jwt.PyJWTError as exc:
        raise unauthorized from exc
    # The anon key is a valid JWT too, but it belongs to no user.
    if claims.get("role") != "authenticated" or not claims.get("sub"):
        raise unauthorized
    return User(id=claims["sub"], email=claims.get("email"))
