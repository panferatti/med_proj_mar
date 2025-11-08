from models import db, BodyPart

def init_database():
    # Проверяем, не заполнена ли уже база
    if BodyPart.query.count() == 0:
        # Создаем иерархию анатомии
        body = BodyPart(name="Тело", level=0)

        # Уровень 1: Основные регионы
        head = BodyPart(name="Голова", parent=body, level=1)
        torso = BodyPart(name="Туловище", parent=body, level=1)
        arms = BodyPart(name="Руки", parent=body, level=1)
        legs = BodyPart(name="Ноги", parent=body, level=1)

        # Уровень 2: Детализация головы
        brain = BodyPart(name="Мозг", parent=head, level=2)
        skull = BodyPart(name="Череп", parent=head, level=2)
        eyes = BodyPart(name="Глаза", parent=head, level=2)
        ears = BodyPart(name="Уши", parent=head, level=2)

        # Уровень 3: Детализация мозга
        frontal_lobe = BodyPart(name="Лобная доля", parent=brain, level=3)
        temporal_lobe = BodyPart(name="Височная доля", parent=brain, level=3)
        parietal_lobe = BodyPart(name="Теменная доля", parent=brain, level=3)
        occipital_lobe = BodyPart(name="Затылочная доля", parent=brain, level=3)

        # Уровень 2: Детализация туловища
        chest = BodyPart(name="Грудная клетка", parent=torso, level=2)
        abdomen = BodyPart(name="Брюшная полость", parent=torso, level=2)

        # Уровень 3: Детализация грудной клетки
        heart = BodyPart(name="Сердце", parent=chest, level=3)
        lungs = BodyPart(name="Легкие", parent=chest, level=3)

        # Уровень 2: Детализация рук
        left_arm = BodyPart(name="Левая рука", parent=arms, level=2)
        right_arm = BodyPart(name="Правая рука", parent=arms, level=2)

        # Уровень 2: Детализация ног
        left_leg = BodyPart(name="Левая нога", parent=legs, level=2)
        right_leg = BodyPart(name="Правая нога", parent=legs, level=2)

        db.session.add(body)
        db.session.commit()
        print("✅ База данных инициализирована с анатомической иерархией")
    else:
        print("ℹ️ База данных уже содержит данные")