const nameInput = document.querySelector('input[name="Name"]');
const alertText = document.getElementById('alert-txt');
const checkInButton = document.querySelector('.submit-check-in');

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