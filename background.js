// --- Setup ---
const canvas = document.getElementById('bg-canvas');
if (!canvas) {
    throw new Error("Could not find canvas element with id 'bg-canvas'");
}
const ctx = canvas.getContext('2d');

// --- Configuration ---
const PIXEL_SCALE = 4;
const CYCLE_DURATION_S = 120; // 2 minutes for a full day-night cycle
const STAR_COUNT = 200;

const COLORS = {
    daySky: '#64b5f6',      // A brighter blue
    sunsetSky: '#ff5722',   // A more vibrant orange
    nightSky: '#0d001a',
    sun: '#ffca28',
    sunGlow: 'rgba(255, 202, 40, 0.3)',
    moon: '#e0e0e0',
    moonGlow: 'rgba(224, 224, 224, 0.2)',
    hill1: '#00695c',
    hill2: '#004d40',
};

// --- State ---
let offscreenCanvas, offscreenCtx;
let stars = [];
let logicalWidth, logicalHeight;

function setup() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    logicalWidth = Math.floor(canvas.width / PIXEL_SCALE);
    logicalHeight = Math.floor(canvas.height / PIXEL_SCALE);

    if (!offscreenCanvas) {
        offscreenCanvas = document.createElement('canvas');
        offscreenCtx = offscreenCanvas.getContext('2d');
    }
    offscreenCanvas.width = logicalWidth;
    offscreenCanvas.height = logicalHeight;
    
    ctx.imageSmoothingEnabled = false;
    
    generateStars();
}

function handleResize() {
    setup();
}

function generateStars() {
    stars = [];
    for (let i = 0; i < STAR_COUNT; i++) {
        stars.push({
            x: Math.random() * logicalWidth,
            y: Math.random() * logicalHeight * 0.8,
            size: Math.random() * 1.5 + 0.5,
            alpha: Math.random() * 0.5 + 0.5,
            twinkleSpeed: Math.random() * 0.05
        });
    }
}

// --- Drawing Functions ---

