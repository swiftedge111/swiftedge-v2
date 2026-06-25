document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("forgot-password-form");
    const submitBtn = document.getElementById("resetBtn");

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const email = document.getElementById("email").value.trim();

        if (!email) {
            showToast("Please enter your email address.", "error");
            return;
        }

        setLoading(submitBtn, true);

        try {
            const response = await fetch(`${API_BASE_URL}/request-reset`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            const result = await response.json().catch(() => ({}));

            if (response.ok) {
                showToast(result.message || 'Reset link sent! Please check your email.', 'success');
                form.reset();
            } else {
                showToast(result.message || 'Something went wrong. Please try again later.', 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            showToast('An unexpected error occurred. Please try again later.', 'error');
        } finally {
            setLoading(submitBtn, false);
        }
    });

    function setLoading(btn, isLoading) {
        if (!btn) return;
        btn.classList.toggle('is-loading', isLoading);
        btn.disabled = isLoading;
    }
});
