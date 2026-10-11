/* GameDistribution Interactive JavaScript */

function playGame() {
  const coverCard = document.getElementById('gd-cover-card');
  const iframeContainer = document.getElementById('gd-iframe-container');
  const iframe = document.getElementById('game-area');

  if (coverCard && iframeContainer) {
    coverCard.style.display = 'none';
    iframeContainer.style.display = 'block';
    
    // Ensure iframe src is set if lazy or deferred
    if (iframe && iframe.dataset.src && !iframe.src) {
      iframe.src = iframe.dataset.src;
    }
  }
}

function openFullscreen() {
  const coverCard = document.getElementById('gd-cover-card');
  if (coverCard && coverCard.style.display !== 'none') {
    playGame();
  }
  const iframe = document.getElementById('game-area');
  if (!iframe) return;

  if (iframe.requestFullscreen) {
    iframe.requestFullscreen();
  } else if (iframe.mozRequestFullScreen) { /* Firefox */
    iframe.mozRequestFullScreen();
  } else if (iframe.webkitRequestFullscreen) { /* Chrome, Safari and Opera */
    iframe.webkitRequestFullscreen();
  } else if (iframe.msRequestFullscreen) { /* IE/Edge */
    iframe.msRequestFullscreen();
  }
}

function openInNewTab() {
  const iframe = document.getElementById('game-area');
  if (iframe && iframe.src) {
    window.open(iframe.src, '_blank');
  } else {
    window.open(window.location.href, '_blank');
  }
}

function copyEmbedCode() {
  const input = document.getElementById('gd-embed-input');
  if (input) {
    input.select();
    input.setSelectionRange(0, 99999);
    navigator.clipboard.writeText(input.value).then(() => {
      showToast('Copied Embed Code to clipboard!');
    }).catch(err => {
      showToast('Copied Embed Code!');
    });
  }
}

function copyExampleUrl() {
  const input = document.getElementById('gd-url-input');
  if (input) {
    input.select();
    input.setSelectionRange(0, 99999);
    navigator.clipboard.writeText(input.value).then(() => {
      showToast('Copied Example URL to clipboard!');
    }).catch(err => {
      showToast('Copied Example URL!');
    });
  }
}

function showToast(message) {
  let toast = document.getElementById('gd-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'gd-toast';
    toast.className = 'gd-toast';
    document.body.appendChild(toast);
  }
  toast.innerHTML = `<i class="fas fa-check-circle" style="color:#10b981;"></i> ${message}`;
  toast.classList.add('show');
  
  setTimeout(() => {
    toast.classList.remove('show');
  }, 2500);
}

// Slider controls
let currentSlide = 0;
const totalSlides = 3;

function setSlide(index) {
  currentSlide = index;
  const dots = document.querySelectorAll('.gd-slider-dot');
  dots.forEach((dot, i) => {
    if (i === index) {
      dot.classList.add('active');
    } else {
      dot.classList.remove('active');
    }
  });
}

function nextSlide() {
  currentSlide = (currentSlide + 1) % totalSlides;
  setSlide(currentSlide);
}

function prevSlide() {
  currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
  setSlide(currentSlide);
}

// Toggle mobile menu drawer
function toggleMobileMenu() {
  const navLinks = document.querySelector('.gd-nav-links');
  if (navLinks) {
    if (navLinks.style.display === 'flex') {
      navLinks.style.display = 'none';
    } else {
      navLinks.style.display = 'flex';
      navLinks.style.flexDirection = 'column';
      navLinks.style.position = 'absolute';
      navLinks.style.top = '100%';
      navLinks.style.left = '0';
      navLinks.style.right = '0';
      navLinks.style.background = '#fff';
      navLinks.style.padding = '20px';
      navLinks.style.boxShadow = '0 10px 20px rgba(0,0,0,0.1)';
    }
  }
}
