import { showAlert } from "./alerts.js";

const initializeLikes = (parentElement = document) => {
  // Handle post likes
  const postLikeButtons = parentElement.querySelectorAll(".post-action.like");

  postLikeButtons.forEach((button) => {
    button.addEventListener("click", async function (e) {
      e.stopPropagation();

      if (this.disabled) return; // Already processing
      this.disabled = true;

      const postId = this.dataset.id;
      const icon = this.querySelector("i");
      const countSpan = this.querySelector("span");

      if (!postId) {
        console.error("Post ID not found on like button");
        this.disabled = false;
        return;
      }

      try {
        const response = await axios.post(`/api/posts/${postId}/like`);

        if (response.data.status === "success") {
          const { liked, count } = response.data.data;

          // Update based on liked status
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

          // Update the count
          countSpan.textContent = count;
        }
      } catch (error) {
        console.error("Error toggling post like:", error);
        showAlert("error", "Couldn't update like status. Please try again.", 3000);
      } finally {
        this.disabled = false;
      }
    });
  });

  // Handle post reposts
  const postRepostButtons = parentElement.querySelectorAll(".post-action.repost");

  postRepostButtons.forEach((button) => {
    button.addEventListener("click", async function (e) {
      e.stopPropagation();

      if (this.disabled) return; // Already processing
      this.disabled = true;

      const postId = this.dataset.id;
      const icon = this.querySelector("i");
      const countSpan = this.querySelector("span");

      if (!postId) {
        console.error("Post ID not found on repost button");
        this.disabled = false;
        return;
      }

      try {
        const response = await axios.post(`/api/posts/${postId}/repost`);

        if (response.data.status === "success") {
          const { reposted, count } = response.data.data;

          // Update based on reposted status
          if (reposted) {
            icon.style.color = "#17BF63"; // Green repost color
            icon.classList.add("reposted");
            showAlert("success", "Post reposted!", 1500);
          } else {
            icon.classList.remove("reposted");
            icon.style.color = "";
            showAlert("info", "Repost removed", 1500);
          }

          // Update the count
          countSpan.textContent = count;
        }
      } catch (error) {
        console.error("Error toggling post repost:", error);
        const message = error.response?.data?.message || "Couldn't update repost status. Please try again.";
        showAlert("error", message, 3000);
      } finally {
        this.disabled = false;
      }
    });
  });

  // Handle post share
  const postShareButtons = parentElement.querySelectorAll(".post-action.share");

  postShareButtons.forEach((button) => {
    button.addEventListener("click", async function (e) {
      e.stopPropagation();

      const baseUrl = window.location.origin;
      const postId = this.dataset.id;

      navigator.clipboard.writeText(`${baseUrl}/posts/${postId}`);
      showAlert("info", "Copied to clipboard", 1500);
    });
  });

  // Handle post comment button
  const postCommentButtons = parentElement.querySelectorAll(".post-action.comment");

  postCommentButtons.forEach((button) => {
    button.addEventListener("click", async function (e) {
      e.stopPropagation();

      const postId = this.dataset.id;
      window.location.href = `/posts/${postId}#commentText`;
    });
  });

  // Handle comment likes
  const commentLikeButtons = parentElement.querySelectorAll(".comment-action.like");

  commentLikeButtons.forEach((button) => {
    button.addEventListener("click", async function (e) {
      e.stopPropagation(); // Prevent event bubbling

      if (this.disabled) return; // Already processing
      this.disabled = true;

      const commentId = this.getAttribute("data-comment-id");
      const icon = this.querySelector("i");
      const countSpan = this.querySelector("span");
      const postId = this.getAttribute("data-post-id");

      if (!commentId || !postId) {
        console.error("Comment ID or Post ID not found on like button");
        this.disabled = false;
        return;
      }

      try {
        const response = await axios.post(`/api/comments/posts/${postId}/comment/${commentId}/like`);

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

          // Update the count
          countSpan.textContent = count;
        }
      } catch (error) {
        console.error("Error toggling comment like:", error);
        showAlert("error", "Couldn't update like status. Please try again.", 3000);
      } finally {
        this.disabled = false;
      }
    });
  });
};

document.addEventListener("DOMContentLoaded", () => initializeLikes());

export { initializeLikes };
