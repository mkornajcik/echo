document.addEventListener("DOMContentLoaded", () => {
  // Smooth scrolling for anchor links
  document.querySelectorAll(".terms-nav-list a").forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();

      const targetId = this.getAttribute("href");
      const targetElement = document.querySelector(targetId);

      if (targetElement) {
        // Get the sticky navigation height
        const navHeight = document.querySelector(".terms-navigation").offsetHeight;

        // Calculate the position to scroll to (accounting for the sticky nav)
        const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - navHeight - 20;

        // Smooth scroll to the target
        window.scrollTo({
          top: targetPosition,
          behavior: "smooth",
        });

        // Update URL hash without scrolling
        history.pushState(null, null, targetId);
      }
    });
  });

  // Highlight active section in navigation
  const sections = document.querySelectorAll(".terms-section");
  const navItems = document.querySelectorAll(".terms-nav-list a");

  function highlightActiveSection() {
    const scrollPosition = window.scrollY;

    sections.forEach((section) => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      const sectionId = "#" + section.getAttribute("id");

      if (scrollPosition >= sectionTop - 200 && scrollPosition < sectionTop + sectionHeight - 200) {
        navItems.forEach((item) => {
          item.classList.remove("active");
          if (item.getAttribute("href") === sectionId) {
            item.classList.add("active");
          }
        });
      }
    });
  }

  // Add active class styling
  const style = document.createElement("style");
  style.textContent = `
      .terms-nav-list li a.active {
        background-color: rgba(169, 29, 58, 0.1);
        color: var(--color-primary);
        font-weight: 700;
      }
    `;
  document.head.appendChild(style);

  window.addEventListener("scroll", highlightActiveSection);
  highlightActiveSection(); // Run once on page load
});
