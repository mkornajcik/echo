import { showAlert } from "./alerts.js";

document.addEventListener("DOMContentLoaded", () => {
  // Edit profile button
  const editProfileBtn = document.querySelector(".edit-profile-btn");
  const editProfileModal = document.getElementById("edit-profile-modal");
  const closeModalBtn = editProfileModal?.querySelector(".close-modal");
  const cancelEditBtn = document.getElementById("cancel-edit");

  if (editProfileBtn && editProfileModal) {
    editProfileBtn.addEventListener("click", () => {
      editProfileModal.classList.add("active");
    });

    // Close modal functions
    const closeModal = () => {
      editProfileModal.classList.remove("active");
    };

    if (closeModalBtn) {
      closeModalBtn.addEventListener("click", closeModal);
    }

    if (cancelEditBtn) {
      cancelEditBtn.addEventListener("click", closeModal);
    }

    // Close when clicking outside
    editProfileModal.addEventListener("click", (e) => {
      if (e.target === editProfileModal) {
        closeModal();
      }
    });

    // Handle form submission
    const editProfileForm = document.getElementById("edit-profile-form");
    if (editProfileForm) {
      editProfileForm.addEventListener("submit", (e) => {
        e.preventDefault();

        // In a real app, you would send the form data to the server
        // For now, we'll just show a success message and close the modal
        showAlert("success", "Profile updated successfully!", 2000);
        closeModal();

        // Update profile info on the page
        const displayName = document.getElementById("display-name").value;
        const bio = document.getElementById("bio").value;
        const location = document.getElementById("location").value;
        const website = document.getElementById("website").value;

        // Update name
        const profileName = document.querySelector(".profile-name");
        if (profileName) {
          profileName.textContent = displayName;
        }

        // Update bio
        const profileBio = document.querySelector(".profile-bio p");
        if (profileBio) {
          profileBio.textContent = bio;
        }

        // Update location
        const locationSpan = document.querySelector(".profile-meta-item:nth-child(1) span");
        if (locationSpan) {
          locationSpan.textContent = location;
        }

        // Update website
        const websiteLink = document.querySelector(".profile-meta-item:nth-child(2) a");
        if (websiteLink) {
          websiteLink.href = website;
          websiteLink.textContent = website;
        }
      });
    }

    // Character counters for form fields
    const textInputs = editProfileModal.querySelectorAll("input[maxlength], textarea[maxlength]");
    textInputs.forEach((input) => {
      const counter = input.parentElement.querySelector(".character-counter");
      if (counter) {
        // Initial count
        counter.textContent = input.getAttribute("maxlength") - input.value.length;

        // Update on input
        input.addEventListener("input", function () {
          const maxLength = this.getAttribute("maxlength");
          const remaining = maxLength - this.value.length;
          counter.textContent = remaining;

          // Change color when getting low
          if (remaining <= 10) {
            counter.style.color = "#f59e0b";
          } else if (remaining <= 0) {
            counter.style.color = "#ef4444";
          } else {
            counter.style.color = "";
          }
        });
      }
    });
  }

  // Avatar and cover image edit buttons
  const editAvatarBtn = document.querySelector(".edit-avatar-btn");
  const editCoverBtn = document.querySelector(".edit-cover-btn");

  if (editAvatarBtn) {
    editAvatarBtn.addEventListener("click", () => {
      // In a real app, you would open a file picker
      showAlert("info", "Avatar upload functionality would open here", 2000);
    });
  }

  if (editCoverBtn) {
    editCoverBtn.addEventListener("click", () => {
      // In a real app, you would open a file picker
      showAlert("info", "Cover image upload functionality would open here", 2000);
    });
  }

  // Follow
  const followBtn = document.querySelector(".follow-btn");
  if (followBtn) {
    followBtn.addEventListener("click", async function () {
      const userId = this.getAttribute("data-user-id");
      const isFollowing = this.getAttribute("data-is-following") === "true";
      const followerCountEl = document.getElementById("profile-follower-count");

      try {
        if (isFollowing) {
          const response = await axios.delete(`/profile/follow/${userId}`);

          this.classList.remove("btn-secondary");
          this.classList.add("btn-primary");
          this.textContent = "Follow";
          this.setAttribute("data-is-following", "false");
          showAlert("success", response.data.message, 2000);

          if (followerCountEl) {
            let count = parseInt(followerCountEl.textContent, 10);
            followerCountEl.textContent = count - 1;
          }
        } else {
          const response = await axios.post(`/profile/follow/${userId}`);

          this.classList.remove("btn-primary");
          this.classList.add("btn-secondary");
          this.textContent = "Following";
          this.setAttribute("data-is-following", "true");
          showAlert("success", response.data.message, 2000);

          if (followerCountEl) {
            let count = parseInt(followerCountEl.textContent, 10);
            followerCountEl.textContent = count + 1;
          }
        }
      } catch (err) {
        showAlert("error", err.response?.data?.message || "An error occurred", 2000);
      }
    });
  }
});
