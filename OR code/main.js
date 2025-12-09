// Main Application Controller
class QRApp {
    constructor() {
        this.qrGenerator = new QRGenerator();
        this.currentInputType = 'text';
        this.debouncedUpdate = Utils.debounce(this.updateQRCode.bind(this), 300);
        
        this.init();
    }

    async init() {
        // Initialize theme
        Utils.initializeTheme();
        
        // Initialize QR generator
        const container = document.getElementById('qrCodeContainer');
        await this.qrGenerator.initialize(container);
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Initialize UI state
        this.initializeUI();
        
        console.log('QR Generator App initialized successfully');
    }

    setupEventListeners() {
        // Dark mode toggle
        const darkModeToggle = document.getElementById('darkModeToggle');
        darkModeToggle.addEventListener('click', () => {
            Utils.toggleDarkMode();
        });

        // Input type tabs
        const tabButtons = document.querySelectorAll('.tab-btn');
        tabButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchInputType(e.target.dataset.type);
            });
        });

        // Content input events
        this.setupContentInputs();
        
        // Logo upload
        this.setupLogoUpload();
        
        // Design controls
        this.setupDesignControls();
        
        // Download functionality
        this.setupDownload();
        
        // Real-time updates for range inputs
        this.setupRangeInputs();
    }

    setupContentInputs() {
        // Text input
        const textInput = document.getElementById('textInput');
        textInput.addEventListener('input', this.debouncedUpdate);

        // URL input
        const urlInput = document.getElementById('urlInput');
        urlInput.addEventListener('input', this.debouncedUpdate);

        // Email inputs
        const emailInput = document.getElementById('emailInput');
        const emailSubject = document.getElementById('emailSubject');
        const emailBody = document.getElementById('emailBody');
        
        [emailInput, emailSubject, emailBody].forEach(input => {
            input.addEventListener('input', this.debouncedUpdate);
        });

        // Phone input
        const phoneInput = document.getElementById('phoneInput');
        phoneInput.addEventListener('input', this.debouncedUpdate);

        // WiFi inputs
        const wifiSSID = document.getElementById('wifiSSID');
        const wifiPassword = document.getElementById('wifiPassword');
        const wifiSecurity = document.getElementById('wifiSecurity');
        
        [wifiSSID, wifiPassword, wifiSecurity].forEach(input => {
            input.addEventListener('input', this.debouncedUpdate);
            input.addEventListener('change', this.debouncedUpdate);
        });

        // vCard inputs
        const vcardInputs = [
            'vcardFirstName', 'vcardLastName', 'vcardOrg', 
            'vcardPhone', 'vcardEmail', 'vcardUrl'
        ];
        
        vcardInputs.forEach(id => {
            const input = document.getElementById(id);
            if (input) {
                input.addEventListener('input', this.debouncedUpdate);
            }
        });
    }

    setupLogoUpload() {
        const logoUpload = document.getElementById('logoUpload');
        const logoUploadBtn = document.getElementById('logoUploadBtn');
        const logoPreview = document.getElementById('logoPreview');
        const logoImg = document.getElementById('logoImg');
        const removeLogo = document.getElementById('removeLogo');

        logoUploadBtn.addEventListener('click', () => {
            logoUpload.click();
        });

        logoUpload.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            // Validate file type
            if (!file.type.startsWith('image/')) {
                Utils.showNotification('Please select a valid image file', 'warning');
                return;
            }

            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                Utils.showNotification('Image size should be less than 5MB', 'warning');
                return;
            }

            try {
                // Resize if needed
                const resizedFile = await Utils.resizeImage(file, 200, 200);
                const logoUrl = await this.qrGenerator.setLogo(resizedFile);
                
                // Show preview
                logoImg.src = logoUrl;
                logoPreview.classList.remove('hidden');
                
                Utils.showNotification('Logo added successfully', 'success');
                
            } catch (error) {
                console.error('Logo upload error:', error);
                Utils.showNotification('Failed to upload logo', 'error');
            }
        });

        removeLogo.addEventListener('click', () => {
            this.qrGenerator.removeLogo();
            logoPreview.classList.add('hidden');
            logoUpload.value = '';
            Utils.showNotification('Logo removed', 'info');
        });
    }

    setupDesignControls() {
        // Shape buttons
        const shapeButtons = document.querySelectorAll('.shape-btn');
        shapeButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                // Update active state
                shapeButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // Update QR code
                this.qrGenerator.updateShape(btn.dataset.shape);
            });
        });

        // Eye style buttons
        const eyeButtons = document.querySelectorAll('.eye-btn');
        eyeButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                // Update active state
                eyeButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // Update QR code
                this.qrGenerator.updateEyeStyle(btn.dataset.eye);
            });
        });

        // Color inputs
        const foregroundColor = document.getElementById('foregroundColor');
        const foregroundColorText = document.getElementById('foregroundColorText');
        const backgroundColor = document.getElementById('backgroundColor');
        const backgroundColorText = document.getElementById('backgroundColorText');
        const backgroundTransparent = document.getElementById('backgroundTransparent');

        // Sync color picker with text input
        foregroundColor.addEventListener('input', (e) => {
            foregroundColorText.value = e.target.value;
            this.updateColors();
        });

        foregroundColorText.addEventListener('input', (e) => {
            if (this.isValidHexColor(e.target.value)) {
                foregroundColor.value = e.target.value;
                this.updateColors();
            }
        });

        backgroundColor.addEventListener('input', (e) => {
            backgroundColorText.value = e.target.value;
            this.updateColors();
        });

        backgroundColorText.addEventListener('input', (e) => {
            if (this.isValidHexColor(e.target.value)) {
                backgroundColor.value = e.target.value;
                this.updateColors();
            }
        });

        backgroundTransparent.addEventListener('change', () => {
            this.updateColors();
        });

        // Error correction
        const errorCorrection = document.getElementById('errorCorrection');
        errorCorrection.addEventListener('change', (e) => {
            this.qrGenerator.updateErrorCorrection(e.target.value);
        });
    }

    setupRangeInputs() {
        // Size input
        const qrSize = document.getElementById('qrSize');
        const qrSizeValue = document.getElementById('qrSizeValue');
        
        qrSize.addEventListener('input', (e) => {
            const size = parseInt(e.target.value);
            qrSizeValue.textContent = size;
            this.qrGenerator.updateSize(size);
        });

        // Margin input
        const qrMargin = document.getElementById('qrMargin');
        const qrMarginValue = document.getElementById('qrMarginValue');
        
        qrMargin.addEventListener('input', (e) => {
            const margin = parseInt(e.target.value);
            qrMarginValue.textContent = margin;
            this.qrGenerator.updateMargin(margin);
        });
    }

    setupDownload() {
        const downloadBtn = document.getElementById('downloadBtn');
        const downloadFormat = document.getElementById('downloadFormat');
        
        downloadBtn.addEventListener('click', async () => {
            const format = downloadFormat.value;
            
            // Add loading state
            downloadBtn.disabled = true;
            downloadBtn.innerHTML = `
                <svg class="loading" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 12a9 9 0 11-6.219-8.56"/>
                </svg>
                Downloading...
            `;
            
            try {
                await this.qrGenerator.downloadQR(format);
            } catch (error) {
                console.error('Download failed:', error);
            } finally {
                // Reset button state
                downloadBtn.disabled = false;
                downloadBtn.innerHTML = `
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="7,10 12,15 17,10"/>
                        <line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                    Download
                `;
            }
        });
    }

    switchInputType(type) {
        if (type === this.currentInputType) return;

        // Update tab buttons
        const tabButtons = document.querySelectorAll('.tab-btn');
        tabButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.type === type);
        });

        // Update form visibility
        const forms = document.querySelectorAll('.input-form');
        forms.forEach(form => {
            form.classList.toggle('active', form.id === `${type}-form`);
        });

        this.currentInputType = type;
        
        // Update QR code with new type
        this.updateQRCode();
        
        // Add animation
        const activeForm = document.querySelector('.input-form.active');
        if (activeForm) {
            Utils.animateElement(activeForm, 'fadeIn');
        }
    }

    updateQRCode() {
        const data = this.collectCurrentData();
        this.qrGenerator.updateData(data, this.currentInputType);
    }

    collectCurrentData() {
        switch (this.currentInputType) {
            case 'text':
                return {
                    text: document.getElementById('textInput').value
                };
            
            case 'url':
                return {
                    url: document.getElementById('urlInput').value
                };
            
            case 'email':
                return {
                    email: document.getElementById('emailInput').value,
                    subject: document.getElementById('emailSubject').value,
                    body: document.getElementById('emailBody').value
                };
            
            case 'phone':
                return {
                    phone: document.getElementById('phoneInput').value
                };
            
            case 'wifi':
                return {
                    ssid: document.getElementById('wifiSSID').value,
                    password: document.getElementById('wifiPassword').value,
                    security: document.getElementById('wifiSecurity').value
                };
            
            case 'vcard':
                return {
                    firstName: document.getElementById('vcardFirstName').value,
                    lastName: document.getElementById('vcardLastName').value,
                    org: document.getElementById('vcardOrg').value,
                    phone: document.getElementById('vcardPhone').value,
                    email: document.getElementById('vcardEmail').value,
                    url: document.getElementById('vcardUrl').value
                };
            
            default:
                return { text: '' };
        }
    }

    updateColors() {
        const foreground = document.getElementById('foregroundColor').value;
        const background = document.getElementById('backgroundColor').value;
        const transparent = document.getElementById('backgroundTransparent').checked;
        
        this.qrGenerator.updateColors(foreground, background, transparent);
    }

    isValidHexColor(color) {
        return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
    }

    initializeUI() {
        // Set initial values for range inputs
        const qrSize = document.getElementById('qrSize');
        const qrSizeValue = document.getElementById('qrSizeValue');
        qrSizeValue.textContent = qrSize.value;

        const qrMargin = document.getElementById('qrMargin');
        const qrMarginValue = document.getElementById('qrMarginValue');
        qrMarginValue.textContent = qrMargin.value;

        // Initialize with sample content for demonstration
        setTimeout(() => {
            const textInput = document.getElementById('textInput');
            textInput.value = 'Welcome to QR Generator Pro!';
            this.updateQRCode();
        }, 500);
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new QRApp();
});

// Handle page visibility changes to optimize performance
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Page is hidden, pause any unnecessary operations
        console.log('App paused');
    } else {
        // Page is visible, resume operations
        console.log('App resumed');
    }
});

// Handle errors globally
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
    Utils.showNotification('An unexpected error occurred', 'error');
});

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    Utils.showNotification('An unexpected error occurred', 'error');
    event.preventDefault();
});