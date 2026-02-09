// DOM Elements
const sidebar = document.getElementById('sidebar');
const hamburgerMenu = document.getElementById('hamburger-menu');
const closeSidebar = document.getElementById('close-sidebar');
const collapseToggle = document.getElementById('collapse-toggle');
const overlay = document.getElementById('overlay');
const body = document.body;
const mainContent = document.querySelector('.main-content');
const themeToggle = document.getElementById('theme-toggle');
const notificationBtn = document.getElementById('notification-btn');

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
        
        // Update collapse button icon
        const icon = collapseToggle.querySelector('i');
        if (sidebar.classList.contains('collapsed')) {
            icon.classList.remove('fa-angle-left');
            icon.classList.add('fa-angle-right');
        } else {
            icon.classList.remove('fa-angle-right');
            icon.classList.add('fa-angle-left');
        }
    }
}

// Event Listeners
hamburgerMenu.addEventListener('click', () => toggleSidebar(true));
closeSidebar.addEventListener('click', () => toggleSidebar(false));
overlay.addEventListener('click', () => toggleSidebar(false));
collapseToggle.addEventListener('click', toggleSidebarCollapse);

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

// Theme Toggle
themeToggle.addEventListener('click', () => {
    const icon = themeToggle.querySelector('i');
    if (icon.classList.contains('fa-moon')) {
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
        document.body.classList.add('dark-mode');
    } else {
        icon.classList.remove('fa-sun');
        icon.classList.add('fa-moon');
        document.body.classList.remove('dark-mode');
    }
});

// Update current section indicator
function updateCurrentSection(sectionName) {
    const currentSection = document.querySelector('.current-section');
    if (!currentSection) return;
    
    const currentText = currentSection.querySelector('.current-text');
    const currentIcon = currentSection.querySelector('.current-icon');
    
    if (!currentText || !currentIcon) return;
    
    // Map section names to icons
    const iconMap = {
        'portfolio': 'fa-wallet',
        'deposit': 'fa-money-bill-wave',
        'withdrawal': 'fa-credit-card',
        'market': 'fa-chart-bar',
        'trade': 'fa-exchange-alt',
        'transactions': 'fa-history',
        'calculator': 'fa-calculator',
        'settings': 'fa-cog'
    };
    
    // Update text and icon
    currentText.textContent = sectionName.charAt(0).toUpperCase() + sectionName.slice(1);
    
    // Remove all icon classes except 'fas'
    currentIcon.className = 'fas';
    
    // Add the appropriate icon class
    if (iconMap[sectionName]) {
        currentIcon.classList.add(iconMap[sectionName]);
    }
}

// Update sidebar username
function updateSidebarUsername(username) {
    const sidebarUsername = document.getElementById('sidebar-username');
    if (sidebarUsername) {
        sidebarUsername.textContent = username;
    }
}

// Sidebar navigation functions (updated to update current section)
function showPortfolio() {
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => {
        section.style.display = 'none';
    });
    document.getElementById('portfolio').style.display = 'block';
    updateCurrentSection('portfolio');
}

function showMarket() {
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => {
        section.style.display = 'none';
    });
    document.getElementById('market-data').style.display = 'block';
    updateCurrentSection('market');
}

function showTrade() {
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => {
        section.style.display = 'none';
    });
    document.getElementById('trade').style.display = 'block';
    updateCurrentSection('trade');
}

function showTransactions() {
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => {
        section.style.display = 'none';
    });
    document.getElementById('transactions').style.display = 'block';
    updateCurrentSection('transactions');
}

function showDeposit() {
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => {
        section.style.display = 'none';
    });
    document.getElementById('deposit').style.display = 'block';
    updateCurrentSection('deposit');
}

function showDepositBtn() {
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => {
        section.style.display = 'none';
    });
    document.getElementById('deposit').style.display = 'block';
    updateCurrentSection('deposit');
}

function showWithdrawal() {
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => {
        section.style.display = 'none';
    });
    document.getElementById('withdrawal').style.display = 'block';
    updateCurrentSection('withdrawal');
}

function showWithdrawalBtn() {
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => {
        section.style.display = 'none';
    });
    document.getElementById('withdrawal').style.display = 'block';
    updateCurrentSection('withdrawal');
}

function showSettings() {
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => {
        section.style.display = 'none';
    });
    document.getElementById('settings').style.display = 'block';
    updateCurrentSection('settings');
}

function showCalculator() {
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => {
        section.style.display = 'none';
    });
    document.getElementById('calculator').style.display = 'block';
    updateCurrentSection('calculator');
}

// Attach the functions to the sidebar menu items
document.getElementById('portfolio-menu').addEventListener('click', showPortfolio);
document.getElementById('market-menu').addEventListener('click', showMarket);
document.getElementById('trading-menu').addEventListener('click', showTrade);
document.getElementById('transaction-menu').addEventListener('click', showTransactions);
document.getElementById('settings-menu').addEventListener('click', showSettings);
document.getElementById('deposit-menu').addEventListener('click', showDeposit);
document.getElementById('withdrawal-menu').addEventListener('click', showWithdrawal);
document.getElementById('calculator-menu').addEventListener('click', showCalculator);
document.getElementById('showwithdrawal-btn').addEventListener('click', showWithdrawalBtn);
document.getElementById('showDeposit-btn').addEventListener('click', showDepositBtn);

// Logout button functionality
document.querySelector('.logout-btn').addEventListener('click', function(e) {
    e.preventDefault();
    Swal.fire({
        title: 'Logout?',
        text: 'Are you sure you want to logout?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#4361ee',
        cancelButtonColor: '#ef233c',
        confirmButtonText: 'Yes, logout'
    }).then((result) => {
        if (result.isConfirmed) {
            localStorage.removeItem('authToken');
            window.location.href = 'login.html';
        }
    });
});

