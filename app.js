document.addEventListener('DOMContentLoaded', () => {
    const codeInput = document.getElementById('code-input');
    const resultSection = document.getElementById('result-section');
    const inputSection = document.getElementById('input-section');
    const resultText = document.getElementById('result-text');
    const header = document.getElementById('main-header') || document.querySelector('header');
    const actionBtn = document.getElementById('action-btn');
    const csvUpload = document.getElementById('csv-upload');
    const uploadStatus = document.getElementById('upload-status');
    const clearDataBtn = document.getElementById('clear-data-btn');
    const listBtns = document.querySelectorAll('.list-btn');
    const adminListBtns = document.querySelectorAll('.admin-list-btn');

    // Multi-list support
    let currentList = 1;
    let isResultMode = false;

    // Get storage key for current list
    function getStorageKey() {
        return `taskData${currentList}`;
    }

    // Load data for current list
    function loadTaskData() {
        return JSON.parse(localStorage.getItem(getStorageKey())) || {};
    }

    // Save data for current list
    function saveTaskData(data) {
        localStorage.setItem(getStorageKey(), JSON.stringify(data));
    }

    let taskData = loadTaskData();

    // Switch active list
    function switchList(listNum) {
        currentList = listNum;
        taskData = loadTaskData();

        // Update main button states
        listBtns.forEach(btn => {
            btn.classList.toggle('active', parseInt(btn.dataset.list) === listNum);
        });

        // Update admin button states
        adminListBtns.forEach(btn => {
            btn.classList.toggle('active', parseInt(btn.dataset.list) === listNum);
        });

        uploadStatus.textContent = `List ${listNum} selected`;
    }

    // List button click handlers (Main)
    listBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            switchList(parseInt(btn.dataset.list));
        });
    });

    // List button click handlers (Admin)
    adminListBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            switchList(parseInt(btn.dataset.list));
        });
    });

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

    csvUpload.addEventListener('change', handleFileUpload);
    clearDataBtn.addEventListener('click', clearData);

    function handleCodeSubmit() {
        const code = codeInput.value.trim();
        if (!code) return;

        inputSection.classList.add('hidden');
        resultSection.classList.remove('hidden');
        if (header) header.style.display = 'none';

        isResultMode = true;
        actionBtn.textContent = 'Enter Another Code';

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

    function handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function (e) {
            const text = e.target.result;
            try {
                const parsed = parseCSV(text);
                taskData = { ...taskData, ...parsed };
                saveTaskData(taskData);
                uploadStatus.textContent = `Loaded ${Object.keys(parsed).length} codes to List ${currentList}!`;
            } catch (err) {
                uploadStatus.textContent = "Error parsing CSV.";
                console.error(err);
            }
        };
        reader.readAsText(file);
    }

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

    // Custom Modal Elements
    const confirmModal = document.getElementById('confirm-modal');
    const confirmYes = document.getElementById('confirm-yes');
    const confirmNo = document.getElementById('confirm-no');
    const confirmMessage = document.getElementById('confirm-message');

    function clearData(e) {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        confirmMessage.textContent = `Clear all codes for List ${currentList}?`;
        confirmModal.classList.remove('hidden');
    }

    // Modal Event Listeners
    if (confirmYes) {
        confirmYes.addEventListener('click', () => {
            localStorage.removeItem(getStorageKey());
            taskData = {};
            uploadStatus.textContent = `List ${currentList} cleared.`;
            confirmModal.classList.add('hidden');
        });
    }

    if (confirmNo) {
        confirmNo.addEventListener('click', () => {
            confirmModal.classList.add('hidden');
        });
    }
});
