import { showAlert } from "./alerts.js";
import { login, register, logout } from "./authentication.js";

document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("login-form");
  const registerForm = document.getElementById("register-form");
  const logOutBtn = document.getElementById("logout-btn");

  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      document.querySelector(".btn-login").textContent = "Processing...";
      const username = document.getElementById("username").value;
      const password = document.getElementById("password").value;
      login(username, password);
    });
  }

  if (registerForm) {
    registerForm.addEventListener("submit", (e) => {
      e.preventDefault();
      document.querySelector(".btn-register").textContent = "Processing...";
      const email = document.getElementById("email").value;
      const username = document.getElementById("username").value;
      const usertag = document.getElementById("usertag").value;
      const password = document.getElementById("password").value;

      register(email, username, usertag, password);
    });
  }

  if (logOutBtn) {
    console.log("Got Log out button");
    logOutBtn.addEventListener("click", logout);
  }

  // Toggle password visibility
  const togglePasswordButtons = document.querySelectorAll(".toggle-password");

  togglePasswordButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const input = this.previousElementSibling;
      const type = input.getAttribute("type") === "password" ? "text" : "password";
      input.setAttribute("type", type);

      // Toggle eye icon
      const icon = this.querySelector("i");
      icon.classList.toggle("fa-eye");
      icon.classList.toggle("fa-eye-slash");
    });
  });

  // Add animation to form elements
  const formGroups = document.querySelectorAll(".form-group");
  formGroups.forEach((group, index) => {
    group.style.opacity = "0";
    group.style.transform = "translateY(20px)";
    group.style.transition = "opacity 0.3s ease, transform 0.3s ease";
    group.style.transitionDelay = `${index * 0.1}s`;

    setTimeout(() => {
      group.style.opacity = "1";
      group.style.transform = "translateY(0)";
    }, 100);
  });

  // Check for alert message in data attribute
  const alertMessage = document.querySelector("body").dataset.alert;
  if (alertMessage) {
    // Determine alert type based on message content
    const alertType = alertMessage.includes("success") || alertMessage.includes("welcome") ? "success" : "info";

    showAlert(alertType, alertMessage);
  }

  // Add event listeners for demo alerts
  const demoAlertButtons = document.querySelectorAll(".demo-alert");
  if (demoAlertButtons) {
    demoAlertButtons.forEach((button) => {
      button.addEventListener("click", function () {
        const type = this.dataset.type || "info";
        const message = this.dataset.message || "This is a sample alert message";
        showAlert(type, message);
      });
    });
  }
});
