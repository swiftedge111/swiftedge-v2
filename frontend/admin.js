// Replace your existing admin JavaScript with this:

// DOM Elements
const sidebar = document.getElementById('sidebar');
const hamburgerMenu = document.getElementById('hamburger-menu');
const closeSidebar = document.getElementById('close-sidebar');
const collapseToggle = document.getElementById('collapse-toggle');
const overlay = document.getElementById('overlay');
const body = document.body;
const mainContent = document.querySelector('.content');
const adminHeader = document.getElementById('admin-header');
const sidebarLinks = document.querySelectorAll('.sidebar-menu a');
const contentSections = document.querySelectorAll('.content-section');
const currentPageName = document.getElementById('current-page-name');
const currentSectionIcon = document.getElementById('current-section-icon');
const themeToggle = document.getElementById('theme-toggle');

// Map section IDs to icons
const sectionIconMap = {
    'bank-transfer': 'fa-university',
    'crypto': 'fa-coins',
    'digital-wallets': 'fa-wallet',
    'card-email': 'fa-credit-card',
    'manage-holdings': 'fa-chart-pie',
    'add-profits': 'fa-chart-line',
    'pin-generation': 'fa-key',
    'withdrawal-approvals': 'fa-check-circle',
    'receipt-generator': 'fa-receipt'
};

// Check if we're on desktop or mobile
function isDesktop() {
    return window.innerWidth > 1024;
}

// Function to Toggle Sidebar (Mobile only)
function toggleSidebar(open) {
    if (!isDesktop()) {
        if (open) {
            sidebar.classList.add('open');
            overlay.classList.add('active');
            body.classList.add('no-scroll');
        } else {
            sidebar.classList.remove('open');
            overlay.classList.remove('active');
            body.classList.remove('no-scroll');
        }
    }
}

// Function to Toggle Sidebar Collapse (Desktop only)
function toggleSidebarCollapse() {
    if (isDesktop()) {
        sidebar.classList.toggle('collapsed');
        mainContent.classList.toggle('sidebar-collapsed');
        if (adminHeader) {
            adminHeader.classList.toggle('sidebar-collapsed');
        }
        
        // Update collapse button icon
        const icon = collapseToggle.querySelector('i');
        if (sidebar.classList.contains('collapsed')) {
            icon.classList.remove('fa-angle-left');
            icon.classList.add('fa-angle-right');
        } else {
            icon.classList.remove('fa-angle-right');
            icon.classList.add('fa-angle-left');
        }
        
        // Save collapse state to localStorage
        localStorage.setItem('adminSidebarCollapsed', sidebar.classList.contains('collapsed'));
    }
}

// Restore sidebar collapse state from localStorage
const savedCollapseState = localStorage.getItem('adminSidebarCollapsed') === 'true';
if (savedCollapseState && isDesktop()) {
    sidebar.classList.add('collapsed');
    mainContent.classList.add('sidebar-collapsed');
    if (adminHeader) {
        adminHeader.classList.add('sidebar-collapsed');
    }
    if (collapseToggle) {
        const icon = collapseToggle.querySelector('i');
        icon.classList.remove('fa-angle-left');
        icon.classList.add('fa-angle-right');
    }
}

// Tab Switch Function
function switchTab(sectionId) {
    // Hide all sections - remove both active and hidden classes
    contentSections.forEach(section => {
        section.classList.remove('active');
        section.classList.add('hidden');
    });
    
    // Show the selected section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.remove('hidden');
        targetSection.classList.add('active');
    }
    
    // Update active state in sidebar
    sidebarLinks.forEach(link => link.classList.remove('active'));
    const activeLink = document.querySelector(`[data-section="${sectionId}"]`);
    if (activeLink) {
        activeLink.classList.add('active');
        
        // Update header current section text
        const menuText = activeLink.querySelector('.menu-text');
        if (menuText && currentPageName) {
            currentPageName.textContent = menuText.textContent;
        }
        
        // Update header current section icon
        if (currentSectionIcon && sectionIconMap[sectionId]) {
            currentSectionIcon.className = 'fas current-icon';
            currentSectionIcon.classList.add(sectionIconMap[sectionId]);
        }
    }
    
    // Close sidebar on mobile
    toggleSidebar(false);
}

// Event Listeners
hamburgerMenu.addEventListener('click', () => toggleSidebar(true));
closeSidebar.addEventListener('click', () => toggleSidebar(false));
overlay.addEventListener('click', () => toggleSidebar(false));
collapseToggle.addEventListener('click', toggleSidebarCollapse);

// Theme Toggle
if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        const icon = themeToggle.querySelector('i');
        if (icon.classList.contains('fa-moon')) {
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
            // Add dark mode functionality here if needed
        } else {
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
            // Remove dark mode functionality here if needed
        }
    });
}

// Add Event Listeners to Sidebar Links
sidebarLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const sectionId = link.getAttribute('data-section');
        if (sectionId) {
            switchTab(sectionId);
        }
    });
});

// Handle window resize
window.addEventListener('resize', () => {
    if (isDesktop()) {
        // On desktop, remove mobile classes
        sidebar.classList.remove('open');
        overlay.classList.remove('active');
        body.classList.remove('no-scroll');
    } else {
        // On mobile, remove desktop collapsed state
        sidebar.classList.remove('collapsed');
        mainContent.classList.remove('sidebar-collapsed');
    }
});

