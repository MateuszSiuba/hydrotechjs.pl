const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const POSTS_DIR = path.join(ROOT, 'posts');
const MANIFEST_PATH = path.join(POSTS_DIR, 'posts.json');
const SITE_URL = 'https://hydrotechjs.pl';

const readJson = (filePath) => JSON.parse(fs.readFileSync(filePath, 'utf-8'));

const normalizeNewlines = (content) => content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

const parseFrontMatter = (content) => {
    const normalized = normalizeNewlines(content);
    const frontMatterRegex = /^---\n([\s\S]*?)\n---/;
    const match = normalized.match(frontMatterRegex);

    if (!match) return null;

    const frontMatter = match[1];
    const body = normalized.replace(frontMatterRegex, '').trim();

    const post = {
        body,
        gallery: [],
        features: [],
        tags: [],
        status: 'draft'
    };

    let currentKey = null;
    let lastScalarKey = null;

    frontMatter.split('\n').forEach(line => {
        const trimmed = line.trim();
        if (!trimmed) return;

        if (trimmed.includes(':') && !trimmed.startsWith('-')) {
            const colonIndex = trimmed.indexOf(':');
            const key = trimmed.substring(0, colonIndex).trim();
            let value = trimmed.substring(colonIndex + 1).trim();

            value = value.replace(/^["']|["']$/g, '');

            if (['gallery', 'features', 'tags'].includes(key)) {
                currentKey = key;
                lastScalarKey = null;
                post[key] = [];
            } else {
                post[key] = value;
                lastScalarKey = key;
            }
            return;
        }

        if (trimmed.startsWith('-')) {
            let value = trimmed.substring(1).trim();

            if (value.includes(':')) {
                const colonIdx = value.indexOf(':');
                const subKey = value.substring(0, colonIdx).trim();
                let subValue = value.substring(colonIdx + 1).trim();
                subValue = subValue.replace(/^["']|["']$/g, '');

                if (currentKey === 'gallery') {
                    if (subKey === 'image') {
                        post.gallery.push({ image: subValue, alt: '' });
                    } else if (subKey === 'alt' && post.gallery.length > 0) {
                        post.gallery[post.gallery.length - 1].alt = subValue;
                    }
                }
            } else {
                value = value.replace(/^["']|["']$/g, '');
                if (currentKey === 'features') post.features.push(value);
                if (currentKey === 'tags') post.tags.push(value);
            }
            return;
        }

        if (currentKey === 'gallery' && trimmed.includes(':')) {
            const colonIdx = trimmed.indexOf(':');
            const subKey = trimmed.substring(0, colonIdx).trim();
            let subValue = trimmed.substring(colonIdx + 1).trim();
            subValue = subValue.replace(/^["']|["']$/g, '');
            if (subKey === 'alt' && post.gallery.length > 0) {
                post.gallery[post.gallery.length - 1].alt = subValue;
            }
            return;
        }

        if (lastScalarKey && !currentKey) {
            post[lastScalarKey] = `${post[lastScalarKey]} ${trimmed}`.trim();
        }
    });

    return post;
};

const formatDate = (dateString) => {
    const date = new Date(dateString);
    const months = [
        'Stycznia', 'Lutego', 'Marca', 'Kwietnia', 'Maja', 'Czerwca',
        'Lipca', 'Sierpnia', 'Września', 'Października', 'Listopada', 'Grudnia'
    ];
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
};

const markdownToHTML = (markdown) => {
    if (!markdown) return '';

    let html = markdown
        .replace(/^### (.*?)$/gm, '<h3>$1</h3>')
        .replace(/^## (.*?)$/gm, '<h2>$1</h2>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
        .replace(/^- (.*?)$/gm, '<li>$1</li>')
        .replace(/✅/g, '<span style="color: #22c55e;">✅</span>')
        .replace(/❌/g, '<span style="color: #ef4444;">❌</span>')
        .replace(/🔵/g, '<span style="font-size: 1.2em;">🔵</span>')
        .replace(/💡/g, '<span style="color: #f59e0b; font-size: 1.2em;">💡</span>')
        .replace(/⚠️/g, '<span style="color: #ef4444; font-size: 1.2em;">⚠️</span>')
        .replace(/💰/g, '<span style="color: #10b981; font-size: 1.2em;">💰</span>')
        .replace(/\n\n/g, '</p><p>');

    html = html.replace(/(<li>.*?<\/li>\s*)+/gs, '<ul class="markdown-list">$&</ul>');

    if (!html.startsWith('<h') && !html.startsWith('<ul')) {
        html = `<p>${html}</p>`;
    }

    return html;
};

const buildResponsiveImage = (imagePath, altText) => {
    if (!imagePath) return '';
    const lower = imagePath.toLowerCase();
    if (lower.endsWith('.webp') || lower.endsWith('.avif')) {
        return `<img src="${imagePath}" alt="${altText}" loading="lazy">`;
    }

    const basePath = imagePath.replace(/\.(\w+)(\?.*)?$/, '');
    const sizes = [480, 768, 1200];
    const avifSrcset = sizes.map(size => `${encodeURI(`${basePath}-${size}.avif`)} ${size}w`).join(', ');
    const webpSrcset = sizes.map(size => `${encodeURI(`${basePath}-${size}.webp`)} ${size}w`).join(', ');

    return `
        <picture>
            <source type="image/avif" srcset="${avifSrcset}" sizes="(max-width: 768px) 100vw, 1200px">
            <source type="image/webp" srcset="${webpSrcset}" sizes="(max-width: 768px) 100vw, 1200px">
            <img src="${imagePath}" alt="${altText}" loading="lazy">
        </picture>
    `;
};

const buildArticleSchema = (post, url) => ({
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": post.title || 'Wpis blogowy',
    "datePublished": post.date || undefined,
    "dateModified": post.date || undefined,
    "author": {
        "@type": "Organization",
        "name": post.author || 'HydroTech J&S'
    },
    "publisher": {
        "@type": "Organization",
        "name": 'HydroTech J&S',
        "logo": {
            "@type": "ImageObject",
            "url": `${SITE_URL}/images/og-image.jpg`
        }
    },
    "image": post.featured_image || undefined,
    "description": post.seo_description || post.description || undefined,
    "mainEntityOfPage": url
});

const renderPostHTML = (post, filename) => {
    const htmlFile = filename.replace(/\.md$/i, '.html');
    const url = `${SITE_URL}/posts/${htmlFile}`;
    const title = post.title ? `${post.title} | HydroTech J&S` : 'Wpis blogowy | HydroTech J&S';
    const description = post.seo_description || post.description || 'Wpis blogowy HydroTech J&S.';
    const image = post.featured_image || (post.gallery && post.gallery[0] && post.gallery[0].image) || `${SITE_URL}/images/blog-og.jpg`;

    const categoryLabel = {
        'realizacje': 'Realizacje',
        'porady': 'Porady',
        'pytania': 'Pytania'
    }[post.category] || post.category || '';

    const featuredImageHTML = post.featured_image ? `
        <div class="portfolio-featured-image">
            ${buildResponsiveImage(post.featured_image, post.title || '')}
        </div>
    ` : '';

    const galleryHTML = post.gallery && post.gallery.length > 0 ? `
        <div class="portfolio-gallery">
            ${post.gallery.map(item => {
                const isVideo = item.image && (
                    item.image.toLowerCase().endsWith('.mp4') ||
                    item.image.toLowerCase().endsWith('.mov') ||
                    item.image.toLowerCase().endsWith('.webm')
                );
                if (isVideo) {
                    return `<video src="${item.image}" controls muted preload="metadata" title="${item.alt || 'Video'}"></video>`;
                }
                return buildResponsiveImage(item.image, item.alt || '');
            }).join('')}
        </div>
    ` : '';

    const featuresHTML = post.features && post.features.length > 0 ? `
        <ul class="portfolio-features">
            ${post.features.map(feature => `<li><i class="fas fa-check"></i> ${feature}</li>`).join('')}
        </ul>
    ` : '';

    const tagsHTML = post.tags && post.tags.length > 0 ? `
        <div class="post-tags">
            ${post.tags.map(tag => `<span class="tag"><i class="fas fa-tag"></i> ${tag}</span>`).join('')}
        </div>
    ` : '';

    const relatedHTML = `
        <div class="post-related-links">
            <h2>Powiązane usługi</h2>
            <div class="related-grid">
                <a class="related-card" href="../uslugi.html">
                    <h3>Zobacz usługi</h3>
                    <p>Pełna oferta usług hydraulicznych i CO.</p>
                </a>
                <a class="related-card" href="../kontakt.html">
                    <h3>Poproś o wycenę</h3>
                    <p>Szybki kontakt i bezpłatna wycena.</p>
                </a>
                <a class="related-card" href="../blog.html">
                    <h3>Więcej realizacji</h3>
                    <p>Zobacz pozostałe wpisy i porady.</p>
                </a>
            </div>
        </div>
    `;

    const bodyHTML = markdownToHTML(post.body || post.description || '');

    const schema = JSON.stringify(buildArticleSchema(post, url));

    return `<!DOCTYPE html>
<html lang="pl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>${title}</title>
    <meta name="title" content="${title}">
    <meta name="description" content="${description}">
    <meta name="author" content="HydroTech J&S">
    <meta name="robots" content="index, follow, max-image-preview:large">
    <meta name="language" content="Polish">

    <meta property="og:type" content="article">
    <meta property="og:url" content="${url}">
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${description}">
    <meta property="og:image" content="${image}">

    <meta property="twitter:card" content="summary_large_image">
    <meta property="twitter:title" content="${title}">
    <meta property="twitter:description" content="${description}">
    <meta property="twitter:image" content="${image}">

    <link rel="canonical" href="${url}">

    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="stylesheet" href="../style.css?v=3.0">
    <link rel="stylesheet" href="../podstrony.css?v=3.0">
    <link rel="stylesheet" href="../blog-markdown.css?v=1.1">

    <script type="application/ld+json">${schema}</script>
</head>
<body>
    <div class="cookie-container">
        <div class="cookie-content">
            <h3>🍪 Ustawienia prywatności</h3>
            <p>Używamy plików cookies do poprawnego działania strony. Wybierz jedną z opcji:</p>
            <div class="cookie-buttons">
                <button class="cookie-accept">Zaakceptuj wszystkie</button>
                <button class="cookie-reject">Odrzuć nieistotne</button>
            </div>
        </div>
    </div>

    <button class="scroll-top"><i class="fas fa-chevron-up"></i></button>
    <button class="theme-toggle" aria-label="Przełącz tryb ciemny"><i class="fas fa-moon"></i></button>

    <header class="main-header">
        <div class="header-wrapper">
            <div class="logo">Hydro<span>Tech J&S</span></div>
            <nav>
                <ul class="nav-menu">
                    <li><a href="../index.html"><i class="fas fa-home"></i> Strona Główna</a></li>
                    <li><a href="../uslugi.html"><i class="fas fa-tools"></i> Usługi</a></li>
                    <li><a href="../blog.html" class="active"><i class="fas fa-newspaper"></i> Blog</a></li>
                    <li><a href="../kontakt.html"><i class="fas fa-phone"></i> Kontakt</a></li>
                </ul>
            </nav>
        </div>
    </header>

    <nav class="breadcrumbs" aria-label="Nawigacja okruszkowa">
        <div class="container">
            <a href="../index.html"><i class="fas fa-home"></i> Strona główna</a>
            <span class="separator">/</span>
            <a href="../blog.html">Blog</a>
            <span class="separator">/</span>
            <span class="current">${post.title || 'Wpis'}</span>
        </div>
    </nav>

    <main>
        <section class="portfolio-section">
            <div class="section-container">
                <article class="portfolio-item visible">
                    <div class="portfolio-header">
                        <div class="portfolio-meta">
                            ${post.date ? `<time datetime="${post.date}">${formatDate(post.date)}</time>` : ''}
                            ${categoryLabel ? `<span class="portfolio-category">${categoryLabel}</span>` : ''}
                        </div>
                        <h1>${post.title || 'Wpis blogowy'}</h1>
                        ${post.author ? `<p class="post-author"><i class="fas fa-user"></i> ${post.author}</p>` : ''}
                    </div>
                    ${featuredImageHTML}
                    ${galleryHTML}
                    <div class="portfolio-content">
                        <div class="post-body">${bodyHTML}</div>
                        ${featuresHTML}
                        ${tagsHTML}
                        ${relatedHTML}
                    </div>
                </article>
            </div>
        </section>
    </main>

    <footer class="main-footer">
        <div class="footer-content">
            <div class="footer-section">
                <h4>HydroTech J&S</h4>
                <p>&copy; 2025 Wszystkie prawa zastrzeżone</p>
            </div>
            <div class="footer-section">
                <h4>Nawigacja</h4>
                <ul>
                    <li><a href="#">Polityka prywatności</a></li>
                    <li><a href="#">Regulamin</a></li>
                </ul>
            </div>
            <div class="footer-section">
                <h4>Social Media</h4>
                <div class="social-media">
                    <a href="https://www.facebook.com/p/HydroTech-JS-61573979556456/" target="_blank" rel="noopener noreferrer" class="social-link">
                        <i class="fab fa-facebook-f"></i>
                        Facebook
                    </a>
                    <a href="https://maps.app.goo.gl/wwdWoJdQHAHkjxen9" target="_blank" rel="noopener noreferrer" class="social-link">
                        <i class="fab fa-google"></i>
                        Google
                    </a>
                </div>
                <div class="company-info">
                    <p>NIP: 599-253-80-52</p>
                </div>
            </div>
        </div>
        <div class="footer-bottom">
            <p class="developer-credit">Wykonanie strony: <a href="https://github.com/MateuszSiuba" target="_blank" rel="noopener noreferrer">Mateusz Siuba</a></p>
        </div>
    </footer>

    <script src="../script.js?v=3.0"></script>
</body>
</html>`;
};

const generate = () => {
    const manifest = readJson(MANIFEST_PATH);

    manifest.forEach(entry => {
        const filename = entry.file || entry.filename || entry;
        const filePath = path.join(POSTS_DIR, filename);
        if (!fs.existsSync(filePath)) return;

        const content = fs.readFileSync(filePath, 'utf-8');
        const post = parseFrontMatter(content);
        if (!post || post.status !== 'published') return;

        const html = renderPostHTML(post, filename);
        const htmlFile = filename.replace(/\.md$/i, '.html');
        const outputPath = path.join(POSTS_DIR, htmlFile);
        fs.writeFileSync(outputPath, html, 'utf-8');
    });

    console.log('Static post pages generated.');
};

generate();
