/* ==========================================================================
   KOLTUK — Apple Keynote Slide Engine & Interactive Field Demo
   ========================================================================== */

let currentSlide = 0;
const totalSlides = 6;

// Audio Chime (Web Audio API)
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
function playAppleClick() {
  try {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.12);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.12);
  } catch (e) {}
}

function playAppleSuccess() {
  try {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
    osc.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.08); // E5
    osc.frequency.setValueAtTime(783.99, audioCtx.currentTime + 0.16); // G5
    gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.4);
  } catch (e) {}
}

// Slide Navigation
function goToSlide(index) {
  if (index < 0) index = 0;
  if (index >= totalSlides) index = totalSlides - 1;
  currentSlide = index;

  if (window.innerWidth <= 820) {
    const targetSlide = document.getElementById(`slide-${currentSlide}`);
    if (targetSlide) {
      targetSlide.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  } else {
    // Update Slides
    const slides = document.querySelectorAll('.slide');
    slides.forEach((s, idx) => {
      if (idx === currentSlide) {
        s.classList.add('active');
        s.scrollTop = 0;
      } else {
        s.classList.remove('active');
      }
    });
  }

  // Helper to scroll pill container horizontally without affecting window scroll
  function scrollNavPill(activePill) {
    const pillNav = document.querySelector('.slide-nav-pill');
    if (pillNav && activePill) {
      const targetScroll = activePill.offsetLeft - (pillNav.offsetWidth / 2) + (activePill.offsetWidth / 2);
      pillNav.scrollTo({ left: targetScroll, behavior: 'smooth' });
    }
  }

  // Update Header Pill
  const navDots = document.querySelectorAll('.nav-dot');
  navDots.forEach((d, idx) => {
    if (idx === currentSlide) {
      d.classList.add('active');
      if (window.innerWidth <= 820) {
        scrollNavPill(d);
      }
    } else {
      d.classList.remove('active');
    }
  });

  // Update Bottom Dock Counter
  const currentSlideNum = document.getElementById('currentSlideNum');
  if (currentSlideNum) {
    currentSlideNum.textContent = String(currentSlide + 1).padStart(2, '0');
  }

  // Update Top Progress Fill
  const progressBar = document.getElementById('progressBar');
  if (progressBar) {
    const pct = ((currentSlide + 1) / totalSlides) * 100;
    progressBar.style.width = `${pct}%`;
  }
}

function nextSlide() {
  playAppleClick();
  goToSlide(currentSlide + 1);
}

function prevSlide() {
  playAppleClick();
  goToSlide(currentSlide - 1);
}

// Keyboard controls
window.addEventListener('keydown', (e) => {
  if (document.getElementById('dealModal')?.classList.contains('active')) return;
  if (e.key === 'ArrowRight' || e.key === 'Space') {
    e.preventDefault();
    nextSlide();
  } else if (e.key === 'ArrowLeft') {
    e.preventDefault();
    prevSlide();
  }
});

// Touch Swipe (only on desktop/presentation mode, disabled on mobile vertical scroll)
let touchStartX = 0;
let touchStartY = 0;
window.addEventListener('touchstart', (e) => {
  touchStartX = e.changedTouches[0].screenX;
  touchStartY = e.changedTouches[0].screenY;
}, { passive: true });

window.addEventListener('touchend', (e) => {
  if (window.innerWidth <= 820) return;
  const diffX = touchStartX - e.changedTouches[0].screenX;
  const diffY = touchStartY - e.changedTouches[0].screenY;
  if (Math.abs(diffX) > 60 && Math.abs(diffX) > Math.abs(diffY) * 1.5) {
    if (diffX > 0) nextSlide();
    else prevSlide();
  }
}, { passive: true });

// Mobile Scroll Observer to update nav pill indicator
if ('IntersectionObserver' in window) {
  const slideObserver = new IntersectionObserver((entries) => {
    if (window.innerWidth <= 820) {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const slideId = entry.target.id;
          const idx = parseInt(slideId.replace('slide-', ''), 10);
          if (!isNaN(idx)) {
            currentSlide = idx;
            const dots = document.querySelectorAll('.nav-dot');
            dots.forEach((d, i) => {
              if (i === currentSlide) {
                d.classList.add('active');
                const pillNav = document.querySelector('.slide-nav-pill');
                if (pillNav) {
                  pillNav.scrollTo({
                    left: d.offsetLeft - (pillNav.offsetWidth / 2) + (d.offsetWidth / 2),
                    behavior: 'smooth'
                  });
                }
              } else {
                d.classList.remove('active');
              }
            });
            const progressBar = document.getElementById('progressBar');
            if (progressBar) {
              progressBar.style.width = `${((currentSlide + 1) / totalSlides) * 100}%`;
            }
          }
        }
      });
    }
  }, { threshold: 0.25 });

  document.querySelectorAll('.slide').forEach(s => slideObserver.observe(s));
}

