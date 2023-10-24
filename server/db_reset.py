from base import db
from main import app

with app.app_context():
    db.drop_all()
    db.create_all()