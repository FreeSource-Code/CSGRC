/**
 * BENTHAM SCIENCE - CYBERSECURITY GRC BOOK CHAPTER CFP PORTAL
 * Master TypeScript Entrypoint
 */
import { InteractiveBookReader } from './book-interactive.js';
import { InteractiveCyberGlobe } from './globe.js';
document.addEventListener('DOMContentLoaded', () => {
    // Initialize the Interactive 3D Openable Book Engine
    window.bookReader = new InteractiveBookReader();
    initDeadlinesCountdown();
    initTopicFilter();
    initMobileNav();
    initSubmissionDrawer();
    initScrollSpy();
    initCopyButtons();
    initDirectEmailHelper();
    initCustomCursor();
    initCyberGlobeControls();
});
/* ==========================================================================
   Live Deadlines Countdown
   ========================================================================== */
function initDeadlinesCountdown() {
    const deadlines = {
        abstractSub: new Date('2026-10-31T23:59:59'),
        abstractAcc: new Date('2026-11-07T23:59:59'),
        chapterSub: new Date('2026-11-21T23:59:59'),
        chapterAcc: new Date('2026-12-05T23:59:59')
    };
    const daysEl = document.getElementById('count-days');
    const hoursEl = document.getElementById('count-hours');
    const minutesEl = document.getElementById('count-minutes');
    const secondsEl = document.getElementById('count-seconds');
    function update() {
        const now = new Date();
        const diff = deadlines.abstractSub.getTime() - now.getTime();
        if (diff > 0) {
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);
            if (daysEl)
                daysEl.textContent = String(days).padStart(2, '0');
            if (hoursEl)
                hoursEl.textContent = String(hours).padStart(2, '0');
            if (minutesEl)
                minutesEl.textContent = String(minutes).padStart(2, '0');
            if (secondsEl)
                secondsEl.textContent = String(seconds).padStart(2, '0');
        }
    }
    update();
    setInterval(update, 1000);
}
/* ==========================================================================
   Topic Search & Filter
   ========================================================================== */
function initTopicFilter() {
    const searchInput = document.getElementById('topic-search-input');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const val = e.target.value.toLowerCase().trim();
            const boxes = document.querySelectorAll('.topic-single-box');
            boxes.forEach(box => {
                const text = box.textContent?.toLowerCase() || '';
                box.style.display = text.includes(val) ? 'flex' : 'none';
            });
        });
    }
    window.toggleTopicsShelf = function (_category) {
        const shelf = document.getElementById('all-topics-shelf');
        if (shelf) {
            shelf.scrollIntoView({ behavior: 'smooth' });
        }
    };
}
/* ==========================================================================
   Submission Drawer & Form Handler
   ========================================================================== */
function initSubmissionDrawer() {
    const subModal = document.getElementById('submission-drawer-modal');
    const closeSubBtn = document.getElementById('close-sub-drawer');
    window.openSubmissionDrawer = function (topicNum, topicName) {
        const topicInput = document.getElementById('drawer-topic');
        if (topicInput)
            topicInput.value = `Topic ${topicNum}: ${topicName}`;
        if (subModal)
            subModal.classList.add('open');
    };
    if (closeSubBtn && subModal) {
        closeSubBtn.addEventListener('click', () => {
            subModal.classList.remove('open');
        });
    }
    const drawerForm = document.getElementById('drawer-submission-form');
    if (drawerForm) {
        drawerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const author = document.getElementById('drawer-author')?.value || '';
            const email = document.getElementById('drawer-email')?.value || '';
            const topic = document.getElementById('drawer-topic')?.value || '';
            const title = document.getElementById('drawer-title')?.value || '';
            const abstract = document.getElementById('drawer-abstract')?.value || '';
            const subject = encodeURIComponent(`Book Chapter Submission - ${topic} - ${title}`);
            const body = encodeURIComponent(`Respected Editorial Board,
Bentham Science Book: Cybersecurity Governance, Risk, and Compliance in the Age of AI

Author: ${author}
Email: ${email}
Chapter: ${topic}
Working Title: ${title}

Abstract Summary:
${abstract}

Compliance Statement:
1. Adheres to IEEE citation format.
2. Target full chapter length: 7,000 to 8,000 words.
3. Strict No-AI generation, <10% plagiarism threshold.

Thank you,
${author}`);
            // Direct Gmail Web Composer URL (Opens directly in browser, NOT in Outlook desktop app)
            const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=cgrc2027@gmail.com&su=${subject}&body=${body}`;
            // Auto-copy proposal to clipboard as reliable backup
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(decodeURIComponent(body)).catch(() => { });
            }
            const win = window.open(gmailUrl, '_blank');
            if (!win || win.closed || typeof win.closed === 'undefined') {
                window.location.href = `mailto:cgrc2027@gmail.com?subject=${subject}&body=${body}`;
            }
            if (subModal)
                subModal.classList.remove('open');
            showToast('Opening Gmail with your chapter proposal prefilled!');
        });
    }
}
/* ==========================================================================
   Direct Webmail / Gmail Launcher (Bypasses desktop Outlook)
   ========================================================================== */
function initDirectEmailHelper() {
    window.openDirectEmail = function (to = 'cgrc2027@gmail.com', subjectStr = 'Book Chapter Submission - Cybersecurity GRC', bodyStr = '') {
        const su = encodeURIComponent(subjectStr);
        const bo = encodeURIComponent(bodyStr);
        const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(to)}&su=${su}&body=${bo}`;
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(to).catch(() => { });
        }
        const win = window.open(gmailUrl, '_blank');
        if (!win || win.closed || typeof win.closed === 'undefined') {
            window.location.href = `mailto:${to}?subject=${su}&body=${bo}`;
        }
        showToast(`Opening Gmail for ${to}!`);
    };
}
/* ==========================================================================
   Poster Modal & Lightbox Support
   ========================================================================== */