// Setup Nav Pill Clicks
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.nav-dot').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = parseInt(btn.getAttribute('data-slide'), 10);
      playAppleClick();
      goToSlide(target);
    });
  });

  // Fullscreen button
  const fsToggle = document.getElementById('fsToggle');
  if (fsToggle) {
    fsToggle.addEventListener('click', () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      } else {
        document.exitFullscreen().catch(() => {});
      }
    });
  }
});

// --- IPHONE DEMO STATE ---
let demoSelectedServices = [
  { name: 'Saç Kesim', price: 500 },
  { name: 'Sakal Tasarım', price: 300 }
];
let demoSelectedBarber = 'Ahmet Usta';
let demoSelectedTime = '15:30';

function updatePhoneTotal() {
  const total = demoSelectedServices.reduce((sum, s) => sum + s.price, 0);
  const totalEl = document.getElementById('demoPhoneTotal');
  if (totalEl) totalEl.textContent = `₺${total}`;
}

function toggleDemoService(el, price, name) {
  playAppleClick();
  el.classList.toggle('selected');
  if (el.classList.contains('selected')) {
    if (!demoSelectedServices.some(s => s.name === name)) {
      demoSelectedServices.push({ name, price });
    }
  } else {
    demoSelectedServices = demoSelectedServices.filter(s => s.name !== name);
  }
  updatePhoneTotal();
}

function selectDemoBarber(el, name) {
  playAppleClick();
  document.querySelectorAll('.b-card').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  demoSelectedBarber = name;
}

function selectDemoTime(el, time) {
  playAppleClick();
  document.querySelectorAll('.t-btn:not(.disabled)').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
  demoSelectedTime = time;
}

function triggerPhoneBooking() {
  playAppleSuccess();
  const toast = document.getElementById('phoneToast');
  const toastDetail = document.getElementById('toastDetail');
  if (toast && toastDetail) {
    toastDetail.textContent = `${demoSelectedBarber} • Bugün ${demoSelectedTime}`;
    toast.classList.add('active');
    setTimeout(() => {
      toast.classList.remove('active');
    }, 3200);
  }

  // Update iPad next customer dynamically
  const ipadNextName = document.getElementById('ipadNextName');
  const ipadNextTags = document.getElementById('ipadNextTags');
  if (ipadNextName) {
    ipadNextName.textContent = 'Can Öztürk (Yeni Randevu!)';
  }
  if (ipadNextTags) {
    ipadNextTags.innerHTML = demoSelectedServices.map(s => `<span>${s.name}</span>`).join('');
  }
}

// --- IPAD ACTIONS ---
function markCustomerArrived() {
  playAppleSuccess();
  alert('✓ Müşteri geldi olarak onaylandı. Koltuk süresi başladı.');
}

function markCustomerNoShow() {
  playAppleClick();
  alert('🚫 No-Show bildirildi.\nMüşterinin güven puanı düşürüldü. Tekrarında sistem bu müşteriyi bloke eder.');
}

function quickAddWalkin() {
  const name = prompt('Kapıdan gelen müşterinin adı ve telefonu:', 'Serkan Kaya - 0532 111 22 33');
  if (name) {
    playAppleSuccess();
    alert(`✓ ${name} boş koltuğa eklendi. Müşterinin telefonuna otomatik onay WhatsApp mesajı gönderildi.`);
  }
}

// Live Clock for iPad
function updateClock() {
  const clockEl = document.getElementById('liveClock');
  if (!clockEl) return;
  const now = new Date();
  const h = String(now.getHours()).padStart(2, '0');
  const m = String(now.getMinutes()).padStart(2, '0');
  const days = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
  clockEl.textContent = `${h}:${m} • ${days[now.getDay()]}`;
}
setInterval(updateClock, 10000);
updateClock();

// --- DEAL MODAL (5.000 TL) ---
function openDealModal() {
  playAppleClick();
  const modal = document.getElementById('dealModal');
  if (modal) modal.classList.add('active');
}

function closeDealModal() {
  const modal = document.getElementById('dealModal');
  if (modal) modal.classList.remove('active');
}

function handleDealSubmit(e) {
  e.preventDefault();
  playAppleSuccess();
  const form = document.getElementById('barberQuickForm');
  const success = document.getElementById('dealSuccess');
  if (form && success) {
    form.style.display = 'none';
    success.classList.add('active');
  }
}
