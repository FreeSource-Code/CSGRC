/**
 * Interactive 3D Openable Book Engine with Dual-Page Chapter Reader (TypeScript)
 * Displays ONLY the official 14 book chapter topics from Bentham Science
 * Across 7 authentic two-page spreads (Left: Chapter 1, Right: Chapter 2, etc.)
 * Zero redundant fluff, clean, simple and direct as requested.
 */
export const OFFICIAL_CHAPTERS = [
    { id: 1, number: "01", title: "Foundations of Cybersecurity Governance, Risk, and Compliance" },
    { id: 2, number: "02", title: "AI Oversight and Ethical Governance" },
    { id: 3, number: "03", title: "Global Regulatory Volatility and Compliance Challenges" },
    { id: 4, number: "04", title: "Cybersecurity as a Regulatory Priority" },
    { id: 5, number: "05", title: "Zero-Trust Architectures in GRC" },
    { id: 6, number: "06", title: "Data Governance and Privacy by Design" },
    { id: 7, number: "07", title: "Risk Intelligence in the Age of AI" },
    { id: 8, number: "08", title: "Resilience and Incident-Response Frameworks" },
    { id: 9, number: "09", title: "Cloud Security and Compliance in Multi-Cloud Environments" },
    { id: 10, number: "10", title: "Cybersecurity and ESG Integration" },
    { id: 11, number: "11", title: "Remote Workforces and Virtual Workplaces" },
    { id: 12, number: "12", title: "Geopolitical Risks and Cybersecurity Governance" },
    { id: 13, number: "13", title: "Metrics, Reporting, and Continuous Compliance Monitoring" },
    { id: 14, number: "14", title: "The Future of GRC: From Compliance to Competitive Advantage" }
];
export class InteractiveBookReader {
    constructor() {
        this.currentSpreadIndex = 0; // 0 to 6 (7 spreads for 14 chapters)
        this.isBookOpen = false;
        this.containerEl = null;
        this.bookCoverEl = null;
        this.openReaderEl = null;
        this.init();
    }
    init() {
        this.containerEl = document.getElementById('hero-book-stage');
        this.bookCoverEl = document.getElementById('hero-3d-book-cover');
        this.openReaderEl = document.getElementById('hero-open-book-reader');
        if (this.bookCoverEl) {
            this.bookCoverEl.addEventListener('click', () => this.openBook());
        }
        const openTriggerBtn = document.getElementById('btn-open-book-trigger');
        if (openTriggerBtn) {
            openTriggerBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.openBook();
            });
        }
        const closeBtn = document.getElementById('btn-close-book-reader');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeBook());
        }
        const prevBtn = document.getElementById('book-nav-prev');
        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.prevSpread());
        }
        const nextBtn = document.getElementById('book-nav-next');
        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.nextSpread());
        }
        this.renderSpread(0);
    }
    openBook() {
        this.isBookOpen = true;
        if (this.bookCoverEl)
            this.bookCoverEl.style.display = 'none';
        if (this.openReaderEl) {
            this.openReaderEl.style.display = 'block';
            this.openReaderEl.classList.add('book-opening-anim');
            setTimeout(() => {
                this.openReaderEl?.classList.remove('book-opening-anim');
            }, 600);
        }
        this.renderSpread(this.currentSpreadIndex);
    }
    closeBook() {
        this.isBookOpen = false;
        if (this.openReaderEl)
            this.openReaderEl.style.display = 'none';
        if (this.bookCoverEl) {
            this.bookCoverEl.style.display = 'block';
            this.bookCoverEl.classList.add('book-closing-anim');
            setTimeout(() => {
                this.bookCoverEl?.classList.remove('book-closing-anim');
            }, 500);
        }
    }
    nextSpread() {
        const totalSpreads = Math.ceil(OFFICIAL_CHAPTERS.length / 2);
        if (this.currentSpreadIndex < totalSpreads - 1) {
            this.currentSpreadIndex++;
        }
        else {
            this.currentSpreadIndex = 0;
        }
        this.renderSpread(this.currentSpreadIndex);
    }
    prevSpread() {
        const totalSpreads = Math.ceil(OFFICIAL_CHAPTERS.length / 2);
        if (this.currentSpreadIndex > 0) {
            this.currentSpreadIndex--;
        }
        else {
            this.currentSpreadIndex = totalSpreads - 1;
        }
        this.renderSpread(this.currentSpreadIndex);
    }
    jumpToSpread(spreadIdx) {
        const totalSpreads = Math.ceil(OFFICIAL_CHAPTERS.length / 2);
        if (spreadIdx >= 0 && spreadIdx < totalSpreads) {
            this.currentSpreadIndex = spreadIdx;
            this.renderSpread(spreadIdx);
        }
    }
    jumpToChapter(chapterIdx) {
        const spreadIdx = Math.floor(chapterIdx / 2);
        this.jumpToSpread(spreadIdx);
    }
    renderSpread(spreadIdx) {
        const leftIdx = spreadIdx * 2;
        const rightIdx = spreadIdx * 2 + 1;
        const leftCh = OFFICIAL_CHAPTERS[leftIdx];
        const rightCh = OFFICIAL_CHAPTERS[rightIdx];
        // Left Page Elements
        const badgeLeft = document.getElementById('book-chapter-index-left');
        const titleLeft = document.getElementById('book-chapter-title-left');
        const pageNumLeft = document.getElementById('book-page-num-left');
        const submitBtnLeft = document.getElementById('book-chapter-submit-btn-left');
        if (leftCh) {
            if (badgeLeft)
                badgeLeft.textContent = `CHAPTER ${leftCh.number}`;
            if (titleLeft)
                titleLeft.textContent = leftCh.title;
            if (pageNumLeft)
                pageNumLeft.textContent = `Page ${leftCh.id}`;
            if (submitBtnLeft) {
                submitBtnLeft.textContent = `Submit for Topic ${leftCh.number} →`;
                submitBtnLeft.onclick = () => {
                    if (typeof window.openSubmissionDrawer === 'function') {
                        window.openSubmissionDrawer(leftCh.number, leftCh.title);
                    }
                };
            }
        }
        // Right Page Elements
        const badgeRight = document.getElementById('book-chapter-index-right');
        const titleRight = document.getElementById('book-chapter-title-right');
        const pageNumRight = document.getElementById('book-page-num-right');
        const submitBtnRight = document.getElementById('book-chapter-submit-btn-right');
        if (rightCh) {
            if (badgeRight)
                badgeRight.textContent = `CHAPTER ${rightCh.number}`;
            if (titleRight)
                titleRight.textContent = rightCh.title;
            if (pageNumRight)
                pageNumRight.textContent = `Page ${rightCh.id}`;
            if (submitBtnRight) {
                submitBtnRight.textContent = `Submit for Topic ${rightCh.number} →`;
                submitBtnRight.onclick = () => {
                    if (typeof window.openSubmissionDrawer === 'function') {
                        window.openSubmissionDrawer(rightCh.number, rightCh.title);
                    }
                };
            }
        }
        // Bottom Navigation Badge
        const progressEl = document.getElementById('book-chapter-progress');
        if (progressEl && leftCh && rightCh) {
            progressEl.textContent = `Chapters ${leftCh.number} & ${rightCh.number} of 14`;
        }
        this.renderThumbnailStrip(spreadIdx);
    }
    renderThumbnailStrip(currentSpreadIdx) {
        const stripEl = document.getElementById('book-chapter-thumbnails');
        if (!stripEl)
            return;
        const totalSpreads = Math.ceil(OFFICIAL_CHAPTERS.length / 2);
        let html = '';
        for (let i = 0; i < totalSpreads; i++) {
            const ch1 = OFFICIAL_CHAPTERS[i * 2];
            const ch2 = OFFICIAL_CHAPTERS[i * 2 + 1];
            const isActive = i === currentSpreadIdx;
            html += `
        <button class="ch-strip-btn ${isActive ? 'active' : ''}" 
                onclick="window.bookReader.jumpToSpread(${i})" 
                title="Chapters ${ch1.number} & ${ch2.number}">
          ${ch1.number}&ndash;${ch2.number}
        </button>
      `;
        }
        stripEl.innerHTML = html;
    }
}
