/**
 * Highway Racer 2 - UI & Interaction Controller
 * Handles fullscreen, audio toggle, mobile touch input, FAQ accordion, and statistics.
 */

document.addEventListener('DOMContentLoaded', () => {
  const gameWindow = document.querySelector('.game-window');
  const fullscreenBtn = document.getElementById('fullscreenBtn');
  const soundBtn = document.getElementById('soundBtn');
  const pauseBtn = document.getElementById('pauseBtn');
  const restartBtn = document.getElementById('restartBtn');

  // 1. Fullscreen Toggle
  const exitFullscreenBtn = document.getElementById('exitFullscreenBtn');

  if (fullscreenBtn && gameWindow) {
    fullscreenBtn.addEventListener('click', () => {
      if (!document.fullscreenElement) {
        gameWindow.requestFullscreen?.().catch(err => {
          console.warn('Fullscreen request failed:', err);
        });
      } else {
        document.exitFullscreen?.();
      }
    });

    if (exitFullscreenBtn) {
      exitFullscreenBtn.addEventListener('click', () => {
        document.exitFullscreen?.();
      });
    }

    const onFsChange = () => {
      const isFs = !!document.fullscreenElement;
      fullscreenBtn.setAttribute('aria-label', isFs ? 'Exit Fullscreen' : 'Enter Fullscreen');
      if (window.gameInstance && typeof window.gameInstance.resize === 'function') {
        setTimeout(() => window.gameInstance.resize(), 80);
      }
    };

    document.addEventListener('fullscreenchange', onFsChange);
    document.addEventListener('webkitfullscreenchange', onFsChange);
  }

  // 2. Sound Toggle
  if (soundBtn) {
    soundBtn.addEventListener('click', () => {
      if (window.gameInstance && window.gameInstance.audio) {
        const isMuted = window.gameInstance.audio.toggleMute();
        soundBtn.innerHTML = isMuted
          ? `<svg viewBox="0 0 24 24"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg><span>Unmute</span>`
          : `<svg viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg><span>Sound</span>`;
      }
    });
  }

  // 3. Pause / Resume
  if (pauseBtn) {
    pauseBtn.addEventListener('click', () => {
      if (window.gameInstance) {
        window.gameInstance.togglePause();
        pauseBtn.innerHTML = window.gameInstance.state === 'PAUSED'
          ? `<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg><span>Resume</span>`
          : `<svg viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg><span>Pause</span>`;
      }
    });
  }

  // 4. Restart Button
  if (restartBtn) {
    restartBtn.addEventListener('click', () => {
      const gameFrame = document.getElementById('gameFrame');
      if (gameFrame && gameFrame.src) {
        const currentSrc = gameFrame.src;
        gameFrame.src = '';
        setTimeout(() => { gameFrame.src = currentSrc; }, 50);
      } else if (window.gameInstance) {
        window.gameInstance.start();
      }
    });
  }

  // 5. Mobile Virtual Touch Controls
  const bindTouch = (btnId, keyName) => {
    const btn = document.getElementById(btnId);
    if (!btn) return;

    const startAction = (e) => {
      e.preventDefault();
      if (window.gameInstance) {
        if (window.gameInstance.state === 'START' || window.gameInstance.state === 'GAMEOVER') {
          window.gameInstance.start();
        }
        window.gameInstance.keys[keyName] = true;
      }
    };

    const endAction = (e) => {
      e.preventDefault();
      if (window.gameInstance) {
        window.gameInstance.keys[keyName] = false;
      }
    };

    btn.addEventListener('touchstart', startAction, { passive: false });
    btn.addEventListener('touchend', endAction, { passive: false });
    btn.addEventListener('mousedown', startAction);
    btn.addEventListener('mouseup', endAction);
    btn.addEventListener('mouseleave', endAction);
  };

  bindTouch('touchLeft', 'left');
  bindTouch('touchRight', 'right');
  bindTouch('touchBrake', 'down');
  bindTouch('touchNitro', 'nitro');

  // 6. FAQ Accordion
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const questionBtn = item.querySelector('.faq-question');
    if (questionBtn) {
      questionBtn.addEventListener('click', () => {
        const isActive = item.classList.contains('active');
        faqItems.forEach(other => {
          if (other !== item) other.classList.remove('active');
        });
        item.classList.toggle('active', !isActive);
      });
    }
  });

  // 7. Update High Score on Page from storage
  const updateBestRecord = () => {
    const bestEl = document.getElementById('statBestScore');
    if (bestEl) {
      const stored = localStorage.getItem('hr2_highscore') || '0';
      bestEl.textContent = parseInt(stored, 10).toLocaleString();
    }
  };
  // 8. Category Filter System
  const categoryPills = document.querySelectorAll('.category-pill');
  const categoryCards = document.querySelectorAll('.category-card');

  categoryPills.forEach(pill => {
    pill.addEventListener('click', () => {
      categoryPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');

      const filter = pill.getAttribute('data-filter');

      categoryCards.forEach(card => {
        const cat = card.getAttribute('data-cat');
        if (filter === 'all' || cat === filter) {
          card.style.display = 'flex';
          card.style.animation = 'fadeInCard 0.35s ease-out forwards';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
});

