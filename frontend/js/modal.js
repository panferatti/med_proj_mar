// Функции для работы с модальными окнами
function openNotesModal() {
    const modal = document.getElementById('notesModal');
    if (modal && window.anatomyApp?.anatomyNavigator) {
        window.anatomyApp.anatomyNavigator.loadNotes();
        modal.classList.add('active');
    }
}

function closeNotesModal() {
    const modal = document.getElementById('notesModal');
    if (modal) modal.classList.remove('active');
}

function openAddNoteModal() {
    const modal = document.getElementById('addNoteModal');
    const noteForm = document.getElementById('noteForm');
    if (modal && noteForm) {
        noteForm.reset();
        modal.classList.add('active');
    }
}

function closeAddNoteModal() {
    const modal = document.getElementById('addNoteModal');
    if (modal) modal.classList.remove('active');
}

// Обработчик формы добавления записи
document.addEventListener('DOMContentLoaded', function() {
    const noteForm = document.getElementById('noteForm');
    if (noteForm) {
        noteForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            if (!window.anatomyApp?.anatomyNavigator) return;

            const formData = {
                body_part_id: window.anatomyApp.anatomyNavigator.currentPartId,
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
                    noteForm.reset();
                    closeAddNoteModal();
                    await window.anatomyApp.anatomyNavigator.loadNotes();
                    window.anatomyApp.anatomyNavigator.showNotification('Запись успешно добавлена', 'success');
                } else {
                    throw new Error('Ошибка сервера');
                }

            } catch (error) {
                console.error('Ошибка сохранения записи:', error);
                window.anatomyApp.anatomyNavigator.showNotification('Ошибка при сохранении записи', 'error');
            }
        });
    }
});