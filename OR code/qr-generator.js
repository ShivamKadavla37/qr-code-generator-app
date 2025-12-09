// QR Code Generator Module
class QRGenerator {
    constructor() {
        this.qrCode = null;
        this.logoImage = null;
        this.currentOptions = this.getDefaultOptions();
        this.initialized = false;
    }

    getDefaultOptions() {
        return {
            width: 400,
            height: 400,
            type: "svg",
            margin: 4,
            qrOptions: {
                typeNumber: 0,
                mode: 'Byte',
                errorCorrectionLevel: 'H'
            },
            imageOptions: {
                hideBackgroundDots: true,
                imageSize: 0.4,
                margin: 8,
                crossOrigin: "anonymous",
                saveAsBlob: true
            },
            dotsOptions: {
                color: "#000000",
                type: "square"
            },
            backgroundOptions: {
                color: "#ffffff",
                gradient: null
            },
            cornersSquareOptions: {
                color: "#000000",
                type: "square"
            },
            cornersDotOptions: {
                color: "#000000",
                type: "square"
            }
        };
    }

    async initialize(container) {
        if (this.initialized) return;

        this.container = container;
        this.initialized = true;
        
        // Create initial QR code
        this.createQRCode();
    }

    createQRCode() {
        try {
            if (this.qrCode) {
                this.qrCode = null;
            }

            this.qrCode = new QRCodeStyling(this.currentOptions);
            
            // Clear container and append QR code
            this.container.innerHTML = '';
            this.qrCode.append(this.container);
            
        } catch (error) {
            console.error('Error creating QR code:', error);
            this.showError('Failed to create QR code');
        }
    }

    updateData(data, type = 'text') {
        if (!data) {
            this.showPlaceholder();
            return;
        }

        const processedData = this.processDataByType(data, type);
        
        if (!processedData) {
            this.showError('Invalid data format');
            return;
        }

        // Update QR code data
        this.currentOptions = {
            ...this.currentOptions,
            data: processedData
        };

        this.createQRCode();
        this.updatePreviewInfo(type, processedData);
    }

    processDataByType(data, type) {
        switch (type) {
            case 'text':
                return data.text || '';
            
            case 'url':
                const url = data.url || '';
                if (!url) return '';
                return url.startsWith('http') ? url : `https://${url}`;
            
            case 'email':
                return Utils.generateEmail(data);
            
            case 'phone':
                return Utils.generatePhone(data.phone || '');
            
            case 'wifi':
                return Utils.generateWiFi(data);
            
            case 'vcard':
                return Utils.generateVCard(data);
            
            default:
                return data;
        }
    }

    updateSize(width, height = null) {
        height = height || width;
        
        this.currentOptions.width = width;
        this.currentOptions.height = height;
        
        if (this.qrCode && this.currentOptions.data) {
            this.qrCode.update({ 
                width: width, 
                height: height 
            });
        }
    }

    updateMargin(margin) {
        this.currentOptions.margin = margin;
        
        if (this.qrCode && this.currentOptions.data) {
            this.qrCode.update({ margin });
        }
    }

    updateColors(foreground, background, transparent = false) {
        this.currentOptions.dotsOptions.color = foreground;
        this.currentOptions.cornersSquareOptions.color = foreground;
        this.currentOptions.cornersDotOptions.color = foreground;
        
        if (transparent) {
            this.currentOptions.backgroundOptions.color = "transparent";
        } else {
            this.currentOptions.backgroundOptions.color = background;
        }
        
        if (this.qrCode && this.currentOptions.data) {
            this.qrCode.update({
                dotsOptions: this.currentOptions.dotsOptions,
                cornersSquareOptions: this.currentOptions.cornersSquareOptions,
                cornersDotOptions: this.currentOptions.cornersDotOptions,
                backgroundOptions: this.currentOptions.backgroundOptions
            });
        }
    }

    updateShape(shapeType) {
        let dotsType, cornersType;
        
        switch (shapeType) {
            case 'square':
                dotsType = 'square';
                cornersType = 'square';
                break;
            case 'rounded':
                dotsType = 'rounded';
                cornersType = 'extra-rounded';
                break;
            case 'circle':
                dotsType = 'classy-rounded';
                cornersType = 'extra-rounded';
                break;
            case 'dots':
                dotsType = 'dots';
                cornersType = 'dot';
                break;
            default:
                dotsType = 'square';
                cornersType = 'square';
        }
        
        this.currentOptions.dotsOptions.type = dotsType;
        this.currentOptions.cornersSquareOptions.type = cornersType;
        this.currentOptions.cornersDotOptions.type = cornersType;
        
        if (this.qrCode && this.currentOptions.data) {
            this.qrCode.update({
                dotsOptions: this.currentOptions.dotsOptions,
                cornersSquareOptions: this.currentOptions.cornersSquareOptions,
                cornersDotOptions: this.currentOptions.cornersDotOptions
            });
        }
    }

    updateEyeStyle(eyeType) {
        const cornerType = eyeType === 'rounded' ? 'extra-rounded' : 'square';
        const dotType = eyeType === 'rounded' ? 'dot' : 'square';
        
        this.currentOptions.cornersSquareOptions.type = cornerType;
        this.currentOptions.cornersDotOptions.type = dotType;
        
        if (this.qrCode && this.currentOptions.data) {
            this.qrCode.update({
                cornersSquareOptions: this.currentOptions.cornersSquareOptions,
                cornersDotOptions: this.currentOptions.cornersDotOptions
            });
        }
    }

