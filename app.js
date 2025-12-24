document.addEventListener('DOMContentLoaded', () => {
    const codeInput = document.getElementById('code-input');
    const resultSection = document.getElementById('result-section');
    const inputSection = document.getElementById('input-section');
    const resultText = document.getElementById('result-text');
    const header = document.getElementById('main-header') || document.querySelector('header');
    const actionBtn = document.getElementById('action-btn');
    const listBtns = document.querySelectorAll('.list-btn');

    // Admin Page Elements
    const adminToggle = document.getElementById('admin-toggle');
    const adminPage = document.getElementById('admin-page');
    const adminBack = document.getElementById('admin-back');
    const csvUploads = document.querySelectorAll('.csv-upload');
    const clearListBtns = document.querySelectorAll('.clear-list-btn');

    // Modal Elements
    const confirmModal = document.getElementById('confirm-modal');
    const confirmYes = document.getElementById('confirm-yes');
    const confirmNo = document.getElementById('confirm-no');
    const confirmMessage = document.getElementById('confirm-message');

    // State
    let currentList = 1;
    let isResultMode = false;
    let pendingClearList = null;

    // Storage helpers
    function getStorageKey(listNum) {
        return `taskData${listNum}`;
    }

    function loadTaskData(listNum) {
        return JSON.parse(localStorage.getItem(getStorageKey(listNum))) || {};
    }

    function saveTaskData(listNum, data) {
        localStorage.setItem(getStorageKey(listNum), JSON.stringify(data));
    }

    // Switch active list (main app)
    function switchList(listNum) {
        currentList = listNum;

        listBtns.forEach(btn => {
            btn.classList.toggle('active', parseInt(btn.dataset.list) === listNum);
        });
    }

    // Main list button handlers
    listBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            switchList(parseInt(btn.dataset.list));
        });
    });

    // Admin Page Toggle
    if (adminToggle) {
        adminToggle.addEventListener('click', () => {
            adminPage.classList.remove('hidden');
        });
    }

    if (adminBack) {
        adminBack.addEventListener('click', () => {
            adminPage.classList.add('hidden');
        });
    }

    // Action button handler
    if (actionBtn) {
        actionBtn.addEventListener('click', () => {
            if (isResultMode) {
                resetApp();
            } else {
                handleCodeSubmit();
            }
        });
    }

    // Enter key to submit
    if (codeInput) {
        codeInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleCodeSubmit();
            }
        });
    }

    function handleCodeSubmit() {
        const code = codeInput.value.trim();
        if (!code) return;

        inputSection.classList.add('hidden');
        resultSection.classList.remove('hidden');
        if (header) header.style.display = 'none';

        isResultMode = true;
        actionBtn.textContent = 'Enter Another Code';

        const taskData = loadTaskData(currentList);
        if (taskData[code]) {
            resultText.textContent = taskData[code];
            if (Math.random() > 0.5) {
                triggerWinEffects();
            }
        } else {
            resultText.textContent = "No Task listed.";
        }
    }

    function resetApp() {
        codeInput.value = '';
        resultSection.classList.add('hidden');
        inputSection.classList.remove('hidden');
        if (header) header.style.display = '';
        document.body.classList.remove('party-mode');
        isResultMode = false;
        actionBtn.textContent = 'Submit';
        codeInput.focus();
    }

    function triggerWinEffects() {
        if (window.confetti) {
            window.confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 }
            });
        }
    }

    // Per-list file upload handlers
    csvUploads.forEach(input => {
        input.addEventListener('change', (event) => {
            const listNum = parseInt(input.dataset.list);
            const file = event.target.files[0];
            if (!file) return;

            const statusEl = document.querySelector(`.upload-status[data-list="${listNum}"]`);

            const reader = new FileReader();
            reader.onload = function (e) {
                const text = e.target.result;
                try {
                    const parsed = parseCSV(text);
                    const existingData = loadTaskData(listNum);
                    const mergedData = { ...existingData, ...parsed };
                    saveTaskData(listNum, mergedData);
                    if (statusEl) {
                        statusEl.textContent = `Loaded ${Object.keys(parsed).length} codes!`;
                    }
                } catch (err) {
                    if (statusEl) {
                        statusEl.textContent = "Error parsing CSV.";
                    }
                    console.error(err);
                }
            };
            reader.readAsText(file);
        });
    });

    function parseCSV(text) {
        const lines = text.split('\n');
        const data = {};
        lines.forEach(line => {
            const parts = line.split(',');
            if (parts.length >= 2) {
                const code = parts[0].trim();
                const prompt = parts.slice(1).join(',').trim();
                if (code && prompt) {
                    data[code] = prompt;
                }
            }
        });
        return data;
    }

    // Per-list clear handlers
    clearListBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            pendingClearList = parseInt(btn.dataset.list);
            confirmMessage.textContent = `Clear all codes for List ${pendingClearList}?`;
            confirmModal.classList.remove('hidden');
        });
    });

    // Modal handlers
    if (confirmYes) {
        confirmYes.addEventListener('click', () => {
            if (pendingClearList) {
                localStorage.removeItem(getStorageKey(pendingClearList));
                const statusEl = document.querySelector(`.upload-status[data-list="${pendingClearList}"]`);
                if (statusEl) {
                    statusEl.textContent = `List ${pendingClearList} cleared.`;
                }
                pendingClearList = null;
            }
            confirmModal.classList.add('hidden');
        });
    }

    if (confirmNo) {
        confirmNo.addEventListener('click', () => {
            pendingClearList = null;
            confirmModal.classList.add('hidden');
        });
    }
});
