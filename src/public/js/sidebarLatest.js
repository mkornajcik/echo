document.addEventListener("DOMContentLoaded", () => {
  // Format timestamps to relative time
  formatTimestamps();

  // Set up post actions
  setupPostActions();

  // Make entire post clickable
  setupPostClicks();
});

function formatTimestamps() {
  const timestamps = document.querySelectorAll(".post-timestamp");

  timestamps.forEach((timestamp) => {
    const dateStr = timestamp.getAttribute("data-timestamp");
    if (!dateStr) return;

    const date = new Date(dateStr);
    timestamp.textContent = getRelativeTimeString(date);
  });
}

function getRelativeTimeString(date) {
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) {
    return "Just now";
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
  } else if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} ${days === 1 ? "day" : "days"} ago`;
  } else {
    // Format date for older posts
    const options = { year: "numeric", month: "short", day: "numeric" };
    return date.toLocaleDateString(undefined, options);
  }
}

// Show loading skeleton
function showLoadingSkeleton(container) {
  let skeletonHTML = "";

  for (let i = 0; i < 3; i++) {
    skeletonHTML += `
        <div class="latest-user-skeleton">
          <div class="skeleton-header">
            <div class="skeleton-avatar"></div>
            <div class="skeleton-name"></div>
          </div>
          <div class="skeleton-text"></div>
          <div class="skeleton-text"></div>
          <div class="skeleton-text"></div>
        </div>
      `;
  }

  container.innerHTML = skeletonHTML;
}

// Update latest posts container with new data
function updateLatestPosts(container, posts) {
  if (!posts || posts.length === 0) {
    container.innerHTML = `
        <div class="empty-latest">
          <p>No recent posts from users you follow</p>
          <a href="/search" class="btn btn-secondary">Find users to follow</a>
        </div>
      `;
    return;
  }

  let postsHTML = "";

  posts.forEach((post) => {
    const needsReadMore = post.postText.length > 100;

    postsHTML += `
        <div class="latest-user" data-post-id="${post.postId}">
          <div class="post-user-info">
            <h4><a href="/profile/${post.id}">${post.username}</a></h4>
            <span class="username">@${post.usertag}</span>
          </div>
          <div class="post-content">
            ${post.postText}
          </div>
          ${needsReadMore ? `<a href="/posts/${post.postId}" class="read-more">Read more</a>` : ""}
          <span class="post-timestamp" data-timestamp="${post.createdAt}">
            ${getRelativeTimeString(new Date(post.createdAt))}
          </span>
          <div class="post-actions">
            <button class="post-action-btn like-btn" data-post-id="${post.postId}">
              <i class="far fa-heart"></i> <span>Like</span>
            </button>
            <button class="post-action-btn comment-btn" data-post-id="${post.postId}">
              <i class="far fa-comment"></i> <span>Reply</span>
            </button>
            <a href="//${post.postId}" class="post-action-btn">
              <i class="fas fa-external-link-alt"></i> <span>View</span>
            </a>
          </div>
        </div>
      `;
  });

  container.innerHTML = postsHTML;

  // Re-initialize event listeners for new content
  setupPostActions();
  setupPostClicks();
}

// Set up post action buttons
function setupPostActions() {
  // Comment button functionality
  const commentButtons = document.querySelectorAll(".latest-posts .comment-btn");
  commentButtons.forEach((button) => {
    button.addEventListener("click", function (e) {
      e.stopPropagation();
      const postId = this.getAttribute("data-post-id");

      // Redirect to post page with comment focus
      window.location.href = `/posts/${postId}#commentText`;
    });
  });
}

// Make entire post clickable
function setupPostClicks() {
  const postItems = document.querySelectorAll(".latest-posts .latest-user");

  postItems.forEach((item) => {
    item.addEventListener("click", function (e) {
      // Don't trigger if clicking on a link or button
      if (
        e.target.tagName === "A" ||
        e.target.tagName === "BUTTON" ||
        e.target.closest("a") ||
        e.target.closest("button")
      ) {
        return;
      }

      const postId = this.getAttribute("data-post-id");
      if (postId) {
        window.location.href = `/posts/${postId}`;
      }
    });
  });
}
