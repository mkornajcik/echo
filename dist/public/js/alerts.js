// Map of alerts to icons
const ALERT_ICONS = {
  success: "fa-check-circle",
  error: "fa-exclamation-circle",
  warning: "fa-exclamation-triangle",
  info: "fa-info-circle",
  default: "fa-bell",
};

export const hideAlert = () => {
  const el = document.querySelector(".alert");
  if (!el) return;

  el.classList.add("alert--fadeout");

  setTimeout(() => {
    if (el.parentElement) el.parentElement.removeChild(el);
  }, 300);
};

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

  const alertElement = document.querySelector(".alert");

  // Add event listener to close button
  const closeBtn = alertElement.querySelector(".alert__close");
  if (closeBtn) {
    closeBtn.addEventListener("click", hideAlert);
  }

  resetButtonText();

  if (duration > 0) {
    window.setTimeout(hideAlert, duration);
  }

  setTimeout(() => {
    alertElement.classList.add("alert--visible");
  }, 10);
};

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
