const nameInput = document.querySelector('input[name="Name"]');
const alertText = document.getElementById('alert-txt');
const checkInButton = document.querySelector('.submit-check-in');
const configWarning = document.getElementById('config-warning');

// runtime-configured endpoint (populated from /config.json)
let googleScriptUrl = null;

// Try to load local config at runtime. This file should NOT be committed to git.
fetch('/config.json')
    .then(res => {
        if (!res.ok) throw new Error('Config not found');
        return res.json();
    })
    .then(cfg => {
        if (cfg && cfg.googleScriptUrl) {
            googleScriptUrl = cfg.googleScriptUrl;
            // if form exists, set action so progressive enhancement works
            const form = document.getElementById('check-in-form');
            if (form) form.action = googleScriptUrl;
            if (configWarning) configWarning.style.display = 'none';
        } else {
            if (configWarning) configWarning.style.display = 'block';
        }
    })
    .catch(() => {
        if (configWarning) configWarning.style.display = 'block';
    });

nameInput.addEventListener('input', function() {
if (this.value.includes('@')) {
    alertText.style.display = 'block';
    checkInButton.disabled = true;
    this.style.borderColor = 'red';
    this.style.backgroundColor = 'transparent';
} else {
    alertText.style.display = 'none';
    checkInButton.disabled = false;
    this.style.borderColor = '';
    this.style.backgroundColor = '';
}
});

document.getElementById('check-in-form').addEventListener('submit', function(event) {
event.preventDefault();

const form = event.target;
    // guard: ensure we have a configured endpoint
    if (!googleScriptUrl) {
        configWarning.style.display = 'block';
        alert('Form not configured. Please add a local config.json with your Google Script URL.');
        return;
    }
    // set form action dynamically to keep the URL out of source control
    form.action = googleScriptUrl;
const formData = new FormData(form);
const loadingContainer = document.querySelector('.loading-container');
const successContainer = document.querySelector('.success-container');
const currentDateElement = document.getElementById('currentDate');

loadingContainer.style.display = 'flex';

fetch(form.action, {
    method: 'POST',
    body: formData,
    mode: 'no-cors'
})
.then(response => {
    console.log('Form submitted successfully!');
    form.reset();
    loadingContainer.style.display = 'none';
    successContainer.style.display = 'flex';
    
    const now = new Date();
    const options = {year: 'numeric', month: 'long', day: 'numeric'};
    currentDateElement.textContent = now.toLocaleDateString(undefined, options);
})
.catch(error => {
    console.error('Error submitting form:', error);
    loadingContainer.style.display = 'none';
    alert('There was an error submitting the form. Please try again.');
});
});