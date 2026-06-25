/* Lightweight, dependency-free toast notifications.
   Replaces native alert() popups with branded in-page messages.
   Usage: showToast('Saved!', 'success');  // type: 'success' | 'error' | 'info' */
(function () {
    function getContainer() {
        let container = document.querySelector('.toast-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'toast-container';
            container.setAttribute('role', 'status');
            container.setAttribute('aria-live', 'polite');
            document.body.appendChild(container);
        }
        return container;
    }

    const ICONS = { success: '✓', error: '!', info: 'i' };

    window.showToast = function (message, type, duration) {
        type = type || 'info';
        duration = typeof duration === 'number' ? duration : 5000;

        const toast = document.createElement('div');
        toast.className = 'toast toast--' + type;

        const icon = document.createElement('span');
        icon.className = 'toast__icon';
        icon.textContent = ICONS[type] || ICONS.info;

        const msg = document.createElement('span');
        msg.className = 'toast__msg';
        msg.textContent = message; // textContent => safe against HTML injection

        const close = document.createElement('button');
        close.type = 'button';
        close.className = 'toast__close';
        close.setAttribute('aria-label', 'Dismiss');
        close.innerHTML = '&times;';

        toast.appendChild(icon);
        toast.appendChild(msg);
        toast.appendChild(close);
        getContainer().appendChild(toast);

        let timer;
        function dismiss() {
            clearTimeout(timer);
            toast.classList.add('toast--hide');
            toast.addEventListener('animationend', () => toast.remove(), { once: true });
        }

        close.addEventListener('click', dismiss);
        if (duration > 0) timer = setTimeout(dismiss, duration);

        return { dismiss };
    };
})();
