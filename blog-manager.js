// Blog Manager - dynamiczne ładowanie postów z Markdown
class BlogManager {
    constructor() {
        this.allPosts = [];
        this.filteredPosts = [];
        this.currentFilter = 'all';
        // Odczytaj zapisaną stronę z localStorage lub ustaw 1
        this.currentPage = parseInt(localStorage.getItem('blogCurrentPage')) || 1;
        this.postsPerPage = 5;
        this.searchQuery = '';
    }

    // Ładowanie postów z pliku JSON
    async loadPosts() {
        try {
            // Manifest zawiera listę plików markdown z katalogu /posts/
            const manifestResp = await fetch('/posts/posts.json');
            if (!manifestResp.ok) throw new Error('Brak manifestu postów');
            const manifest = await manifestResp.json();

            const posts = [];
            for (const entry of manifest) {
                const filename = entry.file || entry.filename || entry;
                try {
                    const resp = await fetch(`/posts/${filename}`);
                    if (!resp.ok) {
                        console.warn(`Nie można pobrać pliku: /posts/${filename}`);
                        continue;
                    }
                    const text = await resp.text();
                    const post = this.parseMarkdown(text, filename);
                    if (post) posts.push(post);
                } catch (err) {
                    console.warn('Błąd podczas pobierania postu', filename, err);
                }
            }

            // Filtruj tylko opublikowane posty (nie draft)
            this.allPosts = posts.filter(post => post.status === 'published');
            this.allPosts.sort((a, b) => new Date(b.date) - new Date(a.date));
            this.filteredPosts = [...this.allPosts];
            this.renderPosts();
            this.renderPagination();
        } catch (error) {
            console.error('Błąd ładowania postów:', error);
        }
    }

