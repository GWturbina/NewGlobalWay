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
            maxY: window.innerHeight - margin - 200 // Space for button
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
                
                // Boundary bouncing
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
        
        // Enter DApp
        document.getElementById('enter-dapp-btn').addEventListener('click', () => {
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
        
        // Update active button
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
        // Update nav
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.toggle('active', item.dataset.page === page);
        });
        
        // Update pages
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
                    
                    // Get balance
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
        // Update user ID
        document.getElementById('user-id').textContent = this.userId || 'Generating...';
        
        // Update wallet info
        if (this.wallet.connected) {
            document.getElementById('wallet-address').textContent = 
                `${this.wallet.address.substring(0, 6)}...${this.wallet.address.substring(38)}`;
            document.getElementById('balance').textContent = 
                `${this.wallet.balance.toFixed(4)} BNB`;
        }
        
        // Update referral link
        const referralLink = `${window.location.origin}?ref=${this.userId}`;
        document.getElementById('referral-link').value = referralLink;
    }
    
    // Smart contract integration placeholders
    async initializeContracts() {
        // Contract addresses
        this.contracts = {
            globalWay: '0x64De05a0c818a925711EA0874FD972Bdc2edb2aA',
            globalWayStats: '0xEa4F7F9e1c21Ad766B64D07dC9CB137C1b06Dfa4',
            gwtToken: '0x5Bf1b9edD3914f546AC02cf35CC285E640Cb68Fc'
        };
        
        // Initialize Web3 contracts when wallet is connected
        if (this.wallet.connected && typeof window.ethereum !== 'undefined') {
            // Contract ABI and initialization would go here
            console.log('Contracts ready for integration');
        }
    }
    
    // Partner system methods
    async checkUserRegistration() {
        // Check if user is registered in the contract
        return false; // Placeholder
    }
    
    async registerUser(sponsorAddress) {
        // Register user in the smart contract
        console.log('Registering user with sponsor:', sponsorAddress);
    }
    
    async buyLevel(level) {
        // Buy level in the smart contract
        console.log('Buying level:', level);
    }
    
    // Token system methods
    async getTokenBalance() {
        // Get GWT token balance
        return 0; // Placeholder
    }
    
    async buyTokens(amount) {
        // Buy GWT tokens
        console.log('Buying tokens:', amount);
    }
    
    async sellTokens(amount) {
        // Sell GWT tokens
        console.log('Selling tokens:', amount);
    }
    
    // Matrix system methods
    async getMatrixData(level) {
        // Get matrix data for specific level
        return {}; // Placeholder
    }
    
    // Projects access methods
    async checkProjectAccess(projectId) {
        // Check if user has access to specific project
        return false; // Placeholder
    }
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
    // Clean URL
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

// Network detection
window.addEventListener('online', () => {
    console.log('Connection restored');
});

window.addEventListener('offline', () => {
    console.log('Connection lost - working offline');
});
