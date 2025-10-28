// Wyrejestruj Service Worker (jeśli istnieje) i wyczyść cache
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(function(registrations) {
        for(let registration of registrations) {
            registration.unregister();
        }
    });
    
    // Wyczyść cache
    if ('caches' in window) {
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames.map(function(cacheName) {
                    return caches.delete(cacheName);
                })
            );
        });
    }
}

// Loading Screen - tylko przy wolnym ładowaniu
document.addEventListener('DOMContentLoaded', () => {
    const loadingScreen = document.querySelector('.loading-screen');
    const pageLoadStart = Date.now();

    window.addEventListener('load', () => {
        const loadTime = Date.now() - pageLoadStart;
        
        if (loadingScreen) {
            // Pokaż tylko jeśli ładowanie trwało dłużej niż 1 sekundę
            if (loadTime > 1000) {
                setTimeout(() => {
                    loadingScreen.classList.add('hide');
                    setTimeout(() => {
                        loadingScreen.style.display = 'none';
                    }, 500);
                }, 500);
            } else {
                // Szybkie ładowanie - od razu ukryj
                loadingScreen.style.display = 'none';
            }
        }
    });
});

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

// Inicjalizacja mapy Google Maps
function initMap() {
    const mapElement = document.getElementById('map');
    if (!mapElement) return;

    // Współrzędne: Mościczki 34C, Witnica
    const position = { lat: 52.678606, lng: 14.847574 };
    
    // Custom style mapy - dopasowany do kolorystyki strony
    const mapStyles = [
        {
            "featureType": "water",
            "elementType": "geometry",
            "stylers": [{"color": "#4D8DB5"}, {"lightness": 17}]
        },
        {
            "featureType": "landscape",
            "elementType": "geometry",
            "stylers": [{"color": "#f5f5f5"}, {"lightness": 20}]
        },
        {
            "featureType": "road.highway",
            "elementType": "geometry.fill",
            "stylers": [{"color": "#ffffff"}, {"lightness": 17}]
        },
        {
            "featureType": "road.highway",
            "elementType": "geometry.stroke",
            "stylers": [{"color": "#ffffff"}, {"lightness": 29}, {"weight": 0.2}]
        },
        {
            "featureType": "road.arterial",
            "elementType": "geometry",
            "stylers": [{"color": "#ffffff"}, {"lightness": 18}]
        },
        {
            "featureType": "poi",
            "elementType": "geometry",
            "stylers": [{"color": "#f5f5f5"}, {"lightness": 21}]
        }
    ];
    
    // Tworzenie mapy z custom stylem
    const map = new google.maps.Map(mapElement, {
        center: position,
        zoom: 15,
        styles: mapStyles,
        mapTypeControl: true,
        streetViewControl: true,
        fullscreenControl: true,
        zoomControl: true,
        mapTypeControlOptions: {
            style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
            position: google.maps.ControlPosition.TOP_RIGHT,
        },
        zoomControlOptions: {
            position: google.maps.ControlPosition.RIGHT_CENTER
        },
        streetViewControlOptions: {
            position: google.maps.ControlPosition.RIGHT_CENTER
        }
    });
    
    // Custom ikona markera (niebieski pin)
    const customIcon = {
        path: google.maps.SymbolPath.CIRCLE,
        fillColor: '#2B4F6C',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 3,
        scale: 12
    };
    
    // Dodanie markera z animacją
    const marker = new google.maps.Marker({
        position: position,
        map: map,
        title: 'HydroTech J&S',
        animation: google.maps.Animation.DROP,
        icon: customIcon
    });
    
    // Okrąg promienia działania (50km)
    const serviceArea = new google.maps.Circle({
        strokeColor: '#4D8DB5',
        strokeOpacity: 0.4,
        strokeWeight: 2,
        fillColor: '#4D8DB5',
        fillOpacity: 0.1,
        map: map,
        center: position,
        radius: 50000 // 50km w metrach
    });
    
    // Stylowe info okienko
    const infoWindow = new google.maps.InfoWindow({
        content: `
            <div style="padding: 15px; font-family: 'Segoe UI', sans-serif; max-width: 280px;">
                <div style="border-left: 4px solid #2B4F6C; padding-left: 12px; margin-bottom: 12px;">
                    <h3 style="margin: 0 0 8px 0; color: #2B4F6C; font-size: 1.3rem; font-weight: 700;">
                        HydroTech J&S
                    </h3>
                    <p style="margin: 0; color: #666; font-size: 0.9rem;">Profesjonalne usługi hydrauliczne</p>
                </div>
                
                <div style="margin: 12px 0; padding: 10px; background: #f8f9fa; border-radius: 8px;">
                    <p style="margin: 6px 0; color: #333; font-size: 0.95rem; display: flex; align-items: center; gap: 8px;">
                        <span style="color: #4D8DB5; font-size: 1.1rem;">📍</span>
                        <strong>Mościczki 34C</strong><br>
                        <span style="margin-left: 28px; color: #666;">66-460 Witnica</span>
                    </p>
                </div>
                
                <div style="display: flex; gap: 10px; margin-top: 12px;">
                    <a href="tel:+48502313419" 
                       style="flex: 1; padding: 10px; background: linear-gradient(135deg, #2B4F6C, #4D8DB5); 
                              color: white; text-decoration: none; border-radius: 6px; text-align: center; 
                              font-weight: 600; font-size: 0.9rem; display: flex; align-items: center; 
                              justify-content: center; gap: 6px; transition: transform 0.2s;">
                        📞 Zadzwoń
                    </a>
                    <a href="https://www.google.com/maps/dir/?api=1&destination=52.678606,14.847574" 
                       target="_blank"
                       style="flex: 1; padding: 10px; background: white; color: #2B4F6C; 
                              border: 2px solid #2B4F6C; text-decoration: none; border-radius: 6px; 
                              text-align: center; font-weight: 600; font-size: 0.9rem; 
                              display: flex; align-items: center; justify-content: center; gap: 6px;">
                        🗺️ Nawiguj
                    </a>
                </div>
                
                <p style="margin: 12px 0 0 0; padding-top: 10px; border-top: 1px solid #e0e0e0; 
                          color: #666; font-size: 0.85rem; text-align: center;">
                    <span style="color: #4D8DB5; font-weight: 600;">⭕ Zasięg działania: 50km</span>
                </p>
            </div>
        `
    });
    
    // Otwórz info okienko od razu
    infoWindow.open(map, marker);
    
    // Kliknięcie w marker - bounce animation
    marker.addListener('click', () => {
        infoWindow.open(map, marker);
        marker.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(() => marker.setAnimation(null), 2100); // 3 bounces
    });
    
    // Kliknięcie w okrąg - pokaż info
    google.maps.event.addListener(serviceArea, 'click', () => {
        map.setZoom(11);
        map.panTo(position);
    });
}

