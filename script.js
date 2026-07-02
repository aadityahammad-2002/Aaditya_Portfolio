// fade-in / stagger reveal
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('.fade-in, .stagger').forEach(el => observer.observe(el));

  // diagram draw-in
  const diagramWrap = document.querySelector('.diagram-wrap');
  if (diagramWrap) {
    const diagObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('diagram-visible');
          diagObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    diagObserver.observe(diagramWrap);
  }

  // scroll progress bar
  const progressBar = document.getElementById('progressBar');
  const toTopBtn = document.getElementById('toTop');
  window.addEventListener('scroll', () => {
    const h = document.documentElement;
    const scrolled = (h.scrollTop) / (h.scrollHeight - h.clientHeight) * 100;
    if (progressBar) progressBar.style.width = scrolled + '%';
    if (toTopBtn) toTopBtn.classList.toggle('show', h.scrollTop > 500);
  });

  if (toTopBtn) {
    toTopBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // subtle tilt + spotlight on project cards
  document.querySelectorAll('.project').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `perspective(900px) rotateY(${x * 2.5}deg) rotateX(${-y * 2.5}deg) translateY(-2px)`;
      card.style.setProperty('--x', `${e.clientX - rect.left}px`);
      card.style.setProperty('--y', `${e.clientY - rect.top}px`);
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(900px) rotateY(0) rotateX(0) translateY(0)';
    });
  });

  // custom cursor
  const cursorDot = document.getElementById('cursorDot');
  const cursorRing = document.getElementById('cursorRing');
  const isFinePointer = window.matchMedia('(hover:hover) and (pointer:fine)').matches;

  if (isFinePointer && cursorDot && cursorRing) {
    let mouseX = 0, mouseY = 0, ringX = 0, ringY = 0;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursorDot.style.left = mouseX + 'px';
      cursorDot.style.top = mouseY + 'px';
    });

    function animateRing() {
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;
      cursorRing.style.left = ringX + 'px';
      cursorRing.style.top = ringY + 'px';
      requestAnimationFrame(animateRing);
    }
    animateRing();

    document.querySelectorAll('a, button, .chip, .tag').forEach(el => {
      el.addEventListener('mouseenter', () => cursorRing.classList.add('hovering'));
      el.addEventListener('mouseleave', () => cursorRing.classList.remove('hovering'));
    });
  }

  // magnetic buttons
  document.querySelectorAll('.magnetic').forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      btn.style.transform = `translate(${x * 0.25}px, ${y * 0.35}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = 'translate(0,0)';
    });
  });

  // animated count-up stats
  const statObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.querySelectorAll('.stat-num').forEach(el => {
          const target = parseInt(el.dataset.count, 10);
          const suffix = el.dataset.suffix || '';
          const duration = 1200;
          const start = performance.now();
          function tick(now) {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            el.textContent = Math.round(eased * target) + suffix;
            if (progress < 1) requestAnimationFrame(tick);
          }
          requestAnimationFrame(tick);
        });
        statObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  const statsBar = document.querySelector('.stats-bar');
  if (statsBar) statObserver.observe(statsBar);

  // ===================================================================
  // SMOOTH-SCROLL NAV + SCROLL-SPY (active section highlighting)
  // ===================================================================
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = Array.from(navLinks)
    .map(link => document.getElementById(link.dataset.section))
    .filter(Boolean);

  // intercept nav clicks for a controlled smooth scroll (accounts for fixed nav height)
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.dataset.section;
      const targetEl = document.getElementById(targetId);
      if (!targetEl) return;
      e.preventDefault();
      const navHeight = document.querySelector('nav')?.offsetHeight || 70;
      const top = targetEl.getBoundingClientRect().top + window.pageYOffset - navHeight + 1;
      window.scrollTo({ top, behavior: 'smooth' });
      history.pushState(null, '', `#${targetId}`);
    });
  });

  // highlight the nav link for whichever section is currently in view
  if (sections.length) {
    const spyObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          navLinks.forEach(link => {
            link.classList.toggle('active', link.dataset.section === id);
          });
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

    sections.forEach(sec => spyObserver.observe(sec));
  }

  // scroll straight to the right section if the page loads with a #hash in the URL
  window.addEventListener('load', () => {
    if (location.hash) {
      const targetEl = document.querySelector(location.hash);
      if (targetEl) {
        const navHeight = document.querySelector('nav')?.offsetHeight || 70;
        const top = targetEl.getBoundingClientRect().top + window.pageYOffset - navHeight + 1;
        window.scrollTo({ top, behavior: 'auto' });
      }
    }
  });

  // ===================================================================
  // CONTACT FORM -> mailto (static site, no backend)
  // ===================================================================
  const contactForm = document.getElementById('contactForm');
  const formNote = document.getElementById('formNote');
  const DEST_EMAIL = 'aadityahammad@gmail.com';
  const DEFAULT_NOTE = 'Opens your email app with this filled in — no server needed.';

  function setNote(text, type) {
    if (!formNote) return;
    formNote.innerHTML = text;
    formNote.className = 'form-note' + (type ? ` ${type}` : '');
  }

  function markInvalid(el, invalid) {
    el.classList.toggle('field-error', invalid);
  }

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const fname = document.getElementById('fname');
      const lname = document.getElementById('lname');
      const email = document.getElementById('email');
      const subject = document.getElementById('subject');
      const message = document.getElementById('message');

      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      let firstInvalid = null;

      [fname, lname, subject, message].forEach(field => {
        const invalid = !field.value.trim();
        markInvalid(field, invalid);
        if (invalid && !firstInvalid) firstInvalid = field;
      });

      const emailInvalid = !emailPattern.test(email.value.trim());
      markInvalid(email, emailInvalid);
      if (emailInvalid && !firstInvalid) firstInvalid = email;

      if (firstInvalid) {
        setNote('Please fill every field with a valid value before sending.', 'error');
        firstInvalid.focus();
        return;
      }

      const body = `Name: ${fname.value.trim()} ${lname.value.trim()}\nEmail: ${email.value.trim()}\n\n${message.value.trim()}`;
      const mailtoLink = `mailto:${DEST_EMAIL}?subject=${encodeURIComponent(subject.value.trim())}&body=${encodeURIComponent(body)}`;

      // Use a real, clicked anchor (more reliable than location.href across
      // browsers/embedded previews, which sometimes silently block direct
      // mailto navigation) instead of window.location.href.
      const tempLink = document.createElement('a');
      tempLink.href = mailtoLink;
      tempLink.target = '_blank';
      tempLink.rel = 'noopener';
      document.body.appendChild(tempLink);
      tempLink.click();
      document.body.removeChild(tempLink);

      setNote(
        `Opening your email app now. If nothing happens, <a href="${mailtoLink}">click here</a> or email me directly at ${DEST_EMAIL}.`,
        'success'
      );

      setTimeout(() => setNote(DEFAULT_NOTE, ''), 8000);
    });

    // clear error state as the person fixes a field
    ['fname', 'lname', 'email', 'subject', 'message'].forEach(id => {
      const field = document.getElementById(id);
      if (field) field.addEventListener('input', () => markInvalid(field, false));
    });
  }
