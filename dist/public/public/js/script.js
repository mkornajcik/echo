import { showAlert } from "./alerts.js";
document.addEventListener("DOMContentLoaded", () => {
  initMobileNavigation();
  initTestimonialSlider();
  initFloatingElements();
  initSmoothScrolling();
  initRevealAnimations();
});

// Copy to clipboard
const emailLink = document.getElementById("email");

if (emailLink) {
  emailLink.addEventListener("click", async function (e) {
    e.stopPropagation();

    const email = emailLink.textContent;
    navigator.clipboard.writeText(email);
    showAlert("success", "Copied to clipboard", 2500);
  });
}

function initMobileNavigation() {
  const navToggle = document.querySelector(".nav-toggle");
  const navMenu = document.querySelector(".nav-menu");

  if (!navToggle || !navMenu) return;

  // Toggle navigation menu
  navToggle.addEventListener("click", () => {
    navToggle.classList.toggle("active");
    navMenu.classList.toggle("active");
  });

  // Close menu when clicking on a nav link
  document.querySelectorAll(".nav-menu a").forEach((link) => {
    link.addEventListener("click", () => {
      navToggle.classList.remove("active");
      navMenu.classList.remove("active");
    });
  });
}

function initTestimonialSlider() {
  const testimonialSlider = document.querySelector(".testimonial-slider");
  const testimonials = document.querySelectorAll(".testimonial");
  const prevBtn = document.querySelector(".prev-btn");
  const nextBtn = document.querySelector(".next-btn");

  if (!testimonialSlider || !testimonials.length || !prevBtn || !nextBtn) return;

  let currentIndex = 0;
  let autoSlide;
  const SLIDE_INTERVAL = 5000;

  // Show first testimonial
  testimonials[0].classList.add("active");

  // Function to update slider position
  const updateSlider = (newIndex) => {
    // Hide current testimonial
    testimonials[currentIndex].classList.remove("active");

    // Update index
    currentIndex = newIndex;

    // Show new testimonial
    testimonials[currentIndex].classList.add("active");
  };

  // Navigate to next slide
  const nextSlide = () => {
    const newIndex = (currentIndex + 1) % testimonials.length;
    updateSlider(newIndex);
  };

  // Navigate to previous slide
  const prevSlide = () => {
    const newIndex = (currentIndex - 1 + testimonials.length) % testimonials.length;
    updateSlider(newIndex);
  };

  // Setup auto slide functionality
  const startAutoSlide = () => {
    stopAutoSlide();
    autoSlide = setInterval(nextSlide, SLIDE_INTERVAL);
  };

  // Stop auto slide
  const stopAutoSlide = () => {
    if (autoSlide) {
      clearInterval(autoSlide);
    }
  };

  // Event listeners
  nextBtn.addEventListener("click", () => {
    nextSlide();
    startAutoSlide();
  });

  prevBtn.addEventListener("click", () => {
    prevSlide();
    startAutoSlide();
  });

  testimonialSlider.addEventListener("mouseenter", stopAutoSlide);
  testimonialSlider.addEventListener("mouseleave", startAutoSlide);

  // Start auto slide
  startAutoSlide();
}

function initFloatingElements() {
  const floatingElements = document.querySelectorAll(".floating-element");
  if (!floatingElements.length) return;

  floatingElements.forEach((element) => {
    const speed = parseFloat(element.getAttribute("data-speed")) || 1;

    // Random starting position
    const startX = Math.random() * 20 - 10;
    const startY = Math.random() * 20 - 10;
    let x = startX;
    let y = startY;
    let dirX = Math.random() > 0.5 ? 1 : -1;
    let dirY = Math.random() > 0.5 ? 1 : -1;

    element.style.transform = `translate(${startX}px, ${startY}px)`;

    // Custom animation for each element
    function animate() {
      if (Math.abs(x) > 20) dirX *= -1;
      if (Math.abs(y) > 20) dirY *= -1;

      // Update position
      x += 0.1 * dirX * speed;
      y += 0.1 * dirY * speed;

      element.style.transform = `translate(${x}px, ${y}px)`;
      requestAnimationFrame(animate);
    }

    animate();
  });
}

function initSmoothScrolling() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      const targetId = this.getAttribute("href");

      if (targetId === "#") return;

      const targetElement = document.querySelector(targetId);
      if (!targetElement) return;

      e.preventDefault();
      targetElement.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  });
}

function initRevealAnimations() {
  const revealElements = document.querySelectorAll(".feature-card, .testimonial, .cta");
  if (!revealElements.length) return;

  // Set initial styles
  revealElements.forEach((element) => {
    element.style.opacity = "0";
    element.style.transform = "translateY(20px)";
    element.style.transition = "opacity 0.6s ease, transform 0.6s ease";
  });

  // Debounce function
  const debounce = (func, delay) => {
    let timeout;
    return function () {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, arguments), delay);
    };
  };

  const checkReveal = () => {
    const windowHeight = window.innerHeight;
    const revealPoint = 150;

    revealElements.forEach((element) => {
      const elementTop = element.getBoundingClientRect().top;
      if (elementTop < windowHeight - revealPoint) {
        element.style.opacity = "1";
        element.style.transform = "translateY(0)";
      }
    });
  };

  // Debounced scroll handler
  const debouncedCheckReveal = debounce(checkReveal, 10);

  // Check on load and scroll
  window.addEventListener("load", checkReveal);
  window.addEventListener("scroll", debouncedCheckReveal);
}
