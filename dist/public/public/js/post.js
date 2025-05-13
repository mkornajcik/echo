import { showAlert } from "./alerts.js";

document.addEventListener("DOMContentLoaded", () => {
  // Comment form functionality
  const commentForm = document.querySelector(".comment-form");
  const commentTextarea = document.querySelector(".comment-form textarea");
  const commentBtn = document.querySelector(".comment-btn");

  // Track if we've shown the warning alert to avoid spamming
  let warningAlertShown = false;
  let errorAlertShown = false;

  if (commentTextarea && commentBtn) {
    // Add a maxlength attribute if it doesn't exist
    if (!commentTextarea.hasAttribute("maxlength")) {
      commentTextarea.setAttribute("maxlength", "280");
    }

    // Add a character counter to the comment form if it doesn't exist
    let characterCount;
    const commentActions = document.querySelector(".comment-actions");

    if (!document.querySelector(".comment-character-count") && commentActions) {
      characterCount = document.createElement("span");
      characterCount.className = "comment-character-count";
      characterCount.style.color = "var(--color-text-muted)";
      characterCount.style.fontSize = "0.9rem";
      characterCount.style.marginRight = "0.5rem";
      characterCount.textContent = "280";

      // Insert before the comment button
      commentActions.querySelector(".comment-tools").insertAdjacentElement("afterend", characterCount);
    } else {
      characterCount = document.querySelector(".comment-character-count");
    }

    // Enable/disable comment button based on textarea content and monitor character count
    commentTextarea.addEventListener("input", function () {
      const maxLength = Number.parseInt(this.getAttribute("maxlength") || "280");
      const currentLength = this.value.length;
      const remaining = maxLength - currentLength;

      // Update character count if it exists
      if (characterCount) {
        characterCount.textContent = remaining;

        // Change color based on remaining characters
        if (remaining <= 0) {
          characterCount.style.color = "#ef4444"; // Red

          // Show error alert if not already shown
          if (!errorAlertShown) {
            showAlert("error", "You've exceeded the character limit. Please shorten your comment.", 3000);
            errorAlertShown = true;
            warningAlertShown = false; // Reset warning flag
          }
        } else if (remaining <= 20) {
          characterCount.style.color = "#f59e0b"; // Amber/Orange

          // Show warning alert when approaching limit (only once)
          if (remaining <= 10 && !warningAlertShown) {
            showAlert("warning", `You're approaching the character limit. ${remaining} characters remaining.`, 3000);
            warningAlertShown = true;
          }
        } else {
          characterCount.style.color = "var(--color-text-muted)";
          errorAlertShown = false;
          warningAlertShown = false;
        }
      }

      // Enable/disable button
      if (this.value.trim().length > 0 && currentLength <= maxLength) {
        commentBtn.removeAttribute("disabled");
      } else {
        commentBtn.setAttribute("disabled", "disabled");
      }
    });
  }

  if (commentForm) {
    // Handle comment form submission
    commentForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const postId = window.location.pathname.split("/").pop();
      const commentText = commentTextarea.value.trim();
      const maxLength = Number.parseInt(commentTextarea.getAttribute("maxlength") || "280");

      if (!commentText) {
        showAlert("error", "Your comment cannot be empty.", 3000);
        return;
      }

      if (commentText.length > maxLength) {
        showAlert("error", "Your comment exceeds the character limit. Please shorten it before posting.", 4000);
        return;
      }

      // Show loading state
      commentBtn.disabled = true;
      commentBtn.textContent = "Sending...";

      // Send comment to server
      axios
        .post(`/feed/post/${postId}`, {
          commentText: commentText,
        })
        .then((response) => {
          // Show success message
          showAlert("success", "Comment posted successfully!");

          // Clear the textarea
          commentTextarea.value = "";

          // Reset button
          commentBtn.disabled = true;
          commentBtn.textContent = "Reply";

          // Reset character count if it exists
          const characterCount = document.querySelector(".comment-character-count");
          if (characterCount) {
            characterCount.textContent = "280";
            characterCount.style.color = "var(--color-text-muted)";
          }

          // Reload the page to show the new comment
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        })
        .catch((error) => {
          console.error("Error posting comment:", error);
          commentBtn.disabled = false;
          commentBtn.textContent = "Reply";

          if (error.response && error.response.data && error.response.data.message) {
            showAlert("error", error.response.data.message);
          } else {
            showAlert("error", "Failed to post comment. Please try again.");
          }
        });
    });
  }

  // Delete post functionality
  const deletePostButton = document.getElementById("deletePostButton");

  if (deletePostButton) {
    deletePostButton.addEventListener("click", async function () {
      const postId = window.location.pathname.split("/").pop();

      try {
        const res = await axios({
          method: "DELETE",
          url: `/feed/post/${postId}`,
        });
        if (res.data.status === "success") {
          showAlert("success", "Post deleted successfully.");
          window.setTimeout(() => {
            location.assign("/feed");
          }, 1000);
        }
      } catch (err) {
        showAlert("error", "Error deleting the post.");
      }
    });
  }

  // Delete comment functionality
  const deleteCommentButtons = document.querySelectorAll("[id='deleteCommentButton']");

  if (deleteCommentButtons.length > 0) {
    deleteCommentButtons.forEach((button) => {
      button.addEventListener("click", async function () {
        const postId = window.location.pathname.split("/").pop();
        const commentId = this.dataset.id;

        try {
          const res = await axios({
            method: "DELETE",
            url: `/feed/post/${postId}/comment/${commentId}`,
          });
          if (res.data.status === "success") {
            showAlert("success", "Comment deleted successfully.");
            window.setTimeout(() => {
              location.reload();
            }, 1000);
          }
        } catch (err) {
          showAlert("error", "Error deleting the comment.");
        }
      });
    });
  }

  // Reply functionality
  const replyButtons = document.querySelectorAll(".comment-action.reply");

  replyButtons.forEach((button) => {
    button.addEventListener("click", function () {
      // Get the username to reply to
      const username = this.closest(".comment").querySelector(".comment-user-info h4").textContent;

      // Focus the comment textarea and add the @username
      commentTextarea.focus();
      commentTextarea.value = `@${username} `;

      // Trigger the input event to enable the reply button
      const inputEvent = new Event("input", { bubbles: true });
      commentTextarea.dispatchEvent(inputEvent);

      // Scroll to the comment form
      commentForm.scrollIntoView({ behavior: "smooth" });

      // Show a subtle info alert
      showAlert("info", `Replying to ${username}`, 2000);
    });
  });
});
