const revealElements = document.querySelectorAll("[data-reveal]");

const scrollReveal = function () {
for (let i = 0, len = revealElements.length; i < len; i++) {
    const isElementOnScreen =
    revealElements[i].getBoundingClientRect().top < window.innerHeight;

    if (isElementOnScreen) {
        revealElements[i].classList.add("revealed");
    } else {
        revealElements[i].classList.remove("revealed");
    }
    }
};

window.addEventListener("scroll", scrollReveal);
window.addEventListener("load", scrollReveal);

// Carousel functionality
class ImageCarousel {
    constructor() {
        this.carouselTrack = document.querySelector('.carousel-track');
        this.slides = document.querySelectorAll('.carousel-slide');
        this.prevBtn = document.querySelector('.carousel-btn--prev');
        this.nextBtn = document.querySelector('.carousel-btn--next');
        this.indicators = document.querySelectorAll('.carousel-indicator');
        
        this.currentIndex = 0;
        this.slideCount = this.slides.length;
        this.autoSlideInterval = null;
        
        this.init();
    }
    
    init() {
        // Set up event listeners
        this.prevBtn.addEventListener('click', () => this.prevSlide());
        this.nextBtn.addEventListener('click', () => this.nextSlide());
        
        // Set up indicator click events
        this.indicators.forEach((indicator, index) => {
            indicator.addEventListener('click', () => this.goToSlide(index));
        });
        
        // Start auto-sliding
        this.startAutoSlide();
        
        // Pause auto-slide on hover
        this.carouselTrack.addEventListener('mouseenter', () => this.stopAutoSlide());
        this.carouselTrack.addEventListener('mouseleave', () => this.startAutoSlide());
        
        // Touch events for mobile
        this.setupTouchEvents();
    }
    
    updateSlidePosition() {
        const translateX = -this.currentIndex * 100;
        this.carouselTrack.style.transform = `translateX(${translateX}%)`;
        
        // Update active indicators
        this.indicators.forEach((indicator, index) => {
            indicator.classList.toggle('active', index === this.currentIndex);
        });
    }
    
    nextSlide() {
        this.currentIndex = (this.currentIndex + 1) % this.slideCount;
        this.updateSlidePosition();
        this.restartAutoSlide();
    }
    
    prevSlide() {
        this.currentIndex = (this.currentIndex - 1 + this.slideCount) % this.slideCount;
        this.updateSlidePosition();
        this.restartAutoSlide();
    }
    
    goToSlide(index) {
        this.currentIndex = index;
        this.updateSlidePosition();
        this.restartAutoSlide();
    }
    
    startAutoSlide() {
        this.stopAutoSlide();
        this.autoSlideInterval = setInterval(() => {
            this.nextSlide();
        }, 5000); // Change slide every 5 seconds
    }
    
    stopAutoSlide() {
        if (this.autoSlideInterval) {
            clearInterval(this.autoSlideInterval);
            this.autoSlideInterval = null;
        }
    }
    
    restartAutoSlide() {
        this.stopAutoSlide();
        this.startAutoSlide();
    }
    
    setupTouchEvents() {
        let startX, moveX, isDragging = false;
        
        this.carouselTrack.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            isDragging = true;
            this.stopAutoSlide();
        });
        
        this.carouselTrack.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            moveX = e.touches[0].clientX;
        });
        
        this.carouselTrack.addEventListener('touchend', () => {
            if (!isDragging) return;
            isDragging = false;
            
            const diff = startX - moveX;
            const swipeThreshold = 50;
            
            if (Math.abs(diff) > swipeThreshold) {
                if (diff > 0) {
                    this.nextSlide();
                } else {
                    this.prevSlide();
                }
            }
            
            this.startAutoSlide();
        });
    }
}

// Comment functionality
class CommentSystem {
    constructor() {
        this.comments = [];
        this.form = document.getElementById('commentForm');
        this.commentsList = document.getElementById('commentsList');
        this.nameInput = document.getElementById('commentName');
        this.textInput = document.getElementById('commentText');
        
        this.init();
    }
    
    init() {
        this.loadComments();
        this.setupEventListeners();
        this.displayComments();
    }
    
    setupEventListeners() {
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitComment();
        });
    }
    
    submitComment() {
        const name = this.nameInput.value.trim();
        const text = this.textInput.value.trim();
        
        if (!name || !text) {
            alert('Please fill in both name and comment fields.');
            return;
        }
        
        const comment = {
            id: Date.now(),
            name: name,
            text: text,
            date: new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })
        };
        
        this.comments.unshift(comment); // Add to beginning of array
        this.saveComments();
        this.displayComments();
        this.clearForm();
        
        // Show success message
        this.showSuccessMessage();
    }
    
    showSuccessMessage() {
        const successMsg = document.createElement('div');
        successMsg.textContent = 'Comment posted successfully!';
        successMsg.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #4CAF50;
            color: white;
            padding: 15px 20px;
            border-radius: 5px;
            z-index: 1000;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(successMsg);
        
        setTimeout(() => {
            successMsg.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => successMsg.remove(), 300);
        }, 3000);
    }
    
    clearForm() {
        this.nameInput.value = '';
        this.textInput.value = '';
    }
    
    displayComments() {
        if (this.comments.length === 0) {
            this.commentsList.innerHTML = '<p class="no-comments">No comments yet. Be the first to comment!</p>';
            return;
        }
        
        this.commentsList.innerHTML = this.comments.map(comment => `
            <div class="comment-item" data-comment-id="${comment.id}">
                <div class="comment-header">
                    <span class="comment-author">${this.escapeHtml(comment.name)}</span>
                    <span class="comment-date">${comment.date}</span>
                </div>
                <div class="comment-content">${this.escapeHtml(comment.text)}</div>
            </div>
        `).join('');
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    saveComments() {
        localStorage.setItem('websiteComments', JSON.stringify(this.comments));
    }
    
    loadComments() {
        const savedComments = localStorage.getItem('websiteComments');
        if (savedComments) {
            this.comments = JSON.parse(savedComments);
        }
    }
}

// Add CSS animations for success message
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Initialize carousel when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ImageCarousel();
    new CommentSystem();
});
