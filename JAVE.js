// Populate tables, animate sections, and add a visible smooth custom cursor with trail.
// Keeps default cursor visible (no body { cursor: none }).

/*
  Improved, performance-minded JS:
  - Batch DOM updates with DocumentFragment
  - Preload avatars (DiceBear) so images appear smoothly
  - Debounced resize for matching table widths
  - IntersectionObserver unobserves after reveal (less work)
  - Single delegated handlers for row clicks / hover effects
  - Smooth RAF driven cursor with configurable easing
*/

document.addEventListener('DOMContentLoaded', () => {
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

  // Utility: preload an array of image URLs
  function preload(urls) {
    urls.forEach(u => {
      const img = new Image();
      img.src = u;
    });
  }

  // Build rows with avatars (uses DiceBear seeds). Uses DocumentFragment for performance.
  function buildRows(data) {
    const frag = document.createDocumentFragment();
    data.forEach(row => {
      const tr = document.createElement('tr');

      // left name + avatar
      const td1 = document.createElement('td');
      td1.innerHTML = `
        <div class="student-info">
          <img class="student-avatar" src="https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(row[0])}" alt="${row[0]}">
          <span>${row[0]}</span>
        </div>`;
      tr.appendChild(td1);

      // left roll
      const td2 = document.createElement('td');
      td2.textContent = row[1];
      tr.appendChild(td2);

      // right name + avatar
      const td3 = document.createElement('td');
      td3.innerHTML = `
        <div class="student-info">
          <img class="student-avatar" src="https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(row[2])}" alt="${row[2]}">
          <span>${row[2]}</span>
        </div>`;
      tr.appendChild(td3);

      // right roll
      const td4 = document.createElement('td');
      td4.textContent = row[3];
      tr.appendChild(td4);

      frag.appendChild(tr);
    });
    return frag;
  }

  // Render tables (fast)
  function renderTableFast(selector, data) {
    const table = document.querySelector(selector);
    if (!table) return;
    // ensure thead
    let thead = table.querySelector('thead');
    if (!thead) {
      thead = table.appendChild(document.createElement('thead'));
    }
    thead.innerHTML = '<tr><th>Name</th><th>Roll</th><th>Name</th><th>Roll</th></tr>';

    // tbody replaced in one op
    const newTbody = document.createElement('tbody');
    newTbody.appendChild(buildRows(data));
    table.replaceChild(newTbody, table.querySelector('tbody') || table.appendChild(document.createElement('tbody')));
  }

  renderTableFast('.TC', sectionC);
  renderTableFast('.TB', sectionB);
  renderTableFast('.TA', sectionA);

  // Preload avatars quickly
  const preloadUrls = [...sectionC, ...sectionB, ...sectionA].flat().filter((_, i) => i % 2 === 0)
    .map(name => `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`);
  preload(preloadUrls);

  /* ---------- MATCH TABLE SIZES (debounced on resize) ---------- */
  const baseTable = document.querySelector('.TC');
  const otherTables = Array.from(document.querySelectorAll('.TB, .TA'));
  function matchWidths() {
    if (!baseTable) return;
    const width = Math.round(baseTable.getBoundingClientRect().width);
    otherTables.forEach(t => {
      t.style.width = width + 'px';
      if (t.parentElement) {
        t.parentElement.style.display = 'flex';
        t.parentElement.style.justifyContent = 'center';
      }
    });
  }
  // initial
  requestAnimationFrame(matchWidths);
  // debounced resize
  let resizeTimer = null;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(matchWidths, 120);
  });

  /* ---------- Intersection animation (unobserve once done) ---------- */
  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.section-card').forEach((el, i) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(24px) scale(.995)';
    el.style.transition = 'opacity .6s cubic-bezier(.2,.9,.2,1), transform .6s cubic-bezier(.2,.9,.2,1)';
    setTimeout(() => io.observe(el), 60 + i * 100);
  });

  /* ---------- Delegated interactions: row click / keyboard focus ---------- */
  document.addEventListener('click', (e) => {
    const tr = e.target.closest('tbody tr');
    if (!tr) return;
    // copy roll numbers of row (odd-index tds)
    const tds = Array.from(tr.querySelectorAll('td'));
    const rolls = tds.filter((_, i) => i % 2 === 1).map(td => td.textContent).join(', ');
    if (navigator.clipboard) navigator.clipboard.writeText(rolls).catch(()=>{});
    // flash
    tr.style.transition = 'background-color .15s ease';
    tr.style.backgroundColor = 'rgba(255,255,255,0.07)';
    setTimeout(()=> tr.style.backgroundColor = '', 220);
  });

  // keyboard focus styling via CSS class toggle
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') document.documentElement.classList.add('kbd-nav');
  });

  /* ---------- Smooth custom cursor (RAF + light weight) ---------- */
  const dot = document.createElement('div');
  const ring = document.createElement('div');
  dot.id = 'custom-cursor-dot';
  ring.id = 'custom-cursor-ring';
  document.body.appendChild(ring);
  document.body.appendChild(dot);

  // Minimal cursor styles if CSS missing
  const css = document.createElement('style');
  css.textContent = `
    #custom-cursor-dot, #custom-cursor-ring { position: fixed; pointer-events:none; z-index:9999; transform: translate(-50%,-50%); transition: transform .18s ease, background .18s ease; }
    #custom-cursor-dot { width:10px; height:10px; border-radius:50%; background: var(--primary,#4f46e5); box-shadow:0 6px 18px rgba(79,70,229,0.28); }
    #custom-cursor-ring { width:34px; height:34px; border-radius:50%; border:2px solid rgba(79,70,229,0.28); background: radial-gradient(circle, rgba(79,70,229,0.06), transparent 40%); }
    .cursor-hover #custom-cursor-dot { transform: translate(-50%,-50%) scale(1.9); background: linear-gradient(90deg,var(--accent,#f43f5e),var(--secondary,#6366f1)); }
    .cursor-hover #custom-cursor-ring { transform: translate(-50%,-50%) scale(1.25); border-color: rgba(244,63,94,0.6); }
  `;
  document.head.appendChild(css);

  let mouseX = window.innerWidth/2, mouseY = window.innerHeight/2;
  let ringX = mouseX, ringY = mouseY, dotX = mouseX, dotY = mouseY;
  // Easing factors: dot quick, ring smooth
  const DOT_EASE = 0.34, RING_EASE = 0.14;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  }, { passive: true });

  function loop() {
    ringX += (mouseX - ringX) * RING_EASE;
    ringY += (mouseY - ringY) * RING_EASE;
    dotX += (mouseX - dotX) * DOT_EASE;
    dotY += (mouseY - dotY) * DOT_EASE;

    ring.style.left = ringX + 'px';
    ring.style.top = ringY + 'px';
    dot.style.left = dotX + 'px';
    dot.style.top = dotY + 'px';

    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  // Delegated hover detection for interactive scale (lighter than attaching many listeners)
  document.addEventListener('pointerover', (e) => {
    if (e.target.closest('a, button, th, td, .section-card')) document.body.classList.add('cursor-hover');
  });
  document.addEventListener('pointerout', (e) => {
    if (e.target.closest('a, button, th, td, .section-card') === null) document.body.classList.remove('cursor-hover');
  });

  // Click feedback
  document.addEventListener('pointerdown', () => {
    dot.style.transform = 'translate(-50%,-50%) scale(0.72)';
    ring.style.transform = 'translate(-50%,-50%) scale(1.4)';
  });
  document.addEventListener('pointerup', () => {
    dot.style.transform = '';
    ring.style.transform = '';
  });

  // Accessibility: make rows focusable and reveal focus style
  document.querySelectorAll('tbody tr').forEach(tr => tr.setAttribute('tabindex','0'));

});