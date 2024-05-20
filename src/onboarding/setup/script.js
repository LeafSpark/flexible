document.addEventListener('DOMContentLoaded', function () {
    const query = selector => document.querySelector(selector);
    const queryAll = selector => document.querySelectorAll(selector);

    const urlParams = new URLSearchParams(window.location.search);
    let step = parseInt(urlParams.get('l')) || 0;
    const body = document.body;

    const theme = localStorage.getItem('theme') || 'dark';
    body.classList.add(`theme-${theme}`);

    localStorage.setItem('inProgress', 'true');
    localStorage.setItem('onboarding', 'false');
    localStorage.setItem('location', step.toString());

    const progressBar = query('.progress');
    progressBar.style.width = `${(step + 1) * 25}%`;

    const steps = queryAll('.step');
    steps.forEach((stepElement, index) => {
        if (index <= step) {
            stepElement.classList.add('active');
        }
    });

    const content = query('.content');
    fetch(`steps/step_${step}.html`)
        .then(response => response.text())
        .then(html => {
            content.innerHTML = html;
            body.classList.add(`theme-${theme}`);
            initCustomProvidersForm();
        })
        .catch(err => console.warn('Error loading step content:', err));

    query('.continue-btn').addEventListener('click', function () {
        const collectKeys = () => {
            const keys = ['anthropic', 'openai', 'google', 'ollama'].reduce((obj, id) => {
                obj[id] = query(`#${id}-key`).value;
                return obj;
            }, {});

            keys['openai_compatible'] = Array.from(queryAll('.provider-field')).map(field => ({
                name: field.querySelector(`[name='provider-name']`).value,
                key: field.querySelector(`[name='provider-key']`).value,
                url: field.querySelector(`[name='provider-url']`).value,
            })).filter(provider => provider.name && provider.key && provider.url);

            localStorage.setItem('api_keys', JSON.stringify(keys));
        };

        const actions = [
            collectKeys,
            () => localStorage.setItem('backend_endpoint', query('#backend-endpoint').value),
            () => localStorage.setItem('default_landing', query('#default-location').value),
            () => {
                const theme = query('input[name="theme"]:checked').value;
                localStorage.setItem('theme', theme);
                localStorage.setItem('inProgress', 'false');
                window.location.href = `../.${localStorage.getItem('default_landing')}`;
                return; // Make sure to exit after redirect to avoid further JS execution
            }
        ];

        if (step >= 0 && step <= 2) {
            actions[step]();
            step = Math.min(step + 1, 3);
            localStorage.setItem('location', step.toString());
            window.location.href = `index.html?l=${step}`;
        } else if (step === 3) {
            actions[3]();  // Handle the final step
        }
    });

    function initCustomProvidersForm() {
        let providerCount = 1;

        const addProviderField = () => {
            providerCount++;
            const newProvider = `
                <div class='form-group provider-field'>
                    <label for='provider-name-${providerCount}'>Provider Name:</label>
                    <input type='text' id='provider-name-${providerCount}' name='provider-name' required>
                    <label for='provider-key-${providerCount}'>API Key:</label>
                    <input type='password' id='provider-key-${providerCount}' name='provider-key' required>
                    <label for='provider-url-${providerCount}'>URL:</label>
                    <input type='text' id='provider-url-${providerCount}' name='provider-url' required>
                    <button type='button' class='remove-provider-btn'>Remove</button>
                </div>
            `;
            const container = query('#openai-compatible-container');
            const div = document.createElement('div');
            div.innerHTML = newProvider;
            container.appendChild(div);

            div.querySelector('.remove-provider-btn').addEventListener('click', () => div.remove());
        };

        queryAll('.remove-provider-btn').forEach(btn => btn.addEventListener('click', () => btn.closest('.provider-field').remove()));
        query('#add-provider-btn').addEventListener('click', addProviderField);
    }
});