// Update user info in sidebar
async function updateSidebarUserInfo() {
    const token = localStorage.getItem('authToken');
    if (!token) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/user-info`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
        });
        
        if (response.ok) {
            const data = await response.json();
            const username = data.username || data.fullName || 'Trader';
            updateSidebarUsername(username);
            
            // Update avatar initial if needed
            const avatar = document.querySelector('.user-avatar');
            if (avatar) {
                avatar.innerHTML = `<i class="fas fa-user-circle"></i>`;
            }
        }
    } catch (error) {
        console.error('Error updating sidebar user info:', error);
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    // Close sidebar when clicking on menu items (mobile)
    const menuItems = document.querySelectorAll('.sidebar-menu a');
    menuItems.forEach(item => {
        item.addEventListener('click', () => {
            if (!isDesktop()) {
                toggleSidebar(false);
            }
        });
    });
    
    // Initialize sidebar user info
    updateSidebarUserInfo();
    
    // Check for notifications count
    updateNotificationCount();
    
    // UID Copy Functionality
    const copyButtons = document.querySelectorAll('.copy-btn[data-copy]');
    copyButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetId = this.getAttribute('data-copy');
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                const textToCopy = targetElement.textContent || targetElement.value;
                
                // Modern clipboard API
                navigator.clipboard.writeText(textToCopy).then(() => {
                    // Visual feedback
                    const originalIcon = this.innerHTML;
                    this.innerHTML = '<i class="fas fa-check"></i>';
                    this.style.background = '#10b981';
                    this.style.color = 'white';
                    
                    // Show success message
                    Swal.fire({
                        icon: 'success',
                        title: 'Copied!',
                        text: 'UID copied to clipboard',
                        timer: 1500,
                        showConfirmButton: false,
                        toast: true,
                        position: 'top-end'
                    });
                    
                    // Reset button after 2 seconds
                    setTimeout(() => {
                        this.innerHTML = originalIcon;
                        this.style.background = '';
                        this.style.color = '';
                    }, 2000);
                }).catch(err => {
                    console.error('Failed to copy:', err);
                    Swal.fire({
                        icon: 'error',
                        title: 'Copy Failed',
                        text: 'Unable to copy UID',
                        timer: 2000,
                        showConfirmButton: false
                    });
                });
            }
        });
    });
});

// Update notification count
function updateNotificationCount() {
    // Simulate fetching notification count
    const notificationBadge = document.querySelector('.notification-badge');
    if (notificationBadge) {
        // You would fetch real notification count from your API
        const notificationCount = 3; // Example count
        notificationBadge.textContent = notificationCount;
        if (notificationCount === 0) {
            notificationBadge.style.display = 'none';
        }
    }
}

// Initialize the default section
showPortfolio();


// Fetch Market Data Functionality
async function fetchMarketData() {
  const url = 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=7&page=1&sparkline=false';

  try {
      const response = await fetch(url);
      const data = await response.json();

      const marketList = document.getElementById('market-list');
      marketList.innerHTML = ''; // Clear any existing data

      data.forEach(coin => {
          const marketItem = document.createElement('div');
          marketItem.classList.add('market-item');
          marketItem.innerHTML = `
              <h3>${coin.name} (${coin.symbol.toUpperCase()})</h3>
              <p>Price: $${coin.current_price}</p>
              <button onclick="openTradeModal('${coin.id}', 'buy')">Buy</button>
              <button onclick="openTradeModal('${coin.id}', 'sell')">Sell</button>
          `;
          marketList.appendChild(marketItem);
      });
  } catch (error) {
      console.error("Error fetching market data:", error);
  }
}

fetchMarketData();


//code for custom drop down with icons


document.getElementById('deposit-method').addEventListener('change', function () {
  const method = this.value;
  // Hide all sections
  document.querySelectorAll('#deposit-method-sections .deposit-method-section').forEach(section => {
      section.style.display = 'none';
  });

  // Show the selected section
  if (method) {
      const section = document.getElementById(`${method}-section`);
      if (section) section.style.display = 'block';
  }
});

function copyToClipboard(elementId) {
  const copyText = document.getElementById(elementId);
  navigator.clipboard.writeText(copyText.value).then(() => {
      alert('Copied to clipboard!');
  });
}

// Js code for withdrawal toggle functionality
// document.querySelectorAll('.withdrawal-tab').forEach(tab => {
//   tab.addEventListener('click', () => {
//       document.querySelectorAll('.withdrawal-tab').forEach(t => t.classList.remove('active'));
//       tab.classList.add('active');

//       const method = tab.dataset.method;
//       document.querySelectorAll('.withdrawal-method').forEach(methodDiv => {
//           methodDiv.style.display = methodDiv.id === `${method}-method` ? 'block' : 'none';
//       });
//   });
// });


function copyToClipboard(elementId) {
  const input = document.getElementById(elementId);
  input.select();
  document.execCommand("copy");
  alert("Copied to clipboard: " + input.value);
}

// Redirect to Support Email Function
function redirectToSupportEmail() {
  const supportEmail = "swiftedgetrade@gmail.com";
  const subject = "Request for Credit/Debit Card Deposit Instructions";
  const body = `Hello,\n\nI would like to deposit funds using my credit or debit card. Please provide me with the necessary instructions to complete the transaction.\n\nThank you!`;

  // Construct the mailto link
  const mailtoLink = `mailto:${supportEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  // Redirect to the mailto link
  window.location.href = mailtoLink;
}


// Redirect to Email Support Function this is for the email 
function redirectToEmailDepositSupport() {
  const supportEmail = "swiftedgetrade@gmail.com";
  const subject = "Request for Deposit Instructions via Email";
  const body = `Hello,\n\nI would like to deposit funds using the 'Deposit through Email' method. Please provide me with the necessary details to complete the transaction.\n\nThank you!`;

  // Construct the mailto link
  const mailtoLink = `mailto:${supportEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  // Redirect to the mailto link
  window.location.href = mailtoLink;
}


// Fetch deposit details from the backend when the page loads
window.addEventListener('DOMContentLoaded', () => {
  fetch(`${API_BASE_URL}/api/deposit-details`)
      .then(response => response.json())
      .then(data => {
          if (data) {
              window.depositData = data;
          }
      })
      .catch(error => console.error('Error fetching deposit data:', error));
});

document.getElementById('deposit-method').addEventListener('change', function () {
const method = this.value;
const depositData = window.depositData;

// Hide all sections
document.querySelectorAll('#deposit-method-sections .deposit-method-section').forEach(section => {
    section.style.display = 'none';
});

// Show the selected section and populate with data
if (method) {
    const section = document.getElementById(`${method}-section`);
    if (section) {
        section.style.display = 'block';

        // Bank Transfer Details
        if (method === 'bank-transfer') {
            document.getElementById('bank-name').value = depositData.bankDetails.bankName || '';
            document.getElementById('routing-number').value = depositData.bankDetails.routingNumber || '';
            document.getElementById('account-number').value = depositData.bankDetails.accountNumber || '';
            document.getElementById('account-name').value = depositData.bankDetails.accountName || '';
            document.getElementById('swift-code').value = depositData.bankDetails.swiftCode || '';
        }

        // Cryptocurrency Details
        if (method === 'cryptocurrency') {
          const cryptoType = document.getElementById('crypto-type').value;
          const cryptoDetails = depositData.cryptoDetails.find(crypto => crypto.type === cryptoType);
      
          if (cryptoDetails) {
              document.getElementById('crypto-wallet').value = cryptoDetails.walletAddress;
              document.getElementById('crypto-network').value = cryptoDetails.network;
          } else {
              document.getElementById('crypto-wallet').value = 'Select a cryptocurrency to see the wallet address';
              document.getElementById('crypto-network').value = 'Select a cryptocurrency to see the network';
          }
      }
      

        // Digital Wallet Details
        if (method === 'digital-wallet') {
          const walletType = document.getElementById('wallet-type').value;
          const walletDetails = depositData.digitalWalletDetails.find(wallet => wallet.type === walletType);
      
          if (walletDetails) {
              document.getElementById('wallet-info').value = walletDetails.details;
          } else {
              document.getElementById('wallet-info').value = 'Select a wallet to see the details';
          }
      }
      
    }
}
});


// Function to fetch user information and update the DOM
async function fetchUserInfo() {
  try {
      // Fetch the user info using the GET route
      const response = await fetch(`${API_BASE_URL}/user-info`, {
          method: 'GET',
          headers: {
              'Authorization': `Bearer ${localStorage.getItem('authToken')}`,  
          }
      });

      if (!response.ok) {
          throw new Error('Failed to fetch user info');
      }

      const data = await response.json();

      // Update the DOM with the received user data (portfolio section IDs)
      const usernameEl = document.getElementById('portfolio-username');
      const uidEl = document.getElementById('portfolio-UID');
      const statusEl = document.getElementById('portfolio-status');
      const lastLoginEl = document.getElementById('portfolio-last-login');
      
      if (usernameEl) usernameEl.innerText = data.username;
      if (uidEl) uidEl.innerText = data.uid;
      if (statusEl) statusEl.innerText = data.status;
      if (lastLoginEl) lastLoginEl.innerText = data.lastLogin || 'N/A';

  } catch (error) {
      console.error('Error fetching user info:', error);
  }
}


// Format currency helper function
function formatCurrency(amount) {
    if (amount === undefined || amount === null || isNaN(amount)) return '$0.00';
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
}

// Format percentage helper function
function formatPercentage(value, showSign = true) {
    if (value === undefined || value === null || isNaN(value)) return '0.00%';
    const sign = showSign && value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
}

// Format asset amount (for crypto amounts like 0.0005 BTC)
function formatAssetAmount(amount, maxDecimals = 6) {
    if (amount === undefined || amount === null || isNaN(amount)) return '0';
    
    // For very small numbers, show more precision
    if (amount > 0 && amount < 0.0001) {
        return amount.toExponential(2);
    }
    
    // For regular numbers, limit decimal places
    const formatted = parseFloat(amount.toFixed(maxDecimals));
    return formatted.toLocaleString('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: maxDecimals
    });
}

function fetchPortfolioData() {
    console.log('Fetching portfolio data...');
    
    // Show loading state on financial cards
    const financialCards = document.querySelectorAll('.financial-value');
    financialCards.forEach(card => {
        card.classList.add('loading');
    });
    
    return fetch(`${API_BASE_URL}/portfolio`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
    })
    .then(response => {
        console.log('Response status:', response.status);

        if (!response.ok) {
            console.error('Failed to fetch portfolio data. Status:', response.status);
            throw new Error('Failed to fetch portfolio data');
        }
        return response.json();
    })
    .then(data => {
        console.log('Portfolio Data:', data);  
        updatePortfolioUI(data);
        return data;
    })
    .catch(error => {
        console.error('Error fetching portfolio data:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to load portfolio data. Please refresh the page.',
            confirmButtonColor: '#4361ee'
        });
    })
    .finally(() => {
        // Remove loading state
        financialCards.forEach(card => {
            card.classList.remove('loading');
        });
    });
}

// Function to update UI with portfolio data
function updatePortfolioUI(data) {
    console.log('Updating portfolio UI with data:', data);

    // Update Total Balance
    const totalBalanceEl = document.getElementById('total-balance');
    if (totalBalanceEl) {
        totalBalanceEl.textContent = formatCurrency(data.totalBalance || 0);
    }

    // Update Balance Change (weekly profit)
    const balanceChangeEl = document.getElementById('balance-change');
    if (balanceChangeEl) {
        const changeAmount = data.balanceChange || 0;
        const isPositive = changeAmount >= 0;
        balanceChangeEl.className = `financial-change ${isPositive ? 'positive' : 'negative'}`;
        balanceChangeEl.innerHTML = `
            <i class="fas fa-arrow-${isPositive ? 'up' : 'down'}"></i>
            <span>${isPositive ? '+' : '-'}${formatCurrency(Math.abs(changeAmount))} this week</span>
        `;
    }

    // Update Invested Capital
    const investedCapitalEl = document.getElementById('invested-capital');
    if (investedCapitalEl) {
        investedCapitalEl.textContent = formatCurrency(data.investedCapital || 0);
    }

    // Update Initial Investment
    const initialInvestmentEl = document.getElementById('initial-investment');
    if (initialInvestmentEl) {
        initialInvestmentEl.textContent = formatCurrency(data.initialInvestment || 0);
    }

    // Update Profit Earned
    const profitEarnedEl = document.getElementById('profit-earned');
    if (profitEarnedEl) {
        profitEarnedEl.textContent = formatCurrency(data.profitEarned || 0);
    }

    // Update Today's Profit
    const todayProfitEl = document.getElementById('today-profit');
    if (todayProfitEl) {
        const todayProfit = data.todayProfit || 0;
        const isPositive = todayProfit >= 0;
        todayProfitEl.className = `breakdown-value ${isPositive ? 'positive' : 'negative'}`;
        todayProfitEl.textContent = `${isPositive ? '+' : ''}${formatCurrency(todayProfit)}`;
    }

    // Update Yesterday's Profit
    const yesterdayProfitEl = document.getElementById('yesterday-profit');
    if (yesterdayProfitEl) {
        const yesterdayProfit = data.yesterdayProfit || 0;
        const isPositive = yesterdayProfit >= 0;
        yesterdayProfitEl.className = `breakdown-value ${isPositive ? 'positive' : 'negative'}`;
        yesterdayProfitEl.textContent = `${isPositive ? '+' : ''}${formatCurrency(yesterdayProfit)}`;
    }

    // Update Holdings
    const holdingsGrid = document.getElementById('holdings-grid');
    if (holdingsGrid) {
        holdingsGrid.innerHTML = '';

        if (data.holdings && Array.isArray(data.holdings) && data.holdings.length > 0) {
            data.holdings.forEach(holding => {
                const assetCard = document.createElement('div');
                assetCard.className = 'asset-card';

                assetCard.innerHTML = `
                    <div class="asset-header">
                        <div class="asset-icon ${holding.type || 'crypto'}">
                            <i class="${holding.icon || 'fab fa-bitcoin'}"></i>
                        </div>
                        <div class="asset-info">
                            <h4>${holding.name || 'Unknown Asset'}</h4>
                            <p class="asset-symbol">${holding.symbol || 'N/A'}</p>
                        </div>
                    </div>
                    <div class="asset-details">
                        <div class="detail-row">
                            <span class="detail-label">Amount</span>
                            <span class="detail-value" title="${holding.amount || 0} ${holding.unit || ''}">${formatAssetAmount(holding.amount)} ${holding.unit || ''}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Value</span>
                            <span class="detail-value">${formatCurrency(holding.value || 0)}</span>
                        </div>
                    </div>
                `;

                holdingsGrid.appendChild(assetCard);
            });
        } else {
            // Show empty state message
            holdingsGrid.innerHTML = `
                <div class="empty-holdings">
                    <i class="fas fa-wallet"></i>
                    <p>No holdings yet</p>
                    <span>Your assets will appear here once added</span>
                </div>
            `;
        }
    }

    // Update Holdings Summary
    const totalAssetsEl = document.getElementById('total-assets');
    if (totalAssetsEl) {
        totalAssetsEl.textContent = data.holdings ? data.holdings.length : 0;
    }

    const holdingsValueEl = document.getElementById('holdings-value');
    if (holdingsValueEl) {
        holdingsValueEl.textContent = formatCurrency(data.totalHoldingsValue || 0);
    }

    // Update Performance Chart
    if (data.performanceData && Array.isArray(data.performanceData) && data.performanceData.length > 0) {
        updatePerformanceChart(data.performanceData);
    } else {
        // Show empty chart state
        showEmptyChartState();
    }

    // Update Chart Statistics
    const totalReturnEl = document.getElementById('total-return');
    if (totalReturnEl) {
        const totalReturn = data.totalReturn || 0;
        const isPositive = totalReturn >= 0;
        totalReturnEl.className = `stat-value ${isPositive ? 'positive' : 'negative'}`;
        totalReturnEl.textContent = formatPercentage(totalReturn);
    }

    const bestMonthEl = document.getElementById('best-month');
    if (bestMonthEl) {
        if (data.bestMonth && data.bestMonth.name !== 'N/A') {
            const bestMonth = data.bestMonth;
            const isPositive = bestMonth.return >= 0;
            bestMonthEl.className = `stat-value ${isPositive ? 'positive' : 'negative'}`;
            bestMonthEl.textContent = `${bestMonth.name} (${formatCurrency(bestMonth.return)})`;
        } else {
            bestMonthEl.className = 'stat-value';
            bestMonthEl.textContent = 'N/A';
        }
    }

    const avgMonthlyEl = document.getElementById('avg-monthly');
    if (avgMonthlyEl) {
        const avgReturn = data.avgMonthlyReturn || 0;
        const isPositive = avgReturn >= 0;
        avgMonthlyEl.className = `stat-value ${isPositive ? 'positive' : 'negative'}`;
        avgMonthlyEl.textContent = formatCurrency(avgReturn);
    }
}

// Show empty state for chart
function showEmptyChartState() {
    const chartArea = document.getElementById('chart-area');
    const chartLine = document.getElementById('chart-line');
    const dataPointsGroup = document.getElementById('chart-data-points');
    const labelsGroup = document.getElementById('chart-labels');

    if (chartArea) chartArea.setAttribute('d', 'M 50 250 L 750 250 L 750 250 L 50 250 Z');
    if (chartLine) chartLine.setAttribute('d', 'M 50 250 L 750 250');
    if (dataPointsGroup) dataPointsGroup.innerHTML = '';
    if (labelsGroup) {
        labelsGroup.innerHTML = `
            <text x="400" y="150" class="chart-label" style="font-size: 14px; fill: #888; text-anchor: middle;">No performance data available</text>
        `;
    }
}

// Function to update performance chart with dynamic data
function updatePerformanceChart(performanceData) {
    const chartArea = document.getElementById('chart-area');
    const chartLine = document.getElementById('chart-line');
    const dataPointsGroup = document.getElementById('chart-data-points');
    const labelsGroup = document.getElementById('chart-labels');

    if (!chartArea || !chartLine || !dataPointsGroup || !labelsGroup) {
        return;
    }

    if (!performanceData || performanceData.length === 0) {
        showEmptyChartState();
        return;
    }

    // Clear existing elements
    dataPointsGroup.innerHTML = '';
    labelsGroup.innerHTML = '';

    const chartWidth = 700; // 750 - 50 (margins)
    const chartHeight = 200; // 250 - 50 (margins)
    const startX = 50;
    const baseY = 250;
    const padding = 20; // Padding for min/max values

    // Find min and max values for scaling
    const values = performanceData.map(d => d.value);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const valueRange = maxValue - minValue || 1;

    // Calculate Y position for a given value
    const getY = (value) => {
        return baseY - padding - ((value - minValue) / valueRange) * (chartHeight - padding);
    };

    // Build path strings with all points
    const points = performanceData.map((dataPoint, index) => {
        const x = startX + (index / Math.max(performanceData.length - 1, 1)) * chartWidth;
        const y = getY(dataPoint.value);
        return { x, y, dataPoint };
    });

    // Create line path
    let linePath = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
        linePath += ` L ${points[i].x} ${points[i].y}`;
    }

    // Create area path (line path + close to bottom)
    let areaPath = `M ${points[0].x} ${baseY}`;
    areaPath += ` L ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
        areaPath += ` L ${points[i].x} ${points[i].y}`;
    }
    areaPath += ` L ${points[points.length - 1].x} ${baseY}`;
    areaPath += ` Z`;

    // Add data points and labels
    points.forEach((point, index) => {
        // Add data point circle
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', point.x);
        circle.setAttribute('cy', point.y);
        circle.setAttribute('r', 6);
        circle.setAttribute('class', 'chart-dot');
        
        const tooltipValue = point.dataPoint.tooltip || formatCurrency(point.dataPoint.value);
        circle.setAttribute('data-tooltip', `${point.dataPoint.label}: ${tooltipValue}`);
        dataPointsGroup.appendChild(circle);

        // Add label (skip some if too many data points to avoid crowding)
        const showLabel = performanceData.length <= 12 || 
            index === 0 || 
            index === performanceData.length - 1 || 
            index % Math.ceil(performanceData.length / 10) === 0;
        
        if (showLabel) {
            const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            label.setAttribute('x', point.x);
            label.setAttribute('y', 275);
            label.setAttribute('class', 'chart-label');
            label.textContent = point.dataPoint.label;
            labelsGroup.appendChild(label);
        }
    });

    // Update paths
    chartArea.setAttribute('d', areaPath);
    chartLine.setAttribute('d', linePath);
}

