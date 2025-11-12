// Основной файл приложения
class MedicalVisualizationApp {
    constructor() {
        this.anatomyNavigator = null;
        this.init();
    }

    async init() {
        // Инициализируем навигацию
        this.anatomyNavigator = new AnatomyNavigator();

        // Настраиваем глобальные обработчики
        this.setupGlobalEventListeners();

        console.log('Медицинская визуализация инициализирована');
    }

    setupGlobalEventListeners() {
        // Звуки кликов
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('body-part') ||
                e.target.closest('.body-part') ||
                e.target.classList.contains('btn') ||
                e.target.closest('.btn')) {
                playClickSound();
            }
        });

        // Глобальные горячие клавиши
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                closeNotesModal();
                closeAddNoteModal();
                if (window.anatomyApp?.anatomyNavigator) {
                    window.anatomyApp.anatomyNavigator.hideSearchResults();
                }
            }
        });

        // Закрытие модальных окон при клике вне контента
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                e.target.classList.remove('active');
            }
        });
    }
}

// Глобальные функции
function toggleTheme() {
    document.body.classList.toggle('dark-theme');
    if (window.anatomyApp?.anatomyNavigator) {
        window.anatomyApp.anatomyNavigator.showNotification('Тема изменена', 'success');
    }
}

function showHelp() {
    if (window.anatomyApp?.anatomyNavigator) {
        window.anatomyApp.anatomyNavigator.showNotification('💡 Подсказка: Используйте Alt+←/→ для навигации, поиск и быстрые кнопки', 'info');
    }
}

function resetNavigation() {
    if (window.anatomyApp?.anatomyNavigator) {
        window.anatomyApp.anatomyNavigator.loadBodyPart(1);
        window.anatomyApp.anatomyNavigator.showNotification('Навигация сброшена', 'success');
    }
}

function quickActions() {
    if (window.anatomyApp?.anatomyNavigator) {
        window.anatomyApp.anatomyNavigator.showNotification('⚡ Быстрые действия: Используйте кнопки навигации и поиск', 'info');
    }
}

function navigateToPart(partId) {
    if (window.anatomyApp?.anatomyNavigator) {
        window.anatomyApp.anatomyNavigator.loadBodyPart(partId);
    }
}

function clearHistory() {
    if (window.anatomyApp?.anatomyNavigator && confirm('Очистить историю просмотров?')) {
        window.anatomyApp.anatomyNavigator.clearViewHistory();
        window.anatomyApp.anatomyNavigator.showNotification('История очищена', 'success');
    }
}

function zoomIn() {
    if (window.anatomyApp?.anatomyNavigator) {
        window.anatomyApp.anatomyNavigator.zoomIn();
    }
}

function zoomOut() {
    if (window.anatomyApp?.anatomyNavigator) {
        window.anatomyApp.anatomyNavigator.zoomOut();
    }
}

function resetZoom() {
    if (window.anatomyApp?.anatomyNavigator) {
        window.anatomyApp.anatomyNavigator.resetZoom();
    }
}

// Инициализация приложения при загрузке DOM
document.addEventListener('DOMContentLoaded', () => {
    window.anatomyApp = new MedicalVisualizationApp();
});