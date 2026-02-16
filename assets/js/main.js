/**
* Template Name: Medilab
* Template URL: https://bootstrapmade.com/medilab-free-medical-bootstrap-theme/
* Updated: Mar 17 2024 with Bootstrap v5.3.3
* Author: BootstrapMade.com
* License: https://bootstrapmade.com/license/
*/

(function() {
  "use strict";

  /**
   * Easy selector helper function
   */
  const select = (el, all = false) => {
    el = el.trim()
    if (all) {
      return [...document.querySelectorAll(el)]
    } else {
      return document.querySelector(el)
    }
  }

  /**
   * Easy event listener function
   */
  const on = (type, el, listener, all = false) => {
    let selectEl = select(el, all)
    if (selectEl) {
      if (all) {
        selectEl.forEach(e => e.addEventListener(type, listener))
      } else {
        selectEl.addEventListener(type, listener)
      }
    }
  }

  /**
   * Easy on scroll event listener 
   */
  const onscroll = (el, listener) => {
    el.addEventListener('scroll', listener)
  }

  /**
   * Navbar links active state on scroll
   */
  let navbarlinks = select('#navbar .scrollto', true)
  const navbarlinksActive = () => {
    let position = window.scrollY + 200
    navbarlinks.forEach(navbarlink => {
      if (!navbarlink.hash) return
      let section = select(navbarlink.hash)
      if (!section) return
      if (position >= section.offsetTop && position <= (section.offsetTop + section.offsetHeight)) {
        navbarlink.classList.add('active')
      } else {
        navbarlink.classList.remove('active')
      }
    })
  }
  window.addEventListener('load', navbarlinksActive)
  onscroll(document, navbarlinksActive)

  /**
   * Scrolls to an element with header offset
   */
  const scrollto = (el) => {
    let header = select('#header')
    let offset = header.offsetHeight

    let elementPos = select(el).offsetTop
    window.scrollTo({
      top: elementPos - offset,
      behavior: 'smooth'
    })
  }

  /**
   * Toggle .header-scrolled class to #header when page is scrolled
   */
  let selectHeader = select('#header')
  let selectTopbar = select('#topbar')
  if (selectHeader) {
    const headerScrolled = () => {
      if (window.scrollY > 100) {
        selectHeader.classList.add('header-scrolled')
        if (selectTopbar) {
          selectTopbar.classList.add('topbar-scrolled')
        }
      } else {
        selectHeader.classList.remove('header-scrolled')
        if (selectTopbar) {
          selectTopbar.classList.remove('topbar-scrolled')
        }
      }
    }
    window.addEventListener('load', headerScrolled)
    onscroll(document, headerScrolled)
  }

  /**
   * Back to top button
   */
  let backtotop = select('.back-to-top')
  if (backtotop) {
    const toggleBacktotop = () => {
      if (window.scrollY > 100) {
        backtotop.classList.add('active')
      } else {
        backtotop.classList.remove('active')
      }
    }
    window.addEventListener('load', toggleBacktotop)
    onscroll(document, toggleBacktotop)
  }

  /**
   * Mobile nav toggle
   */
  on('click', '.mobile-nav-toggle', function(e) {
    select('#navbar').classList.toggle('navbar-mobile')
    this.classList.toggle('bi-list')
    this.classList.toggle('bi-x')
  })

  /**
   * Mobile nav dropdowns activate
   */
  on('click', '.navbar .dropdown > a', function(e) {
    if (select('#navbar').classList.contains('navbar-mobile')) {
      e.preventDefault()
      this.nextElementSibling.classList.toggle('dropdown-active')
    }
  }, true)

  /**
   * Scrool with ofset on links with a class name .scrollto
   */
  on('click', '.scrollto', function(e) {
    if (select(this.hash)) {
      e.preventDefault()

      let navbar = select('#navbar')
      if (navbar.classList.contains('navbar-mobile')) {
        navbar.classList.remove('navbar-mobile')
        let navbarToggle = select('.mobile-nav-toggle')
        navbarToggle.classList.toggle('bi-list')
        navbarToggle.classList.toggle('bi-x')
      }
      scrollto(this.hash)
    }
  }, true)

  /**
   * Scroll with ofset on page load with hash links in the url
   */
  window.addEventListener('load', () => {
    if (window.location.hash) {
      if (select(window.location.hash)) {
        scrollto(window.location.hash)
      }
    }
  });

  /**
   * Preloader
   */
  let preloader = select('#preloader');
  if (preloader) {
    window.addEventListener('load', () => {
      preloader.remove()
    });
  }

  /**
   * Initiate glightbox 
   */
  const glightbox = GLightbox({
    selector: '.glightbox'
  });

  /**
   * Initiate Gallery Lightbox 
   */
  const galelryLightbox = GLightbox({
    selector: '.galelry-lightbox'
  });

  /**
   * Testimonials slider
   */
  new Swiper('.testimonials-slider', {
    speed: 600,
    loop: true,
    autoplay: {
      delay: 5000,
      disableOnInteraction: false
    },
    slidesPerView: 'auto',
    pagination: {
      el: '.swiper-pagination',
      type: 'bullets',
      clickable: true
    },
    breakpoints: {
      320: {
        slidesPerView: 1,
        spaceBetween: 20
      },

      1200: {
        slidesPerView: 2,
        spaceBetween: 20
      }
    }
  });

  /**
   * Initiate Pure Counter 
   */
  new PureCounter();

})()
/**
 * Medical News Section - Dynamic News Loading & Filter Functionality
 */