// Function to handle performance filter changes
function changePerformancePeriod(period) {
    console.log('Changing performance period to:', period);

    // Update active filter button
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    const activeBtn = document.querySelector(`[data-period="${period}"]`);
    if (activeBtn) {
        activeBtn.classList.add('active');
    }

    // Show loading state on chart
    const chartLine = document.getElementById('chart-line');
    if (chartLine) {
        chartLine.classList.add('loading');
    }

    // Fetch data for the selected period
    fetch(`${API_BASE_URL}/portfolio/performance?period=${period}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to fetch performance data');
        }
        return response.json();
    })
    .then(data => {
        if (data.performanceData && Array.isArray(data.performanceData)) {
            updatePerformanceChart(data.performanceData);
        } else {
            showEmptyChartState();
        }
    })
    .catch(error => {
        console.error('Error fetching performance data:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to load performance data.',
            confirmButtonColor: '#4361ee'
        });
    })
    .finally(() => {
        if (chartLine) {
            chartLine.classList.remove('loading');
        }
    });
}

// Add event listeners for performance filters
document.addEventListener('DOMContentLoaded', function() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            const period = this.getAttribute('data-period');
            changePerformancePeriod(period);
        });
    });

    // Add refresh portfolio button listener
    const refreshPortfolioBtn = document.getElementById('refresh-portfolio');
    if (refreshPortfolioBtn) {
        refreshPortfolioBtn.addEventListener('click', function() {
            // Add loading state
            const icon = this.querySelector('i');
            const originalIcon = icon.className;
            icon.className = 'fas fa-spinner fa-spin';

            // Fetch fresh data
            fetchPortfolioData().finally(() => {
                // Restore original icon
                icon.className = originalIcon;
            });
        });
    }

    // Add Generate Report button listener
    const reportBtn = document.querySelector('.report-action');
    if (reportBtn) {
        reportBtn.addEventListener('click', generateTransactionReport);
    }
});

// Generate Transaction Report Function
async function generateTransactionReport() {
    const reportBtn = document.querySelector('.report-action');
    const originalContent = reportBtn.innerHTML;
    
    try {
        // Show loading state
        reportBtn.innerHTML = `
            <i class="fas fa-spinner fa-spin"></i>
            <span>Generating...</span>
            <p>Please wait</p>
        `;
        reportBtn.disabled = true;

        // Fetch all transactions for the report
        const response = await fetch(`${API_BASE_URL}/api/transactions?page=1&limit=1000`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });

        if (!response.ok) throw new Error('Failed to fetch transactions');

        const { transactions } = await response.json();

        // Fetch user info for the report header
        const userResponse = await fetch(`${API_BASE_URL}/user/info`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });

        let userName = 'User';
        let userEmail = '';
        if (userResponse.ok) {
            const userData = await userResponse.json();
            userName = userData.name || userData.username || 'User';
            userEmail = userData.email || '';
        }

        // Generate report content
        const reportContent = generateReportHTML(transactions, userName, userEmail);
        
        // Create and download the report
        downloadReport(reportContent, `SwiftEdge_Transaction_Report_${new Date().toISOString().split('T')[0]}.html`);

        Swal.fire({
            icon: 'success',
            title: 'Report Generated!',
            text: 'Your transaction report has been downloaded.',
            confirmButtonColor: '#4361ee'
        });

    } catch (error) {
        console.error('Error generating report:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to generate report. Please try again.',
            confirmButtonColor: '#4361ee'
        });
    } finally {
        reportBtn.innerHTML = originalContent;
        reportBtn.disabled = false;
    }
}

// Generate HTML content for the report
function generateReportHTML(transactions, userName, userEmail) {
    const now = new Date();
    const reportDate = now.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });

    // Calculate summary statistics
    const totalDeposits = transactions
        .filter(t => t.type === 'credit' || t.type === 'deposit')
        .reduce((sum, t) => sum + (t.amount || 0), 0);
    
    const totalWithdrawals = transactions
        .filter(t => t.type === 'debit' || t.type === 'withdrawal')
        .reduce((sum, t) => sum + (t.amount || 0), 0);
    
    const totalProfits = transactions
        .filter(t => t.type === 'profit')
        .reduce((sum, t) => sum + (t.amount || 0), 0);

    const completedCount = transactions.filter(t => t.status === 'completed' || t.status === 'approved').length;
    const pendingCount = transactions.filter(t => t.status === 'pending').length;
    const failedCount = transactions.filter(t => t.status === 'failed' || t.status === 'rejected').length;

    // Generate transaction rows
    const transactionRows = transactions.map(tx => {
        const date = new Date(tx.createdAt || tx.date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
        const type = tx.type ? tx.type.charAt(0).toUpperCase() + tx.type.slice(1) : 'N/A';
        const status = tx.status ? tx.status.charAt(0).toUpperCase() + tx.status.slice(1) : 'N/A';
        const amount = tx.amount ? `$${tx.amount.toFixed(2)}` : '$0.00';
        const description = tx.description || tx.method || 'N/A';
        
        const statusColor = tx.status === 'completed' || tx.status === 'approved' ? '#10b981' : 
                           tx.status === 'pending' ? '#f59e0b' : '#ef4444';
        const typeColor = tx.type === 'credit' || tx.type === 'deposit' || tx.type === 'profit' ? '#10b981' : '#ef4444';

        return `
            <tr>
                <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${date}</td>
                <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: ${typeColor}; font-weight: 600;">${type}</td>
                <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${description}</td>
                <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; font-weight: 600;">${amount}</td>
                <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;"><span style="background: ${statusColor}20; color: ${statusColor}; padding: 4px 12px; border-radius: 20px; font-size: 12px;">${status}</span></td>
            </tr>
        `;
    }).join('');

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SwiftEdge Transaction Report</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f8fafc; color: #1e293b; line-height: 1.6; }
        .container { max-width: 900px; margin: 0 auto; padding: 40px 20px; }
        .header { background: linear-gradient(135deg, #1e1e2f, #2a2a3e); color: white; padding: 40px; border-radius: 16px; margin-bottom: 30px; }
        .logo { font-size: 28px; font-weight: 700; margin-bottom: 10px; }
        .report-title { font-size: 20px; opacity: 0.9; }
        .report-meta { margin-top: 20px; font-size: 14px; opacity: 0.8; }
        .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .summary-card { background: white; padding: 24px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
        .summary-card h3 { font-size: 14px; color: #64748b; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px; }
        .summary-card .value { font-size: 28px; font-weight: 700; }
        .summary-card .value.green { color: #10b981; }
        .summary-card .value.red { color: #ef4444; }
        .summary-card .value.blue { color: #3b82f6; }
        .transactions-section { background: white; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); overflow: hidden; }
        .section-header { padding: 20px 24px; border-bottom: 1px solid #e5e7eb; }
        .section-header h2 { font-size: 18px; }
        table { width: 100%; border-collapse: collapse; }
        th { background: #f8fafc; padding: 14px 12px; text-align: left; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b; }
        .footer { text-align: center; margin-top: 40px; color: #64748b; font-size: 14px; }
        .status-summary { display: flex; gap: 20px; margin-top: 15px; }
        .status-item { display: flex; align-items: center; gap: 8px; font-size: 14px; }
        .status-dot { width: 10px; height: 10px; border-radius: 50%; }
        @media print { body { background: white; } .container { padding: 20px; } }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">⚡ SwiftEdge</div>
            <div class="report-title">Transaction History Report</div>
            <div class="report-meta">
                <p><strong>Account Holder:</strong> ${userName}</p>
                ${userEmail ? `<p><strong>Email:</strong> ${userEmail}</p>` : ''}
                <p><strong>Report Generated:</strong> ${reportDate}</p>
                <p><strong>Total Transactions:</strong> ${transactions.length}</p>
            </div>
        </div>

        <div class="summary-grid">
            <div class="summary-card">
                <h3>Total Deposits</h3>
                <div class="value green">$${totalDeposits.toFixed(2)}</div>
            </div>
            <div class="summary-card">
                <h3>Total Withdrawals</h3>
                <div class="value red">$${totalWithdrawals.toFixed(2)}</div>
            </div>
            <div class="summary-card">
                <h3>Total Profits</h3>
                <div class="value green">$${totalProfits.toFixed(2)}</div>
            </div>
            <div class="summary-card">
                <h3>Net Flow</h3>
                <div class="value ${(totalDeposits + totalProfits - totalWithdrawals) >= 0 ? 'green' : 'red'}">$${(totalDeposits + totalProfits - totalWithdrawals).toFixed(2)}</div>
            </div>
        </div>

        <div class="summary-card" style="margin-bottom: 30px;">
            <h3>Transaction Status Overview</h3>
            <div class="status-summary">
                <div class="status-item"><span class="status-dot" style="background: #10b981;"></span> Completed: ${completedCount}</div>
                <div class="status-item"><span class="status-dot" style="background: #f59e0b;"></span> Pending: ${pendingCount}</div>
                <div class="status-item"><span class="status-dot" style="background: #ef4444;"></span> Failed/Rejected: ${failedCount}</div>
            </div>
        </div>

        <div class="transactions-section">
            <div class="section-header">
                <h2>Transaction Details</h2>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Type</th>
                        <th>Description</th>
                        <th>Amount</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    ${transactionRows || '<tr><td colspan="5" style="padding: 40px; text-align: center; color: #64748b;">No transactions found</td></tr>'}
                </tbody>
            </table>
        </div>

        <div class="footer">
            <p>This report was automatically generated by SwiftEdge Investment Platform</p>
            <p style="margin-top: 8px;">© ${new Date().getFullYear()} SwiftEdge. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
    `;
}

// Download report as HTML file
function downloadReport(content, filename) {
    const blob = new Blob([content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}


// window.onload = fetchPortfolioData;

window.onload = function () {
    fetchUserInfo();
    fetchPortfolioData();
    checkTokenExpiration();
};



//checking token expiration

function checkTokenExpiration() {
    const token = localStorage.getItem('authToken');  
    if (token) {
        const decodedToken = JSON.parse(atob(token.split('.')[1]));  
        const expirationTime = decodedToken.exp;
        const currentTime = Math.floor(Date.now() / 1000);  

        if (currentTime >= expirationTime) {
            showSessionExpiredMessage();
        }
    }
}

setInterval(checkTokenExpiration, 60000);


function showSessionExpiredMessage() {
    let modal = document.getElementById('sessionExpiredModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'sessionExpiredModal';
        modal.innerHTML = `
            <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.6); display: flex; align-items: center; justify-content: center; z-index: 10000;">
                <div style="background: #fff; padding: 30px 40px; border-radius: 10px; box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1); max-width: 400px; text-align: center; width: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                    <h2 style="font-size: 18px; color: #333; margin-bottom: 20px;">Session Expired</h2>
                    <p style="font-size: 16px; color: #555; margin-bottom: 30px;">Your session has expired. Please log in again to continue.</p>
                    <button id="loginButton" style="background-color: #007BFF; color: #fff; border: none; padding: 12px 20px; font-size: 16px; border-radius: 5px; cursor: pointer; transition: background-color 0.3s ease; width: 150px;">
                        Log In
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        document.getElementById('loginButton').addEventListener('click', () => {
            localStorage.removeItem('authToken');
            window.location.href = 'login.html';
        });
    }

    modal.style.display = 'block';
}


// setTimeout(() => {
//     localStorage.removeItem('authToken');
//     window.location.href = '/login';
// }, 10000); 


document.getElementById('roi-calculator-form').addEventListener('submit', function (e) {
    e.preventDefault();

    const investmentAmount = parseFloat(document.getElementById('investment-amount').value);
    const rateOfReturn = parseFloat(document.getElementById('rate-of-return').value) / 100;
    const investmentDuration = parseInt(document.getElementById('investment-duration').value, 10);

    if (isNaN(investmentAmount) || isNaN(rateOfReturn) || isNaN(investmentDuration)) {
        alert('Please fill out all fields with valid numbers.');
        return;
    }

    // Calculate ROI
    const totalReturn = investmentAmount * Math.pow(1 + rateOfReturn, investmentDuration);
    const roi = totalReturn - investmentAmount;

    // Display the result
    const resultDiv = document.getElementById('roi-result');
    document.getElementById('roi-output').innerText = `After ${investmentDuration} years, your total return will be $${totalReturn.toFixed(2)}, which is an ROI of $${roi.toFixed(2)}.`;
    resultDiv.style.display = 'block';
});


//Transaction History Functionality Integration

// Transaction History Management
let currentPage = 1;
const transactionsPerPage = 10;
let currentFilter = 'all';

// Initialize transaction history
function initTransactionHistory() {
    loadTransactions();
    setupFilterButtons();
    document.getElementById('load-more').addEventListener('click', loadMoreTransactions);
}

// Load transactions with current filter
async function loadTransactions(page = 1, filter = 'all') {
    try {
        const url = `${API_BASE_URL}/api/transactions?page=${page}&limit=${transactionsPerPage}${
            filter !== 'all' ? `&filter=${filter}` : ''
        }`;

        const response = await fetch(url, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
        });

        if (!response.ok) throw new Error('Failed to load transactions');
        
        const { transactions, total, pages } = await response.json();
        
        renderTransactions(transactions, page === 1);
        updateTransactionCount(total);
        
        // Show/hide load more button
        document.getElementById('load-more').style.display = 
            page < pages ? 'block' : 'none';

    } catch (error) {
        console.error('Error:', error);
        alert('Failed to load transactions. Please try again.');
    }
}

// Render transactions to the table
function renderTransactions(transactions, clearExisting = true) {
    const tbody = document.getElementById('transaction-list');
    if (clearExisting) tbody.innerHTML = '';

    transactions.forEach(tx => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${formatDate(tx.createdAt)}</td>
            <td class="type-${tx.type}">${tx.type === 'credit' ? 'Deposit' : 'Withdrawal'}</td>
            <td>${tx.type === 'credit' ? '+' : '-'}$${tx.amount.toFixed(2)}</td>
            <td><span class="status-${tx.status}">${tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}</span></td>
            <td>${getTransactionDetails(tx)}</td>
        `;
        tbody.appendChild(row);
    });
}

// Helper function to format transaction details
function getTransactionDetails(tx) {
    if (tx.method === 'holding') {
        return `Received ${tx.details.units} ${tx.details.assetSymbol}`;
    }
    if (tx.method === 'withdrawal') {
        return `To ${tx.details.method}: ${tx.details.accountNumber?.slice(-4) || ''}`;
    }
    return tx.details.note || 'Transaction';
}

// Format date for display
function formatDate(dateString) {
    const options = { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

// Update transaction count display
function updateTransactionCount(total) {
    const displayedCount = document.getElementById('transaction-list').children.length;
    document.getElementById('transaction-count').textContent = 
        `${displayedCount} of ${total}`;
}

// Load more transactions
function loadMoreTransactions() {
    currentPage++;
    loadTransactions(currentPage, currentFilter);
}

// Setup filter buttons
function setupFilterButtons() {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelector('.filter-btn.active').classList.remove('active');
            btn.classList.add('active');
            
            currentFilter = btn.dataset.filter;
            currentPage = 1;
            loadTransactions(currentPage, currentFilter);
        });
    });
}

