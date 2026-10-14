from typing import Annotated

from fastapi import APIRouter, Depends

from engine.auth import User, current_user

router = APIRouter()


@router.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@router.get("/me")
def me(user: Annotated[User, Depends(current_user)]) -> User:
    return user
