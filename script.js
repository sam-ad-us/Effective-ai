// ArtVision AI - Main JavaScript File

class ArtVisionAI {
    constructor() {
        this.credits = 10;
        this.generatedImages = [];
        this.isGenerating = false;
        
        this.init();
    }

    init() {
        this.loadCredits();
        this.setupEventListeners();
        this.applyTheme();
        this.updateUI();
    }

    // Load credits from localStorage
    loadCredits() {
        const savedCredits = localStorage.getItem('artvision_credits');
        if (savedCredits !== null) {
            this.credits = parseInt(savedCredits);
        }
    }

    // Save credits to localStorage
    saveCredits() {
        localStorage.setItem('artvision_credits', this.credits.toString());
    }

    // Setup all event listeners
    setupEventListeners() {
        // Generate buttons
        document.getElementById('generateBtn').addEventListener('click', () => this.generateImage());
        document.getElementById('mainGenerateBtn').addEventListener('click', () => this.generateImage());

        // Contact modal
        document.getElementById('contactBtn').addEventListener('click', () => this.openContactModal());
        document.getElementById('closeModal').addEventListener('click', () => this.closeContactModal());
        document.getElementById('closeModalBtn').addEventListener('click', () => this.closeContactModal());

        // Image modal
        document.getElementById('closeImageModal').addEventListener('click', () => this.closeImageModal());

        // Theme toggle
        document.getElementById('themeToggle').addEventListener('click', () => this.toggleTheme());

        // Close modals when clicking outside
        document.getElementById('contactModal').addEventListener('click', (e) => {
            if (e.target.id === 'contactModal') {
                this.closeContactModal();
            }
        });

        document.getElementById('imageModal').addEventListener('click', (e) => {
            if (e.target.id === 'imageModal') {
                this.closeImageModal();
            }
        });

        // Enter key to generate
        document.getElementById('promptInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.generateImage();
            }
        });

        // Reset credits (for testing - remove in production)
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'R') {
                this.resetCredits();
            }
        });
    }

    // Generate image function
    async generateImage() {
        const promptInput = document.getElementById('promptInput');
        const prompt = promptInput.value.trim();
        const style = document.getElementById('styleSelect').value;
        const size = document.getElementById('sizeSelect').value;

        // Validation
        if (!prompt) {
            this.showError('Please enter a prompt to generate an image.');
            promptInput.focus();
            return;
        }

        if (this.credits <= 0) {
            this.showError('You are out of credits. Contact us to buy more credits.');
            return;
        }

        if (this.isGenerating) {
            return;
        }

        // Start generation
        this.isGenerating = true;
        this.updateGenerateButton(true);

        // Deduct credit
        this.credits--;
        this.saveCredits();
        this.updateUI();

        try {
            // Simulate API call delay
            await this.simulateGeneration();

            // Generate image URL based on style
            const imageUrl = this.generateImageUrl(prompt, style, size);
            
            // Create image object
            const imageData = {
                id: Date.now(),
                url: imageUrl,
                prompt: prompt,
                style: style,
                size: size,
                timestamp: new Date().toISOString()
            };

            // Add to gallery
            this.addImageToGallery(imageData);
            this.generatedImages.push(imageData);

            // Save to localStorage
            this.saveGeneratedImages();

            // Show success message
            this.showSuccess('Image generated successfully!');

            // Clear input
            promptInput.value = '';

        } catch (error) {
            console.error('Generation error:', error);
            this.showError('Failed to generate image. Please try again.');
            
            // Refund credit on error
            this.credits++;
            this.saveCredits();
            this.updateUI();
        } finally {
            this.isGenerating = false;
            this.updateGenerateButton(false);
        }
    }

    // Simulate generation delay
    simulateGeneration() {
        return new Promise(resolve => {
            setTimeout(resolve, 2000 + Math.random() * 2000); // 2-4 seconds
        });
    }

    // Generate image URL based on style
    generateImageUrl(prompt, style, size) {
        const [width, height] = size.split('x').map(Number);
        
        // Use different image services based on style
        const styleParams = {
            art: 'nature,landscape',
            anime: 'anime,character',
            realistic: 'portrait,realistic',
            fantasy: 'fantasy,mythical',
            abstract: 'abstract,art'
        };

        const category = styleParams[style] || 'art';
        
        // Use Picsum for variety, with seed based on prompt
        const seed = this.hashCode(prompt + style);
        return `https://picsum.photos/seed/${seed}/${width}/${height}`;
    }

    // Simple hash function for consistent seeds
    hashCode(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash);
    }

    // Add image to gallery
    addImageToGallery(imageData) {
        const gallery = document.getElementById('imageGallery');
        const emptyState = document.getElementById('emptyState');

        // Hide empty state
        if (emptyState) {
            emptyState.style.display = 'none';
        }

        // Create image element
        const imageElement = document.createElement('div');
        imageElement.className = 'gallery-item bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden fade-in-up';
        imageElement.innerHTML = `
            <div class="relative group">
                <img src="${imageData.url}" 
                     alt="${imageData.prompt}" 
                     class="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
                     loading="lazy">
                <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                    <button class="opacity-0 group-hover:opacity-100 bg-white/90 dark:bg-gray-800/90 text-gray-900 dark:text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-105"
                            onclick="artVision.openImageModal('${imageData.url}', '${imageData.prompt}')">
                        <i class="fas fa-expand mr-2"></i>View Full
                    </button>
                </div>
            </div>
            <div class="p-4">
                <p class="text-gray-900 dark:text-white font-medium mb-2 line-clamp-2">${imageData.prompt}</p>
                <div class="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                    <span class="flex items-center">
                        <i class="fas fa-palette mr-1"></i>${imageData.style}
                    </span>
                    <span class="flex items-center">
                        <i class="fas fa-expand-arrows-alt mr-1"></i>${imageData.size}
                    </span>
                </div>
                <div class="mt-2 text-xs text-gray-400 dark:text-gray-500">
                    ${new Date(imageData.timestamp).toLocaleString()}
                </div>
            </div>
        `;

        // Add to beginning of gallery
        gallery.insertBefore(imageElement, gallery.firstChild);
    }

    // Open image modal
    openImageModal(imageUrl, prompt) {
        const modal = document.getElementById('imageModal');
        const modalImage = document.getElementById('modalImage');
        
        modalImage.src = imageUrl;
        modalImage.alt = prompt;
        
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }

    // Close image modal
    closeImageModal() {
        const modal = document.getElementById('imageModal');
        modal.classList.add('hidden');
        document.body.style.overflow = 'auto';
    }

    // Update generate button state
    updateGenerateButton(isGenerating) {
        const mainBtn = document.getElementById('mainGenerateBtn');
        const navBtn = document.getElementById('generateBtn');
        const btnText = document.getElementById('generateBtnText');
        const spinner = document.getElementById('loadingSpinner');

        if (isGenerating) {
            mainBtn.disabled = true;
            navBtn.disabled = true;
            btnText.textContent = 'Generating...';
            spinner.classList.remove('hidden');
        } else {
            mainBtn.disabled = false;
            navBtn.disabled = false;
            btnText.textContent = 'Generate Image';
            spinner.classList.add('hidden');
        }
    }

    // Update UI elements
    updateUI() {
        // Update credit count
        document.getElementById('creditCount').textContent = this.credits;

        // Update button states
        const buttons = [document.getElementById('generateBtn'), document.getElementById('mainGenerateBtn')];
        buttons.forEach(btn => {
            if (btn) {
                btn.disabled = this.credits <= 0 || this.isGenerating;
                if (this.credits <= 0) {
                    btn.classList.add('opacity-50', 'cursor-not-allowed');
                } else {
                    btn.classList.remove('opacity-50', 'cursor-not-allowed');
                }
            }
        });

        // Show/hide empty state
        const emptyState = document.getElementById('emptyState');
        const gallery = document.getElementById('imageGallery');
        
        if (emptyState && gallery) {
            if (gallery.children.length === 0) {
                emptyState.style.display = 'block';
            } else {
                emptyState.style.display = 'none';
            }
        }
    }

    // Contact modal functions
    openContactModal() {
        const modal = document.getElementById('contactModal');
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }

    closeContactModal() {
        const modal = document.getElementById('contactModal');
        modal.classList.add('hidden');
        document.body.style.overflow = 'auto';
    }

    // Theme functions
    toggleTheme() {
        const isDark = document.documentElement.classList.toggle('dark');
        localStorage.setItem('artvision_theme', isDark ? 'dark' : 'light');
        this.applyTheme();
    }

    applyTheme() {
        const savedTheme = localStorage.getItem('artvision_theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }

    // Save generated images to localStorage
    saveGeneratedImages() {
        localStorage.setItem('artvision_images', JSON.stringify(this.generatedImages));
    }

    // Load generated images from localStorage
    loadGeneratedImages() {
        const savedImages = localStorage.getItem('artvision_images');
        if (savedImages) {
            this.generatedImages = JSON.parse(savedImages);
            this.generatedImages.forEach(image => {
                this.addImageToGallery(image);
            });
        }
    }

    // Reset credits (for testing)
    resetCredits() {
        this.credits = 10;
        this.saveCredits();
        this.updateUI();
        this.showSuccess('Credits reset to 10!');
    }

    // Show success message
    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    // Show error message
    showError(message) {
        this.showNotification(message, 'error');
    }

    // Show notification
    showNotification(message, type = 'info') {
        // Remove existing notifications
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(notification => notification.remove());

        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification fixed top-20 right-4 z-50 px-6 py-4 rounded-lg shadow-lg transform transition-all duration-300 ${
            type === 'success' ? 'bg-green-500 text-white' : 
            type === 'error' ? 'bg-red-500 text-white' : 
            'bg-blue-500 text-white'
        }`;
        
        notification.innerHTML = `
            <div class="flex items-center">
                <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'} mr-3"></i>
                <span>${message}</span>
            </div>
        `;

        // Add to page
        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.classList.add('translate-x-0');
        }, 100);

        // Remove after 5 seconds
        setTimeout(() => {
            notification.classList.add('translate-x-full', 'opacity-0');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 5000);
    }
}

// Initialize the application
let artVision;

document.addEventListener('DOMContentLoaded', () => {
    artVision = new ArtVisionAI();
    
    // Load saved images
    artVision.loadGeneratedImages();
    
    // Add some CSS for notifications
    const style = document.createElement('style');
    style.textContent = `
        .notification {
            transform: translateX(100%);
            opacity: 0;
        }
        .notification.translate-x-0 {
            transform: translateX(0);
            opacity: 1;
        }
        .line-clamp-2 {
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
        }
    `;
    document.head.appendChild(style);
});

// Configure Tailwind for dark mode
if (typeof tailwind !== 'undefined') {
    tailwind.config = {
        darkMode: 'class',
        theme: {
            extend: {
                animation: {
                    'fade-in-up': 'fadeInUp 0.6s ease-out',
                    'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                }
            }
        }
    };
} 