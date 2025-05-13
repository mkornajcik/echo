import { showAlert } from "./alerts.js";
import { formatTime } from "./formatTime.js";
import { initializeLikes } from "./likes.js";

document.addEventListener("DOMContentLoaded", () => {
  // Mobile navigation
  const composeBtn = document.querySelector(".compose-btn");
  const composeModal = document.getElementById("compose-modal");
  const closeModal = document.querySelector(".close-modal");

  // Add mobile compose button if on small screen
  if (window.innerWidth <= 576) {
    const composeBtnMobile = document.createElement("button");
    composeBtnMobile.className = "compose-btn-mobile";
    composeBtnMobile.innerHTML = '<i class="fas fa-feather-alt"></i>';
    document.body.appendChild(composeBtnMobile);

    composeBtnMobile.addEventListener("click", () => {
      composeModal.classList.add("active");
      document.body.style.overflow = "hidden";
    });
  }

  // Compose modal functionality
  if (composeBtn) {
    composeBtn.addEventListener("click", () => {
      composeModal.classList.add("active");
      document.body.style.overflow = "hidden";
      composeModal.querySelector("textarea").focus();
    });
  }

  if (closeModal) {
    closeModal.addEventListener("click", () => {
      composeModal.classList.remove("active");
      document.body.style.overflow = "";
    });

    // Close modal when clicking outside
    composeModal.addEventListener("click", (e) => {
      if (e.target === composeModal) {
        composeModal.classList.remove("active");
        document.body.style.overflow = "";
      }
    });
  }

  // Character count for compose
  const textareas = document.querySelectorAll(".compose-input-container textarea");
  const characterCounts = document.querySelectorAll(".character-count");
  const postBtns = document.querySelectorAll(".post-btn");

  // Track if we've shown the warning alert to avoid spamming
  let warningAlertShown = false;
  let errorAlertShown = false;

  textareas.forEach((textarea, index) => {
    textarea.addEventListener("input", function () {
      const maxLength = Number.parseInt(this.getAttribute("maxlength") || "280");
      const currentLength = this.value.length;
      const remaining = maxLength - currentLength;

      if (characterCounts[index]) {
        characterCounts[index].textContent = remaining;

        // Change color based on remaining characters
        if (remaining <= 0) {
          characterCounts[index].style.color = "#ef4444"; // Red

          // Show error alert if not already shown
          if (!errorAlertShown) {
            showAlert("error", "You've exceeded the character limit. Please shorten your post.", 3000);
            errorAlertShown = true;
            warningAlertShown = false; // Reset warning flag
          }
        } else if (remaining <= 20) {
          characterCounts[index].style.color = "#f59e0b"; // Amber/Orange

          // Show warning alert when approaching limit (only once)
          if (remaining <= 10 && !warningAlertShown) {
            showAlert("warning", `You're approaching the character limit. ${remaining} characters remaining.`, 3000);
            warningAlertShown = true;
          }
        } else {
          characterCounts[index].style.color = "";
          errorAlertShown = false;
          warningAlertShown = false;
        }
      }

      if (postBtns[index]) {
        if (currentLength > 0 && currentLength <= maxLength) {
          postBtns[index].removeAttribute("disabled");
        } else {
          postBtns[index].setAttribute("disabled", "disabled");
        }
      }
    });
  });

  // Handle form submission for compose post
  const composeForm = document.querySelector(".compose-post");
  if (composeForm) {
    composeForm.addEventListener("submit", function (e) {
      const textarea = this.querySelector("textarea");
      const maxLength = Number.parseInt(textarea.getAttribute("maxlength") || "280");

      if (textarea.value.length > maxLength) {
        e.preventDefault();
        showAlert("error", "Your post exceeds the character limit. Please shorten it before posting.", 4000);
      } else if (textarea.value.trim().length === 0) {
        e.preventDefault();
        showAlert("error", "Your post cannot be empty.", 3000);
      } else {
        // Optional: Show a posting message
        showAlert("info", "Posting...", 1000);
      }
    });
  }

  // Post actions
  // const repostButtons = document.querySelectorAll(".post-action.repost");

  // Follow buttons
  const followButtons = document.querySelectorAll(".follow-btn");

  followButtons.forEach((button) => {
    button.addEventListener("click", function () {
      if (this.textContent === "Follow") {
        this.textContent = "Following";
        this.classList.remove("btn-secondary");
        this.classList.add("btn-primary");

        // Show follow confirmation
        const username = this.closest(".follow-item").querySelector(".follow-username").textContent;
        showAlert("success", `You are now following ${username}`, 2000);
      } else {
        this.textContent = "Follow";
        this.classList.remove("btn-primary");
        this.classList.add("btn-secondary");
      }
    });
  });

  // Feed tabs
  const feedTabs = document.querySelectorAll(".feed-tab");

  feedTabs.forEach((tab) => {
    tab.addEventListener("click", function () {
      feedTabs.forEach((t) => t.classList.remove("active"));
      this.classList.add("active");

      // Show tab change notification
      showAlert("info", `Switched to ${this.textContent} feed`, 1500);
    });
  });

  // Sticky header shadow
  const contentHeader = document.querySelector(".content-header");

  if (contentHeader) {
    window.addEventListener("scroll", () => {
      if (window.scrollY > 10) {
        contentHeader.style.boxShadow = "0 2px 5px rgba(0, 0, 0, 0.1)";
      } else {
        contentHeader.style.boxShadow = "none";
      }
    });
  }

  // Poll interaction
  const pollOptions = document.querySelectorAll(".poll-option");

  pollOptions.forEach((option) => {
    option.addEventListener("click", function () {
      // Check if user has already voted
      const pollContainer = this.closest(".poll-options");
      if (pollContainer.classList.contains("voted")) return;

      // Mark as voted
      pollContainer.classList.add("voted");

      // Highlight selected option
      this.style.fontWeight = "bold";
      const progressBar = this.querySelector(".poll-option-progress");
      progressBar.style.backgroundColor = "rgba(169, 29, 58, 0.5)";

      // Show vote confirmation
      const optionText = this.querySelector(".poll-option-text").textContent;
      showAlert("success", `You voted for "${optionText}"`, 2000);
    });
  });

  // Make posts clickable but prevent clicks on interactive elements from navigating
  const posts = document.querySelectorAll(".post");

  posts.forEach((post) => {
    const postLinkElement = post.querySelector(".post-link");
    if (!postLinkElement) return;

    // Prevent clicks on interactive elements from triggering the post link
    const interactiveElements = post.querySelectorAll(".post-menu, .post-actions button, .post a:not(.post-link)");

    interactiveElements.forEach((element) => {
      element.addEventListener("click", (e) => {
        e.stopPropagation(); // Prevent event from bubbling up
      });
    });

    // Allow middle-click and ctrl/cmd+click to open in new tab
    post.addEventListener("click", (e) => {
      // Don't navigate if user is selecting text
      if (window.getSelection().toString()) {
        return;
      }

      // Don't navigate if clicking on interactive elements
      if (e.target.closest(".post-menu, .post-actions button, .post a:not(.post-link)")) {
        return;
      }

      // Navigate to post detail page
      window.location.href = postLinkElement.getAttribute("href");
    });
  });

  // Infinite Scrolling Logic
  const postsContainer = document.getElementById("posts-container");
  const loadingIndicator = document.getElementById("loading-indicator");

  if (postsContainer && loadingIndicator) {
    let currentCursor = postsContainer.dataset.lastPostId || null;
    let isLoading = false;
    let noMorePosts = !currentCursor || currentCursor === "";

    const loadMorePosts = async () => {
      if (isLoading || noMorePosts) return;

      isLoading = true;
      loadingIndicator.style.display = "block";

      try {
        const response = await axios.get(`/feed/more?cursor=${currentCursor}`);
        const data = response.data;

        if (data.status === "success" && data.data.posts.length > 0) {
          data.data.posts.forEach((post) => {
            const postElement = createPostElement(post);
            if (loadingIndicator && loadingIndicator.parentNode === postsContainer) {
              postsContainer.insertBefore(postElement, loadingIndicator);
            } else {
              postsContainer.appendChild(postElement);
            }
            initializeLikes(postElement);
          });

          currentCursor = data.data.nextCursor;
          postsContainer.dataset.lastPostId = currentCursor;

          if (!currentCursor) {
            noMorePosts = true;
            if (loadingIndicator) loadingIndicator.innerHTML = "<p>No more posts</p>";
          }
        } else {
          noMorePosts = true;
          loadingIndicator.innerHTML = "<p>No more posts</p>";
        }
      } catch (error) {
        console.error("Failed to load more posts:", error);
        loadingIndicator.innerHTML = "<p>Error loading posts</p>";
        showAlert("error", "Could not load more posts. Please try again later.", 3000);
      } finally {
        isLoading = false;
        if (!noMorePosts) loadingIndicator.style.display = "none";
      }
    };

    function createPostElement(post) {
      const article = document.createElement("article");
      article.className = "post";
      article.dataset.postId = post.id;

      const formattedTime = formatTime(post.createdAt);
      const isLiked = post.likes && post.likes.length > 0;

      article.innerHTML = `
       <a href="/feed/post/${post.id}" class="post-link"></a>
       <div class="post-avatar">
           <img src="/images/default.png" alt="User Avatar">
       </div>
       <div class="post-content">
           <div class="post-header">
               <div class="post-user-info">
                   <h3><a href="/profile/${post.user.id}">${post.user.username}</a></h3>
                   <span class="username">@${post.user.usertag}</span>
                   <span class="post-time">· ${formattedTime}</span>
               </div>
               <button class="post-menu">
                   <i class="fas fa-ellipsis-h"></i>
               </button>
           </div>
           <div class="post-text">
               <p>${post.text}</p>
           </div>
           ${post.image ? `<div class="post-image"><img src="${post.image}" alt="Post image"></div>` : ""}
           <div class="post-actions">
               <button class="post-action comment" data-id="${post.id}">
                   <i class="far fa-comment"></i>
                   <span>${post._count?.comments || 0}</span>
               </button>
               <button class="post-action repost" data-id="${post.id}">
                   <i class="fas fa-retweet"></i>
                   <span>${post._count?.reposts || 0}</span>
               </button>
               <button class="post-action like" data-id="${post.id}">
                   <i class="${isLiked ? "fas" : "far"} fa-heart"></i>
                   <span>${post._count?.likes || 0}</span>
               </button>
               <button class="post-action share">
                   <i class="far fa-share-square"></i>
               </button>
           </div>
       </div>
     `;

      // Comment button handler
      const commentButton = article.querySelector(".post-action.comment");
      if (commentButton) {
        commentButton.addEventListener("click", function (e) {
          e.stopPropagation();
          const postId = this.dataset.id;
          window.location.href = `/feed/post/${postId}`;
        });
      }

      // Interactive elements handling
      const interactiveElements = article.querySelectorAll(".post-menu, .post-actions button, .post a:not(.post-link)");
      interactiveElements.forEach((element) => {
        element.addEventListener("click", (e) => e.stopPropagation());
      });

      // Post click handler
      article.addEventListener("click", (e) => {
        if (window.getSelection().toString()) return;
        if (e.target.closest(".post-menu, .post-actions button, .post a:not(.post-link)")) return;
        const postLink = article.querySelector(".post-link").getAttribute("href");
        window.location.href = postLink;
      });

      return article;
    }

    // Initialize new posts functionality
    function initializeNewPosts() {
      // Follow buttons
      document.querySelectorAll(".follow-btn").forEach((button) => {
        button.addEventListener("click", function () {
          if (this.textContent === "Follow") {
            this.textContent = "Following";
            this.classList.replace("btn-secondary", "btn-primary");
            const username = this.closest(".follow-item").querySelector(".follow-username").textContent;
            showAlert("success", `Following ${username}`, 2000);
          } else {
            this.textContent = "Follow";
            this.classList.replace("btn-primary", "btn-secondary");
          }
        });
      });

      // Post menus
      document.querySelectorAll(".post-menu").forEach((menu) => {
        menu.addEventListener("click", function (e) {
          e.stopPropagation();
          // Add menu functionality here
        });
      });
    }

    // Scroll handler
    let scrollTimeout;
    window.addEventListener("scroll", () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        const nearBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 500;
        if (nearBottom) {
          showAlert("info", "Loading more posts...", 1000);
          loadMorePosts();
        }
      }, 200);
    });
  }
});