function lerpColor(c1, c2, factor) {
    const r1 = parseInt(c1.substring(1, 3), 16), g1 = parseInt(c1.substring(3, 5), 16), b1 = parseInt(c1.substring(5, 7), 16);
    const r2 = parseInt(c2.substring(1, 3), 16), g2 = parseInt(c2.substring(3, 5), 16), b2 = parseInt(c2.substring(5, 7), 16);
    const r = Math.round(r1 + (r2 - r1) * factor), g = Math.round(g1 + (g2 - g1) * factor), b = Math.round(b1 + (b2 - b1) * factor);
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

function drawSky(progress) {
    let skyColor;
    if (progress < 0.4) { // Day
        skyColor = COLORS.daySky;
    } else if (progress < 0.5) { // Sunset
        skyColor = lerpColor(COLORS.daySky, COLORS.sunsetSky, (progress - 0.4) / 0.1);
    } else if (progress < 0.6) { // Dusk
        skyColor = lerpColor(COLORS.sunsetSky, COLORS.nightSky, (progress - 0.5) / 0.1);
    } else if (progress < 0.9) { // Night
        skyColor = COLORS.nightSky;
    } else { // Sunrise
        skyColor = lerpColor(COLORS.nightSky, COLORS.daySky, (progress - 0.9) / 0.1);
    }
    offscreenCtx.fillStyle = skyColor;
    offscreenCtx.fillRect(0, 0, logicalWidth, logicalHeight);
}

function drawStars(progress, time) {
    let nightFactor = 0;
    if (progress >= 0.6 && progress < 0.9) {
        nightFactor = 1;
    } else if (progress >= 0.5 && progress < 0.6) {
        nightFactor = (progress - 0.5) / 0.1;
    } else if (progress >= 0.9) {
        nightFactor = 1 - ((progress - 0.9) / 0.1);
    }

    if (nightFactor > 0) {
        stars.forEach(star => {
            const alpha = star.alpha * nightFactor * (Math.sin(time * star.twinkleSpeed) * 0.25 + 0.75);
            offscreenCtx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
            offscreenCtx.fillRect(star.x, star.y, star.size, star.size);
        });
    }
}

function drawCelestialBody(progress, pathStart, pathEnd, color, glowColor, size) {
    const pathDuration = (pathEnd - pathStart + 1) % 1;
    let currentPosOnPath = (progress - pathStart + 1) % 1;

    if (currentPosOnPath > pathDuration) return; // Not visible

    const angle = (currentPosOnPath / pathDuration) * Math.PI; // 0 to PI for a semi-circle

    const radiusX = logicalWidth / 2 + size;
    const radiusY = logicalHeight * 0.5;
    const centerX = logicalWidth / 2;
    const centerY = logicalHeight * 0.8;

    const bodyX = centerX - Math.cos(angle) * radiusX;
    const bodyY = centerY - Math.sin(angle) * radiusY;

    // Draw circular glow
    const glowGradient = offscreenCtx.createRadialGradient(bodyX, bodyY, size * 0.5, bodyX, bodyY, size * 2);
    glowGradient.addColorStop(0, glowColor);
    glowGradient.addColorStop(1, 'transparent');
    offscreenCtx.fillStyle = glowGradient;
    offscreenCtx.fillRect(bodyX - size * 2, bodyY - size * 2, size * 4, size * 4);
    
    // Draw body
    offscreenCtx.fillStyle = color;
    offscreenCtx.fillRect(Math.floor(bodyX - size / 2), Math.floor(bodyY - size / 2), size, size);
}

function drawLandscape() {
    // Furthest hill
    offscreenCtx.fillStyle = COLORS.hill2;
    offscreenCtx.beginPath();
    offscreenCtx.moveTo(0, logicalHeight);
    offscreenCtx.lineTo(0, logicalHeight * 0.8);
    offscreenCtx.quadraticCurveTo(logicalWidth * 0.25, logicalHeight * 0.7, logicalWidth * 0.5, logicalHeight * 0.8);
    offscreenCtx.quadraticCurveTo(logicalWidth * 0.75, logicalHeight * 0.9, logicalWidth, logicalHeight * 0.8);
    offscreenCtx.lineTo(logicalWidth, logicalHeight);
    offscreenCtx.fill();

    // Closest hill
    offscreenCtx.fillStyle = COLORS.hill1;
    offscreenCtx.beginPath();
    offscreenCtx.moveTo(0, logicalHeight);
    offscreenCtx.lineTo(0, logicalHeight * 0.85);
    offscreenCtx.quadraticCurveTo(logicalWidth * 0.5, logicalHeight * 0.75, logicalWidth, logicalHeight * 0.95);
    offscreenCtx.lineTo(logicalWidth, logicalHeight);
    offscreenCtx.fill();
}

// --- Animation Loop ---
function animate(time) {
    if (!ctx || !offscreenCtx) return;

    time /= 1000;
    const progress = (time / CYCLE_DURATION_S) % 1;

    // 1. Draw to offscreen canvas
    drawSky(progress);
    drawStars(progress, time);
    
    // Sun is visible from sunrise (0.9) to sunset (0.5)
    drawCelestialBody(progress, 0.9, 0.5, COLORS.sun, COLORS.sunGlow, 8); 
    // Moon is visible from dusk (0.5) to dawn (0.9)
    drawCelestialBody(progress, 0.5, 0.9, COLORS.moon, COLORS.moonGlow, 6);

    drawLandscape();

    // 2. Scale up to main canvas
    ctx.drawImage(offscreenCanvas, 0, 0, logicalWidth, logicalHeight, 0, 0, canvas.width, canvas.height);

    requestAnimationFrame(animate);
}

// --- Start ---
window.addEventListener('resize', handleResize);
setup();
requestAnimationFrame(animate);
