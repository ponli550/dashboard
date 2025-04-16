/**
 * KAISEL2 Smooth UI Enhancement
 * This script adds smooth transitions and animations to improve the user experience
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize smooth transitions
    initSmoothTransitions();
    
    // Add scroll animations
    initScrollAnimations();
    
    // Enhance tab transitions
    enhanceTabTransitions();
    
    // Add loading indicators
    addLoadingIndicators();
});

/**
 * Initialize smooth transitions for page elements
 */
function initSmoothTransitions() {
    // Add transition classes to elements
    document.querySelectorAll('.js-slide, .js-t-lines p, .js-t-chars').forEach(el => {
        el.classList.add('smooth-transition');
    });
    
    // Add smooth transition to menu items
    document.querySelectorAll('.js-m-reveal, .js-m-fade').forEach(el => {
        el.classList.add('smooth-transition');
    });
    
    // Improve blob transitions
    const blob = document.querySelector('#gl');
    if (blob) {
        blob.classList.add('smooth-blob');
    }
}

/**
 * Initialize scroll-based animations
 */
function initScrollAnimations() {
    // Set up intersection observer for scroll animations
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observe elements that should animate on scroll
    document.querySelectorAll('.feature-card, .team-member, .presentation-card, .text-anim, .text-anim-inner, .caps-item').forEach(el => {
        el.classList.add('animate-on-scroll');
        observer.observe(el);
    });
}

/**
 * Enhance tab transitions for smoother switching
 */
function enhanceTabTransitions() {
    // Find all tab content elements
    const tabContents = document.querySelectorAll('.tab-content');
    
    // Add transition class to all tab contents
    tabContents.forEach(content => {
        content.classList.add('tab-transition');
    });
    
    // Find all tab buttons
    const tabBtns = document.querySelectorAll('.tab-btn');
    
    // Add click event listeners with improved transitions
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            
            // Remove active class from all buttons
            tabBtns.forEach(btn => btn.classList.remove('active'));
            
            // First set all tabs to transitioning-out state
            tabContents.forEach(content => {
                if (content.classList.contains('active')) {
                    content.classList.add('transitioning-out');
                    content.classList.remove('active');
                }
            });
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Use setTimeout to create a smooth transition between tabs
            setTimeout(() => {
                tabContents.forEach(content => content.classList.remove('transitioning-out'));
                const activeContent = document.getElementById(`${tabId}-content`);
                if (activeContent) {
                    activeContent.classList.add('active');
                }
            }, 300);
        });
    });
}

/**
 * Add loading indicators for async operations
 */
function addLoadingIndicators() {
    // Create loading indicator template
    const loadingTemplate = `
        <div class="loading-container">
            <div class="loading-spinner"></div>
            <p>Loading...</p>
        </div>
    `;
    
    // Add loading indicators to chart containers
    document.querySelectorAll('.chart-container').forEach(container => {
        // Store original content
        const originalContent = container.innerHTML;
        
        // Add data attribute to store original content
        container.setAttribute('data-original-content', originalContent);
        
        // Add method to show loading
        container.showLoading = function() {
            this.innerHTML = loadingTemplate;
        };
        
        // Add method to restore content
        container.restoreContent = function() {
            this.innerHTML = this.getAttribute('data-original-content');
        };
    });
}

/**
 * Helper function to fade in elements with text
 * @param {string} selector - CSS selector for the element
 * @param {string} text - Text to set in the element
 */
function fadeInElement(selector, text) {
    const element = document.querySelector(selector);
    if (element) {
        element.style.opacity = 0;
        element.innerHTML = text;
        setTimeout(() => {
            element.style.opacity = 1;
        }, 50);
    }
}