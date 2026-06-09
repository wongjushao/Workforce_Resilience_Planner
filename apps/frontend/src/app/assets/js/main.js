const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

document.documentElement.classList.add("js");

const mobileToggle = document.querySelector("[data-mobile-toggle]");
const mobileMenu = document.querySelector("[data-mobile-menu]");

if (mobileToggle && mobileMenu) {
  mobileToggle.addEventListener("click", () => {
    const isOpen = mobileToggle.getAttribute("aria-expanded") === "true";
    mobileToggle.setAttribute("aria-expanded", String(!isOpen));
    mobileMenu.classList.toggle("hidden", isOpen);
  });
}

if (!prefersReducedMotion) {
  window.addEventListener("pointermove", (event) => {
    document.body.style.setProperty("--cursor-x", `${event.clientX}px`);
    document.body.style.setProperty("--cursor-y", `${event.clientY}px`);
  });

  document.querySelectorAll(".tilt-card").forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `perspective(1000px) rotateX(${(-y * 8).toFixed(2)}deg) rotateY(${(x * 8).toFixed(2)}deg) translateY(-4px)`;
    });

    card.addEventListener("pointerleave", () => {
      card.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg)";
    });
  });
}

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.16 }
);

document.querySelectorAll(".reveal").forEach((element) => revealObserver.observe(element));

const counterObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const counter = entry.target;
      const target = Number(counter.dataset.count || "0");
      const suffix = counter.dataset.suffix || "";
      const duration = prefersReducedMotion ? 1 : 1200;
      const startTime = performance.now();

      const tick = (now) => {
        const progress = Math.min((now - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        counter.textContent = `${Math.round(target * eased)}${suffix}`;
        if (progress < 1) requestAnimationFrame(tick);
      };

      requestAnimationFrame(tick);
      counterObserver.unobserve(counter);
    });
  },
  { threshold: 0.5 }
);

document.querySelectorAll("[data-count]").forEach((counter) => counterObserver.observe(counter));

document.querySelectorAll("[data-faq-button]").forEach((button) => {
  button.addEventListener("click", () => {
    const item = button.closest(".faq-item");
    const expanded = button.getAttribute("aria-expanded") === "true";
    button.setAttribute("aria-expanded", String(!expanded));
    item.classList.toggle("is-open", !expanded);
  });
});
