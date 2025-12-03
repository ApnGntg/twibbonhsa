// KONFIGURASI TEMPLATE
const templates = [
    { id: 1, name: 'MPLS', file: 'mpls.png' },
    { id: 2, name: 'SANTRI', file: 'frame2.png' },
    { id: 3, name: 'KARTINI', file: 'frame3.png' },
];

let customTemplates = [];
let canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d');
let uploadedImage = null;
let currentFrame = null;
let selectedTemplateId = 1;

let scale = 1;
let offsetX = 0;
let offsetY = 0;

// Theme Toggle
function toggleTheme() {
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-theme');
    const themeToggle = document.querySelector('.theme-toggle');
    
    if (currentTheme === 'dark') {
        html.removeAttribute('data-theme');
        themeToggle.textContent = '🌙';
        localStorage.setItem('theme', 'light');
    } else {
        html.setAttribute('data-theme', 'dark');
        themeToggle.textContent = '☀️';
        localStorage.setItem('theme', 'dark');
    }
}

// Load saved theme
window.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        document.querySelector('.theme-toggle').textContent = '☀️';
    }
    loadHistory();
});

// Mobile Menu Toggle
function toggleMenu() {
    const navMenu = document.getElementById('navMenu');
    navMenu.classList.toggle('active');
}

// Generate template grid
function generateTemplateGrid() {
    const grid = document.getElementById('templateGrid');
    grid.innerHTML = '';
    
    const allTemplates = [...templates, ...customTemplates];
    
    allTemplates.forEach((template, index) => {
        const item = document.createElement('div');
        item.className = 'template-item' + (index === 0 ? ' active' : '');
        item.onclick = () => selectTemplate(template.id);
        
        item.innerHTML = `
            <img src="${template.file}" alt="${template.name}" 
                 onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22%3E%3Crect width=%22200%22 height=%22200%22 fill=%22%23667eea%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 font-size=%2220%22 fill=%22white%22%3E${template.name}%3C/text%3E%3C/svg%3E'">
            <p>${template.name}</p>
        `;
        
        grid.appendChild(item);
    });
}

// Select template
function selectTemplate(templateId) {
    selectedTemplateId = templateId;
    
    document.querySelectorAll('.template-item').forEach(item => {
        item.classList.remove('active');
    });
    
    const allTemplates = [...templates, ...customTemplates];
    const template = allTemplates.find(t => t.id === templateId);
    
    if (template) {
        const items = document.querySelectorAll('.template-item');
        const index = allTemplates.indexOf(template);
        if (items[index]) {
            items[index].classList.add('active');
        }
        
        currentFrame = new Image();
        currentFrame.crossOrigin = "anonymous";
        currentFrame.src = template.file;
        currentFrame.onload = () => {
            if (uploadedImage) {
                drawCanvas();
            }
        };
    }
}

// Upload custom template
document.getElementById('customFrameInput').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
        alert('Tolong upload file gambar!');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(event) {
        const customId = Date.now();
        customTemplates.push({
            id: customId,
            name: 'Custom ' + (customTemplates.length + 1),
            file: event.target.result
        });
        
        generateTemplateGrid();
        selectTemplate(customId);
        alert('Template custom berhasil ditambahkan! ✅');
    };
    reader.readAsDataURL(file);
});

generateTemplateGrid();
selectTemplate(1);

// Upload box handlers
const uploadBox = document.getElementById('uploadBox');
const fileInput = document.getElementById('fileInput');

