class AuthForms {
    constructor() {
        this.forms = {
            login: document.getElementById('loginForm'),
            signup: document.getElementById('signupForm')
        };
        
        this.init();
    }
    
    async init() {
        if (this.forms.login || this.forms.signup) {
            await this.loadSweetAlert();
            this.setupForms();
            this.setupPasswordToggles(); // Initialize password toggle functionality
        }
    }
    
    async loadSweetAlert() {
        try {
            if (typeof Swal === 'undefined') {
                await Promise.race([
                    this.loadScript('https://cdn.jsdelivr.net/npm/sweetalert2@11'),
                    new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 3000))
                ]);
            }
        } catch (error) {
            console.error('Failed to load SweetAlert2:', error);
            window.showAlert = (title, text, icon) => {
                alert(`${icon ? icon.toUpperCase() + ': ' : ''}${title}\n\n${text}`);
            };
        }
    }
    
    loadScript(url) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = url;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }
    
    setupForms() {
        // Login Form
        if (this.forms.login) {
            this.forms.login.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleLogin();
            });
        }
        
        // Signup Form
        if (this.forms.signup) {
            this.forms.signup.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleSignup();
            });
            
            // Add password strength indicator
            const passwordInput = this.forms.signup.querySelector('#signupPassword');
            if (passwordInput) {
                passwordInput.addEventListener('input', (e) => {
                    this.updatePasswordStrength(e.target.value);
                });
            }
            
            // Add confirm password validation
            const confirmPasswordInput = this.forms.signup.querySelector('#confirmPassword');
            if (confirmPasswordInput) {
                confirmPasswordInput.addEventListener('input', () => {
                    this.validatePasswordMatch();
                });
            }
        }
    }
    
    setupPasswordToggles() {
        // Setup password toggles for all forms
        const passwordToggles = document.querySelectorAll('.toggle-password');
        
        passwordToggles.forEach(toggle => {
            // Get the target input
            const targetId = toggle.getAttribute('data-target');
            let input;
            
            if (targetId) {
                input = document.getElementById(targetId);
            } else {
                // Fallback: find the password input in the same input group
                input = toggle.closest('.input-group').querySelector('input[type="password"], input[type="text"]');
            }
            
            if (input) {
                // Set initial state
                this.setToggleState(toggle, input.type === 'password');
                
                // Add click event
                toggle.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.togglePasswordVisibility(input, toggle);
                });
                
                // Add keyboard support
                toggle.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        this.togglePasswordVisibility(input, toggle);
                    }
                });
            }
        });
    }
    
    togglePasswordVisibility(input, toggle) {
        const isPassword = input.type === 'password';
        input.type = isPassword ? 'text' : 'password';
        
        // Update toggle state
        this.setToggleState(toggle, isPassword);
        
        // Focus back on input for better UX
        input.focus();
    }
    
    setToggleState(toggle, isPassword) {
        const icons = toggle.querySelectorAll('svg');
        
        if (isPassword) {
            // Show open eye (password is hidden, clicking will show it)
            icons[0].style.display = 'block';
            icons[1].style.display = 'none';
            toggle.classList.remove('showing');
            toggle.setAttribute('aria-label', 'Show password');
        } else {
            // Show closed eye (password is visible, clicking will hide it)
            icons[0].style.display = 'none';
            icons[1].style.display = 'block';
            toggle.classList.add('showing');
            toggle.setAttribute('aria-label', 'Hide password');
        }
    }
    
    updatePasswordStrength(password) {
        const strengthMeter = document.querySelector('.strength-meter');
        if (!strengthMeter) return;
        
        // Calculate strength
        let strength = 0;
        if (password.length >= 8) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^A-Za-z0-9]/.test(password)) strength++;
        
        // Update strength meter
        strengthMeter.className = 'strength-meter';
        if (password.length === 0) {
            strengthMeter.style.width = '0';
        } else if (strength <= 2) {
            strengthMeter.classList.add('weak');
        } else if (strength === 3) {
            strengthMeter.classList.add('medium');
        } else {
            strengthMeter.classList.add('strong');
        }
    }
    
    validatePasswordMatch() {
        const signupForm = this.forms.signup;
        if (!signupForm) return;
        
        const password = signupForm.querySelector('#signupPassword').value;
        const confirmPassword = signupForm.querySelector('#confirmPassword').value;
        const confirmInput = signupForm.querySelector('#confirmPassword');
        
        if (confirmPassword.length === 0) {
            confirmInput.classList.remove('input-error', 'input-success');
            return;
        }
        
        if (password === confirmPassword) {
            confirmInput.classList.remove('input-error');
            confirmInput.classList.add('input-success');
        } else {
            confirmInput.classList.remove('input-success');
            confirmInput.classList.add('input-error');
        }
    }
    
    async handleLogin() {
        const form = this.forms.login;
        const btn = form.querySelector('#loginBtn');
        const loginInput = form.querySelector('#loginEmail').value.trim().toLowerCase();
        const password = form.querySelector('#loginPassword').value;
        
        if (!loginInput || !password) {
            this.showError('Please fill in all required fields');
            return;
        }
        
        try {
            btn.classList.add('is-loading');
            btn.disabled = true;
            
            const loginData = {
                username: loginInput.includes('@') ? undefined : loginInput,
                email: loginInput.includes('@') ? loginInput : undefined,
                password
            };
            
            // Remove undefined properties
            Object.keys(loginData).forEach(key => loginData[key] === undefined && delete loginData[key]);
            
            const response = await fetch(`${API_BASE_URL}/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(loginData),
                signal: AbortSignal.timeout(10000)
            });
            
            const result = await response.json();
            
            if (response.ok) {
                localStorage.setItem("authToken", result.token);
                await Swal.fire({
                    icon: 'success',
                    title: 'Login Successful!',
                    text: 'Redirecting to Welcome Page...',
                    showConfirmButton: false,
                    timer: 1500,
                    timerProgressBar: true,
                    willClose: () => {
                        window.location.href = "welcome.html";
                    }
                });
            } else {
                throw new Error(result.message || "Invalid credentials");
            }
        } catch (error) {
            console.error("Login error:", error);
            this.showError(error.message || "Login failed. Please try again.");
        } finally {
            btn.classList.remove('is-loading');
            btn.disabled = false;
        }
    }
    
    async handleSignup() {
        const form = this.forms.signup;
        const btn = form.querySelector('#signupBtn');
        
        // Form data collection with validation
        const formData = {
            fullName: form.querySelector('#fullName').value.trim(),
            email: form.querySelector('#signupEmail').value.trim().toLowerCase(),
            username: form.querySelector('#signupUsername').value.trim().toLowerCase(),
            password: form.querySelector('#signupPassword').value,
            confirmPassword: form.querySelector('#confirmPassword').value,
            phone: form.querySelector('#phone').value.trim(),
            terms: form.querySelector('[name="terms"]').checked
        };
        
        // CRITICAL: Validate terms agreement FIRST - Cannot be bypassed
        if (!formData.terms) {
            this.showError('You must agree to the Terms and Conditions to create an account');
            // Highlight the checkbox
            const termsCheckbox = form.querySelector('[name="terms"]');
            const checkboxContainer = termsCheckbox.closest('.checkbox-container');
            checkboxContainer.style.outline = '2px solid var(--danger-color)';
            checkboxContainer.style.outlineOffset = '2px';
            checkboxContainer.style.borderRadius = '6px';
            setTimeout(() => {
                checkboxContainer.style.outline = '';
                checkboxContainer.style.outlineOffset = '';
            }, 3000);
            return;
        }
        
        if (!formData.fullName || !formData.email || !formData.username || !formData.password || !formData.confirmPassword) {
            this.showError('Please fill in all required fields');
            return;
        }
        
        if (!this.validateEmail(formData.email)) {
            this.showError('Please enter a valid email address');
            return;
        }
        
        if (formData.password !== formData.confirmPassword) {
            this.showError('Passwords do not match');
            return;
        }
        
        if (!this.validatePassword(formData.password)) {
            this.showError('Password must be at least 8 characters with one number and one special character');
            return;
        }
        
        try {
            btn.classList.add('is-loading');
            btn.disabled = true;
            const { confirmPassword, terms, ...submitData } = formData;
            
            const response = await fetch(`${API_BASE_URL}/signup`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(submitData),
                signal: AbortSignal.timeout(15000)
            });
            
            const result = await response.json();
            
            if (response.ok) {
                await Swal.fire({
                    icon: 'success',
                    title: 'Account Created!',
                    html: `
                        <p>Your account has been successfully created.</p>
                        <p class="text-sm text-gray-500 mt-2">A verification email has been sent to ${formData.email}</p>
                    `,
                    showConfirmButton: true,
                    confirmButtonText: 'Continue to Login your Account',
                    willClose: () => {
                        window.location.href = "login.html";
                    }
                });
                
                form.reset();
            } else {
                throw new Error(result.message || "Signup failed. Please try again.");
            }
        } catch (error) {
            console.error("Signup error:", error);
            this.showError(error.message || "An error occurred during signup. Please try again.");
        } finally {
            btn.classList.remove('is-loading');
            btn.disabled = false;
        }
    }
    
    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
    
    validatePassword(password) {
        const re = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/;
        return re.test(password);
    }
    
    showError(message) {
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: message,
                confirmButtonColor: '#4361ee',
            });
        } else {
            alert(`Error: ${message}`);
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AuthForms();
});

// Service Worker Registration for Performance
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then(registration => {
            console.log('ServiceWorker registration successful');
        }).catch(err => {
            console.log('ServiceWorker registration failed: ', err);
        });
    });
}

// Additional utility functions
document.addEventListener('DOMContentLoaded', function() {
    // Add focus effects for better UX
    const inputs = document.querySelectorAll('input[type="text"], input[type="email"], input[type="password"], input[type="tel"]');
    
    inputs.forEach(input => {
        // Add focus class to parent
        input.addEventListener('focus', function() {
            this.closest('.input-group').classList.add('focused');
        });
        
        input.addEventListener('blur', function() {
            this.closest('.input-group').classList.remove('focused');
            if (this.value.trim() !== '') {
                this.closest('.input-group').classList.add('has-value');
            } else {
                this.closest('.input-group').classList.remove('has-value');
            }
        });
        
        // Initialize has-value state
        if (input.value.trim() !== '') {
            input.closest('.input-group').classList.add('has-value');
        }
    });
    
    // Add form validation styling
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            const requiredInputs = this.querySelectorAll('input[required]');
            let isValid = true;
            
            requiredInputs.forEach(input => {
                if (!input.value.trim()) {
                    input.classList.add('input-error');
                    isValid = false;
                } else {
                    input.classList.remove('input-error');
                }
            });
            
            if (!isValid) {
                e.preventDefault();
                if (typeof Swal !== 'undefined') {
                    Swal.fire({
                        icon: 'error',
                        title: 'Missing Information',
                        text: 'Please fill in all required fields.',
                        confirmButtonColor: '#4361ee',
                    });
                }
            }
        });
    });
});