document.addEventListener('DOMContentLoaded', function() {
  const newsGrid = document.querySelector('.medical-news .news-grid');
  const filterChips = document.querySelectorAll('.medical-news .chip');

  // Load news from API
  loadMedicalNews();

  /**
   * Load medical news from backend API
   */
  async function loadMedicalNews() {
    if (!newsGrid) return;

    // Show loading state
    newsGrid.innerHTML = '<div class="loading-news"><p>Lade aktuelle medizinische News...</p></div>';

    try {
      console.log('Fetching news from API...');
      const response = await fetch('/api/get-news.php');

      console.log('Response status:', response.status);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const text = await response.text();
      console.log('Response text (first 200 chars):', text.substring(0, 200));

      const data = JSON.parse(text);

      if (data.error) {
        console.error('API returned error:', data.message);
        showError(data.message);
        return;
      }

      if (data.articles && data.articles.length > 0) {
        console.log('Rendering', data.articles.length, 'articles');
        renderNewsArticles(data.articles);
        initializeFilters();
      } else {
        showError('Keine News gefunden');
      }
    } catch (error) {
      console.error('Failed to load news:', error);
      showError('Fehler beim Laden der News: ' + error.message);
    }
  }

  /**
   * Render news articles in the grid
   */
  function renderNewsArticles(articles) {
    newsGrid.innerHTML = '';

    articles.forEach((article, index) => {
      const card = createNewsCard(article);
      newsGrid.appendChild(card);
    });
  }

  /**
   * Create a news card element
   */
  function createNewsCard(article) {
    const card = document.createElement('article');
    card.className = article.isFeatured ? 'news-card featured' : 'news-card';
    card.dataset.category = article.category;

    const publishDate = formatDate(article.publishedAt);
    const badges = createBadges(article);
    const imageHtml = article.imageUrl
      ? `<div class="card-image">
           <img src="${escapeHtml(article.imageUrl)}"
                alt="${escapeHtml(article.title)}"
                loading="lazy"
                onerror="this.style.display='none'; const placeholder = document.createElement('div'); placeholder.className = 'image-placeholder'; placeholder.innerHTML = '<i class=&quot;bi bi-newspaper&quot;></i>'; this.parentElement.classList.add('no-image'); this.parentElement.appendChild(placeholder);">
         </div>`
      : '<div class="card-image no-image"><div class="image-placeholder"><i class="bi bi-newspaper"></i></div></div>';

    card.innerHTML = `
      ${imageHtml}
      <div class="card-content">
        <div class="card-badge-group">
          ${badges}
        </div>
        <time class="card-date" datetime="${article.publishedAt}">${publishDate}</time>
        <h3 class="card-title">${escapeHtml(article.title)}</h3>
        <p class="card-description">${escapeHtml(article.description || '')}</p>
        <div class="card-meta">
          <span class="meta-source">
            <i class="bi bi-newspaper"></i>
            ${escapeHtml(article.source)}
          </span>
        </div>
        <a href="${escapeHtml(article.url)}" class="card-link" target="_blank" rel="noopener noreferrer" aria-label="${escapeHtml(article.title)} lesen">
          Mehr lesen <i class="bi bi-arrow-right"></i>
        </a>
      </div>
    `;

    return card;
  }

  /**
   * Create category badges
   */
  function createBadges(article) {
    const categoryLabels = {
      'digital-health': 'Digital Health',
      'gesundheitssystem': 'Gesundheitssystem',
      'medtech': 'MedTech',
      'ki-forschung': 'KI & Forschung'
    };

    let badges = '';

    if (article.isFeatured) {
      badges += '<span class="badge badge-hot">🔥 Hot</span>';
    }

    badges += `<span class="badge badge-category">${categoryLabels[article.category] || 'News'}</span>`;

    return badges;
  }

  /**
   * Format date in German
   */
  function formatDate(dateString) {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleDateString('de-DE', { month: 'long' });
    const year = date.getFullYear();

    return `${day}. ${month} ${year}`;
  }

  /**
   * Escape HTML to prevent XSS
   */
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Show error message
   */
  function showError(message) {
    newsGrid.innerHTML = `
      <div class="news-error">
        <i class="bi bi-exclamation-triangle"></i>
        <p>${escapeHtml(message)}</p>
      </div>
    `;
  }

  /**
   * Initialize filter functionality
   */
  function initializeFilters() {
    const newsCards = document.querySelectorAll('.medical-news .news-card');

    if (filterChips.length === 0 || newsCards.length === 0) return;

    filterChips.forEach(chip => {
      chip.addEventListener('click', function() {
        const filter = this.dataset.filter;

        // Update active chip
        filterChips.forEach(c => {
          c.classList.remove('active');
          c.setAttribute('aria-pressed', 'false');
        });
        this.classList.add('active');
        this.setAttribute('aria-pressed', 'true');

        // Filter cards with smooth animation
        newsCards.forEach(card => {
          const category = card.dataset.category;

          if (filter === 'all' || category === filter) {
            card.style.display = '';
            setTimeout(() => {
              card.style.opacity = '1';
              card.style.transform = 'scale(1)';
            }, 10);
          } else {
            card.style.opacity = '0';
            card.style.transform = 'scale(0.95)';
            setTimeout(() => {
              card.style.display = 'none';
            }, 300);
          }
        });
      });
    });

    // Initialize card transitions
    newsCards.forEach(card => {
      card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    });
  }
});
