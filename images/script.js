(() => {
  "use strict";

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const menuButton = document.querySelector(".menu-toggle");
  const navigation = document.querySelector("#main-navigation");
  const header = document.querySelector(".site-header");

  function closeMenu() {
    navigation.classList.remove("is-open");
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "Open navigation");
  }

  menuButton.addEventListener("click", () => {
    const open = menuButton.getAttribute("aria-expanded") !== "true";
    navigation.classList.toggle("is-open", open);
    menuButton.setAttribute("aria-expanded", String(open));
    menuButton.setAttribute(
      "aria-label",
      open ? "Close navigation" : "Open navigation",
    );
  });
  navigation.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });
  document.addEventListener("click", (event) => {
    if (!header.contains(event.target)) closeMenu();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && navigation.classList.contains("is-open")) {
      closeMenu();
      menuButton.focus();
    }
  });
  window
    .matchMedia("(min-width: 1280px)")
    .addEventListener("change", closeMenu);

  const navLinks = [...navigation.querySelectorAll("a")];
  const sections = [...document.querySelectorAll("main > section")].filter(
    (section) => navLinks.some((link) => link.hash === "#" + section.id),
  );
  let scrollScheduled = false;

  function updateNavigation() {
    header.classList.toggle("is-scrolled", window.scrollY > 20);
    let current = sections[0];
    for (const section of sections) {
      if (section.getBoundingClientRect().top <= header.offsetHeight + 150) {
        current = section;
      }
    }
    navLinks.forEach((link) => {
      if (link.hash === "#" + current.id) {
        link.setAttribute("aria-current", "location");
      } else {
        link.removeAttribute("aria-current");
      }
    });
    scrollScheduled = false;
  }

  window.addEventListener(
    "scroll",
    () => {
      if (!scrollScheduled) {
        scrollScheduled = true;
        requestAnimationFrame(updateNavigation);
      }
    },
    { passive: true },
  );
  updateNavigation();

  function onSwipe(element, callback) {
    let startX = 0;
    let startY = 0;
    element.addEventListener(
      "touchstart",
      (event) => {
        startX = event.changedTouches[0].clientX;
        startY = event.changedTouches[0].clientY;
      },
      { passive: true },
    );
    element.addEventListener(
      "touchend",
      (event) => {
        const dx = event.changedTouches[0].clientX - startX;
        const dy = event.changedTouches[0].clientY - startY;
        if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.5) {
          callback(dx < 0 ? 1 : -1);
        }
      },
      { passive: true },
    );
  }

  const hero = document.querySelector(".hero-stage");
  const heroSlides = [...document.querySelectorAll(".hero-slide")];
  const heroDots = [...document.querySelectorAll("[data-hero-dot]")];
  const heroPause = document.querySelector("[data-hero-pause]");
  let heroIndex = 0;
  let heroTimer;
  let heroPaused = reducedMotion.matches;
  let heroHovered = false;
  let heroVisible = true;

  function scheduleHero() {
    clearInterval(heroTimer);
    if (
      heroPaused ||
      heroHovered ||
      !heroVisible ||
      document.hidden ||
      reducedMotion.matches
    )
      return;
    heroTimer = setInterval(() => showHero(heroIndex + 1), 8000);
  }

  function showHero(index, interaction = false) {
    heroIndex = (index + heroSlides.length) % heroSlides.length;
    heroSlides.forEach((slide, i) => {
      slide.classList.toggle("is-active", i === heroIndex);
      slide.setAttribute("aria-hidden", String(i !== heroIndex));
    });
    heroDots.forEach((dot, i) => {
      dot.classList.toggle("is-active", i === heroIndex);
      dot.setAttribute("aria-pressed", String(i === heroIndex));
    });
    document.querySelector(".hero-counter").innerHTML =
      String(heroIndex + 1).padStart(2, "0") + " <span>/ 03</span>";
    if (interaction) {
      heroPaused = true;
      updatePauseButton();
      scheduleHero();
    }
  }

  function updatePauseButton() {
    heroPause.hidden = reducedMotion.matches;
    heroPause.textContent = heroPaused ? "Play" : "Pause";
    heroPause.setAttribute(
      "aria-label",
      heroPaused ? "Play slideshow" : "Pause slideshow",
    );
  }

  document
    .querySelector("[data-hero-prev]")
    .addEventListener("click", () => showHero(heroIndex - 1, true));
  document
    .querySelector("[data-hero-next]")
    .addEventListener("click", () => showHero(heroIndex + 1, true));
  heroDots.forEach((dot, i) =>
    dot.addEventListener("click", () => showHero(i, true)),
  );
  heroPause.addEventListener("click", () => {
    heroPaused = !heroPaused;
    updatePauseButton();
    scheduleHero();
  });
  hero.addEventListener("mouseenter", () => {
    heroHovered = true;
    scheduleHero();
  });
  hero.addEventListener("mouseleave", () => {
    heroHovered = false;
    scheduleHero();
  });
  hero.addEventListener("focusin", (event) => {
    if (event.target === heroPause) return;
    heroPaused = true;
    updatePauseButton();
    scheduleHero();
  });
  hero.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      showHero(heroIndex + (event.key === "ArrowRight" ? 1 : -1), true);
    }
  });
  onSwipe(hero, (direction) => showHero(heroIndex + direction, true));
  document.addEventListener("visibilitychange", scheduleHero);
  new IntersectionObserver(([entry]) => {
    heroVisible = entry.isIntersecting;
    scheduleHero();
  }).observe(hero);
  reducedMotion.addEventListener("change", () => {
    heroPaused = reducedMotion.matches;
    updatePauseButton();
    scheduleHero();
  });
  updatePauseButton();
  scheduleHero();

  const amenityTrack = document.querySelector(".amenity-track");
  const amenityCards = [...amenityTrack.querySelectorAll(".amenity-card")];
  const amenityPrevious = document.querySelector("[data-amenity-prev]");
  const amenityNext = document.querySelector("[data-amenity-next]");

  function moveAmenity(direction) {
    const step = amenityCards[1].offsetLeft - amenityCards[0].offsetLeft;
    amenityTrack.scrollBy({
      left: direction * step,
      behavior: reducedMotion.matches ? "instant" : "smooth",
    });
  }

  function updateAmenityControls() {
    amenityPrevious.disabled = amenityTrack.scrollLeft <= 3;
    amenityNext.disabled =
      amenityTrack.scrollLeft >=
      amenityTrack.scrollWidth - amenityTrack.clientWidth - 3;
  }

  amenityPrevious.addEventListener("click", () => moveAmenity(-1));
  amenityNext.addEventListener("click", () => moveAmenity(1));
  amenityTrack.addEventListener("scroll", updateAmenityControls, {
    passive: true,
  });
  amenityTrack.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      moveAmenity(event.key === "ArrowRight" ? 1 : -1);
    }
  });
  window.addEventListener("resize", updateAmenityControls);
  updateAmenityControls();

  const galleryButtons = [...document.querySelectorAll("[data-gallery-index]")];
  const galleryItems = galleryButtons.map((button) => ({
    src: button.dataset.gallerySrc,
    title: button.dataset.galleryTitle,
    project: button.dataset.galleryProject,
    alt: button.querySelector("img").alt,
  }));
  const gallery = document.querySelector(".gallery");
  const galleryImage = document.querySelector("#gallery-image");
  const lightbox = document.querySelector("#image-lightbox");
  const lightboxImage = document.querySelector("#lightbox-image");
  let galleryIndex = 0;
  let returnFocus;

  function imageDisclosure(item) {
    return item.project + " · Artist’s impression · For representation only";
  }

  function updateLightbox() {
    const item = galleryItems[galleryIndex];
    lightboxImage.src = "images/" + item.src;
    lightboxImage.alt = item.alt;
    document.querySelector("#lightbox-title").textContent = item.title;
    document.querySelector("#lightbox-caption").textContent =
      galleryIndex +
      1 +
      " / " +
      galleryItems.length +
      " · " +
      imageDisclosure(item);
  }

  function showGallery(index) {
    galleryIndex = (index + galleryItems.length) % galleryItems.length;
    const item = galleryItems[galleryIndex];
    galleryImage.src = "images/" + item.src;
    galleryImage.alt = item.alt;
    document.querySelector("#gallery-caption").textContent = item.title;
    document.querySelector("#gallery-number").textContent =
      String(galleryIndex + 1).padStart(2, "0") + " / " + galleryItems.length;
    document.querySelector("#gallery-disclosure").textContent =
      imageDisclosure(item);
    galleryButtons.forEach((button, i) =>
      button.setAttribute("aria-pressed", String(i === galleryIndex)),
    );
    if (lightbox.open) updateLightbox();
  }

  function openLightbox() {
    returnFocus = document.activeElement;
    updateLightbox();
    lightbox.showModal();
    document.body.classList.add("modal-open");
    document.querySelector(".lightbox-close").focus();
  }

  document
    .querySelector("[data-gallery-prev]")
    .addEventListener("click", () => showGallery(galleryIndex - 1));
  document
    .querySelector("[data-gallery-next]")
    .addEventListener("click", () => showGallery(galleryIndex + 1));
  galleryButtons.forEach((button, i) =>
    button.addEventListener("click", () => {
      showGallery(i);
      openLightbox();
    }),
  );
  gallery.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      showGallery(galleryIndex + (event.key === "ArrowRight" ? 1 : -1));
    }
  });
  onSwipe(gallery, (direction) => showGallery(galleryIndex + direction));
  document
    .querySelector(".gallery-image-button")
    .addEventListener("click", openLightbox);
  document
    .querySelector(".lightbox-close")
    .addEventListener("click", () => lightbox.close());
  lightbox.addEventListener("close", () => {
    document.body.classList.remove("modal-open");
    returnFocus?.focus({ preventScroll: true });
  });
  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) {
      const bounds = lightbox.getBoundingClientRect();
      if (
        event.clientX < bounds.left ||
        event.clientX > bounds.right ||
        event.clientY < bounds.top ||
        event.clientY > bounds.bottom
      )
        lightbox.close();
    }
  });
  lightbox.addEventListener("keydown", (event) => {
    if (event.key === "Tab") {
      const controls = [...lightbox.querySelectorAll("button")].filter(
        (control) => !control.disabled && control.getClientRects().length,
      );
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      showGallery(galleryIndex + (event.key === "ArrowRight" ? 1 : -1));
    }
  });
  document
    .querySelector("[data-lightbox-prev]")
    .addEventListener("click", () => showGallery(galleryIndex - 1));
  document
    .querySelector("[data-lightbox-next]")
    .addEventListener("click", () => showGallery(galleryIndex + 1));
  onSwipe(lightboxImage, (direction) => showGallery(galleryIndex + direction));
  showGallery(0);

  const stickyEnquiry = document.querySelector(".mobile-enquiry");
  const visibleEnquiries = new Set();
  const enquiryObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) visibleEnquiries.add(entry.target);
        else visibleEnquiries.delete(entry.target);
      });
      stickyEnquiry.classList.toggle("is-hidden", visibleEnquiries.size > 0);
    },
    { rootMargin: "-80px 0px 0px 0px", threshold: 0.01 },
  );
  document
    .querySelectorAll(
      ".enquiry-panel, .section-cta, .hero-actions, .map-request .button, " +
        ".price-panel .button, .overview-copy > .button, " +
        ".philosophy-list > .button, .visit-inner > .button",
    )
    .forEach((element) => enquiryObserver.observe(element));

  if (!reducedMotion.matches) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08 },
    );
    document.querySelectorAll(".reveal").forEach((element) => {
      element.classList.add("will-reveal");
      revealObserver.observe(element);
    });
  }
})();