// Globalnie dostępna funkcja dla Google Maps callback
window.initMap = initMap;

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

// ===== PORTFOLIO FILTERS =====
function initPortfolioFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const portfolioItems = document.querySelectorAll('.portfolio-item');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            const filter = button.getAttribute('data-filter');
            
            // Update active button
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Filter items with animation
            let visibleIndex = 0;
            portfolioItems.forEach((item) => {
                const category = item.getAttribute('data-category');
                
                if (filter === 'all' || category === filter) {
                    // Show item with delay
                    const delay = visibleIndex * 100;
                    visibleIndex++;
                    
                    item.classList.remove('fade-out');
                    item.style.display = 'block';
                    
                    setTimeout(() => {
                        item.classList.remove('hidden');
                        item.classList.add('fade-in', 'visible');
                    }, delay);
                } else {
                    // Hide item immediately
                    item.classList.remove('fade-in', 'visible');
                    item.classList.add('fade-out');
                    
                    setTimeout(() => {
                        item.style.display = 'none';
                        item.classList.add('hidden');
                    }, 300);
                }
            });
        });
    });
}

// ===== SHARE BUTTONS =====
function initShareButtons() {
    document.querySelectorAll('.share-btn').forEach(button => {
        button.addEventListener('click', function() {
            const shareType = this.getAttribute('data-share');
            const article = this.closest('.portfolio-item');
            const title = article.querySelector('h3').textContent;
            const url = window.location.href;
            
            switch(shareType) {
                case 'facebook':
                    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank', 'width=600,height=400');
                    showToast('Otwarto Facebook!', 'fab fa-facebook-f');
                    break;
                    
                case 'whatsapp':
                    window.open(`https://wa.me/?text=${encodeURIComponent(title + ' - ' + url)}`, '_blank');
                    showToast('Otwarto WhatsApp!', 'fab fa-whatsapp');
                    break;
                    
                case 'email':
                    window.location.href = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent('Zobacz ten projekt: ' + url)}`;
                    showToast('Otwarto klienta email!', 'fas fa-envelope');
                    break;
                    
                case 'copy':
                    copyToClipboard(url);
                    this.classList.add('copied');
                    setTimeout(() => {
                        this.classList.remove('copied');
                    }, 2000);
                    showToast('Link skopiowany!', 'fas fa-check');
                    break;
            }
        });
    });
}

function copyToClipboard(text) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text);
    } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
    }
}

function showToast(message, icon) {
    // Remove existing toast
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }
    
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
        <i class="${icon}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// ===== SCROLL ANIMATIONS =====
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);
    
    document.querySelectorAll('.portfolio-item').forEach(item => {
        observer.observe(item);
    });
}

// ===== INITIALIZE ALL =====
document.addEventListener('DOMContentLoaded', () => {
    initPortfolioGallery();
    initPortfolioFilters();
    initShareButtons();
    initScrollAnimations();
    initStatsCounter();
    initServiceCardsAnimation();
    initWhyUsAnimation();
});

// ===== WHY US ANIMATION =====
function initWhyUsAnimation() {
    const whyUsItems = document.querySelectorAll('.why-us-item');
    
    if (whyUsItems.length === 0) return;
    
    const observerOptions = {
        threshold: 0.2,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);
    
    whyUsItems.forEach(item => observer.observe(item));
}

// ===== SERVICE CARDS ANIMATION =====
function initServiceCardsAnimation() {
    const serviceCards = document.querySelectorAll('.service-card');
    
    if (serviceCards.length === 0) return;
    
    const observerOptions = {
        threshold: 0.2,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);
    
    serviceCards.forEach(card => observer.observe(card));
}

// ===== STATS COUNTER ANIMATION =====
function initStatsCounter() {
    const stats = document.querySelectorAll('.stat-number');
    
    const observerOptions = {
        threshold: 0.5,
        rootMargin: '0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
                entry.target.classList.add('counted');
                animateCounter(entry.target);
            }
        });
    }, observerOptions);
    
    stats.forEach(stat => observer.observe(stat));
}

function animateCounter(element) {
    const target = parseInt(element.getAttribute('data-target'));
    const duration = 2000; // 2 seconds
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target;
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current);
        }
    }, duration / steps);
}

// Lightbox - Galeria zdjęć i wideo z nawigacją
let currentLightboxIndex = 0;
let currentGalleryItems = [];

function openLightbox(type, src, altOrPoster, galleryElement) {
    // Usuń poprzedni lightbox jeśli istnieje
    const existingLightbox = document.querySelector('.lightbox');
    if (existingLightbox) {
        existingLightbox.remove();
    }

    // Pobierz wszystkie media z tej galerii
    currentGalleryItems = Array.from(galleryElement.querySelectorAll('img, video')).map(item => {
        return {
            type: item.tagName.toLowerCase() === 'video' ? 'video' : 'img',
            src: item.src,
            alt: item.alt || item.getAttribute('aria-label') || '',
            poster: item.getAttribute('poster') || ''
        };
    });

    // Znajdź indeks klikniętego elementu
    currentLightboxIndex = currentGalleryItems.findIndex(item => item.src === src);

    showLightboxImage(currentLightboxIndex);
}

function showLightboxImage(index) {
    const item = currentGalleryItems[index];
    let lightbox = document.querySelector('.lightbox');
    
    // Jeśli lightbox istnieje, tylko zaktualizuj zawartość z animacją
    if (lightbox) {
        const mediaContainer = lightbox.querySelector('.lightbox-content > img, .lightbox-content > video');
        
        // Fade out starego obrazu
        if (mediaContainer) {
            mediaContainer.style.opacity = '0';
            
            setTimeout(() => {
                // Zaktualizuj zawartość
                const newMediaHTML = item.type === 'img' 
                    ? `<img src="${item.src}" alt="${item.alt}" loading="eager" style="opacity: 0; transition: opacity 0.3s ease;">` 
                    : `<video controls autoplay loop poster="${item.poster}" style="opacity: 0; transition: opacity 0.3s ease;">
                        <source src="${item.src}" type="video/mp4">
                        Twoja przeglądarka nie wspiera wideo.
                    </video>`;
                
                mediaContainer.outerHTML = newMediaHTML;
                
                // Fade in nowego obrazu
                const newMedia = lightbox.querySelector('.lightbox-content > img, .lightbox-content > video');
                setTimeout(() => {
                    newMedia.style.opacity = '1';
                }, 10);
                
                // Aktualizuj licznik i buttony
                const counter = lightbox.querySelector('.lightbox-counter span');
                counter.textContent = `${index + 1} / ${currentGalleryItems.length}`;
                
                const prevBtn = lightbox.querySelector('.prev');
                const nextBtn = lightbox.querySelector('.next');
                prevBtn.disabled = index === 0;
                nextBtn.disabled = index === currentGalleryItems.length - 1;
            }, 150);
        }
        
        return;
    }
    
    // Jeśli lightbox nie istnieje, stwórz nowy
    lightbox = document.createElement('div');
    lightbox.className = 'lightbox active';
    
    lightbox.innerHTML = `
        <div class="lightbox-content">
            ${item.type === 'img' 
                ? `<img src="${item.src}" alt="${item.alt}" loading="eager">` 
                : `<video controls autoplay loop poster="${item.poster}">
                    <source src="${item.src}" type="video/mp4">
                    Twoja przeglądarka nie wspiera wideo.
                </video>`
            }
            <button class="close-btn" aria-label="Zamknij lightbox">
                <i class="fas fa-times"></i>
            </button>
            <button class="lightbox-nav prev" aria-label="Poprzednie zdjęcie" ${index === 0 ? 'disabled' : ''}>
                <i class="fas fa-chevron-left"></i>
            </button>
            <button class="lightbox-nav next" aria-label="Następne zdjęcie" ${index === currentGalleryItems.length - 1 ? 'disabled' : ''}>
                <i class="fas fa-chevron-right"></i>
            </button>
            <div class="lightbox-counter">
                <i class="fas fa-images"></i>
                <span>${index + 1} / ${currentGalleryItems.length}</span>
            </div>
        </div>
    `;
    
    // Zamknij przyciskiem
    lightbox.querySelector('.close-btn').addEventListener('click', () => {
        closeLightbox(lightbox);
    });
    
    // Nawigacja prev/next
    const prevBtn = lightbox.querySelector('.prev');
    const nextBtn = lightbox.querySelector('.next');
    
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            currentLightboxIndex--;
            showLightboxImage(currentLightboxIndex);
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            currentLightboxIndex++;
            showLightboxImage(currentLightboxIndex);
        });
    }
    
    // Zamknij kliknięciem poza contentem
    lightbox.addEventListener('click', e => {
        if (e.target === lightbox) {
            closeLightbox(lightbox);
        }
    });
    
    // Zamknij klawiszem ESC, nawigacja strzałkami
    const keyHandler = (e) => {
        if (e.key === 'Escape') {
            closeLightbox(lightbox);
        } else if (e.key === 'ArrowLeft' && currentLightboxIndex > 0) {
            currentLightboxIndex--;
            showLightboxImage(currentLightboxIndex);
        } else if (e.key === 'ArrowRight' && currentLightboxIndex < currentGalleryItems.length - 1) {
            currentLightboxIndex++;
            showLightboxImage(currentLightboxIndex);
        }
    };
    document.addEventListener('keydown', keyHandler);
    
    // Zapisz handler do późniejszego usunięcia
    lightbox._keyHandler = keyHandler;
    
    document.body.appendChild(lightbox);
    
    // Zablokuj scroll
    document.body.style.overflow = 'hidden';
}

function closeLightbox(lightbox) {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
    
    // Usuń event listener
    if (lightbox._keyHandler) {
        document.removeEventListener('keydown', lightbox._keyHandler);
    }
    
    setTimeout(() => lightbox.remove(), 300);
}

// Inicjalizacja galerii - wykonaj po załadowaniu DOM
function initPortfolioGallery() {
    // Podłącz obrazki
    document.querySelectorAll('.portfolio-gallery img').forEach(img => {
        img.addEventListener('click', () => {
            const gallery = img.closest('.portfolio-gallery');
            openLightbox('img', img.src, img.alt, gallery);
        });
        
        // Dodaj obsługę klawiatury dla dostępności
        img.setAttribute('tabindex', '0');
        img.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                const gallery = img.closest('.portfolio-gallery');
                openLightbox('img', img.src, img.alt, gallery);
            }
        });
    });
    
    // Podłącz wideo
    document.querySelectorAll('.portfolio-gallery video').forEach(video => {
        // Autoplay on hover
        video.addEventListener('mouseenter', () => {
            video.play();
        });
        
        video.addEventListener('mouseleave', () => {
            video.pause();
            video.currentTime = 0;
        });
        
        video.addEventListener('click', () => {
            video.pause();
            video.currentTime = 0;
            const gallery = video.closest('.portfolio-gallery');
            openLightbox('video', video.src, video.getAttribute('aria-label') || '', gallery);
        });
        
        // Dodaj obsługę klawiatury dla dostępności
        video.setAttribute('tabindex', '0');
        video.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                video.pause();
                video.currentTime = 0;
                const gallery = video.closest('.portfolio-gallery');
                openLightbox('video', video.src, video.getAttribute('aria-label') || '', gallery);
            }
        });
    });
}

// ===== Accordion dla strony usług =====
function initAccordion() {
    const accordionHeaders = document.querySelectorAll('.accordion-header');
    
    if (accordionHeaders.length === 0) return;
    
    accordionHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const accordionItem = header.parentElement;
            const isActive = accordionItem.classList.contains('active');
            
            // Zamknij wszystkie inne elementy
            document.querySelectorAll('.accordion-item').forEach(item => {
                if (item !== accordionItem) {
                    item.classList.remove('active');
                }
            });
            
            // Przełącz aktualny element
            if (isActive) {
                accordionItem.classList.remove('active');
            } else {
                accordionItem.classList.add('active');
            }
        });
    });
}

// ===== Animacje scroll dla kart usług =====
function initServicesAnimation() {
    const serviceCards = document.querySelectorAll('.service-card');
    const accordionItems = document.querySelectorAll('.accordion-item');
    
    if (serviceCards.length === 0 && accordionItems.length === 0) return;
    
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, index * 100);
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    serviceCards.forEach(card => observer.observe(card));
    accordionItems.forEach(item => observer.observe(item));
}

// ===== Animacje dla strony kontaktu =====
function initContactAnimations() {
    const quickBtns = document.querySelectorAll('.quick-contact-btn');
    const contactForm = document.querySelector('.contact-form');
    const infoCards = document.querySelectorAll('.info-card');
    const faqItems = document.querySelectorAll('.faq-item');
    
    const elements = [...quickBtns, contactForm, ...infoCards, ...faqItems].filter(el => el !== null);
    
    if (elements.length === 0) return;
    
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, index * 80);
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    elements.forEach(element => observer.observe(element));
}

// ===== Sortowanie projektów od najnowszych =====
function sortPortfolioByDate() {
    const portfolioGrid = document.querySelector('.portfolio-grid');
    if (!portfolioGrid) return;
    
    const items = Array.from(portfolioGrid.querySelectorAll('.portfolio-item'));
    
    // Sortuj od najnowszych (malejąco)
    items.sort((a, b) => {
        const dateA = new Date(a.querySelector('time').getAttribute('datetime'));
        const dateB = new Date(b.querySelector('time').getAttribute('datetime'));
        return dateB - dateA; // Od najnowszych do najstarszych
    });
    
    // Usuń wszystkie i dodaj w nowej kolejności
    items.forEach(item => portfolioGrid.appendChild(item));
}

// ===== Inicjalizacja przy załadowaniu strony =====
document.addEventListener('DOMContentLoaded', () => {
    sortPortfolioByDate(); // Sortuj projekty
    initAccordion();
    initServicesAnimation();
    initContactAnimations();
});