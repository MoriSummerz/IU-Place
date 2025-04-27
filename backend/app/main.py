from fastapi import FastAPI
from routes.router import router
from depends import redis_client
from contextlib import asynccontextmanager
from config import API_HOST, API_PORT


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Starting up...")
    await redis_client.run()
    yield
    print("Shutting down...")


app = FastAPI(lifespan=lifespan)
app.include_router(router)

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host=API_HOST, port=API_PORT)
