/* ╔══════════════════════════════════════════════════════════════╗
   ║  LIQUIDEX — Landing 2.0 orchestration (GSAP + ScrollTrigger)   ║
   ║  Loader → hero intro → scroll-driven story chapters that       ║
   ║  drive the WebGL liquidity field (window.LIQX).                ║
   ╚══════════════════════════════════════════════════════════════╝ */
(function () {
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const LIQX = (window.LIQX = window.LIQX || {
    progress: 0, cascade: 0, burst: 0,
    pal: { hero: 1, hunt: 0, casc: 0, rev: 0 },
    visible: true,
  });

  /* ── word splitter (re-runs on language change) ───────────── */
  function wrapWords(node) {
    Array.from(node.childNodes).forEach((n) => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(" ")); return; }
          const s = document.createElement("span");
          s.className = "w";
          s.textContent = part;
          frag.appendChild(s);
        });
        node.replaceChild(frag, n);
      } else if (n.nodeType === 1) {
        wrapWords(n); // recurse so accent phrases wrap word-by-word too
      }
    });
  }
  function splitWords(scope) {
    scope.querySelectorAll("[data-split]").forEach((el) => {
      if (el.querySelector(".w")) return; // already split
      wrapWords(el);
    });
  }

  /* ── loader ───────────────────────────────────────────────── */
  function runLoader(done) {
    const loader = document.querySelector(".loader");
    if (!loader || reduced) { loader && loader.remove(); done(); return; }
    const bar = loader.querySelector(".l-bar i");
    const pct = loader.querySelector(".l-pct");
    const n = { v: 0 };
    gsap.to(n, {
      v: 100, duration: 1.4, ease: "power2.inOut",
      onUpdate() {
        bar.style.width = n.v + "%";
        pct.textContent = String(Math.round(n.v)).padStart(3, "0");
      },
      onComplete() {
        gsap.to(loader, {
          autoAlpha: 0, duration: 0.7, ease: "power2.inOut", delay: 0.1,
          onComplete() { loader.remove(); done(); },
        });
      },
    });
  }

  /* ── hero intro ───────────────────────────────────────────── */
  function heroIntro() {
    if (reduced) return;
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    tl.from(".nav", { y: -28, autoAlpha: 0, duration: 0.9 }, 0.1)
      .from(".hero-eyebrow", { y: 22, autoAlpha: 0, duration: 0.8 }, 0.2)
      .from(".hero-line .w", { yPercent: 110, autoAlpha: 0, stagger: 0.05, duration: 0.9 }, 0.3)
      .from(".hero-giant", { yPercent: 24, autoAlpha: 0, scale: 0.97, duration: 1.25, ease: "power4.out" }, 0.62)
      .from(".hero-sub", { y: 26, autoAlpha: 0, duration: 0.9 }, 0.95)
      .from(".hero-stats", { y: 18, autoAlpha: 0, duration: 0.8 }, 1.1)
      .from(".scroll-cue", { autoAlpha: 0, duration: 0.9 }, 1.3);
  }

  /* ── scroll-driven story ──────────────────────────────────── */
  let ctx = null;
  function buildScroll() {
    if (ctx) ctx.revert();
    ctx = gsap.context(() => {
      const story = document.querySelector(".story");
      const dots = document.querySelectorAll(".story-dots i");
      const dotsBox = document.querySelector(".story-dots");
      const pill = document.querySelector(".float-cta");

      /* hero text drifts + blurs away as the dive begins */
      if (!reduced) {
        gsap.to(".hero .wrap", {
          yPercent: -14, autoAlpha: 0, ease: "none",
          scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom 35%", scrub: true },
        });
      }

      /* global dive progress: hero top → story end */
      ScrollTrigger.create({
        trigger: ".hero", start: "top top",
        endTrigger: ".story", end: "bottom bottom",
        scrub: true,
        onUpdate(self) { LIQX.progress = self.progress; LIQX.wake && LIQX.wake(); },
      });

      /* canvas + corner UI lifecycle */
      ScrollTrigger.create({
        trigger: ".story", start: "top 80%", end: "bottom 20%",
        onToggle(self) {
          dotsBox && dotsBox.classList.toggle("show", self.isActive);
        },
      });
      ScrollTrigger.create({
        trigger: ".story", start: "top 60%",
        endTrigger: "#pricing", end: "top 70%",
        onToggle(self) { pill && pill.classList.toggle("show", self.isActive); },
      });
      /* fade the WebGL field out once the story ends */
      gsap.to("#liqfield", {
        autoAlpha: 0, ease: "none",
        scrollTrigger: {
          trigger: ".story", start: "bottom 95%", end: "bottom 40%", scrub: true,
          onLeaveBack() { LIQX.visible = true; LIQX.wake && LIQX.wake(); },
          onLeave() { LIQX.visible = false; },
        },
      });

      /* chapters */
      const chapters = gsap.utils.toArray(".chapter");
      chapters.forEach((ch, idx) => {
        const words = ch.querySelectorAll(".ch-big .w, .ch-kicker, .ch-sub, .ch-cta");

        if (!reduced) {
          const tl = gsap.timeline({
            scrollTrigger: { trigger: ch, start: "top 55%", end: "42% 50%", scrub: 0.6 },
          });
          tl.fromTo(words,
            { autoAlpha: 0, y: 36, filter: "blur(9px)" },
            { autoAlpha: 1, y: 0, filter: "blur(0px)", stagger: 0.045, ease: "power2.out" });
          /* drift out before next chapter */
          gsap.fromTo(ch.querySelector(".ch-copy"),
            { autoAlpha: 1, y: 0 },
            { autoAlpha: 0, y: -44, ease: "none",
              scrollTrigger: { trigger: ch, start: "78% 50%", end: "bottom 18%", scrub: true } });
        }

        /* active dot */
        ScrollTrigger.create({
          trigger: ch, start: "top 50%", end: "bottom 50%",
          onToggle(self) { dots[idx] && dots[idx].classList.toggle("on", self.isActive); },
        });

        /* field state per chapter */
        const state = ch.dataset.state;
        if (state) {
          ScrollTrigger.create({
            trigger: ch, start: "top 60%", end: "bottom 45%",
            onToggle(self) {
              if (!self.isActive) return;
              gsap.to(LIQX.pal, {
                hero: state === "hero" ? 1 : 0,
                hunt: state === "hunt" ? 1 : 0,
                casc: state === "casc" ? 1 : 0,
                rev:  state === "rev" ? 1 : 0,
                duration: 1.4, ease: "power2.inOut", overwrite: true,
              });
              gsap.to(LIQX, {
                cascade: state === "casc" ? 1 : 0,
                burst: state === "rev" ? 1 : 0,
                duration: state === "casc" ? 1.6 : 1.2,
                ease: "power2.inOut", overwrite: "auto",
                onUpdate() { LIQX.wake && LIQX.wake(); },
              });
            },
          });
        }
      });

      /* back at the very top → hero palette */
      ScrollTrigger.create({
        trigger: ".hero", start: "top top", end: "bottom 60%",
        onToggle(self) {
          if (!self.isActive) return;
          gsap.to(LIQX.pal, { hero: 1, hunt: 0, casc: 0, rev: 0, duration: 1.2, overwrite: true });
          gsap.to(LIQX, { cascade: 0, burst: 0, duration: 1, overwrite: "auto" });
        },
      });

      /* gentle parallax on content terminals */
      if (!reduced) {
        gsap.utils.toArray(".page .terminal").forEach((el) => {
          gsap.fromTo(el, { y: 36 }, {
            y: -24, ease: "none",
            scrollTrigger: { trigger: el, start: "top 95%", end: "bottom 5%", scrub: true },
          });
        });
      }
    });
  }

  /* ── boot ─────────────────────────────────────────────────── */
  function init() {
    /* nav glassifies on scroll (cheap, GSAP-independent) */
    const nav = document.querySelector(".nav");
    addEventListener("scroll", () => nav && nav.classList.toggle("solid", scrollY > 70), { passive: true });

    if (!window.gsap || !window.ScrollTrigger) {
      const l = document.querySelector(".loader");
      l && l.remove();
      return;
    }
    gsap.registerPlugin(ScrollTrigger);
    splitWords(document);
    runLoader(() => { heroIntro(); });
    buildScroll();

    /* language switch re-renders text → re-split + rebuild */
    document.addEventListener("langchange", () => {
      requestAnimationFrame(() => {
        splitWords(document);
        buildScroll();
        ScrollTrigger.refresh();
      });
    });
    addEventListener("load", () => ScrollTrigger.refresh());
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
