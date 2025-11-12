// Класс для управления навигацией по анатомии
class AnatomyNavigator {
    constructor() {
        this.currentPartId = 1;
        this.currentPartName = "Назад";
        this.breadcrumb = document.getElementById('breadcrumb');
        this.grid = document.getElementById('anatomy-grid');
        this.currentPartElement = document.getElementById('current-part');
        this.visualizationArea = document.getElementById('body-visualization');

        // Элементы навигации
        this.backButton = document.getElementById('backButton');
        this.forwardButton = document.getElementById('forwardButton');
        this.homeButton = document.getElementById('homeButton');
        this.searchInput = document.getElementById('searchInput');
        this.searchResults = document.getElementById('searchResults');
        this.historyList = document.getElementById('historyList');

        // История навигации
        this.navigationHistory = [];
        this.currentHistoryIndex = -1;
        this.viewHistory = JSON.parse(localStorage.getItem('viewHistory')) || [];

        // Состояние zoom
        this.currentZoom = 1;

        // Данные
        this.images = this.initializeImages();
        this.fallbackImages = this.initializeFallbackImages();
        this.anatomyCatalog = this.initializeAnatomyCatalog();

        this.init();
    }

    initializeImages() {
        return {
            1: 'images/body/full_body.jpg',
            2: 'images/body/head.jpg',
            3: 'images/body/torso.jpg',
            4: 'images/body/arms.jpg',
            5: 'images/body/legs.jpg',
            6: 'images/head/brain.jpg',
            7: 'images/head/skull.jpg',
            8: 'images/head/eyes.jpg',
            9: 'images/head/ears.jpg',
            10: 'images/torso/chest.jpg',
            11: 'images/torso/heart.jpg',
            12: 'images/torso/lungs.jpg',
            13: 'images/arms/hand.jpg',
            14: 'images/arms/fingers.jpg',
            15: 'images/legs/foot.jpg',
            16: 'images/legs/toes.jpg'
        };
    }

