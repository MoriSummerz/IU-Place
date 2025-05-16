from fastapi import FastAPI
from routes.router import router
from depends import redis_client
from contextlib import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware
from prometheus_fastapi_instrumentator import Instrumentator


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Starting up...")
    await redis_client.run()
    yield
    print("Shutting down...")


app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)
Instrumentator().instrument(app).expose(app)

