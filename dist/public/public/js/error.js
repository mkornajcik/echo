document.addEventListener("DOMContentLoaded", () => {
  // Create multiple birds with different speeds and paths
  createMultipleBirds();

  // Add subtle background animation
  animateBackground();

  // Add error message typing effect
  typeErrorMessage();

  // Function to create multiple birds
  function createMultipleBirds() {
    const errorAnimation = document.querySelector(".error-animation");
    const colors = ["#A91D3A", "#C73659"];

    // Remove the original bird container
    const originalBird = document.querySelector(".bird-container");
    if (originalBird) {
      originalBird.remove();
    }

    // Create 3 birds with different animations
    for (let i = 0; i < 3; i++) {
      const birdContainer = document.createElement("div");
      birdContainer.className = "bird-container";

      const bird = document.createElement("div");
      bird.className = "bird";

      // Customize bird styles
      bird.style.width = `${20 + i * 5}px`;
      bird.style.height = `${20 + i * 5}px`;

      // Set custom animation
      const delay = i * 3;
      const duration = 12 + i * 2;
      birdContainer.style.animation = `fly ${duration}s linear ${delay}s infinite`;
      birdContainer.style.bottom = `${10 + i * 20}px`;

      // Set custom bird color
      bird.style.setProperty("--error-primary", colors[i % colors.length]);
      bird.style.setProperty("--error-secondary", colors[(i + 1) % colors.length]);

      birdContainer.appendChild(bird);
      errorAnimation.appendChild(birdContainer);
    }
  }

  // Function to animate background
  function animateBackground() {
    const errorCard = document.querySelector(".error-card");

    // Create subtle gradient animation
    let gradientPos = 0;

    function updateGradient() {
      gradientPos = (gradientPos + 1) % 360;

      errorCard.style.backgroundImage = `
          radial-gradient(circle at ${10 + Math.sin(gradientPos * 0.01) * 10}% ${
        20 + Math.cos(gradientPos * 0.01) * 10
      }%, 
            rgba(169, 29, 58, 0.03) 0%, transparent 25%),
          radial-gradient(circle at ${90 - Math.sin(gradientPos * 0.01) * 10}% ${
        80 - Math.cos(gradientPos * 0.01) * 10
      }%, 
            rgba(199, 54, 89, 0.03) 0%, transparent 25%)
        `;

      requestAnimationFrame(updateGradient);
    }

    updateGradient();
  }

  // Function to add typing effect to error message
  function typeErrorMessage() {
    const errorMessage = document.querySelector(".error-message");
    if (!errorMessage) return;

    const originalText = errorMessage.textContent;
    errorMessage.textContent = "";

    let i = 0;
    const typingSpeed = 5; // milliseconds per character

    function typeWriter() {
      if (i < originalText.length) {
        errorMessage.textContent += originalText.charAt(i);
        i++;
        setTimeout(typeWriter, typingSpeed);
      }
    }

    // Start typing after a short delay
    setTimeout(typeWriter, 200);
  }

  // Add click event for the "Go Back" button
  const goBackBtn = document.querySelector(".error-actions .btn-secondary");
  if (goBackBtn) {
    goBackBtn.addEventListener("click", (e) => {
      e.preventDefault();
      window.history.back();
    });
  }
});
