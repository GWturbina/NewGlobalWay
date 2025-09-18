class GlobalWayApp {
    constructor() {
        this.currentLang = 'en';
        this.planets = [];
        this.boundaries = { minX: 0, maxX: 0, minY: 0, maxY: 0 };
        this.wallet = {
            connected: false,
            address: null,
            balance: 0
        };
        this.userId = null;
        this.userLevels = [];
        this.levelPrices = [
            0, 0.0015, 0.003, 0.006, 0.012, 0.024, 
            0.048, 0.096, 0.192, 0.384, 0.768, 1.536, 3.072
        ];
        
        this.init();
    }
    
    init() {
        this.calculateBoundaries();
        this.initializePlanets();
        this.setupEventListeners();
        this.startAnimation();
        this.updateLanguage();
        this.generateUserId();
        
        console.log('GlobalWay App initialized');
    }
    
    calculateBoundaries() {
        const margin = Math.min(window.innerWidth, window.innerHeight) * 0.15;
        this.boundaries = {
            minX: margin,
            maxX: window.innerWidth - margin - 120,
            minY: margin,
            maxY: window.innerHeight - margin - 200
        };
    }
    
    initializePlanets() {
        const planetElements = document.querySelectorAll('.planet');
        
        planetElements.forEach((planet, index) => {
            const x = Math.random() * (this.boundaries.maxX - this.boundaries.minX) + this.boundaries.minX;
            const y = Math.random() * (this.boundaries.maxY - this.boundaries.minY) + this.boundaries.minY;
            
            const planetData = {
                element: planet,
                x: x,
                y: y,
                speedX: (Math.random() - 0.5) * 0.8,
                speedY: (Math.random() - 0.5) * 0.8,
                rotation: 0,
                rotationSpeed: (Math.random() - 0.5) * 1
            };
            
            planet.style.left = x + 'px';
            planet.style.top = y + 'px';
            
            this.planets.push(planetData);
        });
    }
    
    startAnimation() {
        const animate = () => {
            this.planets.forEach(planet => {
                planet.x += planet.speedX;
                planet.y += planet.speedY;
                planet.rotation += planet.rotationSpeed;
                
                if (planet.x <= this.boundaries.minX || planet.x >= this.boundaries.maxX) {
                    planet.speedX *= -1;
                    planet.x = Math.max(this.boundaries.minX, Math.min(this.boundaries.maxX, planet.x));
                }
                
                if (planet.y <= this.boundaries.minY || planet.y >= this.boundaries.maxY) {
                    planet.speedY *= -1;
                    planet.y = Math.max(this.boundaries.minY, Math.min(this.boundaries.maxY, planet.y));
                }
                
                planet.element.style.left = planet.x + 'px';
                planet.element.style.top = planet.y + 'px';
                planet.element.style.transform = `rotate(${planet.rotation}deg)`;
            });
            
            requestAnimationFrame(animate);
        };
        
        animate();
    }
    
    setupEventListeners() {
        // Language switcher
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchLanguage(e.target.dataset.lang);
            });
        });
        
        // Planet clicks
        document.querySelectorAll('.planet').forEach(planet => {
            planet.addEventListener('click', (e) => {
                e.stopPropagation();
                this.showPlanetModal(planet.dataset.planet);
            });
        });
        
        // Modal close
        document.querySelector('.modal-close').addEventListener('click', () => {
            this.closeModal();
        });
        
        document.getElementById('modal').addEventListener('click', (e) => {
            if (e.target.id === 'modal') {
                this.closeModal();
            }
        });
        
        // GWT Coin click to enter DApp
        document.querySelector('.gwt-coin').addEventListener('click', () => {
            this.enterDapp();
        });
        
        // Dashboard navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                this.switchDashboardPage(e.target.dataset.page);
            });
        });
        
        // Connect wallet
        document.getElementById('connect-wallet-btn').addEventListener('click', () => {
            this.connectWallet();
        });
        
        // Window resize
        window.addEventListener('resize', () => {
            this.calculateBoundaries();
        });
    }
    
    switchLanguage(lang) {
        this.currentLang = lang;
        
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.lang === lang);
        });
        
        this.updateLanguage();
    }
    
    updateLanguage() {
        const t = translations[this.currentLang];
        
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.dataset.i18n;
            const keys = key.split('.');
            let value = t;
            
            keys.forEach(k => {
                value = value && value[k];
            });
            
            if (value) {
                element.textContent = value;
            }
        });
    }
    
    showPlanetModal(planetType) {
        const t = translations[this.currentLang];
        const planetData = t[planetType];
        
        if (planetData) {
            document.getElementById('modal-title').textContent = planetData.title;
            document.getElementById('modal-text').textContent = planetData.text;
            document.getElementById('modal').style.display = 'block';
        }
    }
    
    closeModal() {
        document.getElementById('modal').style.display = 'none';
    }
    
    enterDapp() {
        document.getElementById('landing-container').style.display = 'none';
        document.getElementById('dashboard').style.display = 'block';
        
        this.updateDashboard();
    }
    
    switchDashboardPage(page) {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.toggle('active', item.dataset.page === page);
        });
        
        document.querySelectorAll('.page').forEach(p => {
            p.classList.toggle('active', p.id === `page-${page}`);
        });
    }
    
    async connectWallet() {
        try {
            if (typeof window.ethereum !== 'undefined') {
                const accounts = await window.ethereum.request({
                    method: 'eth_requestAccounts'
                });
                
                if (accounts.length > 0) {
                    this.wallet.connected = true;
                    this.wallet.address = accounts[0];
                    
                    const balance = await window.ethereum.request({
                        method: 'eth_getBalance',
                        params: [accounts[0], 'latest']
                    });
                    
                    this.wallet.balance = parseInt(balance, 16) / 1e18;
                    
                    this.updateDashboard();
                    
                    document.getElementById('connect-wallet-btn').textContent = 'Connected';
                    document.getElementById('connect-wallet-btn').disabled = true;
                }
            } else {
                alert('Please install SafePal or MetaMask wallet');
            }
        } catch (error) {
            console.error('Wallet connection failed:', error);
            alert('Failed to connect wallet');
        }
    }
    
    generateUserId() {
        const savedId = localStorage.getItem('globalway-user-id');
        if (savedId) {
            this.userId = savedId;
        } else {
            this.userId = (1000000 + Math.floor(Math.random() * 9000000)).toString();
            localStorage.setItem('globalway-user-id', this.userId);
        }
    }
    
    updateDashboard() {
        document.getElementById('user-id').textContent = this.userId || 'Generating...';
        
        if (this.wallet.connected) {
            document.getElementById('wallet-address-display').textContent = 
                `${this.wallet.address.substring(0, 6)}...${this.wallet.address.substring(38)}`;
            document.getElementById('wallet-balance-display').textContent = 
                `${this.wallet.balance.toFixed(4)} BNB`;
        }
        
        const referralLink = `${window.location.origin}?ref=${this.userId}`;
        document.getElementById('referral-link').value = referralLink;
    }
}

