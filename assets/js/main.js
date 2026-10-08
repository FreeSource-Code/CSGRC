/**
 * BENTHAM SCIENCE - CYBERSECURITY GRC BOOK CHAPTER CFP PORTAL
 * Master Website Engine (Clean Web UX - Zero Errors)
 */

document.addEventListener('DOMContentLoaded', () => {
    initTopicFilter();
    initMobileNav();
    initSubmissionDrawer();
    initScrollSpy();
    initCopyButtons();
    initDirectEmailHelper();
});

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
}

/* ==========================================================================
   Mobile Nav & Scroll to Top
   ========================================================================== */
function initMobileNav() {
    const mobileToggle = document.getElementById('mobile-nav-toggle');
    const navLinks = document.getElementById('nav-links');
    if (mobileToggle && navLinks) {
        const closeMenu = () => {
            navLinks.classList.remove('is-open');
            mobileToggle.textContent = '☰';
            mobileToggle.setAttribute('aria-expanded', 'false');
        };
        const toggleMenu = () => {
            const isOpen = navLinks.classList.toggle('is-open');
            mobileToggle.textContent = isOpen ? '✕' : '☰';
            mobileToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        };

        mobileToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleMenu();
        });

        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                closeMenu();
            });
        });

        document.addEventListener('click', (e) => {
            if (!navLinks.contains(e.target) && !mobileToggle.contains(e.target)) {
                closeMenu();
            }
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
    const header = document.querySelector('.site-header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 20) {
            header?.classList.add('scrolled');
        } else {
            header?.classList.remove('scrolled');
        }
    });
}

/* ==========================================================================
   Submission Drawer & Form Handler
   ========================================================================== */
function initSubmissionDrawer() {
    const subModal = document.getElementById('submission-drawer-modal');
    const closeSubBtn = document.getElementById('close-sub-drawer');

    window.openSubmissionDrawer = function (topicNum, topicName) {
        const topicInput = document.getElementById('drawer-topic');
        if (topicInput) topicInput.value = `Topic ${topicNum}: ${topicName}`;
        if (subModal) subModal.classList.add('open');
    };

    if (closeSubBtn && subModal) {
        closeSubBtn.addEventListener('click', () => {
            subModal.classList.remove('open');
        });
    }

    if (subModal) {
        subModal.addEventListener('click', (e) => {
            if (e.target === subModal) subModal.classList.remove('open');
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
Bentham Science Book: Cybersecurity Governance, Risk, and Compliance in the Age of AI and Global Regulation

Author: ${author}
Institutional Email: ${email}
Chapter Area: ${topic}
Proposed Title: ${title}

Abstract Summary:
${abstract}

Guidelines Adherence:
1. Target length: 7,000 - 8,000 words.
2. Citation style: IEEE reference style.
3. Plagiarism threshold: Less than 10%, strict no-AI generation.

Thank you,
${author}`);

            const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=cgrc2027@gmail.com&su=${subject}&body=${body}`;

            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(decodeURIComponent(body)).catch(() => { });
            }

            const win = window.open(gmailUrl, '_blank');
            if (!win || win.closed || typeof win.closed === 'undefined') {
                window.location.href = `mailto:cgrc2027@gmail.com?subject=${subject}&body=${body}`;
            }

            if (subModal) subModal.classList.remove('open');
            showToast('Opening Gmail with your proposal draft pre-filled!');
        });
    }
}

/* ==========================================================================
   Direct Webmail / Gmail Launcher
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
        } else {
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
        } catch {
            showToast(`Please manually copy: ${text}`);
        }
        document.body.removeChild(textArea);
    }
}

/* ==========================================================================
   Toast Notification Helper
   ========================================================================== */
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
