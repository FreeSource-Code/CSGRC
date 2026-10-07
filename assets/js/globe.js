/**
 * Interactive 3D Rotating Cyber Globe Engine (TypeScript)
 * Real-time 3D spherical projection with inertia drag rotation, glowing cyber nodes,
 * authentic geographic outline of India, high-density Indian cities/states,
 * and seamless transparent blend on white hero background.
 */
export class InteractiveCyberGlobe {
    constructor(canvasId = 'cyber-globe-canvas') {
        this.canvas = null;
        this.ctx = null;
        this.animId = null;
        // Rotation angles (degrees)
        this.rotY = -78; // Centered directly on India (~78°E)
        this.rotX = -20; // Positioned directly in the DEAD CENTER of the 3D sphere
        // Inertia and drag state
        this.isDragging = false;
        this.lastMouseX = 0;
        this.lastMouseY = 0;
        this.velY = 0;
        this.velX = 0;
        this.autoRotate = true;
        this.baseAutoSpeed = 0.32; // smooth orbit velocity
        // Nodes, Arcs & Mesh
        this.points = [];
        this.arcs = [];
        this.indiaBoundary = [];
        this.indiaCities = [];
        this.indiaMeshLines = [];
        this.indiaHub = { lat: 21.0, lon: 78.5, name: "INDIA [HUB]", isHub: true, isIndia: true };
        this.canvas = document.getElementById(canvasId);
        if (this.canvas) {
            this.ctx = this.canvas.getContext('2d');
            this.initIndiaGeography();
            this.initGlobalContinents();
            this.initDataHighways();
            this.setupCanvasSize();
            this.setupEvents();
            this.startAnimation();
        }
    }
    /**
     * Initializes detailed Indian geography:
     * 1. Authentic coastline and border perimeter polygon
     * 2. Non-overlapping smart directional city/state nodes with leader lines
     * 3. Inter-city high-speed national cyber grid mesh
     */
    initIndiaGeography() {
        // 1. Authentic boundary polygon tracing the actual map of India
        this.indiaBoundary = [
            // Jammu & Kashmir / Ladakh Crown
            { lat: 35.8, lon: 76.5 }, { lat: 34.5, lon: 78.2 }, { lat: 33.0, lon: 79.0 },
            // Himachal & Uttarakhand
            { lat: 31.0, lon: 78.5 }, { lat: 30.0, lon: 80.8 },
            // Nepal border trace
            { lat: 27.5, lon: 88.0 }, { lat: 27.8, lon: 88.8 },
            // Arunachal Pradesh & Assam / North East
            { lat: 28.5, lon: 96.0 }, { lat: 27.0, lon: 97.0 }, { lat: 24.5, lon: 93.5 },
            { lat: 23.0, lon: 91.8 }, { lat: 25.2, lon: 90.0 },
            // Bengal Delta & Sundarbans
            { lat: 22.4, lon: 89.0 }, { lat: 21.5, lon: 87.5 },
            // Eastern Coast (Odisha, Andhra, Tamil Nadu)
            { lat: 19.8, lon: 85.8 }, { lat: 17.5, lon: 83.2 }, { lat: 15.5, lon: 80.2 },
            { lat: 13.1, lon: 80.3 }, { lat: 11.5, lon: 79.8 }, { lat: 9.5, lon: 78.8 },
            // Southern Tip (Kanyakumari)
            { lat: 8.08, lon: 77.55 },
            // Western Coast (Kerala, Karnataka, Goa, Konkan)
            { lat: 9.5, lon: 76.4 }, { lat: 12.0, lon: 75.2 }, { lat: 14.5, lon: 74.3 },
            { lat: 15.5, lon: 73.8 }, { lat: 18.5, lon: 72.9 }, { lat: 20.0, lon: 72.8 },
            // Gujarat Gulfs & Saurashtra
            { lat: 21.0, lon: 72.0 }, { lat: 20.8, lon: 70.8 }, { lat: 22.3, lon: 69.0 },
            { lat: 23.5, lon: 68.6 }, { lat: 24.0, lon: 70.5 },
            // Western Border (Rajasthan & Punjab)
            { lat: 25.5, lon: 70.2 }, { lat: 27.5, lon: 71.0 }, { lat: 30.0, lon: 73.5 },
            { lat: 32.5, lon: 74.8 }, { lat: 35.8, lon: 76.5 }
        ];
        // 2. High-Precision Indian Cities with Collision-Free Directional Offsets
        this.indiaCities = [
            { lat: 34.08, lon: 74.79, name: "SRINAGAR", align: 'center', offX: 0, offY: -12 },
            { lat: 30.73, lon: 76.77, name: "CHANDIGARH", align: 'right', offX: -10, offY: -4 },
            { lat: 28.61, lon: 77.20, name: "★ DELHI", align: 'left', offX: 14, offY: -8, color: '#FF9933', isCapital: true },
            { lat: 26.91, lon: 75.78, name: "JAIPUR", align: 'right', offX: -10, offY: 0 },
            { lat: 26.84, lon: 80.94, name: "LUCKNOW", align: 'left', offX: 12, offY: 0 },
            { lat: 23.02, lon: 72.57, name: "AHMEDABAD", align: 'right', offX: -12, offY: 0 },
            { lat: 22.57, lon: 88.36, name: "KOLKATA", align: 'left', offX: 12, offY: 0 },
            { lat: 26.14, lon: 91.73, name: "GUWAHATI", align: 'left', offX: 12, offY: -2 },
            { lat: 19.07, lon: 72.87, name: "MUMBAI", align: 'right', offX: -12, offY: 2 },
            { lat: 18.52, lon: 74.15, name: "PUNE", align: 'left', offX: 12, offY: 7 },
            { lat: 17.38, lon: 78.48, name: "HYDERABAD", align: 'left', offX: 12, offY: -2 },
            { lat: 15.29, lon: 73.98, name: "GOA", align: 'right', offX: -12, offY: 4 },
            { lat: 12.97, lon: 77.59, name: "BENGALURU", align: 'right', offX: -12, offY: 2, color: '#00F0FF' },
            { lat: 13.08, lon: 80.27, name: "CHENNAI", align: 'left', offX: 12, offY: 4 },
            { lat: 9.93, lon: 76.26, name: "KERALA", align: 'right', offX: -12, offY: 6 }
        ];
        // Push cities to main points list
        this.points.push(this.indiaHub);
        this.indiaCities.forEach(c => {
            this.points.push({ lat: c.lat, lon: c.lon, name: c.name, isIndia: true });
        });
        // 3. Dense Interior Cyber Nodes filling India Peninsula
        for (let i = 0; i < 60; i++) {
            this.points.push({
                lat: 9.5 + Math.random() * 23.5,
                lon: 72.0 + Math.random() * 16.5,
                isIndia: true
            });
        }
        // 4. Inter-City High Speed National Cyber Grid Mesh
        const getCityCoord = (name) => {
            const c = this.indiaCities.find(x => x.name.includes(name));
            return c ? { lat: c.lat, lon: c.lon } : { lat: 21, lon: 78 };
        };
        this.indiaMeshLines = [
            { from: getCityCoord("DELHI"), to: getCityCoord("MUMBAI") },
            { from: getCityCoord("DELHI"), to: getCityCoord("BENGALURU") },
            { from: getCityCoord("DELHI"), to: getCityCoord("KOLKATA") },
            { from: getCityCoord("DELHI"), to: getCityCoord("CHANDIGARH") },
            { from: getCityCoord("DELHI"), to: getCityCoord("JAIPUR") },
            { from: getCityCoord("DELHI"), to: getCityCoord("LUCKNOW") },
            { from: getCityCoord("DELHI"), to: getCityCoord("SRINAGAR") },
            { from: getCityCoord("MUMBAI"), to: getCityCoord("PUNE") },
            { from: getCityCoord("MUMBAI"), to: getCityCoord("AHMEDABAD") },
            { from: getCityCoord("MUMBAI"), to: getCityCoord("BENGALURU") },
            { from: getCityCoord("BENGALURU"), to: getCityCoord("HYDERABAD") },
            { from: getCityCoord("BENGALURU"), to: getCityCoord("CHENNAI") },
            { from: getCityCoord("BENGALURU"), to: getCityCoord("KERALA") },
            { from: getCityCoord("HYDERABAD"), to: getCityCoord("CHENNAI") },
            { from: getCityCoord("KOLKATA"), to: getCityCoord("GUWAHATI") },
            { from: getCityCoord("PUNE"), to: getCityCoord("GOA") }
        ];
    }
    /**
     * Initializes global continents nodes
     */
    initGlobalContinents() {
        // East Asia
        const eastAsiaCities = [
            { lat: 35.68, lon: 139.76, name: "TOKYO" },
            { lat: 37.56, lon: 126.97, name: "SEOUL" },
            { lat: 31.23, lon: 121.47, name: "SHANGHAI" },
            { lat: 1.35, lon: 103.82, name: "SINGAPORE" }
        ];
        eastAsiaCities.forEach(c => this.points.push(c));
        for (let i = 0; i < 40; i++) {
            this.points.push({ lat: 18 + Math.random() * 25, lon: 100 + Math.random() * 38 });
        }
        // Europe
        const europeCities = [
            { lat: 51.50, lon: -0.12, name: "LONDON" },
            { lat: 50.11, lon: 8.68, name: "FRANKFURT" },
            { lat: 48.85, lon: 2.35, name: "PARIS" }
        ];
        europeCities.forEach(c => this.points.push(c));
        for (let i = 0; i < 35; i++) {
            this.points.push({ lat: 38 + Math.random() * 20, lon: -6 + Math.random() * 32 });
        }
        // Middle East
        this.points.push({ lat: 25.20, lon: 55.27, name: "DUBAI" });
        for (let i = 0; i < 18; i++) {
            this.points.push({ lat: 18 + Math.random() * 16, lon: 38 + Math.random() * 20 });
        }
        // North America
        const naCities = [
            { lat: 40.71, lon: -74.00, name: "NEW YORK" },
            { lat: 37.77, lon: -122.41, name: "SILICON VALLEY" }
        ];
        naCities.forEach(c => this.points.push(c));
        for (let i = 0; i < 45; i++) {
            this.points.push({ lat: 28 + Math.random() * 24, lon: -122 + Math.random() * 48 });
        }
        // South America
        for (let i = 0; i < 22; i++) {
            this.points.push({ lat: -35 + Math.random() * 40, lon: -70 + Math.random() * 32 });
        }
        // Africa
        for (let i = 0; i < 25; i++) {
            this.points.push({ lat: -30 + Math.random() * 55, lon: 10 + Math.random() * 30 });
        }
        // Australia
        this.points.push({ lat: -33.86, lon: 151.20, name: "SYDNEY" });
        for (let i = 0; i < 20; i++) {
            this.points.push({ lat: -35 + Math.random() * 18, lon: 115 + Math.random() * 35 });
        }
    }
    /**
     * Defines animated cyber defense arcs originating from India Hub
     */
    initDataHighways() {
        const keyPartners = [
            { lat: 51.50, lon: -0.12, name: "LONDON", color: "#00F0FF" },
            { lat: 35.68, lon: 139.76, name: "TOKYO", color: "#FF9933" },
            { lat: 1.35, lon: 103.82, name: "SINGAPORE", color: "#00F0FF" },
            { lat: 40.71, lon: -74.00, name: "NEW YORK", color: "#FF9933" },
            { lat: 50.11, lon: 8.68, name: "FRANKFURT", color: "#00F0FF" },
            { lat: 25.20, lon: 55.27, name: "DUBAI", color: "#00F0FF" },
            { lat: -33.86, lon: 151.20, name: "SYDNEY", color: "#FF9933" },
            { lat: 37.77, lon: -122.41, name: "SILICON VALLEY", color: "#00F0FF" }
        ];
        this.arcs = keyPartners.map((target, idx) => ({
            from: this.indiaHub,
            to: target,
            progress: (idx * 0.12) % 1,
            speed: 0.0055 + (idx % 3) * 0.002,
            color: target.color
        }));
    }
    setupCanvasSize() {
        if (!this.canvas)
            return;
        const updateSize = () => {
            if (!this.canvas)
                return;
            const rect = this.canvas.parentElement?.getBoundingClientRect();
            const w = Math.max(320, rect?.width || 560);
            const h = Math.max(340, rect?.height || 540);
            const dpr = window.devicePixelRatio || 1;
            this.canvas.width = Math.floor(w * dpr);
            this.canvas.height = Math.floor(h * dpr);
            this.canvas.style.width = `${w}px`;
            this.canvas.style.height = `${h}px`;
            if (this.ctx) {
                this.ctx.setTransform(1, 0, 0, 1, 0, 0);
                this.ctx.scale(dpr, dpr);
            }
        };
        updateSize();
        window.addEventListener('resize', updateSize);
    }
    setupEvents() {
        if (!this.canvas)
            return;
        this.canvas.style.cursor = 'grab';
        this.canvas.addEventListener('pointerdown', (e) => {
            this.isDragging = true;
            this.lastMouseX = e.clientX;
            this.lastMouseY = e.clientY;
            this.velX = 0;
            this.velY = 0;
            this.canvas.style.cursor = 'grabbing';
            this.canvas?.setPointerCapture(e.pointerId);
        });
        window.addEventListener('pointermove', (e) => {
            if (!this.isDragging)
                return;
            const dx = e.clientX - this.lastMouseX;
            const dy = e.clientY - this.lastMouseY;
            this.rotY += dx * 0.42;
            this.rotX = Math.max(-55, Math.min(55, this.rotX - dy * 0.35));
            this.velY = dx * 0.35;
            this.velX = -dy * 0.25;
            this.lastMouseX = e.clientX;
            this.lastMouseY = e.clientY;
        });
        const stopDrag = () => {
            if (this.isDragging) {
                this.isDragging = false;
                if (this.canvas)
                    this.canvas.style.cursor = 'grab';
            }
        };
        window.addEventListener('pointerup', stopDrag);
        window.addEventListener('pointercancel', stopDrag);
    }
    /**
     * Projects (lat, lon) on a sphere of radius r into 3D camera coordinates.
     */
    project(lat, lon, r) {
        const latRad = lat * (Math.PI / 180);
        const lonRad = (lon + this.rotY) * (Math.PI / 180);
        const tiltRad = this.rotX * (Math.PI / 180);
        const x = r * Math.cos(latRad) * Math.sin(lonRad);
        const y0 = -r * Math.sin(latRad);
        const z0 = r * Math.cos(latRad) * Math.cos(lonRad);
        const y = y0 * Math.cos(tiltRad) - z0 * Math.sin(tiltRad);
        const z = y0 * Math.sin(tiltRad) + z0 * Math.cos(tiltRad);
        return {
            x,
            y,
            z,
            isFront: z > -r * 0.15
        };
    }
    startAnimation() {
        let pulseTime = 0;
        const render = () => {
            if (!this.canvas || !this.ctx)
                return;
            const w = parseFloat(this.canvas.style.width || '560');
            const h = parseFloat(this.canvas.style.height || '540');
            const cx = w / 2;
            const cy = h / 2;
            // LARGER RADIUS: Makes the 3D globe generous, prominent and spacious
            const r = Math.min(w, h) * 0.47;
            if (!this.isDragging) {
                if (Math.abs(this.velY) > 0.05) {
                    this.rotY += this.velY;
                    this.velY *= 0.94;
                }
                else if (this.autoRotate) {
                    this.rotY += this.baseAutoSpeed;
                }
                if (Math.abs(this.velX) > 0.05) {
                    this.rotX = Math.max(-55, Math.min(55, this.rotX + this.velX));
                    this.velX *= 0.92;
                }
            }
            pulseTime += 0.045;
            this.ctx.clearRect(0, 0, w, h);
            // ==========================================
            // 1. Soft Floor Shadow (Clean Blend on White Hero)
            // ==========================================
            const floorShadow = this.ctx.createRadialGradient(cx, cy + r * 1.02, 0, cx, cy + r * 1.02, r * 0.88);
            floorShadow.addColorStop(0, 'rgba(15, 23, 42, 0.17)');
            floorShadow.addColorStop(0.5, 'rgba(15, 23, 42, 0.05)');
            floorShadow.addColorStop(1, 'rgba(15, 23, 42, 0)');
            this.ctx.fillStyle = floorShadow;
            this.ctx.beginPath();
            this.ctx.ellipse(cx, cy + r * 1.02, r * 0.82, r * 0.16, 0, 0, Math.PI * 2);
            this.ctx.fill();
            // Subtle Outer Cyan Atmosphere Aura
            const aura = this.ctx.createRadialGradient(cx, cy, r * 0.9, cx, cy, r * 1.14);
            aura.addColorStop(0, 'rgba(0, 240, 255, 0.20)');
            aura.addColorStop(0.6, 'rgba(6, 182, 212, 0.04)');
            aura.addColorStop(1, 'rgba(255, 255, 255, 0)');
            this.ctx.fillStyle = aura;
            this.ctx.beginPath();
            this.ctx.arc(cx, cy, r * 1.14, 0, Math.PI * 2);
            this.ctx.fill();
            // ==========================================
            // 2. Base Dark Cyber Planetary Sphere
            // ==========================================
            const sphereGrad = this.ctx.createRadialGradient(cx - r * 0.35, cy - r * 0.35, r * 0.1, cx, cy, r);
            sphereGrad.addColorStop(0, '#141D2A');
            sphereGrad.addColorStop(0.7, '#0C1118');
            sphereGrad.addColorStop(1, '#05070A');
            this.ctx.fillStyle = sphereGrad;
            this.ctx.beginPath();
            this.ctx.arc(cx, cy, r, 0, Math.PI * 2);
            this.ctx.fill();
            // Atmospheric Rim Glow
            this.ctx.lineWidth = 1.8;
            this.ctx.strokeStyle = 'rgba(0, 240, 255, 0.65)';
            this.ctx.stroke();
            // ==========================================
            // 3. 3D Coordinate Graticule (Lat/Lon Grid)
            // ==========================================
            this.ctx.lineWidth = 0.7;
            this.ctx.strokeStyle = 'rgba(0, 240, 255, 0.12)';
            for (let lat = -60; lat <= 60; lat += 30) {
                this.ctx.beginPath();
                let penDown = false;
                for (let lon = 0; lon <= 360; lon += 8) {
                    const p = this.project(lat, lon, r);
                    if (p.z > 0) {
                        if (!penDown) {
                            this.ctx.moveTo(cx + p.x, cy + p.y);
                            penDown = true;
                        }
                        else {
                            this.ctx.lineTo(cx + p.x, cy + p.y);
                        }
                    }
                    else {
                        penDown = false;
                    }
                }
                this.ctx.stroke();
            }
            for (let lon = 0; lon < 360; lon += 45) {
                this.ctx.beginPath();
                let penDown = false;
                for (let lat = -80; lat <= 80; lat += 8) {
                    const p = this.project(lat, lon, r);
                    if (p.z > 0) {
                        if (!penDown) {
                            this.ctx.moveTo(cx + p.x, cy + p.y);
                            penDown = true;
                        }
                        else {
                            this.ctx.lineTo(cx + p.x, cy + p.y);
                        }
                    }
                    else {
                        penDown = false;
                    }
                }
                this.ctx.stroke();
            }
            // ==========================================
            // 4. Orbital Cyber Ring with Tracker
            // ==========================================
            this.ctx.save();
            this.ctx.translate(cx, cy);
            this.ctx.rotate((this.rotX * Math.PI) / 180 * 0.4);
            this.ctx.beginPath();
            this.ctx.ellipse(0, 0, r * 1.28, r * 0.44, 0.22, 0, Math.PI * 2);
            this.ctx.strokeStyle = 'rgba(255, 153, 51, 0.35)';
            this.ctx.lineWidth = 1.2;
            this.ctx.setLineDash([8, 14]);
            this.ctx.stroke();
            const ringAngle = pulseTime * 0.75;
            const satX = Math.cos(ringAngle) * (r * 1.28);
            const satY = Math.sin(ringAngle) * (r * 0.44);
            this.ctx.beginPath();
            this.ctx.arc(satX, satY, 2.8, 0, Math.PI * 2);
            this.ctx.fillStyle = '#00F0FF';
            this.ctx.shadowColor = '#00F0FF';
            this.ctx.shadowBlur = 10;
            this.ctx.fill();
            this.ctx.shadowBlur = 0;
            this.ctx.restore();
            // ==========================================
            // 5. Authentic Geographic Outline of India
            // ==========================================
            this.ctx.beginPath();
            let borderStarted = false;
            this.indiaBoundary.forEach(b => {
                const p = this.project(b.lat, b.lon, r);
                if (p.z > 0) {
                    if (!borderStarted) {
                        this.ctx.moveTo(cx + p.x, cy + p.y);
                        borderStarted = true;
                    }
                    else {
                        this.ctx.lineTo(cx + p.x, cy + p.y);
                    }
                }
                else {
                    borderStarted = false;
                }
            });
            this.ctx.strokeStyle = 'rgba(0, 240, 255, 0.75)';
            this.ctx.lineWidth = 1.6;
            this.ctx.stroke();
            // ==========================================
            // 5.5 India Internal Cyber Mesh Grid Lines
            // ==========================================
            this.indiaMeshLines.forEach(link => {
                const p1 = this.project(link.from.lat, link.from.lon, r);
                const p2 = this.project(link.to.lat, link.to.lon, r);
                if (p1.z > 0 && p2.z > 0) {
                    const depthAlpha = Math.min(p1.z, p2.z) / r;
                    if (depthAlpha > 0.08) {
                        this.ctx.beginPath();
                        this.ctx.moveTo(cx + p1.x, cy + p1.y);
                        this.ctx.lineTo(cx + p2.x, cy + p2.y);
                        this.ctx.strokeStyle = `rgba(0, 240, 255, ${0.48 * depthAlpha})`;
                        this.ctx.lineWidth = 0.9;
                        this.ctx.stroke();
                    }
                }
            });
            // ==========================================
            // 5.7 Global Cyber Data Highways
            // ==========================================
            this.arcs.forEach(arc => {
                arc.progress = (arc.progress + arc.speed) % 1;
                const p1 = this.project(arc.from.lat, arc.from.lon, r);
                const p2 = this.project(arc.to.lat, arc.to.lon, r);
                if (p1.z > -r * 0.2 || p2.z > -r * 0.2) {
                    const sx = cx + p1.x;
                    const sy = cy + p1.y;
                    const ex = cx + p2.x;
                    const ey = cy + p2.y;
                    const mx = (sx + ex) / 2;
                    const my = (sy + ey) / 2 - r * 0.28;
                    this.ctx.beginPath();
                    this.ctx.moveTo(sx, sy);
                    this.ctx.quadraticCurveTo(mx, my, ex, ey);
                    this.ctx.strokeStyle = arc.color === '#00F0FF'
                        ? 'rgba(0, 240, 255, 0.32)'
                        : 'rgba(255, 153, 51, 0.28)';
                    this.ctx.lineWidth = 1.2;
                    this.ctx.setLineDash([]);
                    this.ctx.stroke();
                    const t = arc.progress;
                    const px = (1 - t) * (1 - t) * sx + 2 * (1 - t) * t * mx + t * t * ex;
                    const py = (1 - t) * (1 - t) * sy + 2 * (1 - t) * t * my + t * t * ey;
                    if (p1.z > 0 || p2.z > 0) {
                        this.ctx.beginPath();
                        this.ctx.arc(px, py, 2.5, 0, Math.PI * 2);
                        this.ctx.fillStyle = arc.color;
                        this.ctx.shadowColor = arc.color;
                        this.ctx.shadowBlur = 8;
                        this.ctx.fill();
                        this.ctx.shadowBlur = 0;
                    }
                }
            });
            // ==========================================
            // 6. Cyber Network Nodes (World & India)
            // ==========================================
            this.points.forEach(pt => {
                const p = this.project(pt.lat, pt.lon, r);
                if (p.z <= -r * 0.15)
                    return; // Cull backside
                const px = cx + p.x;
                const py = cy + p.y;
                const depthRatio = Math.max(0.18, (p.z + r * 0.15) / (r * 1.15));
                if (pt.isHub) {
                    // Central India Hub Pulse
                    const pulseR = 5.5 + Math.sin(pulseTime * 2) * 3;
                    this.ctx.beginPath();
                    this.ctx.arc(px, py, pulseR + 6, 0, Math.PI * 2);
                    this.ctx.strokeStyle = `rgba(0, 240, 255, ${0.55 * depthRatio})`;
                    this.ctx.lineWidth = 1.5;
                    this.ctx.stroke();
                    this.ctx.beginPath();
                    this.ctx.arc(px, py, pulseR + 2, 0, Math.PI * 2);
                    this.ctx.strokeStyle = `rgba(255, 153, 51, ${0.75 * depthRatio})`;
                    this.ctx.lineWidth = 1.2;
                    this.ctx.stroke();
                    this.ctx.beginPath();
                    this.ctx.arc(px, py, 5, 0, Math.PI * 2);
                    this.ctx.fillStyle = '#00F0FF';
                    this.ctx.shadowColor = '#00F0FF';
                    this.ctx.shadowBlur = 14;
                    this.ctx.fill();
                    this.ctx.shadowBlur = 0;
                }
                else if (pt.isIndia) {
                    // General India particle
                    this.ctx.beginPath();
                    this.ctx.arc(px, py, 1.4, 0, Math.PI * 2);
                    this.ctx.fillStyle = `rgba(0, 240, 255, ${depthRatio * 0.75})`;
                    this.ctx.fill();
                }
                else if (pt.name) {
                    // Major Global Anchor Cities
                    this.ctx.beginPath();
                    this.ctx.arc(px, py, 2.5, 0, Math.PI * 2);
                    this.ctx.fillStyle = `rgba(255, 153, 51, ${depthRatio * 0.95})`;
                    this.ctx.fill();
                }
                else {
                    // Regular World Cyber Grid Node
                    this.ctx.beginPath();
                    this.ctx.arc(px, py, 1.3, 0, Math.PI * 2);
                    this.ctx.fillStyle = `rgba(0, 240, 255, ${depthRatio * 0.65})`;
                    this.ctx.fill();
                }
            });
            // ==========================================
            // 7. Render Indian Cities with Smart Directional Offsets & Leader Lines
            // ==========================================
            this.indiaCities.forEach(city => {
                const p = this.project(city.lat, city.lon, r);
                if (p.z <= 0)
                    return; // Only show on front-facing hemisphere
                const px = cx + p.x;
                const py = cy + p.y;
                const depthRatio = Math.max(0.2, (p.z + r * 0.15) / (r * 1.15));
                if (depthRatio > 0.35) {
                    const alpha = Math.min(1, depthRatio * 1.3);
                    // 1. Glowing City Node Dot
                    this.ctx.beginPath();
                    this.ctx.arc(px, py, city.isCapital ? 3.2 : 2.4, 0, Math.PI * 2);
                    this.ctx.fillStyle = city.color || '#00F0FF';
                    this.ctx.shadowColor = city.color || '#00F0FF';
                    this.ctx.shadowBlur = 8;
                    this.ctx.fill();
                    this.ctx.shadowBlur = 0;
                    // 2. Subtle Leader Line from Dot to Label
                    const targetX = px + city.offX;
                    const targetY = py + city.offY;
                    this.ctx.beginPath();
                    this.ctx.moveTo(px, py);
                    this.ctx.lineTo(targetX, targetY);
                    this.ctx.strokeStyle = `rgba(0, 240, 255, ${0.35 * alpha})`;
                    this.ctx.lineWidth = 0.8;
                    this.ctx.stroke();
                    // 3. Crisp, Non-Overlapping Label Text
                    this.ctx.font = city.isCapital ? 'bold 8px "Fira Code", monospace' : '600 7.5px "Fira Code", monospace';
                    this.ctx.textAlign = city.align;
                    this.ctx.textBaseline = 'middle';
                    // Text shadow backing for high contrast legibility
                    this.ctx.fillStyle = '#060B12';
                    this.ctx.fillText(city.name, targetX + (city.align === 'right' ? -1 : 1), targetY + 1);
                    this.ctx.fillStyle = city.color ? city.color : `rgba(255, 255, 255, ${0.95 * alpha})`;
                    this.ctx.fillText(city.name, targetX, targetY);
                }
            });
            this.animId = requestAnimationFrame(render);
        };
        render();
    }
    setAutoRotate(enabled) {
        this.autoRotate = enabled;
    }
    resetView() {
        this.rotY = -78;
        this.rotX = -20;
        this.velX = 0;
        this.velY = 0;
    }
    destroy() {
        if (this.animId) {
            cancelAnimationFrame(this.animId);
            this.animId = null;
        }
    }
}
