/* =========================================================
   Sabrina Asha – Portfolio scripts
   ========================================================= */

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- Mobile menu ---------- */
const navMenu = document.getElementById('nav-menu');
const navToggle = document.getElementById('nav-toggle');

function setMenu(open) {
    navMenu.classList.toggle('show', open);
    navToggle.classList.toggle('active', open);
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    document.body.classList.toggle('menu-open', open);
}

navToggle.addEventListener('click', () => setMenu(!navMenu.classList.contains('show')));
document.querySelectorAll('.nav__link').forEach(link => link.addEventListener('click', () => setMenu(false)));
document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
        setMenu(false);
        closeLightbox();
    }
});

/* ---------- Header, progress bar, scroll-up, active link ---------- */
const header = document.getElementById('header');
const progressBar = document.getElementById('scroll-progress-bar');
const scrollUp = document.getElementById('scroll-up');
const sections = document.querySelectorAll('main section[id]');
const navLinks = document.querySelectorAll('.nav__link');

function onScroll() {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;

    header.classList.toggle('scrolled', y > 40);
    scrollUp.classList.toggle('show', y > 500);
    progressBar.style.width = (max > 0 ? (y / max) * 100 : 0) + '%';

    let current = 'home';
    sections.forEach(section => {
        if (y >= section.offsetTop - window.innerHeight * 0.35) current = section.id;
    });
    // at the very bottom, highlight the last section
    if (y >= max - 4) current = sections[sections.length - 1].id;

    navLinks.forEach(link => {
        link.classList.toggle('active-link', link.getAttribute('href') === '#' + current);
    });
}

window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

/* ---------- Typing effect ---------- */
const typedEl = document.getElementById('typed');
const roles = ['Information System', 'Web Development', 'System Development', 'App Development', 'Video Editing'];

if (typedEl && !prefersReducedMotion) {
    let roleIndex = 0;
    let charIndex = roles[0].length;
    let deleting = true;

    function typeLoop() {
        const word = roles[roleIndex];
        typedEl.textContent = word.slice(0, charIndex);

        let delay = deleting ? 45 : 85;

        if (deleting) {
            charIndex--;
            if (charIndex < 0) {
                deleting = false;
                roleIndex = (roleIndex + 1) % roles.length;
                charIndex = 0;
                delay = 300;
            }
        } else {
            charIndex++;
            if (charIndex > roles[roleIndex].length) {
                deleting = true;
                charIndex = roles[roleIndex].length;
                delay = 1800;
            }
        }
        setTimeout(typeLoop, delay);
    }

    setTimeout(typeLoop, 2200);
}

/* ---------- Scroll reveal ---------- */
const revealEls = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window && !prefersReducedMotion) {
    const revealObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach(el => revealObserver.observe(el));
} else {
    revealEls.forEach(el => el.classList.add('in-view'));
}

/* ---------- Custom cursor (desktop only) ---------- */
const cursor = document.getElementById('cursor');
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

if (cursor && finePointer) {
    let x = 0, y = 0, cx = 0, cy = 0;

    window.addEventListener('mousemove', e => {
        x = e.clientX;
        y = e.clientY;
        cursor.classList.add('is-visible');
    });
    document.addEventListener('mouseleave', () => cursor.classList.remove('is-visible'));

    function follow() {
        cx += (x - cx) * 0.2;
        cy += (y - cy) * 0.2;
        cursor.style.left = cx + 'px';
        cursor.style.top = cy + 'px';
        requestAnimationFrame(follow);
    }
    follow();

    document.addEventListener('mouseover', e => {
        cursor.classList.toggle('is-hover', !!e.target.closest('a, button, .skill, input, textarea'));
    });
}