// Logout functionality
document.getElementById('admin-logout').addEventListener('click', function(e) {
    e.preventDefault();
    Swal.fire({
        title: 'Logout?',
        text: 'Are you sure you want to logout from admin panel?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#4361ee',
        cancelButtonColor: '#ef233c',
        confirmButtonText: 'Yes, logout'
    }).then((result) => {
        if (result.isConfirmed) {
            localStorage.removeItem('adminToken');
            window.location.href = 'admin-log.html';
        }
    });
});

// Initialize First Tab
switchTab('bank-transfer');

 
// Integrating backend into frontend for deposit management

document.addEventListener('DOMContentLoaded', () => {
    // Elements for Bank Transfer
    const bankTransferForm = document.querySelector('#bank-transfer form');
    const saveBankTransferBtn = document.querySelector('#save-bank-transfer');

    // Elements for Cryptocurrency
    const cryptoForm = document.querySelector('#crypto form');
    const cryptoDropdown = cryptoForm['crypto-dropdown'];
    const saveCryptoBtn = document.querySelector('#save-crypto');

    // Elements for Digital Wallets
    const digitalWalletsForm = document.querySelector('#digital-wallets form');
    const walletTypeDropdown = digitalWalletsForm['wallet-type'];
    const saveDigitalWalletsBtn = document.querySelector('#save-digital-wallets');

    // Fetch and populate Bank Transfer data
    async function fetchBankTransferData() {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/deposit/bank-transfer`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` },
            });
            if (response.ok) {
                const data = await response.json();
                bankTransferForm['bank-name'].value = data.bankDetails?.bankName || '';
                bankTransferForm['routing-number'].value = data.bankDetails?.routingNumber || '';
                bankTransferForm['account-number'].value = data.bankDetails?.accountNumber || '';
                bankTransferForm['account-name'].value = data.bankDetails?.accountName || '';
                bankTransferForm['swift-code'].value = data.bankDetails?.swiftCode || '';
            }
        } catch (error) {
            console.error('Error fetching bank transfer data:', error);
        }
    }

    // Save Bank Transfer data
    saveBankTransferBtn.addEventListener('click', async () => {
        const bankDetails = {
            bankName: bankTransferForm['bank-name'].value,
            routingNumber: bankTransferForm['routing-number'].value,
            accountNumber: bankTransferForm['account-number'].value,
            accountName: bankTransferForm['account-name'].value,
            swiftCode: bankTransferForm['swift-code'].value,
        };

        try {
            const response = await fetch(`${API_BASE_URL}/admin/deposit/bank-transfer`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('authToken')}`,
                },
                body: JSON.stringify(bankDetails),
            });
            const data = await response.json();
            alert('Bank Transfer details saved successfully!');
        } catch (error) {
            console.error('Error saving bank transfer data:', error);
        }
    });

    // Fetch and populate Cryptocurrency data
    async function fetchCryptoData(cryptocurrency) {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/deposit/crypto?cryptocurrency=${cryptocurrency}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` },
            });
            if (response.ok) {
                const data = await response.json();
                cryptoForm['wallet-address'].value = data.walletAddress || '';
                cryptoForm['network'].value = data.network || '';
            } else {
                // Reset fields if no data found
                cryptoForm['wallet-address'].value = '';
                cryptoForm['network'].value = '';
            }
        } catch (error) {
            console.error('Error fetching cryptocurrency data:', error);
        }
    }

    // Save Cryptocurrency data
    saveCryptoBtn.addEventListener('click', async () => {
        const cryptoDetails = {
            cryptocurrency: cryptoForm['crypto-dropdown'].value,
            walletAddress: cryptoForm['wallet-address'].value,
            network: cryptoForm['network'].value,
        };

        try {
            const response = await fetch(`${API_BASE_URL}/admin/deposit/crypto`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('authToken')}`,
                },
                body: JSON.stringify(cryptoDetails),
            });
            const data = await response.json();
            alert('Cryptocurrency details saved successfully!');
        } catch (error) {
            console.error('Error saving cryptocurrency data:', error);
        }
    });

    // Fetch and populate Digital Wallets data
    async function fetchDigitalWalletsData(walletType) {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/deposit/digital-wallets?walletType=${walletType}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` },
            });
            if (response.ok) {
                const data = await response.json();
                digitalWalletsForm['wallet-username'].value = data.walletUsername || '';
                digitalWalletsForm['wallet-info'].value = data.walletInfo || '';
            } else {
                // Reset fields if no data found
                digitalWalletsForm['wallet-username'].value = '';
                digitalWalletsForm['wallet-info'].value = '';
            }
        } catch (error) {
            console.error('Error fetching digital wallet data:', error);
        }
    }

    // Save Digital Wallets data
    saveDigitalWalletsBtn.addEventListener('click', async () => {
        const digitalWalletDetails = {
            walletType: digitalWalletsForm['wallet-type'].value,
            walletUsername: digitalWalletsForm['wallet-username'].value,
            walletInfo: digitalWalletsForm['wallet-info'].value,
        };

        try {
            const response = await fetch(`${baseURL}/admin/deposit/digital-wallets`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('authToken')}`,
                },
                body: JSON.stringify(digitalWalletDetails),
            });
            const data = await response.json();
            alert('Digital Wallet details saved successfully!');
        } catch (error) {
            console.error('Error saving digital wallet data:', error);
        }
    });

    // Event Listeners for Cryptocurrency and Digital Wallets Dropdowns
    cryptoDropdown.addEventListener('change', () => {
        const selectedCrypto = cryptoDropdown.value;
        fetchCryptoData(selectedCrypto);
    });

    walletTypeDropdown.addEventListener('change', () => {
        const selectedWalletType = walletTypeDropdown.value;
        fetchDigitalWalletsData(selectedWalletType);
    });

    // Initialize by fetching Bank Transfer data and resetting Cryptocurrency and Digital Wallets data
    fetchBankTransferData();
    fetchCryptoData(cryptoDropdown.value);
    fetchDigitalWalletsData(walletTypeDropdown.value);
});


// Fetch and Display User Data
document.getElementById('search-btn').addEventListener('click', async () => {
    const uid = document.getElementById('uid-search').value.trim();
    if (!uid) return;

    try {
        // Use the search-user endpoint to get complete user data including balances
        const response = await fetch(`${API_BASE_URL}/admin/search-user/${uid}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
        });

        if (!response.ok) throw new Error('User not found');
        const result = await response.json();
        
        if (!result.success) {
            throw new Error(result.message || 'User not found');
        }
        
        const user = result.user;

        // Display User Info
        document.getElementById('user-name').textContent = user.fullName || 'N/A';
        document.getElementById('user-username').textContent = user.username || 'N/A';
        document.getElementById('user-email').textContent = user.email || 'N/A';
        document.getElementById('user-uid').textContent = user.uid || 'N/A';
        
        // Display Status with color
        const statusElement = document.getElementById('user-status');
        let statusColor = '#6b7280'; // default gray
        if (user.status === 'Active') {
            statusColor = '#10b981';
        } else if (user.status === 'Inactive') {
            statusColor = '#ef4444';
        }
        statusElement.innerHTML = `<span class="status-dot" style="background: ${statusColor}; display: inline-block; width: 8px; height: 8px; border-radius: 50%; margin-right: 5px;"></span> ${user.status}`;
        
        // Display all three balance types
        document.getElementById('holding-balance').textContent = formatCurrency(user.holdingBalance || 0);
        document.getElementById('user-total-profit').textContent = formatCurrency(user.totalProfit || 0);
        document.getElementById('user-total-balance').textContent = formatCurrency(user.totalBalance || 0);

        // Fetch and display holdings separately
        const holdingsResponse = await fetch(`${API_BASE_URL}/admin/user-holdings/${uid}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
        });
        
        if (holdingsResponse.ok) {
            const holdingsData = await holdingsResponse.json();
            const holdingsList = document.getElementById('holdings-list');
            holdingsList.innerHTML = holdingsData.holdings.length === 0 
                ? '<p class="no-holdings">No holdings found</p>'
                : holdingsData.holdings.map(holding => `
                    <div class="holding-item">
                        <span class="crypto-amount">${holding.amount} ${holding.symbol}</span>
                        <span class="crypto-name">${holding.name}</span>
                        <span class="dollar-value">$${holding.value.toFixed(2)}</span>
                    </div>
                `).join('');
        }

    } catch (error) {
        console.error("Error:", error);
        Swal.fire('Error', error.message, 'error');
    }
});

// Add Holding Function (Single, optimized version)
document.getElementById('add-holding-btn').addEventListener('click', async () => {
    const uid = document.getElementById('uid-search').value;
    const [name, symbol, amount, value] = [
        document.getElementById('holding-name').value.trim(),
        document.getElementById('holding-symbol').value.trim(),
        parseFloat(document.getElementById('holding-amount').value),
        parseFloat(document.getElementById('holding-value').value)
    ];

    // Enhanced validation
    if (!uid) {
        Swal.fire('Error', 'Please search for a user first', 'error');
        return;
    }
    if (!name || !symbol || isNaN(amount) || isNaN(value)) {
        Swal.fire('Error', 'Please fill all fields with valid values', 'error');
        return;
    }
    if (value <= 0) {
        Swal.fire('Error', 'Funding amount must be positive', 'error');
        return;
    }

    try {
        // Show loading indicator
        Swal.fire({
            title: 'Processing...',
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading()
        });

        // Add new holding
        const response = await fetch(`${API_BASE_URL}/admin/add-holding`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            },
            body: JSON.stringify({ uid, name, symbol, amount, value })
        });

        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.message || 'Failed to add holding');
        }

        // Refresh display and clear form
        document.getElementById('search-btn').click();
        document.getElementById('holding-name').value = '';
        document.getElementById('holding-symbol').value = '';
        document.getElementById('holding-amount').value = '';
        document.getElementById('holding-value').value = '';
        
        // Enhanced success message
        Swal.fire({
            icon: 'success',
            title: 'Funding Successful!',
            html: `
                <div style="text-align: left;">
                    <p><strong>Asset Added:</strong> ${amount} ${symbol} (${name})</p>
                    <p><strong>Amount Credited:</strong> $${value.toFixed(2)}</p>
                    <p><strong>New Total Balance:</strong> $${result.totalBalance.toFixed(2)}</p>
                    <p style="color: #28a745; margin-top: 10px;">
                        <i class="fas fa-check-circle"></i> User has been notified
                    </p>
                </div>
            `,
            confirmButtonText: 'Done'
        });

    } catch (error) {
        console.error("Error:", error);
        Swal.fire({
            icon: 'error',
            title: 'Funding Failed',
            text: error.message,
            footer: 'Please check the details and try again'
        });
    }
});


document.addEventListener("DOMContentLoaded", () => {
    const pinTypeDropdown = document.getElementById("pin-type");
    const expirationDropdown = document.getElementById("expiration-time");
    const customExpirationSection = document.getElementById("custom-expiration");
    const customDurationInput = document.getElementById("custom-duration");
    const customDurationHoursInput = document.getElementById("custom-duration-hours");
    const customDurationDaysInput = document.getElementById("custom-duration-days");
    const generatePinButton = document.getElementById("generate-pin");
    const pinFeedback = document.getElementById("pin-feedback");
    const generatedPinElement = document.getElementById("generated-pin");
    const expirationTimeDisplay = document.getElementById("expiration-time-display");
    const copyPinButton = document.getElementById("copy-pin");

    // Show or hide custom expiration time section
    expirationDropdown.addEventListener("change", () => {
        if (expirationDropdown.value === "custom") {
            customExpirationSection.style.display = "block"; // Show the custom expiration section
        } else {
            customExpirationSection.style.display = "none"; // Hide the custom expiration section
        }
    });

    // Handle PIN generation
    generatePinButton.addEventListener("click", async () => {
        let pinType = parseInt(pinTypeDropdown.value, 10); // Convert PIN length to number
        let expirationTime = expirationDropdown.value; // Expiration time as string

        // If custom expiration time is selected, gather custom values
        if (expirationTime === "custom") {
            const customDuration = parseInt(customDurationInput.value || 0, 10);
            const customDurationHours = parseInt(customDurationHoursInput.value || 0, 10);
            const customDurationDays = parseInt(customDurationDaysInput.value || 0, 10);

            // Convert custom time to minutes
            expirationTime = customDuration + (customDurationHours * 60) + (customDurationDays * 1440);
        } else {
            expirationTime = parseInt(expirationTime, 10); // Convert predefined value to number
        }

        console.log("===== FRONTEND LOGS =====");
        console.log("Selected PIN Length (pinType):", pinType);
        console.log("Selected Expiration Time (minutes):", expirationTime);

        const authToken = localStorage.getItem('authToken');
        if (!authToken) {
            alert("You must be logged in to generate a PIN.");
            return;
        }

        try {
            // Log the request payload
            const payload = {
                pinLength: pinType,
                expirationTime: expirationTime
            };
            console.log("Payload sent to backend:", payload);

            // Make the API call to generate and store the PIN
            const response = await fetch(`${API_BASE_URL}/admin/generate-pin`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}` // Send the auth token for authentication
                },
                body: JSON.stringify(payload)
            });

            console.log("Backend response status:", response.status);

            if (!response.ok) throw new Error(`Error: ${response.statusText}`);

            const data = await response.json();
            console.log("Response from backend:", data);

            if (data.message === "PIN generated successfully") {
                // Display the generated PIN
                generatedPinElement.textContent = data.pin;

                // Convert expirationAt to local time zone
                const expirationAtUTC = new Date(data.expirationAt); // Convert from UTC
                const expirationAtLocal = expirationAtUTC.toLocaleString(); // Convert to local time
                expirationTimeDisplay.textContent = expirationAtLocal;

                // Show the feedback region
                pinFeedback.classList.remove("hidden");
            } else {
                alert("Error generating PIN: " + data.message);
            }
        } catch (error) {
            console.error("Error during PIN generation:", error);
            alert("There was an error with the request.");
        }
    });

    // Handle the "Copy PIN" button functionality
    copyPinButton.addEventListener("click", () => {
        const pin = generatedPinElement.textContent;
        if (pin) {
            navigator.clipboard.writeText(pin)
                .then(() => {
                    alert("PIN copied to clipboard!");
                })
                .catch(err => {
                    console.error("Error copying PIN:", err);
                    alert("Failed to copy PIN.");
                });
        } else {
            alert("No PIN to copy.");
        }
    });
});