// Partner system functions
function buyLevel(level) {
    const app = window.globalWayApp;
    
    if (!app.wallet.connected) {
        alert('Please connect your wallet first');
        return;
    }
    
    const price = app.levelPrices[level];
    
    if (confirm(`Buy Level ${level} for ${price} BNB?`)) {
        console.log(`Buying level ${level} for ${price} BNB`);
        alert(`Level ${level} purchase initiated`);
        
        // Update user levels
        if (!app.userLevels.includes(level)) {
            app.userLevels.push(level);
            app.updateLevelButtons();
        }
    }
}

// Update level buttons to show owned levels
function updateLevelButtons() {
    const app = window.globalWayApp;
    const levelButtons = document.querySelectorAll('.level-btn');
    
    levelButtons.forEach((btn, index) => {
        const level = index + 1;
        if (app.userLevels.includes(level)) {
            btn.classList.add('owned');
            btn.textContent = btn.textContent.replace('Level', 'Owned Level');
            btn.disabled = true;
        }
    });
}

// Matrix functions
function showMatrix(level) {
    console.log(`Showing matrix level ${level}`);
    document.querySelector('.matrix-grid').innerHTML = `
        <div class="matrix-position you">YOU - Level ${level}</div>
        <div class="matrix-position empty">Empty Slot</div>
        <div class="matrix-position empty">Empty Slot</div>
    `;
}

// Token functions
function buyTokens() {
    const amount = document.getElementById('buy-amount').value;
    if (!amount || amount <= 0) {
        alert('Please enter valid amount');
        return;
    }
    
    if (!window.globalWayApp.wallet.connected) {
        alert('Please connect your wallet first');
        return;
    }
    
    if (confirm(`Buy ${amount * 1000} GWT tokens for ${amount} BNB?`)) {
        console.log(`Buying ${amount * 1000} GWT for ${amount} BNB`);
        alert('Token purchase initiated');
    }
}

function sellTokens() {
    const amount = document.getElementById('sell-amount').value;
    if (!amount || amount <= 0) {
        alert('Please enter valid amount');
        return;
    }
    
    if (!window.globalWayApp.wallet.connected) {
        alert('Please connect your wallet first');
        return;
    }
    
    if (confirm(`Sell ${amount} GWT tokens for ${amount / 1000} BNB?`)) {
        console.log(`Selling ${amount} GWT for ${amount / 1000} BNB`);
        alert('Token sale initiated');
    }
}

// Project access functions
function accessProject(projectId) {
    const projects = {
        cardgift: 'CardGift - Gift Card Marketplace',
        globaltub: 'GlobalTub - Video Platform',
        globalmarket: 'GlobalMarket - Decentralized Marketplace',
        globalgame: 'GlobalGame - Gaming Platform',
        globaledu: 'GlobalEdu - Educational Platform',
        globalbank: 'GlobalBank - DeFi Banking'
    };
    
    if (!window.globalWayApp.wallet.connected) {
        alert('Please connect your wallet first');
        return;
    }
    
    alert(`Accessing ${projects[projectId]}... (Coming Soon)`);
}

// Utility functions
function copyReferral() {
    const referralInput = document.getElementById('referral-link');
    referralInput.select();
    document.execCommand('copy');
    alert('Referral link copied to clipboard!');
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.globalWayApp = new GlobalWayApp();
});

// Handle referral links
const urlParams = new URLSearchParams(window.location.search);
const referralId = urlParams.get('ref');
if (referralId) {
    localStorage.setItem('referral-sponsor', referralId);
    console.log('Referral detected:', referralId);
    window.history.replaceState({}, '', window.location.pathname);
}

// PWA Service Worker registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}
