// Sends logged-in accounts that are missing phone, country or contact number
// to the complete-profile page. Loaded in the <head> of the welcome page and
// the dashboard (after apiConfig.js) so the page stays hidden until we know.
(function () {
    const token = localStorage.getItem('authToken');
    if (!token) return;

    const root = document.documentElement;
    root.style.visibility = 'hidden';
    const reveal = () => { root.style.visibility = ''; };
    // Never leave the page blank if the API is slow to wake up; withdrawals
    // are refused server-side for incomplete profiles regardless.
    const fallback = setTimeout(reveal, 4000);

    fetch(`${API_BASE_URL}/user-info`, { headers: { 'Authorization': `Bearer ${token}` } })
        .then(response => (response.ok ? response.json() : null))
        .then(user => {
            // Only an explicit false redirects: errors, expired sessions and an
            // older API without the flag leave the page as it is.
            if (user && user.profileComplete === false) {
                clearTimeout(fallback);
                window.location.replace('complete-profile');
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
