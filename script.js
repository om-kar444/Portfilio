document.addEventListener('DOMContentLoaded', () => {
    // ========== PARTICLE NETWORK ANIMATION ==========
    const canvas = document.getElementById('network-canvas');
    const ctx = canvas.getContext('2d');
    
    let particles = [];
    let animationId = null;
    const isMobileDevice = window.innerWidth <= 768;
    
    // Reduce particles on mobile for better performance
    const particleCount = isMobileDevice ? 40 : 80;
    const connectionDistance = isMobileDevice ? 100 : 150;
    const colors = ['#00ffcc', '#ff00ff', '#00ccff', '#ff0066', '#66ff00'];
    
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    
    function createParticles() {
        particles = [];
        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * 0.4,
                vy: (Math.random() - 0.5) * 0.4,
                radius: Math.random() * 1.5 + 1,
                color: colors[Math.floor(Math.random() * colors.length)],
                opacity: Math.random() * 0.3 + 0.5
            });
        }
    }
    
    function drawParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw connections (skip on very small screens for performance)
        if (!isMobileDevice || window.innerWidth > 480) {
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance < connectionDistance) {
                        const opacity = (1 - (distance / connectionDistance)) * 0.5;
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(100, 150, 255, ${opacity})`;
                        ctx.lineWidth = 1;
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }
            }
        }
        
        // Draw particles (no shadow on mobile for performance)
        particles.forEach(particle => {
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
            ctx.fillStyle = particle.color;
            ctx.globalAlpha = particle.opacity;
            if (!isMobileDevice) {
                ctx.shadowBlur = 6;
                ctx.shadowColor = particle.color;
            }
            ctx.fill();
            ctx.shadowBlur = 0;
            ctx.globalAlpha = 1;
        });
    }
    
    function updateParticles() {
        particles.forEach(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
            if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;
        });
    }
    
    function animate() {
        drawParticles();
        updateParticles();
        animationId = requestAnimationFrame(animate);
    }
    
    // Pause animation when tab is not visible (saves battery on mobile)
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            if (animationId) cancelAnimationFrame(animationId);
        } else {
            animate();
        }
    });
    
    resizeCanvas();
    createParticles();
    animate();
    
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            resizeCanvas();
            createParticles();
        }, 200);
    });

    // Initialize AOS for scroll animations
    AOS.init({
        duration: 1000,
        easing: 'ease-in-out',
        once: true,
        mirror: false
    });

    // Typed.js for typing effect
    if (document.querySelector('.typing')) {
        new Typed('.typing', {
            strings: ['Creative Developer', 'UI/UX Enthusiast', 'Problem Solver', 'Tech Innovator','Java Developer','Data Visualizer','Frontend Developer'],
            typeSpeed: 70,
            backSpeed: 60,
            loop: true
        });
    }

    // Sidebar toggle functionality
    const sidebar = document.querySelector('.sidebar');
    const sidebarToggleButtons = document.querySelectorAll('.sidebar-toggle');
    const mainContent = document.getElementById('main-content');

    function isMobile() {
        return window.innerWidth <= 992;
    }

    function toggleSidebar() {
        if (isMobile()) {
            sidebar.classList.toggle('active');
        } else {
            const isCollapsed = sidebar.classList.toggle('collapsed');
            sidebar.setAttribute('data-collapsed', isCollapsed);
        }
    }

    sidebarToggleButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleSidebar();
        });
    });

    // Close sidebar when clicking on the main content on mobile
    mainContent.addEventListener('click', () => {
        if (isMobile() && sidebar.classList.contains('active')) {
            sidebar.classList.remove('active');
        }
    });

    // Scroll Spy for navigation links
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section');

    function updateActiveLink() {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (pageYOffset >= (sectionTop - sectionHeight / 3)) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') && link.getAttribute('href').includes(current)) {
                link.classList.add('active');
            }
        });
    }

    window.addEventListener('scroll', updateActiveLink);
    updateActiveLink();

    // Close sidebar on nav link click (for mobile)
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (isMobile() && sidebar.classList.contains('active')) {
                sidebar.classList.remove('active');
            }
        });
    });

    // On window resize, adjust sidebar state
    window.addEventListener('resize', () => {
        if (!isMobile()) {
            sidebar.classList.remove('active');
        } else {
            sidebar.classList.remove('collapsed');
        }
    });

    // Project cards animation
    const projectCards = document.querySelectorAll('.project-card');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = 1;
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });

    projectCards.forEach(card => {
        card.style.opacity = 0;
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        observer.observe(card);
    });

    // ========== CONTACT FORM ==========
    const contactForm = document.getElementById('contact-form');
    const formMessage = document.getElementById('form-message');

    if (contactForm) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const submitBtn = contactForm.querySelector('.submit-btn');
            const originalText = submitBtn.textContent;
            
            // Show loading state
            submitBtn.textContent = 'Sending...';
            submitBtn.disabled = true;
            formMessage.className = 'form-message';
            formMessage.style.display = 'none';

            // Get form data
            const formData = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                designation: document.getElementById('designation').value,
                subject: document.getElementById('subject').value,
                message: document.getElementById('message').value
            };

            try {
                // Simulate form submission for demo purposes
                // In production, you would connect this to your backend
                
                // Show success message
                formMessage.className = 'form-message success';
                formMessage.textContent = 'Thank you for your message! Please email me directly at omkarkurane141@gmail.com for now.';
                contactForm.reset();

            } catch (error) {
                console.error('Error:', error);
                formMessage.className = 'form-message error';
                formMessage.textContent = 'Please email me directly at omkarkurane141@gmail.com';
            } finally {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
                formMessage.style.display = 'block';
                
                // Hide message after 5 seconds
                setTimeout(() => {
                    formMessage.style.display = 'none';
                }, 5000);
            }
        });
    }

});
