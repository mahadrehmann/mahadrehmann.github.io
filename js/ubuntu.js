/* ================================================
   UBUNTU DESKTOP PORTFOLIO — JavaScript Engine
   ================================================ */

(function () {
  'use strict';

  // ========== STATE ==========
  const state = {
    booted: false,
    windows: [],
    windowIdCounter: 0,
    activeWindowId: null,
    zIndexCounter: 200,
    activitiesOpen: false,
    calendarOpen: false,
    dragState: null,
    resizeState: null,
  };

  // ========== DOM REFS ==========
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  const bootScreen = $('#boot-screen');
  const powerButton = $('#power-button');
  const screenOffState = $('#screen-off-state');
  const screenBootState = $('#screen-boot-state');
  const bootInstruction = $('#boot-instruction');
  const ubuntuDesktop = $('#ubuntu-desktop');
  const desktopArea = $('#desktop-area');
  const windowsContainer = $('#windows-container');
  const panelClock = $('#panel-clock');
  const panelClockBtn = $('#panel-clock-btn');
  const calendarDropdown = $('#calendar-dropdown');
  const activitiesBtn = $('#activities-btn');
  const dock = $('#dock');
  const dockEmptyHint = $('#dock-empty-hint');

  // ========== BOOT SEQUENCE ==========
  powerButton.addEventListener('click', startBoot);

  function startBoot() {
    if (state.booted) return;
    state.booted = true;

    // Press animation
    powerButton.classList.add('pressed');
    bootInstruction.classList.add('hidden');

    // Screen on → boot logo
    setTimeout(() => {
      screenOffState.style.opacity = '0';
      screenBootState.classList.remove('hidden');

      setTimeout(() => {
        screenBootState.classList.add('active');
        bootScreen.classList.add('monitor-on');
      }, 300);
    }, 400);

    // Boot for 2.5s then transition to desktop
    setTimeout(() => {
      bootScreen.classList.add('fade-out');
      ubuntuDesktop.classList.remove('hidden');

      setTimeout(() => {
        ubuntuDesktop.classList.add('visible');
        startClock();
        buildCalendar();
        bootScreen.style.display = 'none';
      }, 100);
    }, 3200);
  }

  // ========== CLOCK ==========
  function startClock() {
    updateClock();
    setInterval(updateClock, 30000);
  }

  function updateClock() {
    const now = new Date();
    const options = { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true };
    panelClock.textContent = now.toLocaleString('en-US', options);
  }

  // ========== CALENDAR DROPDOWN ==========
  panelClockBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    state.calendarOpen = !state.calendarOpen;
    calendarDropdown.classList.toggle('open', state.calendarOpen);
    panelClockBtn.classList.toggle('active', state.calendarOpen);

    // Close activities if open
    if (state.activitiesOpen) toggleActivities();
  });

  // Close calendar when clicking elsewhere
  document.addEventListener('click', (e) => {
    if (state.calendarOpen && !calendarDropdown.contains(e.target) && !panelClockBtn.contains(e.target)) {
      state.calendarOpen = false;
      calendarDropdown.classList.remove('open');
      panelClockBtn.classList.remove('active');
    }
  });

  function buildCalendar() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const today = now.getDate();

    // Month header
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'];
    $('#calendar-month').textContent = `${monthNames[month]} ${year}`;

    // Build grid
    const grid = $('#calendar-grid');
    grid.innerHTML = '';

    // Day headers
    const dayHeaders = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
    dayHeaders.forEach((d) => {
      const el = document.createElement('div');
      el.className = 'cal-day-header';
      el.textContent = d;
      grid.appendChild(el);
    });

    // First day of month (0=Sun, adjust to Mon=0)
    const firstDay = new Date(year, month, 1).getDay();
    const startOffset = firstDay === 0 ? 6 : firstDay - 1;

    // Days in month
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    // Previous month days
    for (let i = startOffset - 1; i >= 0; i--) {
      const el = document.createElement('div');
      el.className = 'cal-day other-month';
      el.textContent = daysInPrevMonth - i;
      grid.appendChild(el);
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const el = document.createElement('div');
      el.className = 'cal-day' + (d === today ? ' today' : '');
      el.textContent = d;
      grid.appendChild(el);
    }

    // Next month days to fill grid
    const totalCells = startOffset + daysInMonth;
    const remaining = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
    for (let d = 1; d <= remaining; d++) {
      const el = document.createElement('div');
      el.className = 'cal-day other-month';
      el.textContent = d;
      grid.appendChild(el);
    }
  }

  // ========== APP ICON SVGs (for dock) ==========
  const appIcons = {
    about: '<svg viewBox="0 0 48 48" width="32" height="32"><circle cx="24" cy="16" r="10" fill="#E95420"/><path d="M6 42c0-9.94 8.06-18 18-18s18 8.06 18 18" fill="#E95420" opacity="0.7"/></svg>',
    experience: '<svg viewBox="0 0 48 48" width="32" height="32"><rect x="6" y="14" width="36" height="26" rx="3" fill="#E95420"/><path d="M16 14V10a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v4" fill="none" stroke="#E95420" stroke-width="3"/><rect x="20" y="24" width="8" height="6" rx="1" fill="#2C001E"/></svg>',
    projects: '<svg viewBox="0 0 48 48" width="32" height="32"><path d="M4 12h16l4-4h20a4 4 0 0 1 4 4v24a4 4 0 0 1-4 4H4a4 4 0 0 1-4-4V12z" fill="#E95420"/><rect x="4" y="16" width="40" height="24" rx="2" fill="#C34113"/></svg>',
    skills: '<svg viewBox="0 0 48 48" width="32" height="32"><rect x="2" y="6" width="44" height="36" rx="4" fill="#300A24"/><text x="8" y="20" fill="#4E9A06" font-family="monospace" font-size="10">$_</text></svg>',
    certifications: '<svg viewBox="0 0 48 48" width="32" height="32"><rect x="6" y="2" width="36" height="44" rx="3" fill="#E95420"/><circle cx="24" cy="34" r="6" fill="#2C001E"/><path d="M24 28l1.76 3.56 3.93.57-2.85 2.77.67 3.93L24 36.9l-3.51 1.85.67-3.93-2.85-2.77 3.93-.57z" fill="#FFB626"/></svg>',
    contact: '<svg viewBox="0 0 48 48" width="32" height="32"><rect x="2" y="10" width="44" height="28" rx="4" fill="#E95420"/><path d="M2 14l22 14 22-14" fill="none" stroke="#2C001E" stroke-width="3"/></svg>',
    resume: '<svg viewBox="0 0 48 48" width="32" height="32"><path d="M12 2h18l10 10v32a4 4 0 0 1-4 4H12a4 4 0 0 1-4-4V6a4 4 0 0 1 4-4z" fill="#E95420"/><path d="M30 2v10h10" fill="#C34113"/></svg>',
    trash: '<svg viewBox="0 0 48 48" width="32" height="32"><path d="M14 14h20v28a4 4 0 0 1-4 4H18a4 4 0 0 1-4-4V14z" fill="#77767B"/><rect x="10" y="10" width="28" height="4" rx="2" fill="#9A9996"/></svg>',
  };

  const appTitles = {
    about: 'About Me',
    experience: 'Experience',
    projects: 'Projects',
    skills: 'Terminal',
    certifications: 'Certificates',
    contact: 'Contact',
    resume: 'Resume',
    trash: 'Trash',
  };

  // ========== APP DEFINITIONS ==========
  const appDefs = {
    about: {
      title: 'About Me',
      icon: '👤',
      width: 600,
      height: 480,
      content: () => `
        <div class="about-app">
          <div class="about-header">
            <img src="images/headshot.png" alt="Mahad Rehman Durrani" class="about-avatar">
            <div class="about-info">
              <h1>Mahad Rehman Durrani</h1>
              <div class="about-role">AI Engineer · CS @ FAST-NUCES</div>
              <p>
                AI Engineer apprentice at <strong>XFlow Research</strong>, building production-grade
                Agentic Workflows and RAG systems that scale. Final-year Computer Science student at
                <strong>FAST-NUCES Islamabad</strong>.
              </p>
              <p style="margin-top: 12px;">
                I'm passionate about pushing the boundaries of what AI agents can autonomously
                accomplish — from multi-agent marketing systems to end-to-end MLOps pipelines.
                I also serve as a Teaching Assistant for Generative AI, mentoring the next wave of builders.
              </p>
              <div class="about-links">
                <a href="https://github.com/mahadrehmann" target="_blank" rel="noopener" class="about-link-btn">⌘ GitHub</a>
                <a href="https://linkedin.com/in/mahad-rehman" target="_blank" rel="noopener" class="about-link-btn">⌘ LinkedIn</a>
                <a href="mailto:mahadrehman04@gmail.com" class="about-link-btn">✉ Email</a>
              </div>
            </div>
          </div>
        </div>
      `,
    },

    experience: {
      title: 'Experience',
      icon: '💼',
      width: 600,
      height: 520,
      content: () => `
        <div class="app-section-title">💼 Work Experience</div>
        <div class="exp-timeline">
          <div class="exp-entry">
            <div class="exp-date">2025-06 → 2026-04</div>
            <div class="exp-role">AI Engineer (Apprentice)</div>
            <div class="exp-company">@ XFlow Research</div>
            <ul class="exp-bullets">
              <li>Engineering production-grade Agentic Workflows to automate enterprise processes, focusing on scalability.</li>
              <li>Reduced LLM hallucinations and inference costs by implementing strict RAG evaluation loops.</li>
              <li>Gathered and translated client requirements into actionable technical specifications.</li>
            </ul>
          </div>
          <div class="exp-entry">
            <div class="exp-date">FAST NUCES</div>
            <div class="exp-role">Teaching Assistant</div>
            <div class="exp-company">@ Generative AI &amp; Software for Mobile Devices</div>
            <ul class="exp-bullets">
              <li>Conducted hands-on technical demos and mentored students in Transformers, GANs, VAEs, Diffusion models.</li>
              <li>Reviewed architectures and API integration strategies for 50+ Mobile Applications (Kotlin/Flutter).</li>
            </ul>
          </div>
        </div>
      `,
    },

    projects: {
      title: 'Projects',
      icon: '📁',
      width: 700,
      height: 560,
      content: () => `
        <div class="app-section-title">📁 Projects</div>
        <div class="projects-grid">
          <div class="project-card">
            <div class="project-name">Markly</div>
            <div class="project-subtitle">Autonomous Marketing Agent System — FYP</div>
            <p class="project-desc">Multi-agent marketing system automating the end-to-end campaign lifecycle. Computer Vision &amp; GenAI pipeline for data-driven competitor analysis and automated poster generation.</p>
            <div class="project-tags">
              <span class="project-tag">FastAPI</span>
              <span class="project-tag">LangGraph</span>
              <span class="project-tag">Docker</span>
              <span class="project-tag">YOLOv8</span>
              <span class="project-tag">CLIP</span>
            </div>
            <a href="https://github.com/mahadrehmann" target="_blank" rel="noopener" class="project-link">→ view on github</a>
          </div>
          <div class="project-card">
            <div class="project-name">RAG Chatbot</div>
            <div class="project-subtitle">Multi-Stage Evaluation Pipeline</div>
            <p class="project-desc">ReAct-style RAG agent with LangChain and FAISS, fortified by a strict input validation layer. 4-stage "LLM-as-a-Judge" evaluation pipeline with LangSmith tracing.</p>
            <div class="project-tags">
              <span class="project-tag">LangChain</span>
              <span class="project-tag">OpenAI</span>
              <span class="project-tag">Gemini</span>
              <span class="project-tag">LangSmith</span>
            </div>
            <a href="https://github.com/mahadrehmann" target="_blank" rel="noopener" class="project-link">→ view on github</a>
          </div>
          <div class="project-card">
            <div class="project-name">MailGen</div>
            <div class="project-subtitle">Agentic Email Automation</div>
            <p class="project-desc">Multi-agent workflow using CrewAI to autonomously analyze requirements and generate context-aware professional emails. Flask dashboard with background job scheduling.</p>
            <div class="project-tags">
              <span class="project-tag">CrewAI</span>
              <span class="project-tag">Flask</span>
              <span class="project-tag">Python</span>
            </div>
            <a href="https://github.com/mahadrehmann" target="_blank" rel="noopener" class="project-link">→ view on github</a>
          </div>
          <div class="project-card">
            <div class="project-name">MLOps Pipeline</div>
            <div class="project-subtitle">End-to-End Production System</div>
            <p class="project-desc">Production-grade MLOps with automated model retraining, real-time observability (Prometheus/Grafana) with Slack alerting, and containerized CI/CD deployments to AWS EC2.</p>
            <div class="project-tags">
              <span class="project-tag">AWS</span>
              <span class="project-tag">GitHub Actions</span>
              <span class="project-tag">Prometheus</span>
              <span class="project-tag">Docker</span>
            </div>
            <a href="https://github.com/mahadrehmann" target="_blank" rel="noopener" class="project-link">→ view on github</a>
          </div>
        </div>
      `,
    },

    skills: {
      title: 'Terminal — neofetch',
      icon: '🖥',
      width: 660,
      height: 420,
      bodyClass: 'terminal-app-body',
      content: () => `
        <div class="terminal-app">
          <div><span class="term-prompt">mahad@portfolio:~$</span> <span class="term-command">neofetch</span></div>
          <div class="neofetch-container">
            <pre class="neofetch-ascii">
         .---.
        |o_o |
        |:_/ |
       //   \\ \\
      (|     | )
     /'\\_   _/\`\\
     \\___)=(___/
            </pre>
            <div class="neofetch-data">
              <div class="nf-header">mahad@skills</div>
              <div class="nf-divider">─────────────────────────</div>
              <div class="nf-row"><span class="nf-label">OS: </span><span class="nf-value">Ubuntu 24.04 LTS (Portfolio Edition)</span></div>
              <div class="nf-row"><span class="nf-label">Host: </span><span class="nf-value">FAST-NUCES Islamabad</span></div>
              <div class="nf-row"><span class="nf-label">Kernel: </span><span class="nf-value">AI Engineer v2.0</span></div>
              <div class="nf-row"><span class="nf-label">Uptime: </span><span class="nf-value">4 years of building</span></div>
              <div class="nf-row"><span class="nf-label">Languages: </span><span class="nf-value">Python, C/C++, SQL, Java, Bash</span></div>
              <div class="nf-row"><span class="nf-label">AI/ML: </span><span class="nf-value">Machine Learning, Deep Learning, GenAI, RAG, Agents</span></div>
              <div class="nf-row"><span class="nf-label">Frameworks: </span><span class="nf-value">PyTorch, TensorFlow, HuggingFace, LangChain, LangGraph, CrewAI</span></div>
              <div class="nf-row"><span class="nf-label">Backend: </span><span class="nf-value">FastAPI, Flask, NumPy, Pandas, Scikit-Learn</span></div>
              <div class="nf-row"><span class="nf-label">DevOps: </span><span class="nf-value">AWS, GCP, Docker, Kubernetes, GitHub Actions, Jenkins</span></div>
              <div class="nf-row"><span class="nf-label">Monitoring: </span><span class="nf-value">Prometheus, Grafana, Linux/WSL</span></div>
              <div class="neofetch-colors">
                <span style="background:#2E3436"></span>
                <span style="background:#CC0000"></span>
                <span style="background:#4E9A06"></span>
                <span style="background:#C4A000"></span>
                <span style="background:#3465A4"></span>
                <span style="background:#75507B"></span>
                <span style="background:#06989A"></span>
                <span style="background:#D3D7CF"></span>
              </div>
            </div>
          </div>
        </div>
      `,
    },

    certifications: {
      title: 'Certificates',
      icon: '📜',
      width: 500,
      height: 380,
      content: () => `
        <div class="app-section-title">🏆 Certifications</div>
        <div class="cert-list">
          <div class="cert-item">
            <div class="cert-icon">📄</div>
            <div class="cert-info">
              <div class="cert-name">Machine Learning Specialization</div>
              <div class="cert-issuer">DeepLearning.AI</div>
            </div>
          </div>
          <div class="cert-item">
            <div class="cert-icon">☁️</div>
            <div class="cert-info">
              <div class="cert-name">AWS Academy Cloud Foundations</div>
              <div class="cert-issuer">Amazon Web Services</div>
            </div>
          </div>
          <div class="cert-item">
            <div class="cert-icon">🤖</div>
            <div class="cert-info">
              <div class="cert-name">Generative AI with LLMs</div>
              <div class="cert-issuer">DeepLearning.AI</div>
            </div>
          </div>
        </div>
      `,
    },

    contact: {
      title: 'Contact',
      icon: '✉',
      width: 550,
      height: 400,
      content: () => `
        <div class="contact-app">
          <div class="app-section-title">✉ Get in Touch</div>
          <div class="contact-info-grid">
            <div class="contact-info-card">
              <div class="contact-icon">📧</div>
              <div class="contact-detail">
                <div class="contact-label">Email</div>
                <div class="contact-value"><a href="mailto:mahadrehman04@gmail.com">mahadrehman04@gmail.com</a></div>
              </div>
            </div>
            <div class="contact-info-card">
              <div class="contact-icon">📍</div>
              <div class="contact-detail">
                <div class="contact-label">Location</div>
                <div class="contact-value">Islamabad, Pakistan</div>
              </div>
            </div>
            <div class="contact-info-card">
              <div class="contact-icon">🎓</div>
              <div class="contact-detail">
                <div class="contact-label">University</div>
                <div class="contact-value">FAST-NUCES Islamabad</div>
              </div>
            </div>
            <div class="contact-info-card">
              <div class="contact-icon">💼</div>
              <div class="contact-detail">
                <div class="contact-label">Current Role</div>
                <div class="contact-value">AI Engineer @ XFlow Research</div>
              </div>
            </div>
          </div>
          <div class="contact-social-links">
            <a href="https://github.com/mahadrehmann" target="_blank" rel="noopener" class="contact-social-btn">⌘ GitHub</a>
            <a href="https://linkedin.com/in/mahad-rehman" target="_blank" rel="noopener" class="contact-social-btn">⌘ LinkedIn</a>
            <a href="mailto:mahadrehman04@gmail.com" class="contact-social-btn">✉ Send Email</a>
            <a href="files/Mahad.pdf" target="_blank" class="contact-social-btn">↓ Resume</a>
          </div>
        </div>
      `,
    },

    resume: {
      title: 'Resume — Mahad.pdf',
      icon: '📄',
      width: 650,
      height: 600,
      content: () => `
        <div class="resume-app">
          <div class="resume-preview">
            <iframe src="files/Mahad.pdf" title="Resume PDF"></iframe>
          </div>
          <div class="resume-actions">
            <a href="files/Mahad.pdf" target="_blank" class="resume-download-btn">↓ Download Resume</a>
            <a href="files/Mahad.pdf" target="_blank" class="resume-download-btn" style="background: var(--bg-surface-hover); color: var(--text-primary);">Open in New Tab</a>
          </div>
        </div>
      `,
    },

    trash: {
      title: 'Trash',
      icon: '🗑',
      width: 400,
      height: 300,
      content: () => `
        <div class="trash-app">
          <div class="trash-icon-large">🗑️</div>
          <div class="trash-message">
            <strong>Trash is empty</strong><br>
            <span style="font-size: 12px; color: var(--text-dim);">No bugs here... probably.</span>
          </div>
        </div>
      `,
    },
  };

  function syncDockIcons() {
    const activeWindow = state.windows.find((w) => w.id === state.activeWindowId);

    dock.querySelectorAll('.dock-icon').forEach((icon) => {
      const shouldBeActive = activeWindow && icon.dataset.app === activeWindow.appName;
      icon.classList.toggle('active', shouldBeActive);
    });
  }

  // ========== DYNAMIC DOCK MANAGEMENT ==========
  function addDockIcon(appName) {
    // Check if already in dock
    if (dock.querySelector(`.dock-icon[data-app="${appName}"]`)) return;

    // Hide empty hint
    if (dockEmptyHint) dockEmptyHint.classList.add('hidden');

    const iconEl = document.createElement('div');
    iconEl.className = 'dock-icon';
    iconEl.dataset.app = appName;
    iconEl.title = appTitles[appName] || appName;
    iconEl.tabIndex = 0;
    iconEl.innerHTML = `
      ${appIcons[appName] || ''}
      <span class="dock-indicator"></span>
    `;

    // Click to focus/restore the window
    iconEl.addEventListener('click', () => {
      const existing = state.windows.find((w) => w.appName === appName);
      if (existing) {
        const el = document.getElementById(existing.id);
        if (el) {
          if (el.classList.contains('minimized')) {
            el.classList.remove('minimized');
            const wd = state.windows.find((w) => w.id === existing.id);
            if (wd) wd.minimized = false;
          }
          if (el.classList.contains('closing')) {
            return;
          }
        }
        focusWindow(existing.id);
      }
    });

    dock.appendChild(iconEl);
    syncDockIcons();
  }

  function removeDockIcon(appName) {
    const iconEl = dock.querySelector(`.dock-icon[data-app="${appName}"]`);
    if (iconEl) {
      iconEl.style.transition = 'opacity 0.2s, transform 0.2s';
      iconEl.style.opacity = '0';
      iconEl.style.transform = 'translateX(-20px)';
      setTimeout(() => iconEl.remove(), 200);
    }

    // Show empty hint if no more dock icons
    setTimeout(() => {
      if (!dock.querySelector('.dock-icon') && dockEmptyHint) {
        dockEmptyHint.classList.remove('hidden');
      }
    }, 250);
  }

  // ========== WINDOW MANAGEMENT ==========
  function openApp(appName) {
    const def = appDefs[appName];
    if (!def) return;

    // Check if already open — focus it
    const existing = state.windows.find((w) => w.appName === appName);
    if (existing) {
      const el = document.getElementById(existing.id);
      if (el) {
        if (el.classList.contains('minimized')) {
          el.classList.remove('minimized');
        }
        focusWindow(existing.id);
        return;
      }
    }

    const id = 'window-' + state.windowIdCounter++;
    const area = desktopArea.getBoundingClientRect();

    // Calculate position (cascade)
    const openCount = state.windows.length;
    const offsetX = 40 + (openCount % 6) * 30;
    const offsetY = 20 + (openCount % 6) * 30;
    const x = Math.min(offsetX, area.width - def.width - 20);
    const y = Math.min(offsetY, area.height - def.height - 20);

    const windowData = {
      id,
      appName,
      x: Math.max(0, x),
      y: Math.max(0, y),
      width: def.width,
      height: def.height,
      maximized: false,
      minimized: false,
    };

    state.windows.push(windowData);

    // Create window element
    const windowEl = document.createElement('div');
    windowEl.id = id;
    windowEl.className = 'window';
    windowEl.dataset.app = appName;
    windowEl.style.left = windowData.x + 'px';
    windowEl.style.top = windowData.y + 'px';
    windowEl.style.width = windowData.width + 'px';
    windowEl.style.height = windowData.height + 'px';
    windowEl.style.zIndex = ++state.zIndexCounter;

    const bodyClass = def.bodyClass || '';

    windowEl.innerHTML = `
      <div class="window-header" data-window-id="${id}">
        <div class="window-header-left">
          <div class="window-btns">
            <button class="window-btn close" data-action="close" data-window-id="${id}" aria-label="Close"></button>
            <button class="window-btn minimize" data-action="minimize" data-window-id="${id}" aria-label="Minimize"></button>
            <button class="window-btn maximize" data-action="maximize" data-window-id="${id}" aria-label="Maximize"></button>
          </div>
        </div>
        <div class="window-title">${def.title}</div>
        <div class="window-header-right"></div>
      </div>
      <div class="window-body ${bodyClass}">
        ${def.content()}
      </div>
      <div class="window-resize" data-window-id="${id}"></div>
    `;

    windowsContainer.appendChild(windowEl);

    // Attach button handlers directly (more reliable than delegation)
    windowEl.querySelector('.window-btn.close').addEventListener('click', (e) => {
      e.stopPropagation();
      closeWindow(id);
    });
    windowEl.querySelector('.window-btn.minimize').addEventListener('click', (e) => {
      e.stopPropagation();
      minimizeWindow(id);
    });
    windowEl.querySelector('.window-btn.maximize').addEventListener('click', (e) => {
      e.stopPropagation();
      maximizeWindow(id);
    });

    // Apply terminal background for skills
    if (bodyClass === 'terminal-app-body') {
      const body = windowEl.querySelector('.window-body');
      body.style.padding = '0';
      body.style.background = '#300A24';
    }

    // Animate in
    requestAnimationFrame(() => {
      windowEl.classList.add('open');
      focusWindow(id);
    });

    // Add to dock dynamically
    addDockIcon(appName);
  }

  function closeWindow(windowId) {
    const el = document.getElementById(windowId);
    if (!el) return;

    const appName = el.dataset.app;

    el.classList.remove('open');
    el.classList.add('closing');

    setTimeout(() => {
      el.remove();
      state.windows = state.windows.filter((w) => w.id !== windowId);

      // Remove from dock
      removeDockIcon(appName);

      // Focus the next top window
      if (state.activeWindowId === windowId) {
        state.activeWindowId = null;
        const remaining = windowsContainer.querySelectorAll('.window:not(.closing)');
        if (remaining.length > 0) {
          let topEl = remaining[0];
          remaining.forEach((w) => {
            if (parseInt(w.style.zIndex) > parseInt(topEl.style.zIndex)) {
              topEl = w;
            }
          });
          focusWindow(topEl.id);
        }
      }
    }, 250);
  }

  function minimizeWindow(windowId) {
    const el = document.getElementById(windowId);
    if (!el) return;

    el.classList.remove('maximized');
    el.classList.add('minimized');

    const wd = state.windows.find((w) => w.id === windowId);
    if (wd) {
      wd.minimized = true;
      wd.maximized = false;
    }

    // Focus next window
    if (state.activeWindowId === windowId) {
      state.activeWindowId = null;
      const remaining = windowsContainer.querySelectorAll('.window:not(.minimized):not(.closing)');
      if (remaining.length > 0) {
        let topEl = remaining[0];
        remaining.forEach((w) => {
          if (parseInt(w.style.zIndex) > parseInt(topEl.style.zIndex)) topEl = w;
        });
        focusWindow(topEl.id);
      }
    }

    syncDockIcons();
  }

  function maximizeWindow(windowId) {
    const el = document.getElementById(windowId);
    if (!el) return;

    const wd = state.windows.find((w) => w.id === windowId);
    if (!wd) return;

    if (el.classList.contains('maximized')) {
      // Restore
      el.classList.remove('maximized');
      el.style.left = wd.x + 'px';
      el.style.top = wd.y + 'px';
      el.style.width = wd.width + 'px';
      el.style.height = wd.height + 'px';
      wd.maximized = false;
    } else {
      // Maximize
      el.classList.remove('minimized');
      wd.x = parseFloat(el.style.left || 0);
      wd.y = parseFloat(el.style.top || 0);
      wd.width = parseFloat(el.style.width || wd.width);
      wd.height = parseFloat(el.style.height || wd.height);
      el.classList.add('maximized');
      wd.maximized = true;
    }
  }

  function focusWindow(windowId) {
    // Unfocus all
    windowsContainer.querySelectorAll('.window').forEach((w) => w.classList.remove('focused'));

    const el = document.getElementById(windowId);
    if (!el) return;

    el.classList.add('focused');
    el.style.zIndex = ++state.zIndexCounter;
    state.activeWindowId = windowId;
    syncDockIcons();
  }

  // ========== WINDOW DRAGGING ==========
  document.addEventListener('mousedown', (e) => {
    // Close calendar on click outside
    // (handled in separate listener above)

    // Window header drag
    const header = e.target.closest('.window-header');
    if (header && !e.target.closest('.window-btn')) {
      const windowId = header.dataset.windowId;
      const el = document.getElementById(windowId);
      if (!el || el.classList.contains('maximized')) return;

      e.preventDefault();
      focusWindow(windowId);

      const rect = el.getBoundingClientRect();
      const areaRect = desktopArea.getBoundingClientRect();

      state.dragState = {
        windowId,
        startX: e.clientX,
        startY: e.clientY,
        origLeft: rect.left - areaRect.left,
        origTop: rect.top - areaRect.top,
      };
    }

    // Window resize
    const resizeHandle = e.target.closest('.window-resize');
    if (resizeHandle) {
      const windowId = resizeHandle.dataset.windowId;
      const el = document.getElementById(windowId);
      if (!el || el.classList.contains('maximized')) return;

      e.preventDefault();
      focusWindow(windowId);

      state.resizeState = {
        windowId,
        startX: e.clientX,
        startY: e.clientY,
        origWidth: el.offsetWidth,
        origHeight: el.offsetHeight,
      };
    }

    // Focus window on click
    const windowEl = e.target.closest('.window');
    if (windowEl && windowEl.id !== state.activeWindowId) {
      focusWindow(windowEl.id);
    }
  });

  document.addEventListener('mousemove', (e) => {
    if (state.dragState) {
      const { windowId, startX, startY, origLeft, origTop } = state.dragState;
      const el = document.getElementById(windowId);
      if (!el) return;

      const dx = e.clientX - startX;
      const dy = e.clientY - startY;

      el.style.left = (origLeft + dx) + 'px';
      el.style.top = (origTop + dy) + 'px';

      // Update stored position
      const wd = state.windows.find((w) => w.id === windowId);
      if (wd) {
        wd.x = origLeft + dx;
        wd.y = origTop + dy;
      }
    }

    if (state.resizeState) {
      const { windowId, startX, startY, origWidth, origHeight } = state.resizeState;
      const el = document.getElementById(windowId);
      if (!el) return;

      const dx = e.clientX - startX;
      const dy = e.clientY - startY;

      const newWidth = Math.max(400, origWidth + dx);
      const newHeight = Math.max(300, origHeight + dy);

      el.style.width = newWidth + 'px';
      el.style.height = newHeight + 'px';

      const wd = state.windows.find((w) => w.id === windowId);
      if (wd) {
        wd.width = newWidth;
        wd.height = newHeight;
      }
    }
  });

  document.addEventListener('mouseup', () => {
    state.dragState = null;
    state.resizeState = null;
  });

  // ========== WINDOW BUTTON CLICKS ==========
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.window-btn');
    if (!btn) return;

    const action = btn.dataset.action;
    const windowId = btn.dataset.windowId;

    if (action === 'close') closeWindow(windowId);
    else if (action === 'minimize') minimizeWindow(windowId);
    else if (action === 'maximize') maximizeWindow(windowId);
  });

  // ========== DOUBLE-CLICK HEADER TO MAXIMIZE ==========
  document.addEventListener('dblclick', (e) => {
    const header = e.target.closest('.window-header');
    if (header && !e.target.closest('.window-btn')) {
      const windowId = header.dataset.windowId;
      maximizeWindow(windowId);
    }
  });

  // ========== DESKTOP ICON CLICKS ==========
  // Double-click on desktop icons to open
  $$('.desktop-icon').forEach((icon) => {
    icon.addEventListener('dblclick', () => {
      const appName = icon.dataset.app;
      openApp(appName);
    });

    // Single click selects
    icon.addEventListener('click', () => {
      $$('.desktop-icon').forEach((i) => i.classList.remove('selected'));
      icon.classList.add('selected');
    });
  });

  // Click desktop to deselect icons
  desktopArea.addEventListener('click', (e) => {
    if (e.target === desktopArea || e.target.id === 'desktop-area') {
      $$('.desktop-icon').forEach((i) => i.classList.remove('selected'));
    }
  });

  // ========== ACTIVITIES OVERLAY ==========
  activitiesBtn.addEventListener('click', toggleActivities);

  function toggleActivities() {
    state.activitiesOpen = !state.activitiesOpen;

    // Close calendar if open
    if (state.calendarOpen) {
      state.calendarOpen = false;
      calendarDropdown.classList.remove('open');
      panelClockBtn.classList.remove('active');
    }

    let overlay = $('#activities-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'activities-overlay';
      overlay.className = 'activities-overlay';
      ubuntuDesktop.appendChild(overlay);

      overlay.addEventListener('click', (e) => {
        if (e.target === overlay || e.target.classList.contains('activities-no-windows')) {
          toggleActivities();
        }
      });
    }

    if (state.activitiesOpen) {
      const openWindows = state.windows.filter((w) => {
        const el = document.getElementById(w.id);
        return el && !el.classList.contains('closing');
      });
      let previewHtml = '<input type="text" class="activities-search" placeholder="Type to search..." id="activities-search">';

      if (openWindows.length === 0) {
        previewHtml += '<div class="activities-no-windows">No open windows — double-click a desktop icon to launch an app</div>';
      } else {
        previewHtml += '<div class="activities-windows">';
        openWindows.forEach((w) => {
          const def = appDefs[w.appName];
          previewHtml += `
            <div class="activities-window-preview" data-window-id="${w.id}">
              <div class="preview-header">
                <span class="preview-dot" style="background: var(--red);"></span>
                <span class="preview-dot" style="background: var(--yellow);"></span>
                <span class="preview-dot" style="background: var(--green);"></span>
              </div>
              <div class="preview-body">${def ? def.title : w.appName}</div>
            </div>
          `;
        });
        previewHtml += '</div>';
      }

      overlay.innerHTML = previewHtml;
      overlay.classList.add('active');

      setTimeout(() => {
        const search = $('#activities-search');
        if (search) search.focus();
      }, 100);

      overlay.querySelectorAll('.activities-window-preview').forEach((preview) => {
        preview.addEventListener('click', () => {
          const windowId = preview.dataset.windowId;
          const wd = state.windows.find((w) => w.id === windowId);
          if (wd) {
            const el = document.getElementById(windowId);
            if (el && el.classList.contains('minimized')) {
              el.classList.remove('minimized');
            }
          }
          focusWindow(windowId);
          toggleActivities();
        });
      });
    } else {
      overlay.classList.remove('active');
    }
  }

  // ========== KEYBOARD SHORTCUTS ==========
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (state.activitiesOpen) {
        toggleActivities();
      }
      if (state.calendarOpen) {
        state.calendarOpen = false;
        calendarDropdown.classList.remove('open');
        panelClockBtn.classList.remove('active');
      }
    }

    if (e.key === 'Super' || e.key === 'Meta') {
      e.preventDefault();
      toggleActivities();
    }
  });

  // ========== TOUCH SUPPORT FOR MOBILE ==========
  let lastTapTime = 0;
  let lastTapTarget = null;

  $$('.desktop-icon').forEach((icon) => {
    icon.addEventListener('touchend', (e) => {
      const now = Date.now();
      if (lastTapTarget === icon && now - lastTapTime < 400) {
        e.preventDefault();
        openApp(icon.dataset.app);
        lastTapTime = 0;
        lastTapTarget = null;
      } else {
        lastTapTime = now;
        lastTapTarget = icon;
        $$('.desktop-icon').forEach((i) => i.classList.remove('selected'));
        icon.classList.add('selected');
      }
    });
  });

  // ========== PREVENT CONTEXT MENU ==========
  ubuntuDesktop.addEventListener('contextmenu', (e) => {
    e.preventDefault();
  });

})();
