from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, db
from app import constants
app = FastAPI()

app.add_middleware( #automatically takes https requests and attatches necessary response headers
    CORSMiddleware,
    allow_origins=[constants.FASTAPI_BASE_URL],
    allow_methods=["*"],
    allow_headers=["*"],
)
#routers
app.include_router(auth.router, prefix="/auth", tags=["auth"])

@app.get("/")
def home():
    return {"greeting": "greeting from home endpoint"}
