/* ========================================
   Portfolio JS — Typewriter, Animations, Clock
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {
  initClock();
  initTypewriter();
  initScrollAnimations();
  initSmoothScroll();
  initMobileMenu();
  initActiveNav();
});

/* ========================================
   1. Typewriter Effect
   ======================================== */
class Typewriter {
  constructor(container, speed = 45) {
    this.container = container;
    this.speed = speed;
    this.queue = [];
  }

  addCommand(text) {
    this.queue.push({ type: 'command', text });
    return this;
  }

  addResponse(text) {
    this.queue.push({ type: 'response', text });
    return this;
  }

  addPause(ms) {
    this.queue.push({ type: 'pause', duration: ms });
    return this;
  }

  addCallback(fn) {
    this.queue.push({ type: 'callback', fn });
    return this;
  }

  async play() {
    for (const item of this.queue) {
      switch (item.type) {
        case 'command':
          await this.typeCommand(item.text);
          break;
        case 'response':
          await this.showResponse(item.text);
          break;
        case 'pause':
          await this.wait(item.duration);
          break;
        case 'callback':
          item.fn();
          break;
      }
    }
  }

  async typeCommand(text) {
    const line = document.createElement('div');
    line.className = 'terminal-line';

    const prompt = document.createElement('span');
    prompt.className = 'prompt';
    prompt.textContent = '$ ';
    line.appendChild(prompt);

    const textSpan = document.createElement('span');
    textSpan.className = 'command-text';
    line.appendChild(textSpan);

    const cursor = document.createElement('span');
    cursor.className = 'cursor';
    cursor.textContent = '█';
    line.appendChild(cursor);

    this.container.appendChild(line);

    for (let i = 0; i < text.length; i++) {
      textSpan.textContent += text[i];
      await this.wait(this.speed);
    }

    cursor.remove();
    await this.wait(250);
  }

  async showResponse(text) {
    const line = document.createElement('div');
    line.className = 'terminal-line response-text';
    line.textContent = text;
    line.style.opacity = '0';
    line.style.transform = 'translateY(4px)';
    this.container.appendChild(line);

    requestAnimationFrame(() => {
      line.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
      line.style.opacity = '1';
      line.style.transform = 'translateY(0)';
    });

    await this.wait(400);
  }

  wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

function initTypewriter() {
  const container = document.getElementById('hero-terminal-body');
  if (!container) return;

  const tw = new Typewriter(container, 40);

  tw.addCommand('whoami')
    .addResponse('Mahad Rehman Durrani')
    .addPause(300)
    .addCommand('cat role.txt')
    .addResponse('AI Engineer · CS @ FAST-NUCES \'26')
    .addPause(300)
    .addCommand('cat bio.txt')
    .addResponse('I build Agentic AI systems, MLOps pipelines,')
    .addResponse('and production-grade GenAI applications.')
    .addPause(400)
    .addCallback(() => {
      // Show CTAs
      const ctas = document.getElementById('hero-ctas');
      if (ctas) ctas.classList.add('visible');
      // Add a final blinking cursor
      const cursorLine = document.createElement('div');
      cursorLine.className = 'terminal-line';
      cursorLine.innerHTML = '<span class="prompt">$ </span><span class="cursor">█</span>';
      container.appendChild(cursorLine);
    });

  tw.play();
}

/* ========================================
   2. Scroll Animations (IntersectionObserver)
   ======================================== */
function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.08,
    rootMargin: '0px 0px -40px 0px'
  });

  document.querySelectorAll('.animate-in').forEach(el => {
    observer.observe(el);
  });
}

/* ========================================
   3. Live Clock (Ubuntu top bar style)
   ======================================== */
function initClock() {
  const clockEl = document.getElementById('topbar-clock');
  if (!clockEl) return;

  function update() {
    const now = new Date();
    const time = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
    const date = now.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
    clockEl.textContent = `${date}  ${time}`;
  }

  update();
  setInterval(update, 10000);
}

/* ========================================
   4. Smooth Scrolling
   ======================================== */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

/* ========================================
   5. Mobile Menu
   ======================================== */
function initMobileMenu() {
  const toggle = document.getElementById('menu-toggle');
  const navCenter = document.getElementById('nav-center');
  if (!toggle || !navCenter) return;

  toggle.addEventListener('click', () => {
    toggle.classList.toggle('active');
    navCenter.classList.toggle('active');
  });

  // Close on link click
  navCenter.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      toggle.classList.remove('active');
      navCenter.classList.remove('active');
    });
  });
}

/* ========================================
   6. Active Nav Tracking
   ======================================== */
function initActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  function onScroll() {
    const scrollY = window.scrollY + 100;
    let current = '';

    sections.forEach(section => {
      if (scrollY >= section.offsetTop) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}
