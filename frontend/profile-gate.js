// Runs before the welcome page and dashboard render (loaded in <head> after
// apiConfig.js) and keeps the page hidden until it knows where to send you:
// - session no longer valid (expired, or JWT_SECRET rotated) -> login
// - phone, country or contact number missing/invalid       -> complete-profile
(function () {
    const token = localStorage.getItem('authToken');
    if (!token) return;

    const root = document.documentElement;
    root.style.visibility = 'hidden';
    const reveal = () => { root.style.visibility = ''; };
    // Never leave the page blank if the API is slow to wake up; withdrawals
    // are refused server-side for incomplete profiles regardless.
    const fallback = setTimeout(reveal, 4000);
    let leaving = false;
    const go = (page) => {
        leaving = true;
        clearTimeout(fallback);
        window.location.replace(page);
    };

    fetch(`${API_BASE_URL}/user-info`, { headers: { 'Authorization': `Bearer ${token}` } })
        .then(response => {
            if (response.status === 401) {
                localStorage.removeItem('authToken');
                go('login');
                return null;
            }
            return response.ok ? response.json() : null;
        })
        .then(user => {
            if (leaving) return;
            // Only an explicit false redirects: other errors and an older API
            // without the flag leave the page as it is.
            if (user && user.profileComplete === false) {
                go('complete-profile');
                return;
            }
            clearTimeout(fallback);
            reveal();
        })
        .catch(() => {
            clearTimeout(fallback);
            reveal();
        });
})();