document.getElementById('deletePinsBtn').addEventListener('click', async () => {
    if (confirm("Are you sure you want to delete all pins? This action cannot be undone.")) {
        try {
            const token = localStorage.getItem("authToken"); 
            const response = await fetch(`${API_BASE_URL}/admin/pins`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();
            document.getElementById('statusMessage').textContent = data.message;
        } catch (error) {
            console.error("Error deleting pins:", error);
            document.getElementById('statusMessage').textContent = "Failed to delete pins.";
        }
    }
});
 
//admin withdrawal Integration

document.addEventListener('DOMContentLoaded', function() {
    const pendingWithdrawalsTable = document.getElementById('pending-withdrawals');
    const refreshBtn = document.querySelector('.btn-refresh');
    const pendingCountSpan = document.querySelector('.pending-count');
    const lastUpdatedSpan = document.querySelector('.last-updated');

    // Get admin token (assuming it's stored differently from user token)
    function getAdminToken() {
        return localStorage.getItem('adminToken') || localStorage.getItem('authToken');
    }

    // Fetch and display pending withdrawals
    async function loadPendingWithdrawals() {
        try {
            const response = await fetch(`${API_BASE_URL}/api/admin/withdrawals/pending`, {
                headers: {
                    'Authorization': `Bearer ${getAdminToken()}`
                }
            });
            
            if (response.status === 401) {
                // Handle unauthorized (redirect to login or show message)
                showError('Session expired. Please log in again.');
                return;
            }
            
            if (response.status === 403) {
                showError('Admin access required');
                return;
            }
            
            const data = await response.json();
            
            if (data.success) {
                updateWithdrawalsTable(data.withdrawals);
                pendingCountSpan.textContent = data.withdrawals.length;
                lastUpdatedSpan.textContent = `Last updated: ${new Date().toLocaleTimeString()}`;
            } else {
                showError('Failed to load withdrawals: ' + (data.error || 'Unknown error'));
            }
        } catch (error) {
            showError('Network error: ' + error.message);
        }
    }

    // Update the table with withdrawal data
    function updateWithdrawalsTable(withdrawals) {
        if (withdrawals.length === 0) {
            pendingWithdrawalsTable.innerHTML = `
                <tr class="empty-state">
                    <td colspan="6">
                        <div class="empty-content">
                            <i class="fas fa-check-circle"></i>
                            <p>No pending withdrawals at this time</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        pendingWithdrawalsTable.innerHTML = withdrawals.map(withdrawal => `
            <tr data-id="${withdrawal._id}">
                <td class="col-date">${new Date(withdrawal.createdAt).toLocaleString()}</td>
                <td class="col-uid">
                    <div class="user-info">
                        <span class="user-name">${withdrawal.userId?.fullName || 'Unknown'}</span>
                        <span class="user-uid">${withdrawal.uid}</span>
                    </div>
                </td>
                <td class="col-amount">$${withdrawal.amount.toFixed(2)}</td>
                <td class="col-method">
                    <span class="method-badge">${withdrawal.method}</span>
                </td>
                <td class="col-details">
                    ${formatDetails(withdrawal.details)}
                </td>
                <td class="col-actions">
                    <div class="action-buttons">
                        <button class="btn-approve" data-id="${withdrawal._id}">Approve</button>
                        <button class="btn-reject" data-id="${withdrawal._id}">Reject</button>
                    </div>
                </td>
            </tr>
        `).join('');

        // Add event listeners to buttons
        document.querySelectorAll('.btn-approve').forEach(btn => {
            btn.addEventListener('click', () => processWithdrawal(btn.dataset.id, 'approve'));
        });
        
        document.querySelectorAll('.btn-reject').forEach(btn => {
            btn.addEventListener('click', () => processWithdrawal(btn.dataset.id, 'reject'));
        });
    }

    // Format details based on withdrawal method
    function formatDetails(details) {
        if (details.bankName) {
            return `
                <div class="bank-details">
                    <div><strong>${details.bankName}</strong></div>
                    <div>Account: ${details.accountNumber}</div>
                    ${details.routingNumber ? `<div>Routing: ${details.routingNumber}</div>` : ''}
                </div>
            `;
        } else if (details.walletAddress) {
            return `
                <div class="crypto-details">
                    <div><strong>${details.cryptoType}</strong></div>
                    <div class="wallet-address">${details.walletAddress}</div>
                </div>
            `;
        }
        return 'N/A';
    }

    // Process withdrawal (approve/reject)
    async function processWithdrawal(id, action) {
        if (!confirm(`Are you sure you want to ${action} this withdrawal?`)) return;
        
        try {
            const response = await fetch(`${API_BASE_URL}/api/admin/withdrawals/${id}/process`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getAdminToken()}`
                },
                body: JSON.stringify({ action })
            });
            
            if (response.status === 401) {
                showError('Session expired. Please log in again.');
                return;
            }
            
            if (response.status === 403) {
                showError('Admin access required');
                return;
            }
            
            const data = await response.json();
            
            if (data.success) {
                showSuccess(`Withdrawal ${action}d successfully`);
                loadPendingWithdrawals(); // Refresh the list
            } else {
                showError(`Failed to ${action} withdrawal: ${data.error || 'Unknown error'}`);
            }
        } catch (error) {
            showError(`Network error: ${error.message}`);
        }
    }

    // Helper functions for notifications
    function showSuccess(message) {
        // You can replace this with toast or other notification
        const notification = document.createElement('div');
        notification.className = 'notification success';
        notification.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span>${message}</span>
        `;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    }

    function showError(message) {
        const notification = document.createElement('div');
        notification.className = 'notification error';
        notification.innerHTML = `
            <i class="fas fa-exclamation-circle"></i>
            <span>${message}</span>
        `;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    }

    // Initial load
    loadPendingWithdrawals();

    // Refresh button
    refreshBtn.addEventListener('click', loadPendingWithdrawals);
});
 
// ==================== RECEIPT GENERATION ====================
document.addEventListener('DOMContentLoaded', function () {
    const generateBtn = document.getElementById('generate-btn');
    if (!generateBtn) return; // Receipt section not present on this page

    // Visual config per status — colour-coded badge shown on the receipt
    const STATUS_CONFIG = {
        successful: { label: 'Successful', color: '#15803d', bg: '#dcfce7', accent: '#16a34a', icon: '&#10003;' },
        pending:    { label: 'Pending',    color: '#b45309', bg: '#fef3c7', accent: '#f59e0b', icon: '&#9202;' },
        failed:     { label: 'Failed',     color: '#b91c1c', bg: '#fee2e2', accent: '#ef4444', icon: '&#10007;' }
    };

    const METHOD_LABELS = {
        'bank-transfer': 'Bank Transfer',
        'wire-transfer': 'Wire Transfer',
        'check': 'Check',
        'crypto': 'Cryptocurrency'
    };

    // Escape user input so it can't break the receipt markup
    function escapeHtml(value) {
        return String(value == null ? '' : value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    // A single label/value line — omitted entirely when the value is empty
    function detailRow(label, value) {
        if (!value) return '';
        return `<tr>
            <td style="padding:11px 0;border-bottom:1px solid #eef2f7;font-size:13px;color:#64748b;font-weight:500;vertical-align:top;white-space:nowrap;">${label}</td>
            <td style="padding:11px 0 11px 18px;border-bottom:1px solid #eef2f7;font-size:13px;color:#0f172a;font-weight:600;text-align:right;vertical-align:top;word-break:break-word;">${escapeHtml(value)}</td>
        </tr>`;
    }

    function sectionTitle(text, accent) {
        return `<div style="font-size:11px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;color:${accent};margin:0 0 2px 0;">${text}</div>`;
    }

    generateBtn.addEventListener('click', function () {
        const senderName    = document.getElementById('client-name').value.trim();
        const receiverName  = document.getElementById('receiver-name').value.trim();
        const receiverAcct  = document.getElementById('receiver-account').value.trim();
        const receiverBank  = document.getElementById('receiver-bank').value.trim();
        const amount        = parseFloat(document.getElementById('payment-amount').value);
        const description   = document.getElementById('payment-description').value.trim();
        const methodKey     = document.getElementById('payment-method').value;
        const trackingId    = document.getElementById('tracking-id').value.trim();
        const statusKey     = document.getElementById('payment-status').value;

        // Validation
        if (!receiverName) {
            Swal.fire('Missing info', 'Please enter the receiver name.', 'warning');
            return;
        }
        if (isNaN(amount) || amount <= 0) {
            Swal.fire('Invalid amount', 'Please enter a valid amount greater than 0.', 'warning');
            return;
        }

        const status = STATUS_CONFIG[statusKey] || STATUS_CONFIG.successful;
        const method = METHOD_LABELS[methodKey] || methodKey;
        const fmtAmount = amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

        const now = new Date();
        const pad = (n) => ('' + n).padStart(2, '0');
        const dateStr = now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        const receiptNo = 'SE-' + now.getFullYear() + pad(now.getMonth() + 1) + pad(now.getDate())
            + '-' + Math.floor(1000 + Math.random() * 9000);

        // Real brand logo (base64 data URI for reliable html2canvas capture),
        // with a graceful fallback to the file on disk.
        const logoSrc = window.SWIFTEDGE_RECEIPT_LOGO || 'images/swi_logo.jpg';

        // Layout is built with tables + inline styles so html2canvas renders it
        // pixel-perfectly in the downloaded PNG/PDF (no reliance on external CSS).
        const receiptHTML = `
        <div style="max-width:480px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0;font-family:-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#0f172a;">

            <!-- Header -->
            <div style="background:linear-gradient(135deg,#4361ee 0%,#7209b7 100%);padding:24px 28px;">
                <table style="width:100%;border-collapse:collapse;"><tr>
                    <td style="vertical-align:middle;">
                        <table style="border-collapse:collapse;"><tr>
                            <td style="vertical-align:middle;">
                                <img src="${logoSrc}" alt="SwiftEdge Trade" style="width:52px;height:52px;display:block;border-radius:10px;object-fit:cover;">
                            </td>
                            <td style="vertical-align:middle;padding-left:12px;">
                                <div style="font-size:18px;font-weight:800;letter-spacing:.3px;line-height:1.1;color:#ffffff;">SwiftEdge Trade</div>
                                <div style="font-size:10px;color:rgba(255,255,255,0.82);letter-spacing:1.2px;margin-top:3px;">SECURE TRADING PLATFORM</div>
                            </td>
                        </tr></table>
                    </td>
                    <td style="vertical-align:middle;text-align:right;">
                        <div style="font-size:9px;color:rgba(255,255,255,0.75);letter-spacing:1px;">RECEIPT NO.</div>
                        <div style="font-size:13px;font-weight:700;margin-top:3px;color:#ffffff;">${receiptNo}</div>
                    </td>
                </tr></table>
            </div>

            <!-- Amount hero -->
            <div style="padding:26px 28px 24px 28px;text-align:center;background:#ffffff;">
                <div style="font-size:11px;letter-spacing:1.5px;color:#94a3b8;font-weight:600;text-transform:uppercase;">Amount</div>
                <div style="font-size:38px;font-weight:800;color:#0f172a;margin:7px 0 14px 0;letter-spacing:-0.5px;">$${fmtAmount}</div>
                <div style="display:inline-block;padding:7px 16px;border-radius:999px;background:${status.bg};color:${status.color};font-size:12px;font-weight:700;letter-spacing:.4px;border:1px solid ${status.accent};">
                    ${status.icon}&nbsp; ${status.label.toUpperCase()}
                </div>
            </div>

            <!-- Recipient details -->
            <div style="padding:6px 28px 0 28px;">
                ${sectionTitle('Recipient Details', '#4361ee')}
                <table style="width:100%;border-collapse:collapse;">
                    ${detailRow('Receiver Name', receiverName)}
                    ${detailRow('Account Number', receiverAcct)}
                    ${detailRow('Bank', receiverBank)}
                </table>
            </div>

            <!-- Transaction details -->
            <div style="padding:16px 28px 8px 28px;">
                ${sectionTitle('Transaction Details', '#7209b7')}
                <table style="width:100%;border-collapse:collapse;">
                    ${detailRow('Sender', senderName)}
                    ${detailRow('Payment Method', method)}
                    ${detailRow('Description', description)}
                    ${detailRow('Tracking ID', trackingId)}
                    ${detailRow('Date', dateStr)}
                    ${detailRow('Time', timeStr)}
                </table>
            </div>

            <!-- Footer -->
            <div style="margin-top:12px;padding:20px 28px;background:#f8fafc;border-top:1px solid #e2e8f0;text-align:center;">
                <div style="font-size:12px;color:#334155;font-weight:600;">Thank you for trading with SwiftEdge Trade</div>
                <div style="font-size:11px;color:#94a3b8;margin-top:7px;line-height:1.7;">
                    SwiftEdge Trade LLC &middot; Financial Street, New York, NY<br>
                    swiftedgetrade.com &middot; (555) 123-4567
                </div>
            </div>
        </div>`;

        document.getElementById('receipt-printable').innerHTML = receiptHTML;

        const output = document.getElementById('receipt-output');
        output.classList.remove('hidden');
        output.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });

    // Shared capture options for crisp output
    function captureReceipt() {
        return html2canvas(document.getElementById('receipt-printable'), {
            scale: 3,
            backgroundColor: '#ffffff',
            useCORS: true,
            logging: false
        });
    }

    function hasReceipt() {
        const el = document.getElementById('receipt-printable');
        if (!el || !el.innerHTML.trim()) {
            Swal.fire('No receipt', 'Please generate a receipt first.', 'info');
            return false;
        }
        return true;
    }

    // Save as PNG
    document.getElementById('save-png').addEventListener('click', function () {
        if (!hasReceipt()) return;
        captureReceipt().then(canvas => {
            const link = document.createElement('a');
            link.download = `swiftedge-receipt-${Date.now()}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        }).catch(error => {
            console.error('PNG generation error:', error);
            Swal.fire('Error', 'Could not generate the image. Please try again.', 'error');
        });
    });

    // Save as PDF — centred on A4 with margins, scaled to fit
    document.getElementById('save-pdf').addEventListener('click', async function () {
        if (!hasReceipt()) return;
        try {
            const canvas = await captureReceipt();
            const pdf = new window.jspdf.jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

            const pageW = pdf.internal.pageSize.getWidth();
            const pageH = pdf.internal.pageSize.getHeight();
            const margin = 14;
            const maxW = pageW - margin * 2;
            const maxH = pageH - margin * 2;

            let imgW = maxW;
            let imgH = (canvas.height * imgW) / canvas.width;
            if (imgH > maxH) {
                imgH = maxH;
                imgW = (canvas.width * imgH) / canvas.height;
            }
            const x = (pageW - imgW) / 2;

            pdf.addImage(canvas.toDataURL('image/png'), 'PNG', x, margin, imgW, imgH);
            pdf.save(`swiftedge-receipt-${Date.now()}.pdf`);
        } catch (error) {
            console.error('PDF generation error:', error);
            Swal.fire('Error', 'Failed to generate PDF. Please try again.', 'error');
        }
    });
});



