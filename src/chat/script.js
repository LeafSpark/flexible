document.addEventListener('DOMContentLoaded', async function () {
    const settingsContainer = document.getElementById('settings-container');

    try {
        // Fetch settings HTML and append to settings container
        const response = await fetch('../settings/index.html');

        if (!response.ok) throw new Error('Network response was not ok');

        const html = await response.text();
        settingsContainer.innerHTML = html;
        console.log('Settings HTML fetched and appended successfully.');
        initializeSettings();
    } catch (error) {
        console.error('Error fetching settings HTML:', error);
    }

    // Chat functionality
    document.getElementById('send-button').addEventListener('click', () => {
        const chatInput = document.getElementById('chat-input');
        const chatWindow = document.querySelector('.chat-window');
        const message = chatInput.value.trim();

        if (!message) return;

        // Create and append user's message
        const userMessage = document.createElement('div');
        userMessage.className = 'message user-message';
        userMessage.textContent = message;
        chatWindow.appendChild(userMessage);

        // Clear input box
        chatInput.value = '';

        // Scroll to bottom of chat window
        chatWindow.scrollTop = chatWindow.scrollHeight;

        // Simulate AI response
        setTimeout(() => {
            const aiMessage = document.createElement('div');
            aiMessage.className = 'message ai-message';
            aiMessage.textContent = `AI Response to: ${message}`;
            chatWindow.appendChild(aiMessage);

            // Scroll to bottom of chat window
            chatWindow.scrollTop = chatWindow.scrollHeight;
        }, 1000);
    });
});

function initializeSettings() {
    console.log('Settings initialized');
    const settingsPopup = document.getElementById('settings-popup');
    if (!settingsPopup) {
        console.error('Settings popup element not found!');
        return;
    }

    const closeBtn = settingsPopup.querySelector('.close-btn');
    const saveBtn = settingsPopup.querySelector('.save-btn');
    const form = document.getElementById('settings-form');

    if (!closeBtn || !saveBtn || !form) {
        console.error('One or more required elements from the settings form are missing!');
        return;
    }

    function loadSettings() {
        form.elements['default-landing'].value = localStorage.getItem('default_landing') || '';
        form.elements['backend-endpoint'].value = localStorage.getItem('backend_endpoint') || '';
        const theme = localStorage.getItem('theme') || 'dark';
        form.elements['theme'].value = theme;
        document.getElementById(`theme-${theme}`).checked = true;
    }

    function saveSettings() {
        localStorage.setItem('default_landing', form.elements['default-landing'].value);
        localStorage.setItem('backend_endpoint', form.elements['backend-endpoint'].value);
        const theme = form.elements['theme'].value;
        localStorage.setItem('theme', theme);
        alert('Settings saved!'); // Replace with a nicer UI element if needed
        settingsPopup.classList.add('hidden');
        // Optionally, apply the theme immediately
        document.body.className = document.body.className.replace(/\btheme-\S+/g, '');
        document.body.classList.add(`theme-${theme}`);
    }

    // Open settings popup
    console.log('Adding event listener to settings button');
    document.getElementById('open-settings-btn').addEventListener('click', () => {
        settingsPopup.classList.remove('hidden');
        loadSettings();
    });

    // Close settings popup
    closeBtn.addEventListener('click', () => {
        settingsPopup.classList.add('hidden');
    });

    // Save settings
    saveBtn.addEventListener('click', saveSettings);

    // Close the popup when clicking outside of the popup content
    window.addEventListener('click', (event) => {
        if (event.target === settingsPopup) {
            settingsPopup.classList.add('hidden');
        }
    });

    // Load current settings on page load
    loadSettings();
}
