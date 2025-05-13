import { showAlert } from "./alerts.js";

document.addEventListener("DOMContentLoaded", () => {
  // Handle follow/unfollow buttons
  const followButtons = document.querySelectorAll(".follow-btn");

  followButtons.forEach((button) => {
    button.addEventListener("click", async function () {
      const userId = this.getAttribute("data-user-id");
      const isFollowing = this.getAttribute("data-is-following") === "true";

      try {
        if (isFollowing) {
          // Unfollow user
          const response = await axios.delete(`/profile/follow/${userId}`);

          this.classList.remove("btn-secondary");
          this.classList.add("btn-primary");
          this.textContent = "Follow";
          this.setAttribute("data-is-following", "false");

          showAlert("success", response.data.message || "Unfollowed successfully", 2000);
        } else {
          // Follow user
          const response = await axios.post(`/profile/follow/${userId}`);

          this.classList.remove("btn-primary");
          this.classList.add("btn-secondary");
          this.textContent = "Following";
          this.setAttribute("data-is-following", "true");

          showAlert("success", response.data.message || "Followed successfully", 2000);
        }
      } catch (err) {
        showAlert("error", err.response?.data?.message || "An error occurred", 2000);
      }
    });
  });
});
