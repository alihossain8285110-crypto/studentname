// Populate tables, animate sections, and add a visible smooth custom cursor with trail.
// Keeps default cursor visible (no body { cursor: none }).

document.addEventListener('DOMContentLoaded', () => {
  /* ---------- DATA (same shape as Section C) ---------- */
  const sectionC = [
    ['RIFAT','21','GALIB','01'],
    ['TURJO','20','UGANDA','62'],
    ['SHABAB','19','SIYAM','31'],
    ['MAHIN','33','AMIN','11']
  ];

  const sectionB = [
    ['SARAH','15','JAMES','02'],
    ['ALEX','16','EMMA','03'],
    ['DAVID','17','SOPHIA','04'],
    ['MIKE','18','LISA','05']
  ];

  const sectionA = [
    ['JOHN','41','MARY','42'],
    ['PETER','43','ANNA','44'],
    ['ROBERT','45','JULIA','46'],
    ['WILLIAM','47','ELENA','48']
  ];

  /* ---------- RENDER TABLES ---------- */
  function renderTable(selector, data) {
    const table = document.querySelector(selector);
    if (!table) return;

    // Head
    const thead = table.querySelector('thead') || table.appendChild(document.createElement('thead'));
    thead.innerHTML = '<tr><th>Name</th><th>Roll</th><th>Name</th><th>Roll</th></tr>';

    // Body
    const tbody = table.querySelector('tbody') || table.appendChild(document.createElement('tbody'));
    tbody.innerHTML = '';
    data.forEach(row => {
      const tr = document.createElement('tr');
      row.forEach(cell => {
        const td = document.createElement('td');
        td.textContent = cell;
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
  }

  renderTable('.TC', sectionC);
  renderTable('.TB', sectionB);
  renderTable('.TA', sectionA);

  /* ---------- MATCH TABLE SIZES (use Section C as baseline) ---------- */
  const baseTable = document.querySelector('.TC');
  const otherTables = Array.from(document.querySelectorAll('.TB, .TA'));
  if (baseTable) {
    // Wait for layout, then copy computed width to others to ensure identical size
    requestAnimationFrame(() => {
      const width = baseTable.getBoundingClientRect().width;
      otherTables.forEach(t => {
        t.style.width = width + 'px';
        // ensure tables stay centered inside their container
        t.parentElement && (t.parentElement.style.display = 'flex', t.parentElement.style.justifyContent = 'center');
      });
    });
  }

  /* ---------- SECTION SCROLL ANIMATION (Intersection Observer) ---------- */
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.section-card').forEach((el, i) => {
    // initial state for smooth JS-driven animation fallback
    el.style.opacity = '0';
    el.style.transform = 'translateY(24px) scale(0.995)';
    el.style.transition = 'opacity 0.6s cubic-bezier(.2,.9,.2,1), transform 0.6s cubic-bezier(.2,.9,.2,1)';
    // stagger reveal
    setTimeout(() => observer.observe(el), 50 + i * 120);
  });

  // Add CSS hook behavior: when in-view class added, set final state
  const style = document.createElement('style');
  style.textContent = `
    .section-card.in-view { opacity: 1 !important; transform: translateY(0) scale(1) !important; }
    tbody tr { will-change: transform, background-color; }
    tbody tr td { transition: background-color .22s ease, color .18s ease; }
  `;
  document.head.appendChild(style);

  /* ---------- CUSTOM VISIBLE CURSOR + TRAIL (smooth) ---------- */
  const dot = document.createElement('div');
  const ring = document.createElement('div');
  dot.id = 'custom-cursor-dot';
  ring.id = 'custom-cursor-ring';
  document.body.appendChild(ring);
  document.body.appendChild(dot);

  // basic styles (fallback if CSS file missing)
  const cursorCss = document.createElement('style');
  cursorCss.textContent = `
    #custom-cursor-dot, #custom-cursor-ring { position: fixed; pointer-events: none; z-index: 9999; transform: translate(-50%, -50%); transition: background .18s ease, transform .18s ease, width .18s ease, height .18s ease; mix-blend-mode: screen; }
    #custom-cursor-dot { width: 10px; height: 10px; border-radius: 50%; background: radial-gradient(circle at 30% 30%, rgba(255,255,255,0.95), rgba(255,255,255,0.6)), var(--primary, #4f46e5); box-shadow: 0 6px 20px rgba(79,70,229,0.28); }
    #custom-cursor-ring { width: 34px; height: 34px; border-radius: 50%; border: 2px solid rgba(79,70,229,0.35); background: radial-gradient(circle, rgba(79,70,229,0.06), transparent 40%); }
    /* hover/active states applied via JS classes */
    .cursor-hover #custom-cursor-dot { transform: translate(-50%,-50%) scale(1.8); background: linear-gradient(90deg,var(--accent,#f43f5e),var(--secondary,#6366f1)); }
    .cursor-hover #custom-cursor-ring { transform: translate(-50%,-50%) scale(1.25); border-color: rgba(244,63,94,0.65); box-shadow: 0 8px 30px rgba(244,63,94,0.12); }
  `;
  document.head.appendChild(cursorCss);

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let ringX = mouseX;
  let ringY = mouseY;
  let dotX = mouseX;
  let dotY = mouseY;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  // animate positions using requestAnimationFrame for smoothness
  function rafLoop() {
    // lerp helpers
    ringX += (mouseX - ringX) * 0.16;
    ringY += (mouseY - ringY) * 0.16;
    dotX += (mouseX - dotX) * 0.33;
    dotY += (mouseY - dotY) * 0.33;

    ring.style.left = `${ringX}px`;
    ring.style.top = `${ringY}px`;
    dot.style.left = `${dotX}px`;
    dot.style.top = `${dotY}px`;

    requestAnimationFrame(rafLoop);
  }
  rafLoop();

  // enlarge cursor on interactive elements
  const hoverable = document.querySelectorAll('a, button, th, td, .section-card');
  hoverable.forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
  });

  // click feedback (quick scale)
  document.addEventListener('mousedown', () => {
    dot.style.transform = 'translate(-50%,-50%) scale(0.7)';
    ring.style.transform = 'translate(-50%,-50%) scale(1.4)';
  });
  document.addEventListener('mouseup', () => {
    dot.style.transform = '';
    ring.style.transform = '';
  });

  /* ---------- SMALL ACCESSIBILITY HELPERS ---------- */
  // Allow keyboard focus visible states for rows
  document.querySelectorAll('tbody tr').forEach(tr => {
    tr.tabIndex = 0;
    tr.addEventListener('focus', () => tr.classList.add('focused'));
    tr.addEventListener('blur', () => tr.classList.remove('focused'));
  });

  // Optional: simple row click to copy roll numbers (example of small interactivity)
  document.querySelectorAll('tbody tr').forEach(tr => {
    tr.addEventListener('click', (e) => {
      // copy the concatenated rolls in the row to clipboard
      const tds = Array.from(tr.querySelectorAll('td'));
      const rolls = tds.filter((_, i) => i % 2 === 1).map(td => td.textContent).join(', ');
      if (navigator.clipboard) navigator.clipboard.writeText(rolls).catch(()=>{});
      // brief flash to show action
      tr.style.transition = 'background-color .18s ease';
      tr.style.backgroundColor = 'rgba(255,255,255,0.07)';
      setTimeout(()=> tr.style.backgroundColor = '', 240);
    });
  });
});