// ==================== PROFIT MANAGEMENT SYSTEM ====================

// DOM Elements for Profit System
const profitSearchBtn = document.getElementById('profit-search-btn');
const profitUidSearch = document.getElementById('profit-uid-search');
const profitUserSection = document.getElementById('profit-user-section');
const addProfitForm = document.getElementById('add-profit-form');
const cancelProfitBtn = document.getElementById('cancel-profit');
const refreshHistoryBtn = document.getElementById('refresh-history');

// Global variables for profit management
let currentProfitUserId = null;
let currentProfitUid = null;

// Initialize profit system
function initializeProfitSystem() {
    setupProfitEventListeners();
}

function setupProfitEventListeners() {
    // Search user by UID
    if (profitSearchBtn) {
        profitSearchBtn.addEventListener('click', searchUserForProfit);
    }
    
    if (profitUidSearch) {
        profitUidSearch.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') searchUserForProfit();
        });
    }

    // Add profit form
    if (addProfitForm) {
        addProfitForm.addEventListener('submit', addProfitToUser);
    }
    
    if (cancelProfitBtn) {
        cancelProfitBtn.addEventListener('click', resetProfitForm);
    }

    // Refresh button for user profit history
    if (refreshHistoryBtn) {
        refreshHistoryBtn.addEventListener('click', loadUserProfitHistory);
    }
}

