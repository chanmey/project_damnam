const contactForm = document.getElementById('contactForm');
const msgElement = document.getElementById('msg');

if (contactForm && msgElement) {
    contactForm.addEventListener('submit', event => {
        event.preventDefault();

        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const message = document.getElementById('message').value.trim();

        if (!name || !email || !message) {
            msgElement.textContent = 'Please fill in all fields before sending.';
            msgElement.style.color = '#d14343';
            return;
        }

        msgElement.textContent = 'Sending your message...';
        msgElement.style.color = '#0f766e';

        setTimeout(() => {
            contactForm.reset();
            msgElement.textContent = 'Thank you! Your message has been sent.';
            msgElement.style.color = '#047857';
        }, 700);
    });
}