function initPosterModal() {
    const modal = document.getElementById('poster-modal');
    const closeBtn = document.getElementById('close-poster-modal');
    if (closeBtn && modal) {
        closeBtn.addEventListener('click', () => modal.classList.remove('open'));
        modal.addEventListener('click', (e) => {
            if (e.target === modal)
                modal.classList.remove('open');
        });
    }
}
/* ==========================================================================
   Mobile Nav & Scroll to Top
   ========================================================================== */
function initMobileNav() {
    initPosterModal();
    const mobileToggle = document.getElementById('mobile-nav-toggle');
    const navLinks = document.getElementById('nav-links');
    if (mobileToggle && navLinks) {
        mobileToggle.addEventListener('click', () => {
            const isVisible = navLinks.style.display === 'flex';
            navLinks.style.display = isVisible ? 'none' : 'flex';
        });
    }
    const topBtn = document.getElementById('scroll-to-top');
    if (topBtn) {
        topBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
}
function initScrollSpy() {
    // Sticky shadow indicator
    const header = document.querySelector('.site-header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 20) {
            header?.classList.add('scrolled');
        }
        else {
            header?.classList.remove('scrolled');
        }
    });
}
/* ==========================================================================
   Clipboard Copy Helper
   ========================================================================== */
function initCopyButtons() {
    window.copyTextToClipboard = function (text, label = 'Email') {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(() => {
                showToast(`Copied ${label}: ${text}`);
            }).catch(() => {
                fallbackCopy(text, label);
            });
        }
        else {
            fallbackCopy(text, label);
        }
    };
    function fallbackCopy(text, label) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
            document.execCommand('copy');
            showToast(`Copied ${label}: ${text}`);
        }
        catch {
            showToast(`Please manually copy: ${text}`);
        }
        document.body.removeChild(textArea);
    }
}
function showToast(message) {
    let toast = document.getElementById('app-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'app-toast';
        toast.className = 'toast-notice';
        document.body.appendChild(toast);
    }
    toast.innerHTML = `<span>✓ ${message}</span>`;
    toast.classList.add('show');
    setTimeout(() => {
        toast?.classList.remove('show');
    }, 3500);
}
/* ==========================================================================
   Custom Interactive Cursor (Smooth trailing ring & scaling)
   ========================================================================== */
function initCustomCursor() {
    if (window.matchMedia('(pointer: coarse)').matches)
        return;
    const dot = document.createElement('div');
    dot.className = 'custom-cursor-dot';
    const ring = document.createElement('div');
    ring.className = 'custom-cursor-ring';
    document.body.appendChild(dot);
    document.body.appendChild(ring);
    let mouseX = -100;
    let mouseY = -100;
    let ringX = -100;
    let ringY = -100;
    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        dot.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
    });
    function renderRing() {
        ringX += (mouseX - ringX) * 0.18;
        ringY += (mouseY - ringY) * 0.18;
        ring.style.transform = `translate(${ringX}px, ${ringY}px)`;
        requestAnimationFrame(renderRing);
    }
    requestAnimationFrame(renderRing);
    const interactives = document.querySelectorAll('a, button, input, textarea, .topic-single-box, .cluster-card, .editorial-member-card, .book-open-cta-pro, .hero-3d-book-cover');
    interactives.forEach(el => {
        el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
        el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
    });
}
/* ==========================================================================
   Interactive 3D Cyber Globe
   ========================================================================== */
function initCyberGlobeControls() {
    const canvas = document.getElementById('cyber-globe-canvas');
    if (canvas) {
        window.cyberGlobe = new InteractiveCyberGlobe('cyber-globe-canvas');
    }
}
