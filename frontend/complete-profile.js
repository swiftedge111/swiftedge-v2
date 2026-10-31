// Collects phone, country and WhatsApp/Telegram contact number from accounts
// created before they were mandatory. Login sends incomplete accounts here,
// and profile-gate.js does the same for the welcome page and dashboard.
document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
        window.location.replace('login');
        return;
    }

    const form = document.getElementById('completeProfileForm');
    const btn = document.getElementById('saveProfileBtn');
    const fields = ContactFields.init(form);

    function showError(message) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: message,
            confirmButtonColor: '#4361ee',
        });
    }

    function logout() {
        localStorage.removeItem('authToken');
        window.location.replace('login');
    }

    document.getElementById('logoutLink').addEventListener('click', (e) => {
        e.preventDefault();
        logout();
    });

    // Prefill whatever the account already has (usually just the phone).
    try {
        const response = await fetch(`${API_BASE_URL}/user-info`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.status === 401) {
            logout();
            return;
        }
        if (response.ok) {
            const user = await response.json();
            if (user.profileComplete) {
                window.location.replace('welcome');
                return;
            }
            fields.setValues(user);
        }
    } catch (error) {
        console.error('Error loading profile:', error);
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const problem = fields.validate();
        if (problem) {
            showError(problem);
            return;
        }

        try {
            btn.classList.add('is-loading');
            btn.disabled = true;

            const response = await fetch(`${API_BASE_URL}/profile/contact`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(fields.getValues()),
                signal: AbortSignal.timeout(15000)
            });
            const result = await response.json();

            if (response.status === 401 || response.status === 403) {
                await Swal.fire({
                    icon: 'warning',
                    title: 'Session Expired',
                    text: 'Please log in again to continue.',
                    confirmButtonColor: '#4361ee',
                });
                logout();
                return;
            }
            if (!response.ok) {
                throw new Error(result.message || 'Could not save your details. Please try again.');
            }

            await Swal.fire({
                icon: 'success',
                title: 'Profile Complete!',
                text: 'Taking you to your dashboard...',
                showConfirmButton: false,
                timer: 1500,
                timerProgressBar: true
            });
            window.location.replace('welcome');
        } catch (error) {
            console.error('Error saving profile:', error);
            showError(error.message || 'Could not save your details. Please try again.');
        } finally {
            btn.classList.remove('is-loading');
            btn.disabled = false;
        }
    });
});
