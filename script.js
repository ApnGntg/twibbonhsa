// ===================================
// SCRIPT.JS LENGKAP UNTUK TWIBBON HSA
// GANTI SEMUA ISI script.js DENGAN INI
// ===================================

// ===== GLOBAL VARIABLES =====
let selectedFrame = null;
let uploadedPhoto = null;
let canvas, ctx;
let scale = 1;
let offsetX = 0;
let offsetY = 0;

// ===== TEMPLATES FRAME =====
const templates = [
    { id: 1, name: 'Frame 1', src: 'frames/frame1.png' },
    { id: 2, name: 'Frame 2', src: 'frame2.png' },
    { id: 3, name: 'Frame 3', src: 'frame3.png' },
    { id: 4, name: 'MPLS', src: 'mpls.png' },
    // Tambahkan frame lain di sini
];

// ===== INITIALIZE =====
document.addEventListener('DOMContentLoaded', function() {
    canvas = document.getElementById('canvas');
    if (canvas) {
        ctx = canvas.getContext('2d');
    }
    
    loadTemplates();
    setupEventListeners();
    animateStats();
    loadHistory();
});

// ===== TOGGLE MENU (MOBILE) =====
function toggleMenu() {
    const navMenu = document.getElementById('navMenu');
    if (navMenu) {
        navMenu.classList.toggle('active');
    }
}

// ===== TOGGLE THEME (DARK/LIGHT MODE) =====
function toggleTheme() {
    const body = document.body;
    const currentTheme = body.getAttribute('data-theme');
    
    if (currentTheme === 'dark') {
        body.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light');
    } else {
        body.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
    }
}

// Load saved theme
const savedTheme = localStorage.getItem('theme');
if (savedTheme) {
    document.body.setAttribute('data-theme', savedTheme);
}

// ===== ANIMATE STATISTICS COUNTER =====
function animateStats() {
    const stats = document.querySelectorAll('.stat-number');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = parseInt(entry.target.getAttribute('data-count'));
                animateCounter(entry.target, target);
                observer.unobserve(entry.target);
            }
        });
    });
    
    stats.forEach(stat => observer.observe(stat));
}

function animateCounter(element, target) {
    let current = 0;
    const increment = target / 50;
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target;
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current);
        }
    }, 30);
}

// ===== LOAD TEMPLATES =====
function loadTemplates() {
    const templateGrid = document.getElementById('templateGrid');
    if (!templateGrid) return;
    
    templateGrid.innerHTML = '';
    
    templates.forEach(template => {
        const item = document.createElement('div');
        item.className = 'template-item';
        item.innerHTML = `<img src="${template.src}" alt="${template.name}">`;
        item.onclick = () => selectTemplate(template.src, item);
        templateGrid.appendChild(item);
    });
}

// ===== SELECT TEMPLATE =====
function selectTemplate(src, element) {
    // Remove previous selection
    document.querySelectorAll('.template-item').forEach(item => {
        item.classList.remove('selected');
    });
    
    // Add selection to clicked item
    element.classList.add('selected');
    
    selectedFrame = new Image();
    selectedFrame.src = src;
    selectedFrame.onload = () => {
        if (uploadedPhoto) {
            renderCanvas();
        }
    };
}

// ===== SETUP EVENT LISTENERS =====
function setupEventListeners() {
    // File input for photo
    const fileInput = document.getElementById('fileInput');
    if (fileInput) {
        fileInput.addEventListener('change', handlePhotoUpload);
    }
    
    // Custom frame upload
    const customFrameInput = document.getElementById('customFrameInput');
    if (customFrameInput) {
        customFrameInput.addEventListener('change', handleCustomFrame);
    }
    
    // Drag and drop
    const uploadBox = document.getElementById('uploadBox');
    if (uploadBox) {
        uploadBox.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadBox.style.background = 'rgba(33, 150, 243, 0.1)';
        });
        
        uploadBox.addEventListener('dragleave', () => {
            uploadBox.style.background = '';
        });
        
        uploadBox.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadBox.style.background = '';
            const file = e.dataTransfer.files[0];
            if (file && file.type.startsWith('image/')) {
                loadPhotoFromFile(file);
            }
        });
    }
    
    // Control sliders
    const scaleSlider = document.getElementById('scaleSlider');
    const xSlider = document.getElementById('xSlider');
    const ySlider = document.getElementById('ySlider');
    
    if (scaleSlider) {
        scaleSlider.addEventListener('input', (e) => {
            scale = parseFloat(e.target.value);
            document.getElementById('scaleValue').textContent = scale.toFixed(1);
            renderCanvas();
        });
    }
    
    if (xSlider) {
        xSlider.addEventListener('input', (e) => {
            offsetX = parseInt(e.target.value);
            document.getElementById('xValue').textContent = offsetX;
            renderCanvas();
        });
    }
    
    if (ySlider) {
        ySlider.addEventListener('input', (e) => {
            offsetY = parseInt(e.target.value);
            document.getElementById('yValue').textContent = offsetY;
            renderCanvas();
        });
    }
}

