// Dark mode wlaczenie
const themeToggle = document.createElement('button');
themeToggle.className = 'theme-toggle';
themeToggle.innerHTML = '🌓';
document.body.appendChild(themeToggle);

themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDark);
    animateOnScroll()
});

// Sprawdzanie trybu
if (localStorage.getItem('darkMode') === 'true') {
    document.body.classList.add('dark-mode');
}

// Ciasteczka
const cookieContainer = document.querySelector('.cookie-container');
const cookieAccept = document.querySelector('.cookie-accept');
const cookieReject = document.querySelector('.cookie-reject');

setTimeout(() => {
    if(!localStorage.getItem('cookieAccepted')) {
        cookieContainer.classList.add('active');
    }
}, 2000);

cookieAccept.addEventListener('click', () => {
    localStorage.setItem('cookieAccepted', 'true');
    cookieContainer.classList.remove('active');
});

cookieReject.addEventListener('click', () => {
    cookieContainer.classList.remove('active');
});

// Scrool
const scrollButton = document.querySelector('.scroll-top');

window.addEventListener('scroll', () => {
    scrollButton.style.opacity = window.scrollY > 500 ? '1' : '0';
});

scrollButton.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// Inicjalizacja mapy
function initMap() {
    const map = L.map('map', {
        preferCanvas: true,
        fadeAnimation: false
    }).setView([52.678606, 14.847574], 14);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap'
    }).addTo(map);
    
    L.marker([52.678606, 14.847574])
        .addTo(map)
        .bindPopup('HydroTech J&S<br>Mościczki 34A<br>66-460 Witnica')
        .openPopup();
    
    setTimeout(() => {
        map.invalidateSize();
    }, 300);
}

document.addEventListener('DOMContentLoaded', initMap);

// Animacje
const animateOnScroll = () => {
    const elements = document.querySelectorAll('.service-card, .info-item');
    const forceUpdate = document.body.classList.contains('dark-mode');
    
    elements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const elementBottom = element.getBoundingClientRect().bottom;
        
        // Resetuj animację przy zmianie motywu
        if(forceUpdate) {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0px)';
        }
        
        // Aktywuj animację
        if (elementTop < window.innerHeight * 0.85 && elementBottom > 0) {
            requestAnimationFrame(() => {
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            });
        }
    });
};

// Obserwator zmian motywu
const observer = new MutationObserver((mutations) => {
    mutations.forEach(() => {
        animateOnScroll();
        setTimeout(animateOnScroll, 100);
    });
});

observer.observe(document.body, {
    attributes: true,
    attributeFilter: ['class']
});

themeToggle.addEventListener('click', () => {
    document.body.offsetHeight;
    
    animateOnScroll();
    
    setTimeout(() => {
        window.dispatchEvent(new Event('scroll'));
    }, 300);
});

window.addEventListener('scroll', animateOnScroll);
animateOnScroll();

// Lightbox
document.querySelectorAll('.portfolio-gallery img').forEach(img => {
    img.addEventListener('click', () => {
        const lightbox = document.createElement('div');
        lightbox.className = 'lightbox active';
        lightbox.innerHTML = `
            <img src="${img.src}" alt="${img.alt}">
            <button class="close-btn"><i class="fas fa-times"></i></button>
        `;
        
        lightbox.querySelector('.close-btn').addEventListener('click', () => {
            lightbox.remove();
        });
        
        document.body.appendChild(lightbox);
    });
});