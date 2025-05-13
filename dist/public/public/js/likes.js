import { showAlert } from "./alerts.js";

const initializeLikes = (parentElement = document) => {
  // Handle post likes
  const postLikeButtons = parentElement.querySelectorAll(".post-action.like");

  postLikeButtons.forEach((button) => {
    button.addEventListener("click", async function (e) {
      e.stopPropagation(); // Prevent navigation when clicking like button

      const postId = this.dataset.id;
      const icon = this.querySelector("i");
      const countSpan = this.querySelector("span");

      if (!postId) {
        console.error("Post ID not found on like button");
        return;
      }

      try {
        const response = await axios.post(`/feed/post/${postId}/like`);

        if (response.data.status === "success") {
          const { liked, count } = response.data.data;

          // Update UI based on liked status
          if (liked) {
            icon.classList.remove("far");
            icon.classList.add("fas");
            icon.style.color = "#F91880"; // Pink heart color
            showAlert("success", "Post liked!", 1500);
          } else {
            icon.classList.remove("fas");
            icon.classList.add("far");
            icon.style.color = "";
            showAlert("info", "Like removed", 1500);
          }

          // Update the count with the value from the server
          countSpan.textContent = count;
        }
      } catch (error) {
        console.error("Error toggling post like:", error);
        showAlert("error", "Couldn't update like status. Please try again.", 3000);
      }
    });
  });

  // Handle post reposts
  const postRepostButtons = parentElement.querySelectorAll(".post-action.repost");

  postRepostButtons.forEach((button) => {
    button.addEventListener("click", async function (e) {
      e.stopPropagation(); // Prevent navigation when clicking repost button

      const postId = this.dataset.id;
      const icon = this.querySelector("i");
      const countSpan = this.querySelector("span");

      if (!postId) {
        console.error("Post ID not found on repost button");
        return;
      }

      try {
        const response = await axios.post(`/feed/post/${postId}/repost`);

        if (response.data.status === "success") {
          const { reposted, count } = response.data.data;

          // Update UI based on reposted status
          if (reposted) {
            icon.style.color = "#17BF63"; // Green repost color
            showAlert("success", "Post reposted!", 1500);
          } else {
            icon.style.color = "";
            showAlert("info", "Repost removed", 1500);
          }

          // Update the count with the value from the server
          countSpan.textContent = count;
        }
      } catch (error) {
        console.error("Error toggling post repost:", error);
        // Check if the error response has a specific message
        const message = error.response?.data?.message || "Couldn't update repost status. Please try again.";
        showAlert("error", message, 3000);
      }
    });
  });

  // Handle comment likes
  const commentLikeButtons = parentElement.querySelectorAll(".comment-action.like");

  commentLikeButtons.forEach((button) => {
    button.addEventListener("click", async function (e) {
      e.stopPropagation(); // Prevent event bubbling

      const commentId = this.getAttribute("data-comment-id");
      const icon = this.querySelector("i");
      const countSpan = this.querySelector("span");
      const postId = window.location.pathname.split("/").pop();

      if (!commentId) {
        console.error("Comment ID not found on like button");
        return;
      }

      try {
        // Make API call to toggle like status
        const response = await axios.post(`/feed/post/${postId}/comment/${commentId}/like`);

        if (response.data.status === "success") {
          const { liked, count } = response.data.data;

          if (liked) {
            // User liked the comment
            icon.classList.remove("far");
            icon.classList.add("fas");
            icon.style.color = "#F91880";
            showAlert("success", "Comment liked!", 1500);
          } else {
            // User unliked the comment
            icon.classList.remove("fas");
            icon.classList.add("far");
            icon.style.color = "";
            showAlert("info", "Like removed", 1500);
          }

          // Update the count with the value from the server
          countSpan.textContent = count;
        }
      } catch (error) {
        console.error("Error toggling comment like:", error);
        showAlert("error", "Couldn't update like status. Please try again.", 3000);
      }
    });
  });
};

// Initialize likes when DOM content is loaded for the initial page load
document.addEventListener("DOMContentLoaded", () => initializeLikes());

export { initializeLikes };
