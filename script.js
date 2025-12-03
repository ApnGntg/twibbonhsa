// ===================================
// KODE INI DITAMBAHKAN DI AKHIR FILE script.js YANG SUDAH ADA
// JANGAN HAPUS KODE YANG SUDAH ADA, CUKUP TAMBAHKAN INI DI BAWAHNYA
// ===================================

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
        const canvas = document.getElementById('canvas');
        
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
    const canvas = document.getElementById('canvas');
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
    const canvas = document.getElementById('canvas');
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
    const canvas = document.getElementById('canvas');
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
    const canvas = document.getElementById('canvas');
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