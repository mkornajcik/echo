/**
 * Alert utility functions for displaying notifications
 */

// Map of alert types to their corresponding Font Awesome icons
const ALERT_ICONS = {
  success: "fa-check-circle",
  error: "fa-exclamation-circle",
  warning: "fa-exclamation-triangle",
  info: "fa-info-circle",
  default: "fa-bell",
};

/**
 * Hides the currently displayed alert with an animation
 */
export const hideAlert = () => {
  const el = document.querySelector(".alert");
  if (!el) return;

  // Add fade out animation before removing
  el.classList.add("alert--fadeout");

  // Remove after animation completes
  setTimeout(() => {
    if (el.parentElement) el.parentElement.removeChild(el);
  }, 300);
};

/**
 * Shows an alert notification
 * @param {string} type - Alert type: success, error, warning, info
 * @param {string} msg - Message to display
 * @param {number} duration - Time in ms before auto-hiding (0 for no auto-hide)
 */
export const showAlert = (type, msg, duration = 5000) => {
  hideAlert();

  // Create alert element
  const markup = `
    <div class="alert alert--${type}">
      <div class="alert__icon">
        <i class="fas ${ALERT_ICONS[type] || ALERT_ICONS.default}"></i>
      </div>
      <div class="alert__content">
        <p>${msg}</p>
      </div>
      <button class="alert__close">
        <i class="fas fa-times"></i>
      </button>
    </div>
  `;

  document.querySelector("body").insertAdjacentHTML("afterbegin", markup);

  // Get the newly created alert
  const alertElement = document.querySelector(".alert");

  // Add event listener to close button
  const closeBtn = alertElement.querySelector(".alert__close");
  if (closeBtn) {
    closeBtn.addEventListener("click", hideAlert);
  }

  // Reset button text if needed
  resetButtonText();

  // Auto-hide after duration (if not 0)
  if (duration > 0) {
    window.setTimeout(hideAlert, duration);
  }

  // Add entrance animation
  setTimeout(() => {
    alertElement.classList.add("alert--visible");
  }, 10);
};

/**
 * Resets button text for login/register buttons if they exist
 */
function resetButtonText() {
  const registerBtn = document.querySelector(".btn-register");
  if (registerBtn) {
    registerBtn.textContent = "Register";
  }

  const loginBtn = document.querySelector(".btn-login");
  if (loginBtn) {
    loginBtn.textContent = "Login";
  }
}
