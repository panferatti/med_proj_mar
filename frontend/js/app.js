class AnatomyNavigator {
    constructor() {
        this.currentPartId = 1;
        this.currentPartName = "Тело";
        this.breadcrumb = document.getElementById('breadcrumb');
        this.grid = document.getElementById('anatomy-grid');
        this.currentPartElement = document.getElementById('current-part');
        this.visualizationArea = document.getElementById('body-visualization');
        this.notesModal = document.getElementById('notesModal');
        this.addNoteModal = document.getElementById('addNoteModal');
        this.notesList = document.getElementById('notesList');
        this.noteForm = document.getElementById('noteForm');

        // Объект с путями к изображениям для каждой анатомической части
        this.images = {
            // Уровень 0: Тело
            1: 'images/body/full_body.jpg',

            // Уровень 1: Основные регионы
            2: 'images/body/head.jpg',      // Голова
            3: 'images/body/torso.jpg',     // Туловище
            4: 'images/body/arms.jpg',      // Руки
            5: 'images/body/legs.jpg',      // Ноги

            // Уровень 2: Детализация головы
            6: 'images/head/brain.jpg',     // Мозг
            7: 'images/head/skull.jpg',     // Череп
            8: 'images/head/eyes.jpg',      // Глаза
            9: 'images/head/ears.jpg',      // Уши

            // Уровень 2: Детализация туловища
            10: 'images/torso/chest.jpg',   // Грудная клетка
            11: 'images/torso/heart.jpg',   // Сердце
            12: 'images/torso/lungs.jpg',   // Легкие

            // Уровень 2: Детализация рук
            13: 'images/arms/hand.jpg',     // Кисть
            14: 'images/arms/fingers.jpg',  // Пальцы

            // Уровень 2: Детализация ног
            15: 'images/legs/foot.jpg',     // Стопа
            16: 'images/legs/toes.jpg'      // Пальцы ног
        };

        // Fallback изображения (можно использовать placeholder'ы)
        this.fallbackImages = {
            1: 'https://via.placeholder.com/400x600/667eea/white?text=Тело+человека',
            2: 'https://via.placeholder.com/300x400/764ba2/white?text=Голова',
            3: 'https://via.placeholder.com/400x500/5a67d8/white?text=Туловище',
            4: 'https://via.placeholder.com/300x400/4c51bf/white?text=Руки',
            5: 'https://via.placeholder.com/300x400/434190/white?text=Ноги',
            6: 'https://via.placeholder.com/300x300/667eea/white?text=Мозг',
            7: 'https://via.placeholder.com/300x300/764ba2/white?text=Череп',
            8: 'https://via.placeholder.com/300x300/5a67d8/white?text=Глаза',
            9: 'https://via.placeholder.com/300x300/4c51bf/white?text=Уши',
            10: 'https://via.placeholder.com/400x400/434190/white?text=Грудная+клетка',
            11: 'https://via.placeholder.com/300x300/667eea/white?text=Сердце',
            12: 'https://via.placeholder.com/300x300/764ba2/white?text=Легкие',
            13: 'https://via.placeholder.com/300x300/5a67d8/white?text=Кисть',
            14: 'https://via.placeholder.com/300x300/4c51bf/white?text=Пальцы',
            15: 'https://via.placeholder.com/300x300/434190/white?text=Стопа',
            16: 'https://via.placeholder.com/300x300/667eea/white?text=Пальцы+ног'
        };

        this.init();
    }

    async init() {
        await this.loadBodyPart(this.currentPartId);
        this.setupEventListeners();
    }

    async loadBodyPart(partId) {
        try {
            const response = await fetch(`http://localhost:5001/api/body-parts/${partId}`);
            const part = await response.json();

            this.currentPartId = partId;
            this.currentPartName = part.name;
            this.currentPartElement.textContent = part.name;

            this.renderAnatomyGrid(part.children);
            this.updateBreadcrumb(part);
            this.updateVisualization(partId);

        } catch (error) {
            console.error('Ошибка загрузки данных:', error);
            // Fallback на тестовые данные для демонстрации
            this.useFallbackData(partId);
        }
    }

    useFallbackData(partId) {
        // Тестовые данные для демонстрации, если API недоступно
        const testData = {
            1: { name: "Тело", children: [
                {id: 2, name: "Голова"}, {id: 3, name: "Туловище"},
                {id: 4, name: "Руки"}, {id: 5, name: "Ноги"}
            ]},
            2: { name: "Голова", children: [
                {id: 6, name: "Мозг"}, {id: 7, name: "Череп"},
                {id: 8, name: "Глаза"}, {id: 9, name: "Уши"}
            ]},
            3: { name: "Туловище", children: [
                {id: 10, name: "Грудная клетка"}, {id: 11, name: "Сердце"},
                {id: 12, name: "Легкие"}
            ]},
            4: { name: "Руки", children: [
                {id: 13, name: "Кисть"}, {id: 14, name: "Пальцы"}
            ]},
            5: { name: "Ноги", children: [
                {id: 15, name: "Стопа"}, {id: 16, name: "Пальцы ног"}
            ]}
        };

        const part = testData[partId] || { name: "Неизвестная часть", children: [] };
        this.currentPartId = partId;
        this.currentPartName = part.name;
        this.currentPartElement.textContent = part.name;

        this.renderAnatomyGrid(part.children);
        this.updateBreadcrumb(part);
        this.updateVisualization(partId);
    }

    renderAnatomyGrid(children) {
        this.grid.innerHTML = '';

        if (children.length === 0) {
            this.grid.innerHTML = '<div class="empty-state">Дальнейшая детализация недоступна</div>';
            return;
        }

        children.forEach(child => {
            const partElement = document.createElement('div');
            partElement.className = 'body-part';
            partElement.innerHTML = `
                <div style="font-size: 2rem; margin-bottom: 0.5rem;">${this.getIconForPart(child.name)}</div>
                <div>${child.name}</div>
            `;
            partElement.dataset.id = child.id;
            partElement.addEventListener('click', () => this.loadBodyPart(child.id));
            this.grid.appendChild(partElement);
        });
    }

    getIconForPart(partName) {
        const icons = {
            'Голова': '🧠',
            'Туловище': '👤',
            'Руки': '💪',
            'Ноги': '🦵',
            'Мозг': '🧠',
            'Череп': '💀',
            'Глаза': '👀',
            'Уши': '👂',
            'Грудная клетка': '🩻',
            'Сердце': '❤️',
            'Легкие': '🫁',
            'Кисть': '🤚',
            'Пальцы': '👆',
            'Стопа': '🦶',
            'Пальцы ног': '🦶'
        };
        return icons[partName] || '🔍';
    }

    updateBreadcrumb(part) {
        // Упрощенная версия breadcrumb - в реальном приложении нужно строить полный путь
        const parts = [
            {id: 1, name: "Тело"},
            {id: part.id, name: part.name}
        ];

        this.breadcrumb.innerHTML = parts.map((p, index) => `
            <span class="crumb ${index === parts.length - 1 ? 'active' : ''}" data-id="${p.id}">
                ${p.name}
            </span>
            ${index < parts.length - 1 ? '<span class="separator">/</span>' : ''}
        `).join('');

        // Добавляем обработчики для хлебных крошек
        this.breadcrumb.querySelectorAll('.crumb:not(.active)').forEach(crumb => {
            crumb.addEventListener('click', (e) => {
                const id = parseInt(e.target.dataset.id);
                this.loadBodyPart(id);
            });
        });
    }

    updateVisualization(partId) {
        const imageUrl = this.images[partId] || this.fallbackImages[partId];

        // Создаем изображение с обработчиком ошибок
        const img = new Image();
        img.onload = () => {
            this.visualizationArea.innerHTML = `
                <img src="${imageUrl}" alt="${this.currentPartName}" class="body-image fade-in">
                <p style="margin-top: 1rem; color: #666;">Текущая область: <strong>${this.currentPartName}</strong></p>
            `;
        };
        img.onerror = () => {
            // Если изображение не загружается, используем fallback
            this.visualizationArea.innerHTML = `
                <img src="${this.fallbackImages[partId]}" alt="${this.currentPartName}" class="body-image fade-in">
                <p style="margin-top: 1rem; color: #666;">Текущая область: <strong>${this.currentPartName}</strong></p>
                <p style="color: #999; font-size: 0.9rem;">Изображение загружено из fallback-источника</p>
            `;
        };
        img.src = imageUrl;
    }

    async loadNotes() {
        try {
            const response = await fetch(`http://localhost:5001/api/notes/${this.currentPartId}`);
            const notes = await response.json();

            this.renderNotes(notes);
        } catch (error) {
            console.error('Ошибка загрузки записей:', error);
            // Показываем тестовые записи для демонстрации
            this.renderNotes([
                {
                    id: 1,
                    doctor: "Доктор Иванов",
                    content: "Пример медицинской записи для демонстрации",
                    date: new Date().toISOString()
                }
            ]);
        }
    }

    renderNotes(notes) {
        this.notesList.innerHTML = '';

        if (notes.length === 0) {
            this.notesList.innerHTML = '<div class="empty-state">Записей пока нет</div>';
            return;
        }

        notes.forEach(note => {
            const noteElement = document.createElement('div');
            noteElement.className = 'note-item fade-in';
            noteElement.innerHTML = `
                <div class="note-header">
                    <span class="note-doctor">👨‍⚕️ ${note.doctor}</span>
                    <span class="note-date">${new Date(note.date).toLocaleDateString('ru-RU')}</span>
                </div>
                <div class="note-content">${note.content}</div>
            `;
            this.notesList.appendChild(noteElement);
        });
    }

    setupEventListeners() {
        this.noteForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const formData = {
                body_part_id: this.currentPartId,
                doctor_name: document.getElementById('doctorName').value,
                content: document.getElementById('noteContent').value
            };

            try {
                const response = await fetch('http://localhost:5001/api/notes', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify(formData)
                });

                if (response.ok) {
                    this.noteForm.reset();
                    closeAddNoteModal();
                    await this.loadNotes();

                    // Показываем уведомление об успехе
                    this.showNotification('Запись успешно добавлена', 'success');
                } else {
                    throw new Error('Ошибка сервера');
                }

            } catch (error) {
                console.error('Ошибка сохранения записи:', error);
                this.showNotification('Ошибка при сохранении записи', 'error');
            }
        });
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            animation: slideInRight 0.3s ease;
        `;
        notification.textContent = message;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
}

// Добавляем CSS анимации для уведомлений
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }

    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }

    .breadcrumb .active {
        color: #667eea;
        font-weight: 600;
    }
`;
document.head.appendChild(style);

// Глобальные функции для работы с модальными окнами
function openNotesModal() {
    const modal = document.getElementById('notesModal');
    anatomyApp.loadNotes();
    modal.classList.add('active');
}

function closeNotesModal() {
    const modal = document.getElementById('notesModal');
    modal.classList.remove('active');
}

function openAddNoteModal() {
    const modal = document.getElementById('addNoteModal');
    // Очищаем форму при открытии
    document.getElementById('noteForm').reset();
    modal.classList.add('active');
}

function closeAddNoteModal() {
    const modal = document.getElementById('addNoteModal');
    modal.classList.remove('active');
}

// Закрытие модальных окон при клике вне контента
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        e.target.classList.remove('active');
    }
});

// Закрытие модальных окон по ESC
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeNotesModal();
        closeAddNoteModal();
    }
});

// Инициализация приложения
let anatomyApp;
document.addEventListener('DOMContentLoaded', () => {
    anatomyApp = new AnatomyNavigator();
});