/* ---------- Projects ("View My Work") slider ---------- */
function initWorkSwiper() {
    const el = document.querySelector('.work__swiper');
    const dotsWrap = document.getElementById('work-pagination');
    if (!el || typeof Swiper === 'undefined') return;

    const wrapper = el.querySelector('.swiper-wrapper');
    const originals = Array.from(wrapper.children);
    const count = originals.length;

    // Loop mode needs more slides than are on screen, so repeat the
    // projects (hidden from screen readers) until there are at least 6.
    let copies = 0;
    while (wrapper.children.length < 6) {
        originals.forEach(slide => {
            const clone = slide.cloneNode(true);
            clone.setAttribute('aria-hidden', 'true');
            clone.querySelectorAll('a, button').forEach(a => a.setAttribute('tabindex', '-1'));
            wrapper.appendChild(clone);
        });
        if (++copies > 6) break;
    }

    // One dot per real project
    const dots = originals.map((slide, i) => {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'work__dot';
        const title = slide.querySelector('.work__title');
        dot.setAttribute('aria-label', 'Show project ' + (i + 1) + (title ? ': ' + title.textContent : ''));
        dotsWrap.appendChild(dot);
        return dot;
    });

    const swiper = new Swiper(el, {
        slidesPerView: 1,
        spaceBetween: 20,
        loop: true,
        grabCursor: true,
        speed: prefersReducedMotion ? 0 : 600,
        keyboard: { enabled: true, onlyInViewport: true },
        a11y: { enabled: true },
        breakpoints: {
            640: { slidesPerView: 2, spaceBetween: 24, centeredSlides: false },
            1025: { slidesPerView: 3, spaceBetween: 28, centeredSlides: true }
        }
    });

    function updateDots() {
        const current = swiper.realIndex % count;
        dots.forEach((dot, i) => dot.setAttribute('aria-current', String(i === current)));
    }

    dots.forEach((dot, i) => dot.addEventListener('click', () => {
        // jump to the nearest copy of that project
        const real = swiper.realIndex;
        const target = real - (real % count) + i;
        swiper.slideToLoop(target);
    }));

    swiper.on('slideChange', updateDots);
    updateDots();
}

initWorkSwiper();

/* ---------- Certifications slider ---------- */
if (typeof Swiper !== 'undefined') {
    new Swiper('.certs__swiper', {
        slidesPerView: 1.1,
        spaceBetween: 20,
        grabCursor: true,
        navigation: { nextEl: '.certs-next', prevEl: '.certs-prev' },
        pagination: { el: '.certs-pagination', clickable: true },
        breakpoints: {
            640: { slidesPerView: 2, spaceBetween: 24 },
            1024: { slidesPerView: 3, spaceBetween: 28 }
        }
    });
}

/* ---------- Lightbox for certificates ---------- */
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
let lastFocused = null;

function openLightbox(src, alt) {
    lastFocused = document.activeElement;
    lightboxImg.src = src;
    lightboxImg.alt = alt;
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.classList.add('menu-open');
    document.getElementById('lightbox-close').focus();
}

function closeLightbox() {
    if (!lightbox.classList.contains('open')) return;
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('menu-open');
    if (lastFocused) lastFocused.focus();
}

document.querySelectorAll('[data-lightbox]').forEach(btn => {
    btn.addEventListener('click', () => {
        const img = btn.querySelector('img');
        openLightbox(btn.dataset.lightbox, img ? img.alt : '');
    });
});
document.getElementById('lightbox-close').addEventListener('click', closeLightbox);
lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });

/* ---------- Instagram reels ---------- */
// Used if data/instagram-content.json can't be loaded (e.g. opening index.html straight from your computer)
const fallbackReels = [
    'DVI3suUE2zn', 'DVf8H3hvwcd', 'DVvXxSvD56w', 'DWX73M6PfPX',
    'DWiRQFpPIAC', 'DWk1fo3v_q_', 'DXeB7Q4TtNx', 'DXgmpZ6zVQ_',
    'DcPwCrUzMRf', 'DcU-_bwTQTE', 'DcXhBvQTWzZ', 'DccrBduzax-'
].map(id => ({ url: `https://www.instagram.com/reel/${id}/` }));

