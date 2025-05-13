import { showAlert } from "./alerts.js";

document.addEventListener("DOMContentLoaded", () => {
  const editProfileBtn = document.querySelector(".edit-profile-btn");
  const editProfileModal = document.getElementById("edit-profile-modal");
  const closeModalBtn = editProfileModal?.querySelector(".close-modal");
  const cancelEditBtn = document.getElementById("cancel-edit");

  // Handle message user button
  const messageUserBtn = document.querySelector(".message-user-btn");
  if (messageUserBtn) {
    messageUserBtn.addEventListener("click", async () => {
      const targetId = messageUserBtn.dataset.targetId;

      if (!targetId) {
        console.error("Target user ID not found on button.");
        return;
      }

      try {
        const response = await axios.post("/api/messages/start-conversation", {
          targetUserId: targetId,
        });

        if (response.data.data.conversation?.id) {
          window.location.href = `/messages/${response.data.data.conversation.id}`;
        } else {
          console.error("Failed to get conversation ID from backend:", response.data);
          showAlert("error", "Could not start conversation. Please try again.", 1500);
        }
      } catch (error) {
        console.error("Error starting conversation:", error);
        showAlert("error", "Could not start conversation. Please try again.", 1500);
      }
    });
  }

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

    // Handle edit profile form submission
    const editProfileForm = document.getElementById("edit-profile-form");

    if (editProfileForm) {
      editProfileForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const editProfileBtn = document.querySelector(".edit-profile-btn");
        const userId = editProfileBtn.dataset.userId;

        const username = document.getElementById("display-name").value;
        const bio = document.getElementById("bio").value;
        const location = document.getElementById("location").value;
        const website = document.getElementById("website").value;

        try {
          const response = await axios.post(`/profile/${userId}`, { username, bio, location, website });

          if (response.data.status === "success") {
            closeModal();

            document.querySelector(".profile-name").textContent = response.data.user.username;
            document.querySelector(".profile-bio").textContent = response.data.user.bio;
            document.querySelector(".profile-meta-item.location span").textContent = response.data.user.location;
            document.querySelector(".profile-meta-item.website a").textContent = response.data.user.website;

            showAlert("success", "Profile updated succesfully", 5000);
          }
        } catch (error) {
          console.error("Error updating profile:", error);
          if (error.status === 429) {
            showAlert("error", "Too many requests. Try again later.", 5000);
          } else if (error.status === 409) {
            showAlert("error", "This username is already taken.", 5000);
          } else {
            showAlert("error", "Could not update user. Please try again.", 5000);
          }
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
  const avatarUpload = document.getElementById("avatar-upload");

  const editCoverBtn = document.querySelector(".edit-cover-btn");
  const coverUpload = document.getElementById("cover-upload");

  if (editAvatarBtn && avatarUpload) {
    editAvatarBtn.addEventListener("click", () => {
      avatarUpload.click();
    });
  }

  if (editCoverBtn && coverUpload) {
    editCoverBtn.addEventListener("click", () => {
      coverUpload.click();
    });
  }

  if (avatarUpload) {
    avatarUpload.addEventListener("change", handleAvatarSelect);
  }

  if (coverUpload) {
    coverUpload.addEventListener("change", handleCoverSelect);
  }

  // Profile avatar upload
  async function handleAvatarSelect(e) {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      showAlert("error", "Only image files are allowed", 3000);
      return;
    }

    // Validate file size
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      showAlert("error", "Image size must be less than 5MB", 3000);
      return;
    }

    const imageFile = avatarUpload.files[0];

    const formData = new FormData();
    if (imageFile) formData.append("image", imageFile);

    try {
      showAlert("info", "Posting...", 1500);
      const response = await axios.post("/files/profile/avatar", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.status === "success") {
        showAlert("success", "Posted successfully!", 2000);

        setTimeout(() => {
          window.location.reload();
        }, 2000);
      }
    } catch (error) {
      if (error.status === 429) {
        showAlert("error", "Too many requests. Try again later.", 5000);
      } else {
        showAlert("error", error.response?.data?.message || "Failed to upload avatar", 3000);
      }
    }
  }

  // Profile cover banner upload
  async function handleCoverSelect(e) {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      showAlert("error", "Only image files are allowed", 3000);
      return;
    }

    // Validate file size
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      showAlert("error", "Image size must be less than 5MB", 3000);
      return;
    }

    const imageFile = coverUpload.files[0];

    const formData = new FormData();
    if (imageFile) formData.append("image", imageFile);

    try {
      showAlert("info", "Posting...", 1500);
      const response = await axios.post("/files/profile/cover", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.status === "success") {
        showAlert("success", "Posted successfully!", 2000);

        setTimeout(() => {
          window.location.reload();
        }, 2000);
      }
    } catch (error) {
      if (error.status === 429) {
        showAlert("error", "Too many requests. Try again later.", 5000);
      } else {
        showAlert("error", error.response?.data?.message || "Failed to upload cover", 3000);
      }
    }
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
          const response = await axios.delete(`/api/profile/${userId}/unfollow/`);

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
          const response = await axios.post(`/api/profile/${userId}/follow`);

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
