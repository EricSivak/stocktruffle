from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from engine.api import system
from engine.config import get_settings


def create_app() -> FastAPI:
    app = FastAPI(title="stocktruffle engine", version="0.1.0")
    app.add_middleware(
        CORSMiddleware,
        allow_origins=get_settings().cors_origins,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.include_router(system.router)
    return app


app = create_app()
