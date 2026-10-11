from fastapi import APIRouter
from app import constants

router = APIRouter()

@router.get("/signup")
def signup():
    #use pydantic base models to contain front end data from sign up form to api
    return {"greeting:": "greeting from signup endpoint"}
@router.get("/login")
def login():
    return {"login_greeting": "greeting from login endpoint"}