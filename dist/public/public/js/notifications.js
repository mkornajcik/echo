import { showAlert } from "./alerts.js";

const updateNotificationBadge = async () => {
  const badgeElement = document.getElementById("nav-notification-badge");
  if (!badgeElement) {
    return;
  }

  try {
    const response = await axios.get("/api/notifications/unread-count");

    if (response.data.status === "success") {
      const count = response.data.unreadCount;

      if (count > 0) {
        badgeElement.textContent = count;
        badgeElement.style.display = "inline-flex";
      } else {
        badgeElement.textContent = "";
        badgeElement.style.display = "none";
      }
    } else {
      badgeElement.style.display = "none";
    }
  } catch (error) {
    badgeElement.style.display = "none";

    if (error.response && error.response.status !== 401) {
      console.error("Failed to fetch notification count:", error);
    }
  }
};

const updateMessageNotificationBadge = async () => {
  const badgeElement = document.getElementById("nav-message-notification-badge");
  if (!badgeElement) {
    return;
  }

  try {
    const response = await axios.get("/api/notifications/message/unread-count");

    if (response.data.status === "success") {
      const count = response.data.unreadMessageCount;

      if (count > 0) {
        badgeElement.textContent = count;
        badgeElement.style.display = "inline-flex";
      } else {
        badgeElement.textContent = "";
        badgeElement.style.display = "none";
      }
    } else {
      badgeElement.style.display = "none";
    }
  } catch (error) {
    badgeElement.style.display = "none";

    if (error.response && error.response.status !== 401) {
      console.error("Failed to fetch notification count:", error);
    }
  }
};

document.addEventListener("DOMContentLoaded", () => {
  // Update notifications badge
  updateNotificationBadge();
  updateMessageNotificationBadge();

  // Notification tabs functionality
  const notificationTabs = document.querySelectorAll(".notification-tab");
  if (notificationTabs.length > 0) {
    notificationTabs.forEach((tab) => {
      tab.addEventListener("click", function () {
        // Update active tab
        notificationTabs.forEach((t) => t.classList.remove("active"));
        this.classList.add("active");

        // Filter notifications based on selected tab
        filterNotifications(this.textContent.toLowerCase());
      });
    });
  }

  // Function to filter notifications
  function filterNotifications(filter) {
    const notifications = document.querySelectorAll(".notification-item");
    if (notifications.length === 0) return;

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
      messages: "message",
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

  // Toggle switch functionality
  const toggleSwitches = document.querySelectorAll(".toggle-input");

  toggleSwitches.forEach((toggle) => {
    toggle.addEventListener("change", function () {
      const settingName = this.closest(".settings-item").querySelector("h4").textContent;
      const status = this.checked ? "enabled" : "disabled";
    });
  });

  // Mark notifications as read
  const markAsRead = async () => {
    const badgeElement = document.getElementById("nav-notification-badge");
    if (!badgeElement) {
      return;
    }
    try {
      const response = await axios.patch("/api/notifications/read-all");

      if (response.data.status === "success") {
        badgeElement.style.display = "none";
        showAlert("info", "All notifications marked as read", 2000);
      } else {
        badgeElement.style.display = "none";
      }
    } catch (error) {
      badgeElement.style.display = "none";

      if (error.response && error.response.status !== 401) {
        console.error("Failed to fetch notification count:", error);
      }
    }
  };
  const readButton = document.getElementById("markAsReadButton");
  if (!readButton) return;
  readButton.addEventListener("click", markAsRead);

  // Make notification items clickable
  const notificationItems = document.querySelectorAll(".notification-item");

  notificationItems.forEach((item) => {
    item.style.cursor = "pointer";
    item.addEventListener("click", (e) => {
      // Don't navigate if clicking on links
      if (e.target.closest("a")) {
        return;
      }
      if (item.dataset.refid) {
        window.location = `/posts/${item.dataset.refid}`;
      } else if (item.dataset.followid) {
        window.location = `/profile/${item.dataset.followid}`;
      } else if (item.dataset.conversationid) {
        window.location = `/messages/${item.dataset.conversationid}`;
      }
    });
  });
});