['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    uploadBox.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

['dragenter', 'dragover'].forEach(eventName => {
    uploadBox.addEventListener(eventName, () => {
        uploadBox.classList.add('dragover');
    });
});

['dragleave', 'drop'].forEach(eventName => {
    uploadBox.addEventListener(eventName, () => {
        uploadBox.classList.remove('dragover');
    });
});

uploadBox.addEventListener('drop', handleDrop);

function handleDrop(e) {
    const files = e.dataTransfer.files;
    handleFiles(files);
}

fileInput.addEventListener('change', function(e) {
    handleFiles(e.target.files);
});

function handleFiles(files) {
    if (files.length === 0) return;
    
    const file = files[0];
    
    if (!file.type.startsWith('image/')) {
        alert('Tolong upload file gambar!');
        return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
        alert('Ukuran file maksimal 5MB!');
        return;
    }
    
    document.getElementById('loading').classList.add('active');
    
    const reader = new FileReader();
    reader.onload = function(e) {
        uploadedImage = new Image();
        uploadedImage.onload = function() {
            setTimeout(() => {
                document.getElementById('loading').classList.remove('active');
                document.getElementById('previewSection').classList.remove('hidden');
                document.getElementById('previewSection').scrollIntoView({ behavior: 'smooth' });
                resetControls();
                drawCanvas();
            }, 500);
        };
        uploadedImage.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

// Slider controls
document.getElementById('scaleSlider').addEventListener('input', function(e) {
    scale = parseFloat(e.target.value);
    document.getElementById('scaleValue').textContent = scale.toFixed(1);
    drawCanvas();
});

document.getElementById('xSlider').addEventListener('input', function(e) {
    offsetX = parseInt(e.target.value);
    document.getElementById('xValue').textContent = offsetX;
    drawCanvas();
});

document.getElementById('ySlider').addEventListener('input', function(e) {
    offsetY = parseInt(e.target.value);
    document.getElementById('yValue').textContent = offsetY;
    drawCanvas();
});

function drawCanvas() {
    if (!uploadedImage || !currentFrame) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(canvas.width/2 + offsetX, canvas.height/2 + offsetY);
    ctx.scale(scale, scale);
    
    const imgAspect = uploadedImage.width / uploadedImage.height;
    const canvasAspect = canvas.width / canvas.height;
    
    let drawWidth, drawHeight;
    if (imgAspect > canvasAspect) {
        drawHeight = canvas.height;
        drawWidth = drawHeight * imgAspect;
    } else {
        drawWidth = canvas.width;
        drawHeight = drawWidth / imgAspect;
    }
    
    ctx.drawImage(uploadedImage, -drawWidth/2, -drawHeight/2, drawWidth, drawHeight);
    ctx.restore();

    if (currentFrame.complete && currentFrame.naturalHeight !== 0) {
        ctx.drawImage(currentFrame, 0, 0, canvas.width, canvas.height);
    }
}

function resetControls() {
    scale = 1;
    offsetX = 0;
    offsetY = 0;
    document.getElementById('scaleSlider').value = 1;
    document.getElementById('xSlider').value = 0;
    document.getElementById('ySlider').value = 0;
    document.getElementById('scaleValue').textContent = '1.0';
    document.getElementById('xValue').textContent = '0';
    document.getElementById('yValue').textContent = '0';
}

function downloadImage() {
    const link = document.createElement('a');
    const allTemplates = [...templates, ...customTemplates];
    const template = allTemplates.find(t => t.id === selectedTemplateId);
    const fileName = 'twibbon-hsa-' + template.name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now() + '.png';
    link.download = fileName;
    link.href = canvas.toDataURL('image/png', 1.0);
    link.click();
    
    alert('✅ Twibbon berhasil didownload!');
}

function resetAll() {
    uploadedImage = null;
    document.getElementById('previewSection').classList.add('hidden');
    document.getElementById('fileInput').value = '';
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// History Management
function saveToHistory() {
    const dataURL = canvas.toDataURL('image/png');
    const history = JSON.parse(localStorage.getItem('twibbonHistory') || '[]');
    
    history.unshift({
        id: Date.now(),
        image: dataURL,
        date: new Date().toLocaleString('id-ID')
    });
    
    // Limit to 20 items
    if (history.length > 20) {
        history.pop();
    }
    
    localStorage.setItem('twibbonHistory', JSON.stringify(history));
    loadHistory();
    alert('✅ Twibbon berhasil disimpan ke history!');
}

function loadHistory() {
    const history = JSON.parse(localStorage.getItem('twibbonHistory') || '[]');
    const grid = document.getElementById('historyGrid');
    
    if (history.length === 0) {
        grid.innerHTML = '<p style="color: var(--text-light);">Belum ada history. Buat twibbon pertama kamu!</p>';
        return;
    }
    
    grid.innerHTML = '';
    history.forEach(item => {
        const div = document.createElement('div');
        div.className = 'history-item';
        div.innerHTML = `
            <img src="${item.image}" alt="History" onclick="viewHistory(${item.id})">
            <button class="delete-btn" onclick="deleteHistory(${item.id}, event)">✕</button>
        `;
        grid.appendChild(div);
    });
}

function viewHistory(id) {
    const history = JSON.parse(localStorage.getItem('twibbonHistory') || '[]');
    const item = history.find(h => h.id === id);
    if (item) {
        const link = document.createElement('a');
        link.download = 'twibbon-history-' + id + '.png';
        link.href = item.image;
        link.click();
    }
}

function deleteHistory(id, event) {
    event.stopPropagation();
    if (confirm('Hapus twibbon ini dari history?')) {
        let history = JSON.parse(localStorage.getItem('twibbonHistory') || '[]');
        history = history.filter(h => h.id !== id);
        localStorage.setItem('twibbonHistory', JSON.stringify(history));
        loadHistory();
    }
}

// Share Functions
function shareToFacebook() {
    alert('💡 Tip: Download twibbon kamu, lalu upload ke Facebook dengan caption tentang HSA!');
    downloadImage();
}

function shareToTwitter() {
    const text = encodeURIComponent('Lihat twibbon keren saya dari SMK HSA! 🎓 #SMKHSA #Twibbon');
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
}

function shareToWhatsApp() {
    const text = encodeURIComponent('Lihat twibbon keren saya dari SMK HSA! 🎓');
    window.open(`https://wa.me/?text=${text}`, '_blank');
    setTimeout(() => {
        alert('💡 Jangan lupa attach file twibbon yang sudah kamu download!');
    }, 1000);
}

function shareToInstagram() {
    alert('💡 Tip Instagram:\n1. Download twibbon kamu\n2. Buka Instagram\n3. Upload sebagai post/story\n4. Tag @smkhsa dan gunakan hashtag #SMKHSA');
    downloadImage();
}

// Smooth scroll for navigation
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            // Close mobile menu after click
            document.getElementById('navMenu').classList.remove('active');
        }
    });
});

// Animated Counter
function animateCounter(element, target) {
    let current = 0;
    const increment = target / 100;
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target.toLocaleString('id-ID');
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current).toLocaleString('id-ID');
        }
    }, 20);
}

// Intersection Observer for Counter Animation
const observerOptions = {
    threshold: 0.5
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const counters = entry.target.querySelectorAll('.stat-number');
            counters.forEach(counter => {
                const target = parseInt(counter.getAttribute('data-count'));
                animateCounter(counter, target);
            });
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

const statsContainer = document.querySelector('.stats-container');
if (statsContainer) {
    observer.observe(statsContainer);
}

// Add scroll reveal animation
const revealElements = document.querySelectorAll('.card, .gallery-item');
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, { threshold: 0.1 });

revealElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(50px)';
    el.style.transition = 'all 0.6s ease';
    revealObserver.observe(el);
});