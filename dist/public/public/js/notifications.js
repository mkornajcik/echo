import { showAlert } from "./alerts.js";

document.addEventListener("DOMContentLoaded", () => {
  // Notification tabs functionality
  const notificationTabs = document.querySelectorAll(".notification-tab");

  notificationTabs.forEach((tab) => {
    tab.addEventListener("click", function () {
      // Update active tab
      notificationTabs.forEach((t) => t.classList.remove("active"));
      this.classList.add("active");

      // Show tab change notification
      showAlert("info", `Showing ${this.textContent} notifications`, 1500);

      // Filter notifications based on selected tab
      filterNotifications(this.textContent.toLowerCase());
    });
  });

  // Function to filter notifications
  function filterNotifications(filter) {
    const notifications = document.querySelectorAll(".notification-item");

    if (filter === "all") {
      // Show all notifications
      notifications.forEach((notification) => {
        notification.style.display = "flex";
      });
      return;
    }

    // Map tab names to notification types
    const typeMap = {
      mentions: "mention",
      likes: "like",
      reposts: "repost",
      follows: "follow",
    };

    const filterType = typeMap[filter];

    // Filter notifications
    notifications.forEach((notification) => {
      const notificationType = Array.from(notification.querySelector(".notification-icon").classList).find(
        (cls) => cls !== "notification-icon"
      );

      if (notificationType === filterType) {
        notification.style.display = "flex";
      } else {
        notification.style.display = "none";
      }
    });
  }

  // Follow button functionality
  const followButtons = document.querySelectorAll(".follow-btn");

  followButtons.forEach((button) => {
    button.addEventListener("click", function () {
      if (this.textContent === "Follow Back") {
        this.textContent = "Following";
        this.classList.remove("btn-secondary");
        this.classList.add("btn-primary");

        // Show follow confirmation
        const username = this.closest(".notification-item").querySelector("strong").textContent;
        showAlert("success", `You are now following ${username}`, 2000);
      } else {
        this.textContent = "Follow Back";
        this.classList.remove("btn-primary");
        this.classList.add("btn-secondary");
      }
    });
  });

  // Toggle switch functionality
  const toggleSwitches = document.querySelectorAll(".toggle-input");

  toggleSwitches.forEach((toggle) => {
    toggle.addEventListener("change", function () {
      const settingName = this.closest(".settings-item").querySelector("h4").textContent;
      const status = this.checked ? "enabled" : "disabled";

      // Show setting change notification
      showAlert("success", `${settingName} ${status}`, 2000);
    });
  });

  // Mark notifications as read when viewed
  setTimeout(() => {
    const badge = document.querySelector(".notification-badge");
    if (badge) {
      badge.style.display = "none";
      showAlert("info", "All notifications marked as read", 2000);
    }
  }, 2000);

  // Make notification items clickable
  const notificationItems = document.querySelectorAll(".notification-item");

  notificationItems.forEach((item) => {
    item.addEventListener("click", (e) => {
      // Don't navigate if clicking on buttons or links
      if (e.target.closest("button") || e.target.closest("a")) {
        return;
      }

      // In a real app, you would navigate to the relevant post or profile
      showAlert("info", "Navigating to related content", 1500);
    });
  });
});
