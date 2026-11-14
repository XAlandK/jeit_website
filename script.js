const header = document.querySelector('.header');
const menuToggle = document.getElementById('menuToggle');
const mobileMenu = document.getElementById('mobileMenu');

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// The deprecation banner sits above the sticky header, so the header's bottom edge
// moves as the page scrolls. Pin the fixed mobile menu right under it.
const placeMenu = () => {
    mobileMenu.style.top = `${Math.max(0, header.getBoundingClientRect().bottom)}px`;
};

// Mobile Menu Toggle
const setMenu = (open) => {
    if (open) {
        placeMenu();
    }
    mobileMenu.classList.toggle('active', open);
    menuToggle.classList.toggle('active', open);
    menuToggle.setAttribute('aria-expanded', String(open));
};

menuToggle.addEventListener('click', () => {
    setMenu(!mobileMenu.classList.contains('active'));
});

// Close mobile menu when clicking on a link
mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => setMenu(false));
});

// Close on Escape, or when clicking outside the menu
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileMenu.classList.contains('active')) {
        setMenu(false);
        menuToggle.focus();
    }
});

document.addEventListener('click', (e) => {
    if (!mobileMenu.classList.contains('active')) {
        return;
    }
    if (!mobileMenu.contains(e.target) && !menuToggle.contains(e.target)) {
        setMenu(false);
    }
});

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (!href) {
            return;
        }

        // "#" is the logo: send it back to the top of the page.
        const target = href === '#' ? null : document.querySelector(href);
        if (href !== '#' && !target) {
            return;
        }

        e.preventDefault();

        // If the mobile menu is open, close it before measuring header height.
        setMenu(false);

        requestAnimationFrame(() => {
            const headerOffset = header ? header.getBoundingClientRect().height : 0;
            const extraOffset = 8;
            const targetTop = target ? target.getBoundingClientRect().top + window.pageYOffset : 0;
            const top = target ? Math.max(0, targetTop - headerOffset - extraOffset) : 0;

            window.scrollTo({
                top,
                behavior: prefersReducedMotion ? 'auto' : 'smooth'
            });

            if (target) {
                history.pushState(null, '', href);
            }
        });
    });
});

// Add scroll effect to header
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset > 50;
    header.style.boxShadow = scrolled
        ? '0 4px 12px rgba(0, 0, 0, 0.1)'
        : '0 4px 6px -1px rgba(0, 0, 0, 0.1)';

    if (mobileMenu.classList.contains('active')) {
        placeMenu();
    }
}, { passive: true });

// Animate elements on scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

const stats = document.querySelectorAll('.stat');

// Only hide-then-reveal when motion is welcome; otherwise leave content in place.
if (!prefersReducedMotion) {
    const reveal = (elements, step) => {
        elements.forEach((el, index) => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = `all 0.6s ease ${index * step}s`;
            observer.observe(el);
        });
    };

    reveal(document.querySelectorAll('.feature-card'), 0.1);
    reveal(stats, 0.15);
}

// Counter animation for stats
const animateCounter = (element, target) => {
    if (prefersReducedMotion) {
        element.textContent = target.toLocaleString('en-US') + '+';
        return;
    }

    let current = 0;
    const increment = target / 50;
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target.toLocaleString('en-US') + '+';
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current).toLocaleString('en-US') + '+';
        }
    }, 30);
};

// Start counter animation when stats are visible
const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const statNumber = entry.target.querySelector('.stat-number');
            const targetValue = parseInt(statNumber.textContent.replace(/[^0-9]/g, ''), 10);
            animateCounter(statNumber, targetValue);
            statsObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

stats.forEach(stat => {
    statsObserver.observe(stat);
});