function escapeHtml(value = '') {
    return String(value).replace(/[&<>"']/g, c => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
}

function renderReels(reels) {
    const wrapper = document.getElementById('reels-wrapper');
    if (!wrapper) return;

    wrapper.innerHTML = reels.map(reel => {
        const url = escapeHtml(reel.url);
        return `
            <div class="swiper-slide">
                <div class="reel">
                    <blockquote class="instagram-media" data-instgrm-permalink="${url}" data-instgrm-version="14">
                        <div class="reel__placeholder">
                            <i class="ri-instagram-line"></i>
                            <span>Loading reel…</span>
                            <a href="${url}" target="_blank" rel="noopener">Watch on Instagram</a>
                        </div>
                    </blockquote>
                </div>
            </div>`;
    }).join('');

    if (typeof Swiper !== 'undefined') {
        new Swiper('.reels__swiper', {
            slidesPerView: 'auto',
            spaceBetween: 20,
            grabCursor: true,
            watchOverflow: true,
            navigation: { nextEl: '.reels-next', prevEl: '.reels-prev' },
            pagination: { el: '.reels-pagination', clickable: true, dynamicBullets: true }
        });
    }

    processInstagram();
}

// Instagram's script loads async, so keep trying briefly until it's ready
function processInstagram(attempt = 0) {
    if (window.instgrm && window.instgrm.Embeds) {
        window.instgrm.Embeds.process();
    } else if (attempt < 40) {
        setTimeout(() => processInstagram(attempt + 1), 250);
    }
}

async function loadReels() {
    try {
        const res = await fetch('data/instagram-content.json');
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const data = await res.json();
        const reels = Array.isArray(data) ? data : data.videos;
        renderReels(reels && reels.length ? reels : fallbackReels);
    } catch (err) {
        console.warn('Using fallback reel list:', err);
        renderReels(fallbackReels);
    }
}

loadReels();

/* ---------- Toast ---------- */
const toast = document.getElementById('toast');
let toastTimer;

function showToast(message) {
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
}

/* ---------- Copy email ---------- */
const copyBtn = document.getElementById('copy-email');
if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
        const email = copyBtn.dataset.email;
        try {
            await navigator.clipboard.writeText(email);
            showToast('Email copied: ' + email);
        } catch {
            window.location.href = 'mailto:' + email;
        }
    });
}

/* ---------- Contact form (opens email app) ---------- */
const form = document.getElementById('contact-form');
const formError = document.getElementById('form-error');

if (form) {
    form.addEventListener('submit', e => {
        e.preventDefault();
        // note: form.name is the form's own name attribute, so read inputs by id
        const nameInput = document.getElementById('cf-name');
        const emailInput = document.getElementById('cf-email');
        const messageInput = document.getElementById('cf-message');
        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
        const message = messageInput.value.trim();

        [nameInput, emailInput, messageInput].forEach(f => f.classList.remove('invalid'));

        const missing = [];
        if (!name) missing.push(nameInput);
        if (!/^\S+@\S+\.\S+$/.test(email)) missing.push(emailInput);
        if (!message) missing.push(messageInput);

        if (missing.length) {
            missing.forEach(f => f.classList.add('invalid'));
            formError.textContent = 'Fill in your name, a valid email and a message.';
            missing[0].focus();
            return;
        }

        formError.textContent = '';
        const subject = encodeURIComponent(`Portfolio enquiry from ${name}`);
        const body = encodeURIComponent(`${message}\n\n${name}\n${email}`);
        window.location.href = `mailto:sbrnasha@gmail.com?subject=${subject}&body=${body}`;
        showToast('Opening your email app…');
    });
}

/* ---------- Footer year ---------- */
document.getElementById('year').textContent = new Date().getFullYear();
