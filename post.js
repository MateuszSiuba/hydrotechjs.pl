const getQueryParam = (key) => {
    const params = new URLSearchParams(window.location.search);
    return params.get(key);
};

const setMeta = (name, content) => {
    const meta = document.querySelector(`meta[name="${name}"]`);
    if (meta) meta.setAttribute('content', content);
};

const setPropertyMeta = (property, content) => {
    const meta = document.querySelector(`meta[property="${property}"]`);
    if (meta) meta.setAttribute('content', content);
};

const setCanonical = (url) => {
    const link = document.querySelector('link[rel="canonical"]');
    if (link) link.setAttribute('href', url);
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

const parseMarkdown = (content, filename) => {
    const normalizedContent = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    const frontMatterRegex = /^---\n([\s\S]*?)\n---/;
    const match = normalizedContent.match(frontMatterRegex);
    if (!match) return null;

    const frontMatter = match[1];
    const body = normalizedContent.replace(frontMatterRegex, '').trim();

    const post = {
        filename,
        body,
        gallery: [],
        features: [],
        tags: [],
        status: 'draft'
    };

    let currentKey = null;

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
                post[key] = [];
            } else {
                post[key] = value;
            }
        } else if (trimmed.startsWith('-')) {
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
        } else if (currentKey === 'gallery' && trimmed.includes(':')) {
            const colonIdx = trimmed.indexOf(':');
            const subKey = trimmed.substring(0, colonIdx).trim();
            let subValue = trimmed.substring(colonIdx + 1).trim();
            subValue = subValue.replace(/^["']|["']$/g, '');
            if (subKey === 'alt' && post.gallery.length > 0) {
                post.gallery[post.gallery.length - 1].alt = subValue;
            }
        }
    });

    return post;
};

const buildArticleSchema = (post, url) => {
    return {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": post.title || "Wpis blogowy",
        "datePublished": post.date || undefined,
        "dateModified": post.date || undefined,
        "author": {
            "@type": "Organization",
            "name": post.author || "HydroTech J&S"
        },
        "publisher": {
            "@type": "Organization",
            "name": "HydroTech J&S",
            "logo": {
                "@type": "ImageObject",
                "url": "https://hydrotechjs.pl/images/og-image.jpg"
            }
        },
        "image": post.featured_image || undefined,
        "description": post.description || undefined,
        "mainEntityOfPage": url
    };
};

const renderPost = (post, url) => {
    const container = document.getElementById('post-content');
    if (!container) return;

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
                <a class="related-card" href="uslugi.html">
                    <h3>Zobacz usługi</h3>
                    <p>Pełna oferta usług hydraulicznych i CO.</p>
                </a>
                <a class="related-card" href="kontakt.html">
                    <h3>Poproś o wycenę</h3>
                    <p>Szybki kontakt i bezpłatna wycena.</p>
                </a>
                <a class="related-card" href="blog.html">
                    <h3>Więcej realizacji</h3>
                    <p>Zobacz pozostałe wpisy i porady.</p>
                </a>
            </div>
        </div>
    `;

    container.innerHTML = `
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
                <div class="post-body">${markdownToHTML(post.body || post.description || '')}</div>
                ${featuresHTML}
                ${tagsHTML}
                ${relatedHTML}
            </div>
        </article>
    `;

    const breadcrumb = document.getElementById('post-breadcrumb');
    if (breadcrumb) breadcrumb.textContent = post.title || 'Wpis';

    const title = post.title ? `${post.title} | HydroTech J&S` : 'Wpis blogowy | HydroTech J&S';
    const description = post.seo_description || post.description || 'Wpis blogowy HydroTech J&S.';
    const image = post.featured_image || 'https://hydrotechjs.pl/images/blog-og.jpg';

    document.title = title;
    setMeta('title', title);
    setMeta('description', description);
    setPropertyMeta('og:title', title);
    setPropertyMeta('og:description', description);
    setPropertyMeta('og:image', image);
    setPropertyMeta('og:url', url);
    setPropertyMeta('twitter:title', title);
    setPropertyMeta('twitter:description', description);
    setPropertyMeta('twitter:image', image);
    setCanonical(url);

    const schemaScript = document.getElementById('post-jsonld');
    if (schemaScript) {
        schemaScript.textContent = JSON.stringify(buildArticleSchema(post, url));
    }
};

const initPostPage = async () => {
    const filename = getQueryParam('post');
    const container = document.getElementById('post-content');

    if (!filename) {
        if (container) container.innerHTML = '<p style="text-align:center; opacity:0.7;">Brak wskazanego wpisu.</p>';
        return;
    }

    try {
        const resp = await fetch(`/posts/${filename}`);
        if (!resp.ok) throw new Error('Nie można pobrać wpisu');
        const text = await resp.text();
        const post = parseMarkdown(text, filename);
        if (!post) throw new Error('Błędny format wpisu');

        const url = `${window.location.origin}/post.html?post=${encodeURIComponent(filename)}`;
        renderPost(post, url);
    } catch (error) {
        if (container) container.innerHTML = '<p style="text-align:center; opacity:0.7;">Nie udało się załadować wpisu.</p>';
        console.error(error);
    }
};

document.addEventListener('DOMContentLoaded', initPostPage);