    initializeFallbackImages() {
        return {
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
    }

    initializeAnatomyCatalog() {
        return {
            1: { name: "Тело", level: 0 },
            2: { name: "Голова", level: 1 },
            3: { name: "Туловище", level: 1 },
            4: { name: "Руки", level: 1 },
            5: { name: "Ноги", level: 1 },
            6: { name: "Мозг", level: 2 },
            7: { name: "Череп", level: 2 },
            8: { name: "Глаза", level: 2 },
            9: { name: "Уши", level: 2 },
            10: { name: "Грудная клетка", level: 2 },
            11: { name: "Сердце", level: 3 },
            12: { name: "Легкие", level: 3 },
            13: { name: "Кисть", level: 2 },
            14: { name: "Пальцы", level: 3 },
            15: { name: "Стопа", level: 2 },
            16: { name: "Пальцы ног", level: 3 }
        };
    }

    async init() {
        await this.loadBodyPart(this.currentPartId);
        this.setupEventListeners();
        this.setupParallax();
        this.initializeAnimations();
        this.setupNavigationHistory();
        this.updateNavigationButtons();
        this.renderViewHistory();
    }

    async loadBodyPart(partId, direction = null) {
        try {
            this.showLoadingAnimation();
            
            const response = await fetch(`http://localhost:5001/api/body-parts/${partId}`);
            const part = await response.json();
            
            // Анимация перехода
            if (direction === 'back') {
                this.visualizationArea.classList.add('slide-right');
            } else if (direction === 'forward') {
                this.visualizationArea.classList.add('slide-left');
            }
            
            this.currentPartId = partId;
            this.currentPartName = part.name;
            
            this.animateTitleChange(part.name);
            this.renderAnatomyGrid(part.children);
            this.updateBreadcrumb(part);
            this.updateVisualization(partId);
            
            this.addToNavigationHistory(partId, part.name);
            this.addToViewHistory(partId, part.name);
            
            this.showSuccessAnimation();
            this.updateNavigationButtons();
            
            setTimeout(() => {
                this.visualizationArea.classList.remove('slide-left', 'slide-right');
            }, 300);
            
        } catch (error) {
            console.error('Ошибка загрузки данных:', error);
            this.useFallbackData(partId);
            this.showErrorAnimation();
        }
    }

    addToNavigationHistory(partId, partName) {
        const historyItem = { id: partId, name: partName, timestamp: Date.now() };
        
        if (this.currentHistoryIndex < this.navigationHistory.length - 1) {
            this.navigationHistory = this.navigationHistory.slice(0, this.currentHistoryIndex + 1);
        }
        
        this.navigationHistory.push(historyItem);
        this.currentHistoryIndex = this.navigationHistory.length - 1;
    }

    addToViewHistory(partId, partName) {
        this.viewHistory = this.viewHistory.filter(item => item.id !== partId);
        
        this.viewHistory.unshift({
            id: partId,
            name: partName,
            timestamp: Date.now(),
            icon: this.getIconForPart(partName)
        });
        
        this.viewHistory = this.viewHistory.slice(0, 10);
        localStorage.setItem('viewHistory', JSON.stringify(this.viewHistory));
        this.renderViewHistory();
    }

    clearViewHistory() {
        this.viewHistory = [];
        localStorage.setItem('viewHistory', JSON.stringify([]));
        this.renderViewHistory();
    }

    setupNavigationHistory() {
        this.addToNavigationHistory(1, "Тело");
    }

    goBack() {
        if (this.currentHistoryIndex > 0) {
            this.currentHistoryIndex--;
            const historyItem = this.navigationHistory[this.currentHistoryIndex];
            this.loadBodyPart(historyItem.id, 'back');
        }
    }

    goForward() {
        if (this.currentHistoryIndex < this.navigationHistory.length - 1) {
            this.currentHistoryIndex++;
            const historyItem = this.navigationHistory[this.currentHistoryIndex];
            this.loadBodyPart(historyItem.id, 'forward');
        }
    }

    goHome() {
        this.loadBodyPart(1);
    }

    updateNavigationButtons() {
        if (this.backButton) this.backButton.disabled = this.currentHistoryIndex <= 0;
        if (this.forwardButton) this.forwardButton.disabled = this.currentHistoryIndex >= this.navigationHistory.length - 1;
    }

    setupEventListeners() {
        // Навигационные кнопки
        if (this.backButton) this.backButton.addEventListener('click', () => this.goBack());
        if (this.forwardButton) this.forwardButton.addEventListener('click', () => this.goForward());
        if (this.homeButton) this.homeButton.addEventListener('click', () => this.goHome());

        // Поиск
        if (this.searchInput) {
            this.searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
            this.searchInput.addEventListener('focus', () => this.showSearchResults());
        }

        // Горячие клавиши
        document.addEventListener('keydown', (e) => this.handleKeyboardNavigation(e));
    }

    handleKeyboardNavigation(e) {
        if (e.altKey && e.key === 'ArrowLeft') {
            e.preventDefault();
            this.goBack();
        } else if (e.altKey && e.key === 'ArrowRight') {
            e.preventDefault();
            this.goForward();
        } else if (e.altKey && e.key === 'Home') {
            e.preventDefault();
            this.goHome();
        }
    }

    zoomIn() {
        this.currentZoom = Math.min(this.currentZoom + 0.2, 3);
        this.applyZoom();
    }

    zoomOut() {
        this.currentZoom = Math.max(this.currentZoom - 0.2, 0.5);
        this.applyZoom();
    }

    resetZoom() {
        this.currentZoom = 1;
        this.applyZoom();
    }

    applyZoom() {
        const image = this.visualizationArea.querySelector('.body-image');
        if (image) {
            image.style.transform = `scale(${this.currentZoom})`;
        }
    }

    handleSearch(query) {
        if (query.length < 2) {
            this.hideSearchResults();
            return;
        }

        const results = this.searchAnatomy(query.toLowerCase());
        this.displaySearchResults(results);
    }

    searchAnatomy(query) {
        return Object.entries(this.anatomyCatalog)
            .filter(([id, data]) => 
                data.name.toLowerCase().includes(query)
            )
            .map(([id, data]) => ({
                id: parseInt(id),
                name: data.name,
                level: data.level,
                icon: this.getIconForPart(data.name)
            }))
            .slice(0, 10);
    }

    displaySearchResults(results) {
        if (!this.searchResults) return;
        
        if (results.length === 0) {
            this.searchResults.innerHTML = '<div class="search-result">Ничего не найдено</div>';
        } else {
            this.searchResults.innerHTML = results.map(result => `
                <div class="search-result" onclick="anatomyApp.anatomyNavigator.navigateToSearchResult(${result.id})">
                    <span style="margin-right: 0.5rem;">${result.icon}</span>
                    ${result.name}
                </div>
            `).join('');
        }
        this.showSearchResults();
    }

    navigateToSearchResult(partId) {
        this.loadBodyPart(partId);
        this.hideSearchResults();
        if (this.searchInput) this.searchInput.value = '';
    }

    showSearchResults() {
        if (this.searchResults) this.searchResults.style.display = 'block';
    }

    hideSearchResults() {
        if (this.searchResults) this.searchResults.style.display = 'none';
    }

    renderViewHistory() {
        if (!this.historyList) return;
        
        if (this.viewHistory.length === 0) {
            this.historyList.innerHTML = '<div style="color: #666; font-size: 0.8rem; text-align: center;">История пуста</div>';
            return;
        }

        this.historyList.innerHTML = this.viewHistory.map(item => `
            <div class="history-item" onclick="anatomyApp.anatomyNavigator.loadBodyPart(${item.id})">
                <span>${item.icon}</span>
                <span style="flex: 1;">${item.name}</span>
            </div>
        `).join('');
    }

    // Остальные методы (анимации, рендеринг и т.д.) остаются без изменений
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

        const img = new Image();
        img.onload = () => {
            this.visualizationArea.innerHTML = `
                <img src="${imageUrl}" alt="${this.currentPartName}" class="body-image fade-in">
                <p style="margin-top: 1rem; color: #666;">Текущая область: <strong>${this.currentPartName}</strong></p>
            `;
            this.applyZoom();
        };
        img.onerror = () => {
            this.visualizationArea.innerHTML = `
                <img src="${this.fallbackImages[partId]}" alt="${this.currentPartName}" class="body-image fade-in">
                <p style="margin-top: 1rem; color: #666;">Текущая область: <strong>${this.currentPartName}</strong></p>
                <p style="color: #999; font-size: 0.9rem;">Изображение загружено из fallback-источника</p>
            `;
            this.applyZoom();
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
        const notesList = document.getElementById('notesList');
        if (!notesList) return;
        
        notesList.innerHTML = '';

        if (notes.length === 0) {
            notesList.innerHTML = '<div class="empty-state">Записей пока нет</div>';
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
            notesList.appendChild(noteElement);
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