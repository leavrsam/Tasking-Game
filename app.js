document.addEventListener('DOMContentLoaded', () => {
    const codeInput = document.getElementById('code-input');
    const submitBtn = document.getElementById('submit-btn');
    const resetBtn = document.getElementById('reset-btn');
    const resultSection = document.getElementById('result-section');
    const inputSection = document.getElementById('input-section');
    const resultText = document.getElementById('result-text');
    const csvUpload = document.getElementById('csv-upload');
    const uploadStatus = document.getElementById('upload-status');
    const clearDataBtn = document.getElementById('clear-data-btn');

    // Load data from localStorage
    let taskData = JSON.parse(localStorage.getItem('taskData')) || {};

    // Auto-load default CSV if storage is empty
    if (Object.keys(taskData).length === 0) {
        fetch('./tasks.csv')
            .then(response => {
                if (response.ok) return response.text();
            })
            .then(text => {
                if (text) {
                    const parsed = parseCSV(text);
                    if (Object.keys(parsed).length > 0) {
                        taskData = parsed;
                        localStorage.setItem('taskData', JSON.stringify(taskData));
                        console.log('Default tasks loaded:', Object.keys(taskData).length);
                    }
                }
            })
            .catch(err => console.log('No default tasks.csv found or fetch failed', err));
    }

    submitBtn.addEventListener('click', handleCodeSubmit);
    resetBtn.addEventListener('click', resetApp);
    csvUpload.addEventListener('change', handleFileUpload);
    clearDataBtn.addEventListener('click', clearData);

    function handleCodeSubmit() {
        const code = codeInput.value.trim();
        if (!code) return;

        inputSection.classList.add('hidden');
        resultSection.classList.remove('hidden');

        if (taskData[code]) {
            resultText.textContent = taskData[code];
            triggerWinEffects();
        } else {
            resultText.textContent = "No Task listed.";
        }
    }

    function resetApp() {
        codeInput.value = '';
        resultSection.classList.add('hidden');
        inputSection.classList.remove('hidden');
        document.body.classList.remove('party-mode');
    }

    function triggerWinEffects() {
        // Confetti
        if (window.confetti) {
            window.confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 }
            });
        }

        // Flashing Background
        // document.body.classList.add('party-mode'); // Optional: bit intense, maybe just confetti is code
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
                localStorage.setItem('taskData', JSON.stringify(taskData));
                uploadStatus.textContent = `Loaded ${Object.keys(parsed).length} codes!`;
            } catch (err) {
                uploadStatus.textContent = "Error parsing CSV.";
                console.error(err);
            }
        };
        reader.readAsText(file);
    }

    function parseCSV(text) {
        // Simple parser: assuming "Code,Prompt" format
        const lines = text.split('\n');
        const data = {};
        lines.forEach(line => {
            const parts = line.split(',');
            if (parts.length >= 2) {
                const code = parts[0].trim();
                // Join the rest in case prompt has commas
                const prompt = parts.slice(1).join(',').trim();
                if (code && prompt) {
                    data[code] = prompt;
                }
            }
        });
        return data;
    }

    function clearData() {
        if (confirm('Are you sure you want to clear all loaded codes?')) {
            localStorage.removeItem('taskData');
            taskData = {};
            uploadStatus.textContent = "Data cleared.";
        }
    }
});
