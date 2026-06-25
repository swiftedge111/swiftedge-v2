document.addEventListener('DOMContentLoaded', () => {
    // Extract the token from the query parameters
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    // console.log("Extracted token from URL:", token); // Debug log for extracted token

    if (token) {
        document.getElementById('token').value = token; // Populate hidden input with token
    } else {
        alert("Invalid link! Token not found.");
    }

    setupPasswordToggles();
});

// Show/hide password toggle (eye icon) for each password field.
// Mirrors the behaviour used on the login page (see script.js).
function setupPasswordToggles() {
    document.querySelectorAll('.toggle-password').forEach((toggle) => {
        const input = document.getElementById(toggle.getAttribute('data-target'));
        if (!input) return;

        setToggleState(toggle, input.type === 'password');

        const handle = (event) => {
            event.preventDefault();
            input.type = input.type === 'password' ? 'text' : 'password';
            setToggleState(toggle, input.type === 'password');
            input.focus();
        };

        toggle.addEventListener('click', handle);
        toggle.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') handle(event);
        });
    });
}

function setToggleState(toggle, isHidden) {
    const icons = toggle.querySelectorAll('svg');
    if (icons.length < 2) return;
    // icons[0] = open eye (shown while password hidden), icons[1] = closed eye
    icons[0].style.display = isHidden ? 'block' : 'none';
    icons[1].style.display = isHidden ? 'none' : 'block';
    toggle.classList.toggle('showing', !isHidden);
    toggle.setAttribute('aria-label', isHidden ? 'Show password' : 'Hide password');
}

document.getElementById('update-password-form').addEventListener('submit', async (event) => {
    event.preventDefault();

    const token = document.getElementById('token').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    if (newPassword !== confirmPassword) {
        alert('Passwords do not match!');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/reset-password/${token}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password: newPassword }),
        });

        const data = await response.json();
        console.log("Server response:", data);

        if (response.ok) {
            alert('Password updated successfully!');
            window.location.href = 'login.html';
        } else {
            alert(data.message || 'Failed to reset password.');
        }
    } catch (error) {
        console.error("Error:", error);
        alert('An error occurred while resetting your password.');
    }
});
