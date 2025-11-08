from flask import Flask, jsonify, request
from flask_cors import CORS
from models import db, BodyPart, MedicalNote

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///medical.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Разрешаем CORS для фронтенда
CORS(app)

# Инициализируем базу данных
db.init_app(app)

# Импортируем функцию инициализации после создания app
with app.app_context():
    db.create_all()
    from database import init_database
    init_database()

@app.route('/')
def index():
    return "Медицинская визуализация API работает!"

@app.route('/api/body-parts/<int:part_id>')
def get_body_part(part_id):
    part = BodyPart.query.get_or_404(part_id)
    return jsonify({
        'id': part.id,
        'name': part.name,
        'level': part.level,
        'children': [{'id': c.id, 'name': c.name} for c in part.children]
    })

@app.route('/api/notes/<int:part_id>')
def get_notes(part_id):
    notes = MedicalNote.query.filter_by(body_part_id=part_id).order_by(MedicalNote.created_at.desc()).all()
    return jsonify([{
        'id': n.id,
        'doctor': n.doctor_name,
        'content': n.content,
        'date': n.created_at.isoformat()
    } for n in notes])

@app.route('/api/notes', methods=['POST'])
def add_note():
    data = request.json
    note = MedicalNote(
        body_part_id=data['body_part_id'],
        doctor_name=data['doctor_name'],
        content=data['content']
    )
    db.session.add(note)
    db.session.commit()
    return jsonify({'success': True})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)