    updateErrorCorrection(level) {
        this.currentOptions.qrOptions.errorCorrectionLevel = level;
        
        if (this.qrCode && this.currentOptions.data) {
            this.createQRCode(); // Need to recreate for error correction change
        }
    }

    async setLogo(imageFile) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    this.logoImage = e.target.result;
                    this.currentOptions.image = e.target.result;
                    
                    if (this.qrCode && this.currentOptions.data) {
                        this.qrCode.update({
                            image: this.logoImage,
                            imageOptions: this.currentOptions.imageOptions
                        });
                    }
                    
                    resolve(this.logoImage);
                };
                img.onerror = reject;
                img.src = e.target.result;
            };
            reader.onerror = reject;
            reader.readAsDataURL(imageFile);
        });
    }

    removeLogo() {
        this.logoImage = null;
        this.currentOptions.image = null;
        
        if (this.qrCode && this.currentOptions.data) {
            this.qrCode.update({
                image: null
            });
        }
    }

    async downloadQR(format = 'png') {
        if (!this.qrCode || !this.currentOptions.data) {
            Utils.showNotification('No QR code to download', 'warning');
            return;
        }

        try {
            const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
            const filename = `qrcode-${timestamp}`;

            switch (format.toLowerCase()) {
                case 'png':
                    await this.qrCode.download({
                        name: filename,
                        extension: 'png'
                    });
                    break;
                
                case 'jpg':
                case 'jpeg':
                    await this.qrCode.download({
                        name: filename,
                        extension: 'jpeg'
                    });
                    break;
                
                case 'svg':
                    await this.qrCode.download({
                        name: filename,
                        extension: 'svg'
                    });
                    break;
                
                case 'pdf':
                    await this.downloadAsPDF(filename);
                    break;
                
                default:
                    throw new Error(`Unsupported format: ${format}`);
            }

            Utils.showNotification(`QR code downloaded as ${format.toUpperCase()}`, 'success');
            
        } catch (error) {
            console.error('Download error:', error);
            Utils.showNotification('Failed to download QR code', 'error');
        }
    }

    async downloadAsPDF(filename) {
        try {
            // Get QR code as canvas
            const canvas = this.container.querySelector('canvas');
            if (!canvas) {
                throw new Error('No canvas found');
            }

            // Create PDF
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF();
            
            // Calculate dimensions to center the QR code
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const qrSize = Math.min(pdfWidth - 40, pdfHeight - 40, 150);
            const x = (pdfWidth - qrSize) / 2;
            const y = (pdfHeight - qrSize) / 2;

            // Add QR code to PDF
            const imgData = canvas.toDataURL('image/png');
            pdf.addImage(imgData, 'PNG', x, y, qrSize, qrSize);
            
            // Save PDF
            pdf.save(`${filename}.pdf`);
            
        } catch (error) {
            throw new Error(`PDF generation failed: ${error.message}`);
        }
    }

    showPlaceholder() {
        this.container.innerHTML = `
            <div class="placeholder">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
                    <rect x="3" y="3" width="7" height="7"/>
                    <rect x="14" y="3" width="7" height="7"/>
                    <rect x="14" y="14" width="7" height="7"/>
                    <path d="m5 5 2 0 0 2"/>
                    <path d="m5 17 0 2 2 0"/>
                    <path d="m19 5 0 2-2 0"/>
                    <path d="m19 19-2 0 0-2"/>
                </svg>
                <p>Enter content to generate QR code</p>
            </div>
        `;
    }

    showError(message) {
        this.container.innerHTML = `
            <div class="placeholder error">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="15" y1="9" x2="9" y2="15"/>
                    <line x1="9" y1="9" x2="15" y2="15"/>
                </svg>
                <p>${message}</p>
            </div>
        `;
    }

    updatePreviewInfo(type, data) {
        // Update type info
        const typeInfo = document.getElementById('qrTypeInfo');
        if (typeInfo) {
            const typeNames = {
                text: 'Text',
                url: 'Website URL',
                email: 'Email',
                phone: 'Phone Number',
                wifi: 'Wi-Fi Network',
                vcard: 'Contact Card'
            };
            typeInfo.textContent = typeNames[type] || 'Text';
        }

        // Update size info
        const sizeInfo = document.getElementById('qrSizeInfo');
        if (sizeInfo) {
            sizeInfo.textContent = `${this.currentOptions.width}px`;
        }

        // Update error correction info
        const errorInfo = document.getElementById('qrErrorInfo');
        if (errorInfo) {
            const errorLevels = {
                L: 'Low (7%)',
                M: 'Medium (15%)',
                Q: 'Quartile (25%)',
                H: 'High (30%)'
            };
            errorInfo.textContent = errorLevels[this.currentOptions.qrOptions.errorCorrectionLevel] || 'High (30%)';
        }
    }

    // Get current QR code data for external use
    getCurrentData() {
        return {
            data: this.currentOptions.data,
            options: { ...this.currentOptions },
            hasLogo: !!this.logoImage
        };
    }

    // Reset to default state
    reset() {
        this.currentOptions = this.getDefaultOptions();
        this.logoImage = null;
        this.showPlaceholder();
    }
}

// Export for use in other modules
window.QRGenerator = QRGenerator;