const nameInput = document.querySelector('input[name="Name"]');
const alertText = document.getElementById('alert-txt');
const checkInButton = document.querySelector('.submit-check-in');
const configWarning = document.getElementById('config-warning');
const eventSelect = document.getElementById('event-select');

// runtime-configured endpoint (populated from /config.json)
let googleScriptUrl = null;
let allEvents = [];

// Load events from events.json
fetch('/events.json')
    .then(res => res.json())
    .then(events => {
        allEvents = events;
        populateEventDropdown();
    })
    .catch(error => {
        console.error('Error loading events:', error);
        eventSelect.innerHTML = '<option value="">Error loading events</option>';
    });

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

function populateEventDropdown() {
    const now = new Date();
    const currentWeekStart = getWeekStart(now);
    const currentWeekEnd = new Date(currentWeekStart);
    currentWeekEnd.setDate(currentWeekEnd.getDate() + 6);

    // Filter events for current week
    const weekEvents = allEvents.filter(event => {
        const eventDate = new Date(event.date + 'T00:00:00');
        return eventDate >= currentWeekStart && eventDate <= currentWeekEnd;
    });

    // Sort events by date and time
    weekEvents.sort((a, b) => {
        const dateA = new Date(a.date + 'T' + a.time);
        const dateB = new Date(b.date + 'T' + b.time);
        return dateA - dateB;
    });

    // Clear dropdown
    eventSelect.innerHTML = '';

    if (weekEvents.length === 0) {
        eventSelect.innerHTML = '<option value="">No events this week</option>';
        return;
    }

    // Find the event to auto-select (today's or next upcoming)
    let selectedIndex = 0;
    const today = now.toISOString().split('T')[0];
    
    for (let i = 0; i < weekEvents.length; i++) {
        if (weekEvents[i].date >= today) {
            selectedIndex = i;
            break;
        }
    }

    // Populate dropdown with formatted events
    weekEvents.forEach((event, index) => {
        const eventDate = new Date(event.date + 'T00:00:00');
        const formattedDate = formatEventDate(eventDate);
        const displayText = `${event.name} - ${formattedDate}, ${event.time}`;
        
        const option = document.createElement('option');
        option.value = displayText;
        option.textContent = displayText;
        if (index === selectedIndex) {
            option.selected = true;
        }
        eventSelect.appendChild(option);
    });
}

function getWeekStart(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Monday start
    const weekStart = new Date(d.setDate(diff));
    weekStart.setHours(0, 0, 0, 0);
    return weekStart;
}

function formatEventDate(date) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[date.getMonth()]} ${date.getDate()}`;
}

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