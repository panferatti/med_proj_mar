from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class BodyPart(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    parent_id = db.Column(db.Integer, db.ForeignKey('body_part.id'))
    level = db.Column(db.Integer, nullable=False)
    children = db.relationship('BodyPart', backref=db.backref('parent', remote_side=[id]))

class MedicalNote(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    body_part_id = db.Column(db.Integer, db.ForeignKey('body_part.id'), nullable=False)
    doctor_name = db.Column(db.String(100), nullable=False)
    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    body_part = db.relationship('BodyPart', backref='notes')