// ===== HANDLE PHOTO UPLOAD =====
function handlePhotoUpload(e) {
    const file = e.target.files[0];
    if (file) {
        loadPhotoFromFile(file);
    }
}

function loadPhotoFromFile(file) {
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
        alert('⚠️ Ukuran file terlalu besar! Maksimal 5MB');
        return;
    }
    
    // Show loading
    const loading = document.getElementById('loading');
    if (loading) {
        loading.style.display = 'block';
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
        uploadedPhoto = new Image();
        uploadedPhoto.onload = () => {
            if (loading) {
                loading.style.display = 'none';
            }
            
            // Show preview section
            const previewSection = document.getElementById('previewSection');
            if (previewSection) {
                previewSection.classList.remove('hidden');
            }
            
            // Reset controls
            resetControls();
            
            // Render if frame is selected
            if (selectedFrame) {
                renderCanvas();
            } else {
                alert('📋 Pilih template frame terlebih dahulu!');
            }
        };
        uploadedPhoto.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

// ===== HANDLE CUSTOM FRAME =====
function handleCustomFrame(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            selectedFrame = new Image();
            selectedFrame.onload = () => {
                if (uploadedPhoto) {
                    renderCanvas();
                }
                showToast('✅ Custom frame berhasil diupload!');
            };
            selectedFrame.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
}

// ===== RENDER CANVAS =====
function renderCanvas() {
    if (!canvas || !ctx || !uploadedPhoto || !selectedFrame) return;
    
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    
    // Calculate photo dimensions
    const photoWidth = uploadedPhoto.width * scale;
    const photoHeight = uploadedPhoto.height * scale;
    
    // Center photo
    const x = (canvasWidth - photoWidth) / 2 + offsetX;
    const y = (canvasHeight - photoHeight) / 2 + offsetY;
    
    // Draw photo
    ctx.drawImage(uploadedPhoto, x, y, photoWidth, photoHeight);
    
    // Draw frame on top
    ctx.drawImage(selectedFrame, 0, 0, canvasWidth, canvasHeight);
}

// ===== RESET CONTROLS =====
function resetControls() {
    scale = 1;
    offsetX = 0;
    offsetY = 0;
    
    const scaleSlider = document.getElementById('scaleSlider');
    const xSlider = document.getElementById('xSlider');
    const ySlider = document.getElementById('ySlider');
    
    if (scaleSlider) {
        scaleSlider.value = 1;
        document.getElementById('scaleValue').textContent = '1.0';
    }
    if (xSlider) {
        xSlider.value = 0;
        document.getElementById('xValue').textContent = '0';
    }
    if (ySlider) {
        ySlider.value = 0;
        document.getElementById('yValue').textContent = '0';
    }
}

// ===== DOWNLOAD IMAGE =====
function downloadImage() {
    if (!canvas) {
        alert('⚠️ Belum ada twibbon yang dibuat!');
        return;
    }
    
    const link = document.createElement('a');
    link.download = `twibbon-hsa-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    
    showToast('💾 Twibbon berhasil didownload!');
}

// ===== SAVE TO HISTORY =====
function saveToHistory() {
    if (!canvas) {
        alert('⚠️ Belum ada twibbon yang dibuat!');
        return;
    }
    
    const history = JSON.parse(localStorage.getItem('twibbonHistory') || '[]');
    const imageData = canvas.toDataURL('image/png');
    
    history.unshift({
        id: Date.now(),
        image: imageData,
        date: new Date().toLocaleDateString('id-ID')
    });
    
    // Limit to 10 items
    if (history.length > 10) {
        history.pop();
    }
    
    localStorage.setItem('twibbonHistory', JSON.stringify(history));
    loadHistory();
    
    showToast('💼 Twibbon berhasil disimpan ke history!');
}

// ===== LOAD HISTORY =====
function loadHistory() {
    const historyGrid = document.getElementById('historyGrid');
    if (!historyGrid) return;
    
    const history = JSON.parse(localStorage.getItem('twibbonHistory') || '[]');
    
    if (history.length === 0) {
        historyGrid.innerHTML = '<p style="color: var(--text-light);">Belum ada history. Buat twibbon pertama kamu!</p>';
        return;
    }
    
    historyGrid.innerHTML = '';
    history.forEach(item => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        historyItem.innerHTML = `
            <img src="${item.image}" alt="History">
            <div class="history-date">${item.date}</div>
        `;
        historyItem.onclick = () => downloadHistoryItem(item.image);
        historyGrid.appendChild(historyItem);
    });
}

function downloadHistoryItem(imageData) {
    const link = document.createElement('a');
    link.download = `twibbon-hsa-history-${Date.now()}.png`;
    link.href = imageData;
    link.click();
    
    showToast('💾 History item didownload!');
}

// ===== RESET ALL =====
function resetAll() {
    const confirm = window.confirm('🔄 Reset semua? Foto dan pengaturan akan dihapus.');
    if (!confirm) return;
    
    uploadedPhoto = null;
    selectedFrame = null;
    resetControls();
    
    const previewSection = document.getElementById('previewSection');
    if (previewSection) {
        previewSection.classList.add('hidden');
    }
    
    if (canvas && ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    
    // Reset file inputs
    const fileInput = document.getElementById('fileInput');
    if (fileInput) fileInput.value = '';
    
    // Remove template selection
    document.querySelectorAll('.template-item').forEach(item => {
        item.classList.remove('selected');
    });
    
    showToast('🔄 Reset berhasil!');
}

// ===== PWA INSTALLATION =====
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    
    const installPrompt = document.getElementById('installPrompt');
    if (installPrompt) {
        installPrompt.style.display = 'block';
    }
});

const installBtn = document.getElementById('installBtn');
if (installBtn) {
    installBtn.addEventListener('click', async () => {
        if (!deferredPrompt) return;
        
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        
        console.log(`User response: ${outcome}`);
        
        if (outcome === 'accepted') {
            showToast('✅ Aplikasi berhasil diinstall!');
        }
        
        deferredPrompt = null;
        document.getElementById('installPrompt').style.display = 'none';
    });
}

const dismissBtn = document.getElementById('dismissBtn');
if (dismissBtn) {
    dismissBtn.addEventListener('click', () => {
        document.getElementById('installPrompt').style.display = 'none';
    });
}

// Register Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/twibbonhsa/sw.js')
            .then(registration => {
                console.log('✅ ServiceWorker registered:', registration.scope);
            })
            .catch(err => {
                console.log('❌ ServiceWorker registration failed:', err);
            });
    });
}

// ===== SOCIAL MEDIA SHARE (Web Share API) =====
const shareBtn = document.getElementById('shareBtn');
if (shareBtn) {
    shareBtn.addEventListener('click', async () => {
        if (!canvas) {
            showToast('⚠️ Belum ada twibbon yang dibuat');
            return;
        }
        
        try {
            canvas.toBlob(async (blob) => {
                if (!blob) {
                    showToast('❌ Gagal mengkonversi gambar');
                    return;
                }
                
                const file = new File([blob], 'twibbon-hsa.png', { type: 'image/png' });
                
                if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
                    try {
                        await navigator.share({
                            title: 'Twibbon HSA',
                            text: 'Lihat twibbon keren yang aku buat di HSA Twibbon Generator! 🎓',
                            files: [file]
                        });
                        showToast('✅ Berhasil share!');
                    } catch (err) {
                        if (err.name !== 'AbortError') {
                            console.log('Error sharing:', err);
                            fallbackShare(canvas);
                        }
                    }
                } else {
                    fallbackShare(canvas);
                }
            }, 'image/png');
        } catch (err) {
            console.error('Error:', err);
            showToast('❌ Gagal share gambar');
        }
    });
}

function fallbackShare(canvas) {
    const userChoice = confirm(
        '📱 Browser kamu tidak support share langsung.\n\n' +
        'Klik OK untuk download gambar,\n' +
        'atau Cancel untuk copy link website.'
    );
    
    if (userChoice) {
        const link = document.createElement('a');
        link.download = 'twibbon-hsa-' + Date.now() + '.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
        showToast('💾 Gambar berhasil didownload!');
    } else {
        const url = window.location.href;
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(url)
                .then(() => showToast('📋 Link berhasil dicopy!'))
                .catch(() => showToast('❌ Gagal copy link'));
        } else {
            const textArea = document.createElement('textarea');
            textArea.value = url;
            textArea.style.position = 'fixed';
            textArea.style.opacity = '0';
            document.body.appendChild(textArea);
            textArea.select();
            try {
                document.execCommand('copy');
                showToast('📋 Link berhasil dicopy!');
            } catch (err) {
                showToast('❌ Gagal copy link');
            }
            document.body.removeChild(textArea);
        }
    }
}

// ===== SHARE TO SPECIFIC SOCIAL MEDIA =====
function shareToFacebook() {
    if (!canvas) {
        showToast('⚠️ Belum ada twibbon yang dibuat');
        return;
    }
    
    const url = encodeURIComponent(window.location.href);
    const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
    
    window.open(shareUrl, 'facebook-share', 'width=600,height=400');
    showToast('📘 Membuka Facebook...');
}

function shareToTwitter() {
    if (!canvas) {
        showToast('⚠️ Belum ada twibbon yang dibuat');
        return;
    }
    
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent('Lihat twibbon keren yang aku buat di HSA Twibbon Generator! 🎓');
    const shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${text}`;
    
    window.open(shareUrl, 'twitter-share', 'width=600,height=400');
    showToast('🐦 Membuka Twitter...');
}

function shareToWhatsApp() {
    if (!canvas) {
        showToast('⚠️ Belum ada twibbon yang dibuat');
        return;
    }
    
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent('Lihat twibbon keren yang aku buat di HSA Twibbon Generator! 🎓 ');
    
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    const shareUrl = isMobile 
        ? `whatsapp://send?text=${text}${url}`
        : `https://web.whatsapp.com/send?text=${text}${url}`;
    
    window.open(shareUrl, '_blank');
    showToast('💬 Membuka WhatsApp...');
}

function shareToInstagram() {
    if (!canvas) {
        showToast('⚠️ Belum ada twibbon yang dibuat');
        return;
    }
    
    alert(
        '📷 Instagram Tips:\n\n' +
        '1. Klik tombol "Download Twibbon"\n' +
        '2. Buka Instagram app\n' +
        '3. Upload gambar yang sudah didownload\n' +
        '4. Jangan lupa tag @smkhsa! 😊'
    );
    
    const link = document.createElement('a');
    link.download = 'twibbon-hsa-' + Date.now() + '.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
    
    showToast('💾 Gambar didownload! Upload ke Instagram ya! 📷');
}

// ===== TOAST NOTIFICATION =====
function showToast(message, duration = 3000) {
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }
    
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        if (toast.parentNode) {
            toast.remove();
        }
    }, duration);
}

// ===== CHECK IF APP IS INSTALLED =====
window.addEventListener('appinstalled', (evt) => {
    console.log('✅ PWA berhasil diinstall!');
    showToast('🎉 Aplikasi berhasil diinstall!');
});

// ===== DETECT IF RUNNING AS PWA =====
function isRunningAsPWA() {
    return (window.matchMedia('(display-mode: standalone)').matches) || 
           (window.navigator.standalone) || 
           document.referrer.includes('android-app://');
}

if (isRunningAsPWA()) {
    console.log('✅ Running as PWA');
} else {
    console.log('🌐 Running in browser');
}

// ===== UPDATE AVAILABLE NOTIFICATION =====
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('controllerchange', () => {
        const shouldRefresh = confirm(
            '🔄 Update tersedia!\n\n' +
            'Aplikasi akan dimuat ulang untuk mendapatkan versi terbaru.'
        );
        
        if (shouldRefresh) {
            window.location.reload();
        }
    });
}
