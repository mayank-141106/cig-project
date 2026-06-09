from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
import app.models.models

from app.routes import auth, clubs, events, upload, media, social, ai

app = FastAPI(title="CIG Media Platform", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5500",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5500",
        "https://cig-project.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

app.include_router(auth.router)
app.include_router(clubs.router)
app.include_router(events.router)
app.include_router(upload.router)
app.include_router(media.router)
app.include_router(social.router)
app.include_router(ai.router)

@app.get("/")
def root():
    return {"message": "CIG Media Platform API is running"}