// Search user by UID for profit addition
async function searchUserForProfit() {
    const uid = profitUidSearch.value.trim();
    
    if (!uid) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Please enter a UID',
            confirmButtonColor: '#7c3aed'
        });
        return;
    }

    try {
        // Show loading
        Swal.fire({
            title: 'Searching...',
            text: 'Looking for user in the system',
            allowOutsideClick: false,
            showConfirmButton: false,
            willOpen: () => {
                Swal.showLoading();
            }
        });

        const response = await fetch(`${API_BASE_URL}/admin/search-user/${uid}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            Swal.close();
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: data.message || 'User not found',
                confirmButtonColor: '#7c3aed'
            });
            return;
        }

        // Store user info
        currentProfitUserId = data.user.id;
        currentProfitUid = data.user.uid;

        // Display user info
        displayUserProfitInfo(data.user);
        
        // Show user section
        profitUserSection.classList.remove('hidden');
        
        // Load user's profit history
        loadUserProfitHistory();
        
        Swal.close();
        
    } catch (error) {
        console.error('Error searching user:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to search user',
            confirmButtonColor: '#7c3aed'
        });
    }
}

// Display user information for profit addition
function displayUserProfitInfo(user) {
    document.getElementById('profit-user-name').textContent = user.fullName;
    document.getElementById('profit-user-email').textContent = user.email;
    document.getElementById('profit-user-uid').textContent = user.uid;
    
    // Set status with color - use innerHTML to preserve the dot element
    const statusElement = document.getElementById('profit-user-status');
    let statusColor = '#6b7280'; // default gray
    
    if (user.status === 'Active') {
        statusColor = '#10b981';
    } else if (user.status === 'Inactive') {
        statusColor = '#ef4444';
    }
    
    statusElement.innerHTML = `<span class="status-dot" style="background: ${statusColor};"></span> ${user.status}`;
    
    // Format currency values
    document.getElementById('profit-holding-balance').textContent = 
        formatCurrency(user.holdingBalance || 0);
    document.getElementById('profit-total-profit').textContent = 
        formatCurrency(user.totalProfit || 0);
    document.getElementById('profit-total-balance').textContent = 
        formatCurrency(user.totalBalance || 0);
}

// Add profit to user account
async function addProfitToUser(e) {
    e.preventDefault();
    
    const amount = document.getElementById('profit-amount').value;
    const description = document.getElementById('profit-description').value;
    
    if (!currentProfitUid) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Please search for a user first',
            confirmButtonColor: '#7c3aed'
        });
        return;
    }
    
    if (!amount || parseFloat(amount) <= 0) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Please enter a valid amount',
            confirmButtonColor: '#7c3aed'
        });
        return;
    }

    try {
        // Show loading
        Swal.fire({
            title: 'Processing...',
            text: 'Adding profit to user account',
            allowOutsideClick: false,
            showConfirmButton: false,
            willOpen: () => {
                Swal.showLoading();
            }
        });

        const response = await fetch(`${API_BASE_URL}/admin/add-profit`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            },
            body: JSON.stringify({
                uid: currentProfitUid,
                amount: parseFloat(amount),
                description: description || ''
            })
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(data.message || 'Failed to add profit');
        }

        // Success
        await Swal.fire({
            icon: 'success',
            title: 'Success!',
            html: `
                <div style="text-align: center; padding: 10px;">
                    <div style="color: #10b981; font-size: 48px; margin-bottom: 10px;">
                        <i class="fas fa-check-circle"></i>
                    </div>
                    <h3 style="color: #1e1e2f; margin-bottom: 15px;">Profit Added Successfully</h3>
                    <div style="background: rgba(124, 58, 237, 0.05); padding: 15px; border-radius: 10px; margin: 15px 0;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                            <span style="color: #6b7280;">Amount:</span>
                            <span style="font-weight: 600; color: #1e1e2f;">$${parseFloat(amount).toFixed(2)}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                            <span style="color: #6b7280;">Total Profit:</span>
                            <span style="font-weight: 600; color: #10b981;">$${data.data.profit.totalProfit.toFixed(2)}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span style="color: #6b7280;">Total Balance:</span>
                            <span style="font-weight: 600; color: #7c3aed;">$${data.data.profit.totalBalance.toFixed(2)}</span>
                        </div>
                    </div>
                    <p style="color: #10b981; font-size: 14px; margin-top: 15px;">
                        <i class="fas fa-envelope"></i> User has been notified via email
                    </p>
                </div>
            `,
            confirmButtonText: 'Done',
            confirmButtonColor: '#7c3aed'
        });

        // Reset form
        resetProfitForm();
        
        // Refresh user data and history (after user clicks "Done")
        searchUserForProfit();
        
    } catch (error) {
        console.error('Error adding profit:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.message || 'Please try again',
            confirmButtonColor: '#7c3aed'
        });
    }
}

// Reset profit form
function resetProfitForm() {
    document.getElementById('profit-amount').value = '';
    document.getElementById('profit-description').value = '';
}

// Load user's profit history
async function loadUserProfitHistory() {
    if (!currentProfitUid) return;

    try {
        const response = await fetch(
            `${API_BASE_URL}/admin/user-profits/${currentProfitUid}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });

        const data = await response.json();

        if (response.ok && data.success) {
            displayUserProfitHistory(data.data);
        }
    } catch (error) {
        console.error('Error loading profit history:', error);
    }
}

// Display user's profit history
function displayUserProfitHistory(data) {
    const profitsList = document.getElementById('profits-list');
    
    if (!data.profits || data.profits.length === 0) {
        profitsList.innerHTML = `
            <tr class="no-data">
                <td colspan="4">
                    <div class="empty-state">
                        <i class="fas fa-coins"></i>
                        <p>No profit history found for this user</p>
                    </div>
                </td>
            </tr>
        `;
    } else {
        profitsList.innerHTML = data.profits.map(profit => `
            <tr>
                <td>${new Date(profit.timestamp).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                })}</td>
                <td style="color: #10b981; font-weight: 600;">${formatCurrency(profit.amount)}</td>
                <td>${profit.description || '<span style="color: #9ca3af;">No description</span>'}</td>
                <td>${profit.addedBy?.username || 'Admin'}</td>
            </tr>
        `).join('');
    }
    
    // Update summary
    document.getElementById('total-profits-sum').textContent = 
        formatCurrency(data.summary.totalProfit || 0);
    document.getElementById('total-profits-count').textContent = 
        data.summary.count || 0;
}

// Utility function to format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initializeProfitSystem();
});