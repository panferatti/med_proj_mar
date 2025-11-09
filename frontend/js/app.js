class AnatomyNavigator {
    constructor() {
        this.currentPartId = 1;
        this.currentPartName = "Назад";
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
        this.setupParallax();
        this.initializeAnimations();
    }

    async loadBodyPart(partId) {
        try {
            // Добавляем анимацию загрузки
            this.showLoadingAnimation();

            const response = await fetch(`http://localhost:5001/api/body-parts/${partId}`);
            const part = await response.json();

            this.currentPartId = partId;
            this.currentPartName = part.name;

            // Анимируем смену заголовка
            this.animateTitleChange(part.name);

            this.renderAnatomyGrid(part.children);
            this.updateBreadcrumb(part);
            this.updateVisualization(partId);

            // Показываем анимацию успешной загрузки
            this.showSuccessAnimation();

        } catch (error) {
            console.error('Ошибка загрузки данных:', error);
            // Fallback на тестовые данные для демонстрации
            this.useFallbackData(partId);
            this.showErrorAnimation();
        }
    }

    showLoadingAnimation() {
        this.visualizationArea.innerHTML = `
            <div class="empty-state">
                <div class="loading-spinner" style="
                    width: 60px; height: 60px; border: 4px solid #f3f3f3;
                    border-top: 4px solid #667eea; border-radius: 50%;
                    animation: spin 1s linear infinite; margin: 0 auto 1rem;
                "></div>
                <p>Загрузка...</p>
            </div>
        `;
    }

    animateTitleChange(newTitle) {
        this.currentPartElement.style.animation = 'none';
        setTimeout(() => {
            this.currentPartElement.textContent = newTitle;
            this.currentPartElement.style.animation = 'fadeInUp 0.6s ease-out';
        }, 50);
    }

    showSuccessAnimation() {
        const successIcon = document.createElement('div');
        successIcon.innerHTML = '✅';
        successIcon.style.cssText = `
            position: absolute; top: 20px; right: 20px; font-size: 2rem;
            animation: bounceIn 0.6s ease-out; z-index: 10;
        `;
        this.visualizationArea.appendChild(successIcon);

        setTimeout(() => {
            if (successIcon.parentNode) {
                successIcon.parentNode.removeChild(successIcon);
            }
        }, 2000);
    }

    showErrorAnimation() {
        const errorIcon = document.createElement('div');
        errorIcon.innerHTML = '❌';
        errorIcon.style.cssText = `
            position: absolute; top: 20px; right: 20px; font-size: 2rem;
            animation: shake 0.5s ease-in-out; z-index: 10;
        `;
        this.visualizationArea.appendChild(errorIcon);

        setTimeout(() => {
            if (errorIcon.parentNode) {
                errorIcon.parentNode.removeChild(errorIcon);
            }
        }, 2000);
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
            this.grid.innerHTML = '<div class="empty-state fade-in-up">🏁 Дальнейшая детализация недоступна</div>';
            return;
        }

        children.forEach((child, index) => {
            const partElement = document.createElement('div');
            partElement.className = 'body-part fade-in-up';
            partElement.style.animationDelay = `${index * 0.1}s`;
            partElement.innerHTML = `
                <div class="body-part-icon">${this.getIconForPart(child.name)}</div>
                <div>${child.name}</div>
            `;
            partElement.dataset.id = child.id;

            // Добавляем эффект ripple при клике
            partElement.addEventListener('click', (e) => {
                this.createRippleEffect(e);
                setTimeout(() => this.loadBodyPart(child.id), 300);
            });

            this.grid.appendChild(partElement);
        });
    }

    createRippleEffect(event) {
        const button = event.currentTarget;
        const circle = document.createElement('span');
        const diameter = Math.max(button.clientWidth, button.clientHeight);
        const radius = diameter / 2;

        circle.style.width = circle.style.height = `${diameter}px`;
        circle.style.left = `${event.clientX - button.getBoundingClientRect().left - radius}px`;
        circle.style.top = `${event.clientY - button.getBoundingClientRect().top - radius}px`;
        circle.classList.add('ripple');

        const ripple = button.getElementsByClassName('ripple')[0];
        if (ripple) {
            ripple.remove();
        }

        button.appendChild(circle);
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
            {id: 1, name: "Назад"},
            {id: part.id, name: part.name}
        ];

        this.breadcrumb.innerHTML = parts.map((p, index) => `
            <span class="crumb ${index === parts.length - 1 ? 'active' : ''}" data-id="${p.id}">
                ${p.name}
            </span>
            ${index < parts.length - 1 ? '<span class="separator">/</span>' : ''}
        `).join('');

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

    setupParallax() {
        window.addEventListener('mousemove', (e) => {
            const parallaxBg = document.querySelector('.parallax-bg');
            const x = (e.clientX / window.innerWidth) * 20 - 10;
            const y = (e.clientY / window.innerHeight) * 20 - 10;

            if (parallaxBg) {
                parallaxBg.style.transform = `translate(${x}px, ${y}px)`;
            }
        });
    }

    initializeAnimations() {
        // Добавляем CSS анимации
        const style = document.createElement('style');
        style.textContent = `
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }

            @keyframes bounceIn {
                0% { transform: scale(0.3); opacity: 0; }
                50% { transform: scale(1.05); }
                70% { transform: scale(0.9); }
                100% { transform: scale(1); opacity: 1; }
            }

            @keyframes shake {
                0%, 100% { transform: translateX(0); }
                25% { transform: translateX(-10px); }
                75% { transform: translateX(10px); }
            }

            .ripple {
                position: absolute;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.6);
                transform: scale(0);
                animation: ripple-animation 0.6s linear;
                pointer-events: none;
            }

            @keyframes ripple-animation {
                to {
                    transform: scale(4);
                    opacity: 0;
                }
            }

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
                if (notification.parentNode) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
}

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

// Новые глобальные функции
function toggleTheme() {
    document.body.classList.toggle('dark-theme');
    anatomyApp.showNotification('Тема изменена', 'success');
}

function showHelp() {
    anatomyApp.showNotification('💡 Подсказка: Кликайте на части тела для навигации', 'info');
}

function resetNavigation() {
    anatomyApp.loadBodyPart(1);
    anatomyApp.showNotification('Навигация сброшена', 'success');
}

function quickActions() {
    const actions = [
        { name: '📋 Записи', action: () => openNotesModal() },
        { name: '✏️ Новая запись', action: () => openAddNoteModal() },
        { name: '🔄 Сбросить', action: () => resetNavigation() },
        { name: '🏠 На главную', action: () => anatomyApp.loadBodyPart(1) }
    ];

    // Показываем quick actions menu
    anatomyApp.showNotification('Быстрые действия доступны', 'info');
}

// Добавляем обработчики для улучшенного UX
document.addEventListener('DOMContentLoaded', () => {
    anatomyApp = new AnatomyNavigator();

    // Добавляем звуковые эффекты (опционально)
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('body-part') ||
            e.target.closest('.body-part') ||
            e.target.classList.contains('btn') ||
            e.target.closest('.btn')) {
            // Воспроизведение легкого звука клика
            playClickSound();
        }
    });
});

function playClickSound() {
    // Простой звук клика с помощью Web Audio API
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        gainNode.gain.value = 0.1;

        oscillator.start();
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.1);
        oscillator.stop(audioContext.currentTime + 0.1);
    } catch (e) {
        console.log('Web Audio API не поддерживается');
    }
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