    parseMarkdown(content, filename) {
        // Normalizuj końce linii do \n
        const normalizedContent = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
        
        // Obsługa front matter
        const frontMatterRegex = /^---\n([\s\S]*?)\n---/;
        const match = normalizedContent.match(frontMatterRegex);
        
        if (!match) {
            console.warn(`No front matter found in ${filename}`);
            console.log('Content preview:', normalizedContent.substring(0, 150));
            return null;
        }

        const frontMatter = match[1];
        const body = normalizedContent.replace(frontMatterRegex, '').trim();

        const post = {
            filename,
            body,
            gallery: [],
            features: [],
            tags: [],
            status: 'draft' // default status
        };

        let currentKey = null;
        let currentGalleryItem = null;

        frontMatter.split('\n').forEach(line => {
            const trimmed = line.trim();
            
            // Ignoruj puste linie
            if (!trimmed) return;
            
            // Klucz: wartość (np. title: "Tytuł")
            if (trimmed.includes(':') && !trimmed.startsWith('-')) {
                const colonIndex = trimmed.indexOf(':');
                const key = trimmed.substring(0, colonIndex).trim();
                let value = trimmed.substring(colonIndex + 1).trim();
                
                // Usuń cudzysłowy z początku i końca
                value = value.replace(/^["']|["']$/g, '');
                
                if (['gallery', 'features', 'tags'].includes(key)) {
                    currentKey = key;
                    post[key] = [];
                } else {
                    post[key] = value;
                    // NIE resetuj currentKey - może być multi-line array
                }
            } 
            // Element tablicy (np. - image: /path/to/img.jpg)
            else if (trimmed.startsWith('-')) {
                let value = trimmed.substring(1).trim();
                
                // Sprawdź czy to sub-property (np. - image: lub - alt:)
                if (value.includes(':')) {
                    const colonIdx = value.indexOf(':');
                    const subKey = value.substring(0, colonIdx).trim();
                    let subValue = value.substring(colonIdx + 1).trim();
                    subValue = subValue.replace(/^["']|["']$/g, '');
                    
                    if (currentKey === 'gallery') {
                        if (subKey === 'image') {
                            // Zawsze twórz nowy element galerii
                            currentGalleryItem = { image: subValue, alt: '' };
                            post.gallery.push(currentGalleryItem);
                        } else if (subKey === 'alt') {
                            // Dodaj alt do OSTATNIEGO elementu galerii (nie currentGalleryItem)
                            if (post.gallery.length > 0) {
                                post.gallery[post.gallery.length - 1].alt = subValue;
                            }
                        }
                    }
                } else {
                    // Prosty element tablicy (np. - tag1)
                    value = value.replace(/^["']|["']$/g, '');
                    
                    if (currentKey === 'features') {
                        post.features.push(value);
                    } else if (currentKey === 'tags') {
                        post.tags.push(value);
                    }
                }
            }
            // Właściwość bez myślnika w kontekście tablicy (np. "  alt: value" po "  - image:")
            else if (currentKey === 'gallery' && trimmed.includes(':')) {
                const colonIdx = trimmed.indexOf(':');
                const subKey = trimmed.substring(0, colonIdx).trim();
                let subValue = trimmed.substring(colonIdx + 1).trim();
                subValue = subValue.replace(/^["']|["']$/g, '');
                
                if (subKey === 'alt' && post.gallery.length > 0) {
                    // Dodaj alt do ostatniego elementu galerii
                    post.gallery[post.gallery.length - 1].alt = subValue;
                }
            }
        });

        console.log(`Parsed post: ${post.title}, status: ${post.status}, category: ${post.category}, gallery: ${post.gallery.length} items`);
        return post;
    }

    applyFilters() {
        let posts = [...this.allPosts];

        // Filtr kategorii
        if (this.currentFilter !== 'all') {
            posts = posts.filter(post => post.category === this.currentFilter);
        }

        // Wyszukiwarka
        if (this.searchQuery) {
            const query = this.searchQuery.toLowerCase();
            posts = posts.filter(post => {
                return post.title.toLowerCase().includes(query) ||
                       post.description.toLowerCase().includes(query) ||
                       post.content.toLowerCase().includes(query) ||
                       (post.tags && post.tags.some(tag => tag.toLowerCase().includes(query)));
            });
        }

        this.filteredPosts = posts;
        this.currentPage = 1;
        this.renderPosts();
        this.renderPagination();
    }

    renderPosts() {
        const grid = document.querySelector('.portfolio-grid');
        if (!grid) return;

        grid.innerHTML = '';

        const startIndex = (this.currentPage - 1) * this.postsPerPage;
        const endIndex = startIndex + this.postsPerPage;
        const postsToShow = this.filteredPosts.slice(startIndex, endIndex);

        if (postsToShow.length === 0) {
            grid.innerHTML = '<p style="text-align: center; padding: 3rem; color: var(--text); opacity: 0.7;">Nie znaleziono postów.</p>';
            return;
        }

        postsToShow.forEach(post => {
            const article = this.createPostElement(post);
            grid.appendChild(article);
        });

        this.updateFilterCounts();

        // Reinicjalizuj lightbox dla dynamicznie utworzonych galerii
        if (typeof initPortfolioGallery === 'function') {
            setTimeout(() => initPortfolioGallery(), 50);
        }
    }

    renderPagination() {
        const totalPages = Math.ceil(this.filteredPosts.length / this.postsPerPage);
        
        const oldPagination = document.querySelector('.pagination');
        if (oldPagination) oldPagination.remove();

        if (totalPages <= 1) return;

        const paginationDiv = document.createElement('div');
        paginationDiv.className = 'pagination';
        
        const prevBtn = document.createElement('button');
        prevBtn.className = 'pagination-btn';
        prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i> Poprzednia';
        prevBtn.disabled = this.currentPage === 1;
        prevBtn.onclick = () => this.changePage(this.currentPage - 1);
        paginationDiv.appendChild(prevBtn);

        const pageNumbers = document.createElement('div');
        pageNumbers.className = 'pagination-numbers';
        
        for (let i = 1; i <= totalPages; i++) {
            const pageBtn = document.createElement('button');
            pageBtn.className = `pagination-number ${i === this.currentPage ? 'active' : ''}`;
            pageBtn.textContent = i;
            pageBtn.onclick = () => this.changePage(i);
            pageNumbers.appendChild(pageBtn);
        }
        paginationDiv.appendChild(pageNumbers);

        const nextBtn = document.createElement('button');
        nextBtn.className = 'pagination-btn';
        nextBtn.innerHTML = 'Następna <i class="fas fa-chevron-right"></i>';
        nextBtn.disabled = this.currentPage === totalPages;
        nextBtn.onclick = () => this.changePage(this.currentPage + 1);
        paginationDiv.appendChild(nextBtn);

        const grid = document.querySelector('.portfolio-grid');
        grid.parentElement.appendChild(paginationDiv);
    }

    changePage(page) {
        this.currentPage = page;
        // Zapisz stronę w localStorage
        localStorage.setItem('blogCurrentPage', page);
        this.renderPosts();
        this.renderPagination();
        
        document.querySelector('.portfolio-section').scrollIntoView({ behavior: 'smooth' });
    }

    createPostElement(post) {
        const article = document.createElement('article');
        article.className = 'portfolio-item visible';
        article.dataset.category = post.category;

        const categoryLabel = {
            'realizacje': 'Realizacje',
            'porady': 'Porady',
            'pytania': 'Pytania'
        }[post.category] || post.category;

        let featuredImageHTML = '';
        if (post.featured_image) {
            featuredImageHTML = `
                <div class="portfolio-featured-image">
                    <img src="${post.featured_image}" alt="${post.title}" loading="lazy">
                </div>
            `;
        }

        let galleryHTML = '';
        if (post.gallery && post.gallery.length > 0) {
            const galleryCount = post.gallery.length;
            let galleryClass = 'portfolio-gallery';
            
            // Ogranicz do maksymalnie 4 zdjęć (grid 2x2)
            const galleryItems = post.gallery.slice(0, 4);
            
            console.log(`Post: ${post.title}, Gallery items: ${galleryCount} (showing ${galleryItems.length})`, post.gallery);
            
            // Dodaj klasę w zależności od liczby wyświetlanych elementów
            if (galleryItems.length === 3) {
                galleryClass += ' items-3';
            } else if (galleryItems.length === 2) {
                galleryClass += ' items-2';
            } else if (galleryItems.length === 1) {
                galleryClass += ' items-1';
            }
            // 4 zdjęcia = domyślny grid 2x2, nie trzeba dodawać klasy
            
            console.log(`Gallery class: ${galleryClass}`);
            
            galleryHTML = `
                <div class="${galleryClass}">
                    ${galleryItems.map((item, index) => {
                        // Sprawdź czy to video czy zdjęcie
                        const isVideo = item.image && (
                            item.image.toLowerCase().endsWith('.mp4') || 
                            item.image.toLowerCase().endsWith('.mov') ||
                            item.image.toLowerCase().endsWith('.webm')
                        );
                        
                        if (isVideo) {
                            return `<video src="${item.image}" controls muted preload="metadata" title="${item.alt || 'Video'}"></video>`;
                        } else {
                            return `<img src="${item.image}" alt="${item.alt}" loading="lazy">`;
                        }
                    }).join('')}
                </div>
            `;
        }

        let featuresHTML = '';
        if (post.features && post.features.length > 0) {
            featuresHTML = `
                <ul class="portfolio-features">
                    ${post.features.map(feature => `
                        <li><i class="fas fa-check"></i> ${feature}</li>
                    `).join('')}
                </ul>
            `;
        }

        let tagsHTML = '';
        if (post.tags && post.tags.length > 0) {
            tagsHTML = `
                <div class="post-tags">
                    ${post.tags.map(tag => `
                        <span class="tag"><i class="fas fa-tag"></i> ${tag}</span>
                    `).join('')}
                </div>
            `;
        }

        article.innerHTML = `
            <div class="portfolio-header">
                <div class="portfolio-meta">
                    <time datetime="${post.date}">${this.formatDate(post.date)}</time>
                    <span class="portfolio-category">${categoryLabel}</span>
                </div>
                <h3>${post.title}</h3>
                ${post.author ? `<p class="post-author"><i class="fas fa-user"></i> ${post.author}</p>` : ''}
            </div>
            
            ${featuredImageHTML}
            ${galleryHTML}
            
            <div class="portfolio-content">
                <p>${post.description || post.content}</p>
                ${featuresHTML}
                ${tagsHTML}
                
                <div class="share-buttons">
                    <span class="share-label">Udostępnij:</span>
                    <button class="share-btn facebook" data-share="facebook" title="Udostępnij na Facebooku">
                        <i class="fab fa-facebook-f"></i>
                    </button>
                    <button class="share-btn whatsapp" data-share="whatsapp" title="Wyślij przez WhatsApp">
                        <i class="fab fa-whatsapp"></i>
                    </button>
                    <button class="share-btn email" data-share="email" title="Wyślij emailem">
                        <i class="fas fa-envelope"></i>
                    </button>
                    <button class="share-btn copy" data-share="copy" title="Kopiuj link">
                        <i class="fas fa-link"></i>
                    </button>
                </div>
            </div>
        `;

        return article;
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const months = [
            'Stycznia', 'Lutego', 'Marca', 'Kwietnia', 'Maja', 'Czerwca',
            'Lipca', 'Sierpnia', 'Września', 'Października', 'Listopada', 'Grudnia'
        ];
        return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
    }

    updateFilterCounts() {
        const counts = {
            all: this.allPosts.length,
            realizacje: this.allPosts.filter(p => p.category === 'realizacje').length,
            porady: this.allPosts.filter(p => p.category === 'porady').length,
            pytania: this.allPosts.filter(p => p.category === 'pytania').length
        };

        document.querySelectorAll('.filter-btn').forEach(btn => {
            const filter = btn.dataset.filter;
            const countSpan = btn.querySelector('.count');
            if (countSpan && counts[filter] !== undefined) {
                countSpan.textContent = counts[filter];
            }
        });
    }

    setupFilters() {
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                this.currentFilter = btn.dataset.filter;
                this.applyFilters();
            });
        });
    }

    setupSearch() {
        const filtersDiv = document.querySelector('.portfolio-filters');
        if (!filtersDiv) return;

        const searchBox = document.createElement('div');
        searchBox.className = 'search-box';
        searchBox.innerHTML = `
            <input type="text" id="blogSearch" placeholder="🔍 Szukaj postów..." class="search-input">
        `;
        
        filtersDiv.parentElement.insertBefore(searchBox, filtersDiv);

        const searchInput = document.getElementById('blogSearch');
        searchInput.addEventListener('input', (e) => {
            this.searchQuery = e.target.value;
            this.applyFilters();
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.portfolio-grid')) {
        const blogManager = new BlogManager();
        blogManager.setupFilters();
        blogManager.setupSearch();
        blogManager.loadPosts();
    }
});
