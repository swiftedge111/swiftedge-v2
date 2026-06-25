document.addEventListener('DOMContentLoaded', () => {
    // Extract the token from the query parameters
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    // console.log("Extracted token from URL:", token); // Debug log for extracted token

    if (token) {
        document.getElementById('token').value = token; // Populate hidden input with token
    } else {
        showToast('Invalid or incomplete reset link. Please request a new password reset.', 'error', 8000);
        const btn = document.getElementById('updateBtn');
        if (btn) btn.disabled = true;
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

    const submitBtn = document.getElementById('updateBtn');
    const token = document.getElementById('token').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    if (newPassword.length < 8) {
        showToast('Password must be at least 8 characters long.', 'error');
        return;
    }

    if (newPassword !== confirmPassword) {
        showToast('Passwords do not match!', 'error');
        return;
    }

    setLoading(submitBtn, true);

    try {
        const response = await fetch(`${API_BASE_URL}/reset-password/${token}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password: newPassword }),
        });

        const data = await response.json().catch(() => ({}));
        console.log("Server response:", data);

        if (response.ok) {
            showToast('Password updated successfully! Redirecting to login…', 'success');
            // Keep button disabled and redirect after the toast is visible
            setTimeout(() => { window.location.href = 'login.html'; }, 1800);
        } else {
            showToast(data.message || 'Failed to reset password.', 'error');
            setLoading(submitBtn, false);
        }
    } catch (error) {
        console.error("Error:", error);
        showToast('An error occurred while resetting your password.', 'error');
        setLoading(submitBtn, false);
    }
});

function setLoading(btn, isLoading) {
    if (!btn) return;
    btn.classList.toggle('is-loading', isLoading);
    btn.disabled = isLoading;
}
