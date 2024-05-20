document.addEventListener('DOMContentLoaded', function () {
    const urlParams = new URLSearchParams(window.location.search);
    let step = parseInt(urlParams.get('l')) || 0;

    // Load theme from localStorage and apply it
    const theme = localStorage.getItem('theme') || 'dark';
    document.body.classList.add(`theme-${theme}`);

    // Initialize localStorage values
    localStorage.setItem('inProgress', 'true');
    localStorage.setItem('onboarding', 'false');
    localStorage.setItem('location', step.toString());

    // Update progress bar
    const progressBar = document.querySelector('.progress');
    const steps = document.querySelectorAll('.step');
    progressBar.style.width = `${(step + 1) * 25}%`;

    // Highlight current step
    steps.forEach((stepElement, index) => {
        if (index <= step) {
            stepElement.classList.add('active');
        }
    });

    // Load content based on step
    const content = document.querySelector('.content');
    fetch(`steps/step_${step}.html`)
        .then(response => response.text())
        .then(html => {
            content.innerHTML = html;
            // Re-apply the theme to the newly loaded content
            document.body.classList.add(`theme-${theme}`);
            // Initialize additional JS for dynamically added content after loading
            initCustomProvidersForm();
        })
        .catch(err => console.warn('Error loading step content:', err));

    // Continue button click handler
    document.querySelector('.continue-btn').addEventListener('click', function () {
        if (step === 0) {
            const keys = {
                anthropic: document.getElementById('anthropic-key').value,
                openai: document.getElementById('openai-key').value,
                google: document.getElementById('google-key').value,
                ollama: document.getElementById('ollama-key').value
            };

            const providerFields = document.querySelectorAll('.provider-field');
            keys['openai_compatible'] = [];

            providerFields.forEach((field, index) => {
                const name = field.querySelector(`[name='provider-name']`).value;
                const key = field.querySelector(`[name='provider-key']`).value;
                const url = field.querySelector(`[name='provider-url']`).value;

                if (name && key && url) {
                    keys['openai_compatible'].push({ name, key, url });
                }
            });

            localStorage.setItem('api_keys', JSON.stringify(keys));
        } else if (step === 1) {
            const backendEndpoint = document.getElementById('backend-endpoint').value;
            if (backendEndpoint) {
                localStorage.setItem('backend_endpoint', backendEndpoint);
            }
        } else if (step === 2) {
            const defaultLocation = document.getElementById('default-location').value;
            localStorage.setItem('default_landing', defaultLocation);
        } else if (step === 3) {
            const theme = document.querySelector('input[name="theme"]:checked').value;
            localStorage.setItem('theme', theme);
            localStorage.setItem('inProgress', 'false');
            window.location.href = "../." + localStorage.getItem('default_landing');
            return;
        }

        step = Math.min(step + 1, 3); // Ensure step doesn't exceed 3
        localStorage.setItem('location', step.toString());
        window.location.href = `index.html?l=${step}`;
    });

    function initCustomProvidersForm() {
        let providerCount = 1;

        // Handle add another provider button click
        document.getElementById('add-provider-btn').addEventListener('click', function () {
            providerCount++;
            const newProviderField = document.createElement('div');
            newProviderField.classList.add('form-group', 'provider-field');
            newProviderField.innerHTML = `
                <label for="provider-name-${providerCount}">Provider Name:</label>
                <input type="text" id="provider-name-${providerCount}" name="provider-name" required>

                <label for="provider-key-${providerCount}">API Key:</label>
                <input type="password" id="provider-key-${providerCount}" name="provider-key" required>

                <label for="provider-url-${providerCount}">URL:</label>
                <input type="text" id="provider-url-${providerCount}" name="provider-url" required>

                <button type="button" class="remove-provider-btn">Remove</button>
            `;
            document.getElementById('openai-compatible-container').appendChild(newProviderField);

            newProviderField.querySelector('.remove-provider-btn').addEventListener('click', function () {
                this.parentElement.remove();
            });
        });

        // Attach event listeners to initial remove button
        document.querySelectorAll('.remove-provider-btn').forEach(button => {
            button.addEventListener('click', function () {
                this.parentElement.remove();
            });
        });
    }
});