// Initialize when transactions section loads
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize if transactions section exists
    if (document.getElementById('transactions')) {
        initTransactionHistory();
    }
});

//Withdrawal section functionality

document.addEventListener('DOMContentLoaded', function() {
  // Tab switching
  const withdrawalTabs = document.querySelectorAll('.withdrawal-tab');
  withdrawalTabs.forEach(tab => {
    tab.addEventListener('click', function() {
      const method = this.dataset.method;
      
      // Update active tab
      withdrawalTabs.forEach(t => t.classList.remove('active'));
      this.classList.add('active');
      
      // Show corresponding form
      document.querySelectorAll('.withdrawal-method').forEach(form => {
        form.style.display = 'none';
      });
      document.getElementById(`${method}-method`).style.display = 'block';
    });
  });
  
  // Form submission
  const cryptoForm = document.getElementById('crypto-method').querySelector('form');
  const bankForm = document.getElementById('bank-method').querySelector('form');
  
  cryptoForm.addEventListener('submit', handleWithdrawalSubmit);
  bankForm.addEventListener('submit', handleWithdrawalSubmit);
  
  function handleWithdrawalSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    const withdrawalData = {};
    const isCrypto = form.closest('.withdrawal-method').id.includes('crypto');
    
    for (const [key, value] of formData.entries()) {
      withdrawalData[key] = value;
    }
    
    // Get the correct amount field based on method
    const amountField = isCrypto ? 'crypto-amount' : 'bank-amount';
    const amountInput = document.getElementById(amountField);
    const amount = parseFloat(withdrawalData[amountField]);
    
    // Validate amount
    if (!amountInput.value || isNaN(amount)) {
      amountInput.focus();
      alert('Please enter a valid amount');
      return;
    }
    
    if (amount <= 0) {
      amountInput.focus();
      alert('Amount must be greater than zero');
      return;
    }
    
    // Set withdrawal method
    withdrawalData.method = isCrypto ? 'crypto' : 'bank';
    
    // Calculate fee (1.5% for crypto, 1% for bank)
    const fee = isCrypto ? amount * 0.015 : amount * 0.01;
    const total = amount + fee;
    
    // Create currency formatter
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    });
    
    // Update summary modal
    const summaryAmount = document.getElementById('summary-amount');
    const summaryMethod = document.getElementById('summary-method');
    const summaryInfo = document.getElementById('summary-info');
    const summaryFee = document.getElementById('summary-fee');
    const summaryTotal = document.getElementById('summary-total');
    
    if (summaryAmount) summaryAmount.textContent = formatter.format(amount);
    if (summaryMethod) summaryMethod.textContent = isCrypto 
      ? `Crypto (${withdrawalData['crypto-type']})` 
      : 'Bank Transfer';
    if (summaryInfo) summaryInfo.textContent = isCrypto
      ? withdrawalData['crypto-wallet']
      : `${withdrawalData['bank-name']} - ${withdrawalData['account-number']}`;
    if (summaryFee) summaryFee.textContent = formatter.format(fee);
    if (summaryTotal) summaryTotal.textContent = formatter.format(total);
    
    // Store withdrawal data for later use
    const summaryModal = document.getElementById('transaction-summary-modal');
    if (summaryModal) {
      summaryModal.dataset.withdrawalData = JSON.stringify({
        ...withdrawalData,
        amount: amount,
        fee: fee,
        total: total
      });
      
      // Show summary modal
      summaryModal.style.display = 'flex';
    }
  }
  
  // Modal Controls
  const modalClose = document.querySelector('.modal-close');
  if (modalClose) {
    modalClose.addEventListener('click', function() {
      const modal = document.getElementById('transaction-summary-modal');
      if (modal) modal.style.display = 'none';
    });
  }
  
  const cancelTransaction = document.getElementById('cancel-transaction');
  if (cancelTransaction) {
    cancelTransaction.addEventListener('click', function() {
      const modal = document.getElementById('transaction-summary-modal');
      if (modal) modal.style.display = 'none';
    });
  }
  
  const confirmTransaction = document.getElementById('confirm-transaction');
  if (confirmTransaction) {
    confirmTransaction.addEventListener('click', function() {
      const summaryModal = document.getElementById('transaction-summary-modal');
      const pinModal = document.getElementById('withdrawal-pin-modal');
      if (summaryModal) summaryModal.style.display = 'none';
      if (pinModal) {
        pinModal.classList.remove('hidden');
        pinModal.style.display = 'flex';
      }
    });
  }
  
  // PIN Modal Backdrop Click to Close
  const withdrawalPinModal = document.getElementById('withdrawal-pin-modal');
  if (withdrawalPinModal) {
    withdrawalPinModal.addEventListener('click', function(e) {
      // Only close if clicked on the modal backdrop (not on modal-content)
      if (e.target === withdrawalPinModal) {
        withdrawalPinModal.classList.add('hidden');
        withdrawalPinModal.style.display = 'none';
        // Reset PIN input when modal is closed
        const pinInput = document.getElementById('custom-pin');
        if (pinInput) pinInput.value = '';
      }
    });
  }
  
  // PIN Input Handling
  const pinInput = document.getElementById('custom-pin');
  
  document.querySelectorAll('.keyboard-key[data-key]').forEach(key => {
    key.addEventListener('click', function() {
      const keyValue = this.dataset.key;
      if (keyValue === 'clear') {
        // Close modal and reset PIN input
        const pinModal = document.getElementById('withdrawal-pin-modal');
        if (pinModal) {
          pinModal.classList.add('hidden');
          pinModal.style.display = 'none';
        }
        pinInput.value = '';
      } else if (keyValue === 'submit') {
        submitWithdrawal();
      } else if (keyValue !== 'question' && pinInput.value.length < 6) {
        pinInput.value += keyValue;
      }
    });
  });
  
  async function submitWithdrawal() {
        if (pinInput.value.length < 4) {
            alert('Please enter at least 4 digits');
            return;
        }
        
        const pin = pinInput.value;
        const withdrawalData = JSON.parse(
            document.getElementById('transaction-summary-modal').dataset.withdrawalData
        );
        
        // Show loading state
        const submitBtn = document.querySelector('.keyboard-key[data-key="submit"]');
        const originalBtnHTML = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        submitBtn.disabled = true;
        
        try {
            console.log('Starting withdrawal process...', { withdrawalData });
            
            // 1. First verify PIN
            console.log('Verifying PIN...');
            const pinResponse = await fetch(`${API_BASE_URL}/verify-pin`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                body: JSON.stringify({ pin })
            });
            
            const pinResponseText = await pinResponse.text();
            let pinResponseData;
            try {
                pinResponseData = JSON.parse(pinResponseText);
            } catch {
                pinResponseData = { message: pinResponseText };
            }
            
            console.log('PIN verification response:', {
                status: pinResponse.status,
                data: pinResponseData
            });

            if (!pinResponse.ok) {
                throw new Error(pinResponseData.message || 'PIN verification failed');
            }

            // 2. Submit withdrawal request
            const authToken = localStorage.getItem('authToken');
            if (!authToken) {
                throw new Error('You need to be logged in to perform this action');
            }

            const withdrawalPayload = {
                amount: withdrawalData.amount,
                method: withdrawalData.method,
                cryptoType: withdrawalData['crypto-type'],
                walletAddress: withdrawalData['crypto-wallet'],
                bankDetails: withdrawalData.method === 'bank' ? {
                    bankName: withdrawalData['bank-name'],
                    accountNumber: withdrawalData['account-number'],
                    routingNumber: withdrawalData['routing-number']
                } : null
            };

            console.log('Submitting withdrawal with payload:', withdrawalPayload);

            const withdrawalResponse = await fetch(`${API_BASE_URL}/api/withdraw`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify(withdrawalPayload)
            });

            const withdrawalResponseText = await withdrawalResponse.text();
            let withdrawalResponseData;
            try {
                withdrawalResponseData = JSON.parse(withdrawalResponseText);
            } catch {
                withdrawalResponseData = { message: withdrawalResponseText };
            }

            console.log('Withdrawal response:', {
                status: withdrawalResponse.status,
                data: withdrawalResponseData
            });

            if (!withdrawalResponse.ok) {
                // Handle specific "User not found" error
                if (withdrawalResponse.status === 404 && withdrawalResponseData.error?.includes('User not found')) {
                    localStorage.removeItem('authToken');
                    throw new Error('Session expired. Please login again.');
                }
                throw new Error(
                    withdrawalResponseData.message || 
                    withdrawalResponseData.error || 
                    `Withdrawal failed with status ${withdrawalResponse.status}`
                );
            }

            // Show success
            Swal.fire({
                icon: 'success',
                title: 'Success!',
                text: 'Withdrawal Successful the money is on its way to your Bank.',
                timer: 7000
            });
            
            // Reset forms and close modals
            const pinModalEl = document.getElementById('withdrawal-pin-modal');
            if (pinModalEl) {
              pinModalEl.classList.add('hidden');
              pinModalEl.style.display = 'none';
            }
            document.getElementById('crypto-method').querySelector('form').reset();
            document.getElementById('bank-method').querySelector('form').reset();
            
        } catch (error) {
            console.error('Full withdrawal error:', {
                error: error,
                message: error.message,
                stack: error.stack
            });
            
            let errorMessage = error.message;
            if (error.message.includes('Failed to fetch')) {
                errorMessage = 'Network error. Please check your internet connection.';
            } else if (error.message.includes('status 500')) {
                errorMessage = 'Server error. Please try again later.';
            } else if (error.message.includes('User not found') || error.message.includes('Session expired')) {
                errorMessage = 'Session expired. Please login again.';
                localStorage.removeItem('authToken');
                setTimeout(() => window.location.href = '/login', 2000);
            }

            Swal.fire({
                icon: 'error',
                title: 'Withdrawal Failed',
                text: errorMessage,
                timer: 7000
            });
        } finally {
            // Reset PIN input
            pinInput.value = '';
            submitBtn.innerHTML = originalBtnHTML;
            submitBtn.disabled = false;
        }
    }
  
});