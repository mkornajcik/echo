import { showAlert } from "./alerts.js";
import { formatTime } from "./formatTime.js";
import { initializeLikes } from "./likes.js";

document.addEventListener("DOMContentLoaded", () => {
  //  Elements
  const postsContainer = document.getElementById("posts-container");
  const feedTabs = document.querySelectorAll(".feed-tab");
  const composeModal = document.getElementById("compose-modal");
  const closeModal = document.querySelector(".close-modal");
  const composeBtn = document.querySelector(".compose-btn");
  const profileFeed = document.querySelector(".feed");
  const mediaButton = document.getElementById("media-button");
  const imageUpload = document.getElementById("image-upload");
  const imagePreview = document.getElementById("image-preview");
  const composeForm = document.getElementById("compose-form");
  const showMoreBtn = document.getElementById("show-more-btn");

  //  Image upload
  if (mediaButton && imageUpload) {
    mediaButton.addEventListener("click", () => {
      const ripple = document.createElement("span");
      ripple.classList.add("ripple-effect");
      mediaButton.appendChild(ripple);

      setTimeout(() => {
        ripple.remove();
      }, 500);

      imageUpload.click();
    });
  }

  if (imageUpload) {
    imageUpload.addEventListener("change", handleImageSelect);
  }

  if (composeForm) {
    composeForm.addEventListener("submit", handlePostSubmit);
  }

  function handleImageSelect(e) {
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

    // Show loading state
    imagePreview.innerHTML = `
      <div class="image-preview-item loading">
        <div class="lazy-placeholder"></div>
      </div>
    `;

    // Preview image
    const reader = new FileReader();
    reader.onload = (event) => {
      // Create new image to get dimensions
      const img = new Image();
      img.onload = function () {
        const aspectRatio = this.width / this.height;

        imagePreview.innerHTML = `
          <div class="image-preview-item" tabindex="0">
            <img src="${event.target.result}" alt="Image preview" 
                class="lazy-image loaded"
                data-width="${this.width}" 
                data-height="${this.height}"
                data-aspect="${aspectRatio.toFixed(2)}">
            <button type="button" class="remove-image" aria-label="Remove image">
              <i class="fas fa-times"></i>
            </button>
            <div class="image-upload-feedback">
            </div>
          </div>
        `;

        imagePreview.querySelector(".remove-image").addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();

          const previewItem = imagePreview.querySelector(".image-preview-item");
          previewItem.style.opacity = "0";

          setTimeout(() => {
            imagePreview.innerHTML = "";
            imageUpload.value = "";
          }, 300);

          showAlert("info", "Image removed", 1500);
        });
      };

      img.src = event.target.result;
    };

    reader.onerror = () => {
      showAlert("error", "Failed to load image", 3000);
      imagePreview.innerHTML = "";
    };

    reader.readAsDataURL(file);
  }

  async function handlePostSubmit(e) {
    e.preventDefault();
    const text = document.getElementById("text").value.trim();
    const imageFile = imageUpload.files[0];

    if (!text && !imageFile) {
      showAlert("error", "Post must contain text or an image", 3000);
      return;
    }

    const formData = new FormData();
    if (text) formData.append("text", text);
    if (imageFile) formData.append("image", imageFile);

    // Disable form during submission
    const submitButton = composeForm.querySelector("button[type='submit']");
    const originalButtonText = submitButton.innerHTML;
    submitButton.disabled = true;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Posting...';

    try {
      showAlert("info", "Posting...", 1500);
      const response = await axios.post("/files/post", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.status === "success") {
        composeForm.reset();

        if (imagePreview.innerHTML) {
          const previewItem = imagePreview.querySelector(".image-preview-item");
          if (previewItem) {
            previewItem.style.opacity = "0";
            setTimeout(() => {
              imagePreview.innerHTML = "";
            }, 300);
          } else {
            imagePreview.innerHTML = "";
          }
        }

        imageUpload.value = "";
        showAlert("success", "Posted successfully!", 2000);

        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    } catch (error) {
      if (error.status === 429) {
        showAlert("error", "Too many requests. Try again later.", 5000);
      } else {
        showAlert("error", error.response?.data?.message || "Failed to create post", 3000);
      }
    } finally {
      // Re-enable form
      submitButton.disabled = false;
      submitButton.innerHTML = originalButtonText;
    }
  }

  //  Implement Lazy Loading for Images
  function setupLazyLoading() {
    if ("IntersectionObserver" in window) {
      const imageObserver = new IntersectionObserver(
        (entries, observer) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const img = entry.target;
              const src = img.getAttribute("data-src");

              if (src) {
                img.src = src;
                img.classList.add("loaded");
                img.removeAttribute("data-src");
                observer.unobserve(img);
              }
            }
          });
        },
        {
          rootMargin: "50px 0px",
          threshold: 0.1,
        }
      );

      // Target images with data-src
      document.querySelectorAll("img[data-src]").forEach((img) => {
        imageObserver.observe(img);
      });
    } else {
      // in case observer doesnt work (example old browsers)
      document.querySelectorAll("img[data-src]").forEach((img) => {
        img.src = img.getAttribute("data-src");
        img.classList.add("loaded");
        img.removeAttribute("data-src");
      });
    }
  }

  setupLazyLoading();

  const originalCreatePostElement = window.createPostElement || (() => {});

  window.createPostElement = (post) => {
    const postElement = originalCreatePostElement(post);

    if (!postElement) {
      const article = document.createElement("article");
      article.className = "post";
      article.dataset.postId = post.id;

      const formattedTime = typeof formatTime === "function" ? formatTime(post.createdAt) : post.createdAt;

      const isLiked = post.likes && Array.isArray(post.likes) && post.likes.length > 0;
      const commentCount = post._count?.comments ?? 0;
      const repostCount = post._count?.reposts ?? 0;
      const likeCount = post._count?.likes ?? 0;
      const userAvatar = post.user?.image || "/images/default.png";
      const postText = post.text || "";

      // Basic sanitization
      const sanitizedText = postText.replace(/</g, "&lt;").replace(/>/g, "&gt;");

      const imageHtml = post.image
        ? `<div class="post-image-container">
             <div class="post-image">
               <img src="/images/placeholder.svg" data-src="${post.image}" alt="Post image" class="lazy-image">
               <div class="lazy-placeholder"></div>
             </div>
           </div>`
        : "";

      article.innerHTML = `
        <a href="/posts/${post.id}" class="post-link" aria-hidden="true" tabindex="-1"></a>
        <div class="post-avatar">
          <a href="/profile/${post.user?.id}" tabindex="-1"><img src="${userAvatar}" alt="${
        post.user?.username
      }'s Avatar"></a>
        </div>
        <div class="post-content">
          <div class="post-header">
            <div class="post-user-info">
              <h3><a href="/profile/${post.user?.id}">${post.user?.username || "Unknown User"}</a></h3>
              <span class="username">@${post.user?.usertag || "unknown"}</span>
              <span class="post-time">· ${formattedTime}</span>
            </div>
          </div>
          <div class="post-text">
            <p>${sanitizedText}</p>
          </div>
          ${imageHtml}
          <div class="post-actions">
            <button class="post-action comment" data-id="${post.id}" aria-label="Comment on post" id="comment-btn">
              <i class="far fa-comment" aria-hidden="true"></i>
              <span>${commentCount}</span>
            </button>
            <button class="post-action repost" data-id="${post.id}" aria-label="Repost">
              <i class="fas fa-retweet" aria-hidden="true"></i>
              <span>${repostCount}</span>
            </button>
            <button class="post-action like" data-id="${post.id}" aria-label="${isLiked ? "Unlike post" : "Like post"}">
              <i class="${isLiked ? "fas text-red-500" : "far"} fa-heart" aria-hidden="true"></i>
              <span class="${isLiked ? "text-red-500" : ""}">${likeCount}</span>
            </button>
            <button class="post-action share" aria-label="Share post" data-id="${post.id}" id="share-btn">
              <i class="far fa-share-square" aria-hidden="true"></i>
            </button>
          </div>
        </div>
      `;

      // Attach event listeners
      const commentButton = article.querySelector(".post-action.comment");
      commentButton?.addEventListener("click", function (e) {
        e.stopPropagation();
        window.location.href = `/posts/${this.dataset.id}#commentText`;
      });

      if (typeof initializeLikes === "function") {
        initializeLikes(article);
      }

      const interactiveSelector =
        ".post-menu, .post-actions button, .post a:not(.post-link), .post-user-info a, .post-avatar a";
      article.querySelectorAll(interactiveSelector).forEach((el) => {
        el.addEventListener("click", (e) => e.stopPropagation());
      });

      article.addEventListener("click", (e) => {
        if (window.getSelection()?.toString()) return;
        if (e.target.closest(interactiveSelector)) return;

        const postLink = article.querySelector(".post-link")?.getAttribute("href");
        if (postLink) window.location.href = postLink;
      });

      return article;
    }

    setTimeout(() => {
      setupLazyLoading();
    }, 100);

    return postElement;
  };

  if (typeof initializeLikes === "function" && profileFeed) {
    initializeLikes(profileFeed);
  }

  //  Mobile Navigation
  if (window.innerWidth <= 576) {
    const composeBtnMobile = document.createElement("button");
    composeBtnMobile.className = "compose-btn-mobile";
    composeBtnMobile.innerHTML = '<i class="fas fa-feather-alt"></i>';
    document.body.appendChild(composeBtnMobile);
    composeBtnMobile.addEventListener("click", () => {
      if (composeModal) {
        composeModal.classList.add("active");
        document.body.style.overflow = "hidden";
      }
    });
  }

  //  Compose Modal Functionality
  if (composeBtn && composeModal) {
    composeBtn.addEventListener("click", () => {
      composeModal.classList.add("active");
      document.body.style.overflow = "hidden";
      composeModal.querySelector("textarea")?.focus();
    });
  }
  if (closeModal && composeModal) {
    closeModal.addEventListener("click", () => {
      composeModal.classList.remove("active");
      document.body.style.overflow = "";
    });
    composeModal.addEventListener("click", (e) => {
      if (e.target === composeModal) {
        composeModal.classList.remove("active");
        document.body.style.overflow = "";
      }
    });
  }

  //  Character Count
  const textareas = document.querySelectorAll(".compose-input-container textarea");
  const characterCounts = document.querySelectorAll(".character-count");
  const postBtns = document.querySelectorAll(".post-btn");
  let warningAlertShown = false;
  let errorAlertShown = false;

  textareas.forEach((textarea, index) => {
    textarea.addEventListener("input", function () {
      const maxLength = Number.parseInt(this.getAttribute("maxlength") || "280", 10);
      const currentLength = this.value.length;
      const remaining = maxLength - currentLength;

      if (characterCounts[index]) {
        characterCounts[index].textContent = String(remaining); // Ensure string
        if (remaining <= 0) {
          characterCounts[index].style.color = "#ef4444";
          if (!errorAlertShown) {
            showAlert("error", "You've exceeded the character limit.", 3000);
            errorAlertShown = true;
            warningAlertShown = false;
          }
        } else if (remaining <= 20) {
          characterCounts[index].style.color = "#f59e0b";
          if (remaining <= 10 && !warningAlertShown) {
            showAlert("warning", `${remaining} characters remaining.`, 3000);
            warningAlertShown = true;
          }
        } else {
          characterCounts[index].style.color = "";
          errorAlertShown = false;
          warningAlertShown = false;
        }
      }
      if (postBtns[index]) {
        postBtns[index].disabled = !(currentLength > 0 && currentLength <= maxLength);
      }
    });
    textarea.dispatchEvent(new Event("input"));
  });

  //  Compose Form Submission
  if (composeForm) {
    composeForm.addEventListener("submit", function (e) {
      const textarea = this.querySelector("textarea");
      if (!textarea) return;
      const maxLength = Number.parseInt(textarea.getAttribute("maxlength") || "280", 10);
      if (textarea.value.length > maxLength) {
        e.preventDefault();
        showAlert("error", "Post exceeds character limit.", 4000);
      } else if (textarea.value.trim().length === 0 && !imageUpload.files[0]) {
        e.preventDefault();
        showAlert("error", "Post cannot be empty.", 3000);
      } else {
        showAlert("info", "Posting...", 1500);
        // Allow submission
      }
    });
  }

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

  //  Sticky Header Shadow
  const contentHeader = document.querySelector(".content-header");
  if (contentHeader) {
    window.addEventListener("scroll", () => {
      contentHeader.style.boxShadow = window.scrollY > 10 ? "0 2px 5px rgba(0, 0, 0, 0.1)" : "none";
    });
  }

  const posts = document.querySelectorAll(".post");

  posts.forEach((post) => {
    const postLinkElement = post.querySelector(".post-link");
    if (!postLinkElement) return;

    const interactiveElements = post.querySelectorAll(".post-menu, .post-actions button, .post a:not(.post-link)");

    interactiveElements.forEach((element) => {
      element.addEventListener("click", (e) => {
        e.stopPropagation();
      });
    });

    post.addEventListener("click", (e) => {
      if (window.getSelection().toString()) {
        return;
      }

      if (e.target.closest(".post-menu, .post-actions button, .post a:not(.post-link)")) {
        return;
      }

      window.location.href = postLinkElement.getAttribute("href");
    });
  });

  if (postsContainer && feedTabs.length > 0) {
    let isLoading = false;
    let noMorePosts =
      !postsContainer.dataset.lastPostId ||
      postsContainer.dataset.lastPostId === "null" ||
      postsContainer.dataset.lastPostId === "";

    //  Load More Posts Function
    const loadMorePosts = async () => {
      const currentLoadingIndicator = document.getElementById("loading-indicator");

      if (!currentLoadingIndicator || !postsContainer.contains(currentLoadingIndicator)) {
        console.error(
          "loadMorePosts: Loading indicator '#loading-indicator' not found or not inside '#posts-container'. Aborting load."
        );
        noMorePosts = true;
        if (isLoading) isLoading = false;
        return;
      }

      const currentCursor = postsContainer.dataset.lastPostId;
      const currentFilter = postsContainer.dataset.feedFilter || "all";
      noMorePosts = !currentCursor || currentCursor === "null" || currentCursor === "";

      if (isLoading || noMorePosts) {
        if (
          noMorePosts &&
          !currentLoadingIndicator.innerHTML.includes("No more posts") &&
          !currentLoadingIndicator.innerHTML.includes("Error")
        ) {
          currentLoadingIndicator.innerHTML = "<p>No more posts</p>";
          currentLoadingIndicator.style.display = "block";
        }
        return;
      }

      isLoading = true;
      currentLoadingIndicator.innerHTML = "<p>Loading more posts...</p>";
      currentLoadingIndicator.style.display = "block";

      try {
        showAlert("info", `Loading...`, 1500);
        const apiUrl = `/feed/more?cursor=${currentCursor}&filter=${currentFilter}`;
        const response = await axios.get(apiUrl);
        const data = response.data;

        if (data.status === "success" && data.data.posts && data.data.posts.length > 0) {
          data.data.posts.forEach((post) => {
            const postElement = createPostElement(post);
            postsContainer.insertBefore(postElement, currentLoadingIndicator);
          });

          const nextCursor = data.data.nextCursor;
          postsContainer.dataset.lastPostId = nextCursor || "";
          noMorePosts = !nextCursor;

          if (noMorePosts) {
            currentLoadingIndicator.innerHTML = "<p>No more posts</p>";
            currentLoadingIndicator.style.display = "block";
          } else {
            currentLoadingIndicator.style.display = "none";
          }

          setupLazyLoading();
        } else {
          noMorePosts = true;
          postsContainer.dataset.lastPostId = "";
          currentLoadingIndicator.innerHTML = "<p>No more posts</p>";
          currentLoadingIndicator.style.display = "block";
        }
      } catch (error) {
        console.error("Failed to load more posts:", error.response?.data || error.message || error);
        currentLoadingIndicator.innerHTML = "<p>Error loading posts. Try scrolling again.</p>";
        currentLoadingIndicator.style.display = "block";
        showAlert("error", "Could not load more posts. Please try scrolling again.", 3000);
      } finally {
        isLoading = false;
        if (noMorePosts && currentLoadingIndicator) {
          currentLoadingIndicator.style.display = "block";
        } else if (currentLoadingIndicator) {
          currentLoadingIndicator.style.display = "none";
        }
      }
    };

    //  Feed Tab Switching Logic
    feedTabs.forEach((tab) => {
      tab.addEventListener("click", async function () {
        if (this.classList.contains("active") || isLoading) {
          return;
        }

        const isFollowingTab = this.textContent.trim() === "Following";
        const url = isFollowingTab ? "/feed/following" : "/feed";
        const newFilterValue = isFollowingTab ? "following" : "all";

        isLoading = true;
        showAlert("info", `Loading ${this.textContent} feed...`, 1500);
        document.getElementById("loading-indicator")?.remove();

        try {
          const response = await fetch(url);
          if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
          const html = await response.text();

          const parser = new DOMParser();
          const newDoc = parser.parseFromString(html, "text/html");

          const newPostsContainer = newDoc.getElementById("posts-container");
          if (!newPostsContainer) throw new Error("Could not parse #posts-container from response.");

          const newLastPostId = newPostsContainer.dataset.lastPostId || "";

          //  Update DOM
          postsContainer.innerHTML = newPostsContainer.innerHTML;
          postsContainer.dataset.lastPostId = newLastPostId;
          postsContainer.dataset.feedFilter = newFilterValue;

          window.scrollTo({ top: 0, behavior: "smooth" });

          // Update active tab style
          feedTabs.forEach((t) => t.classList.remove("active"));
          this.classList.add("active");

          //  Reset infinite scroll state
          noMorePosts = !newLastPostId || newLastPostId === "null" || newLastPostId === "";

          // Initialize likes and lazy loading for new content
          if (typeof initializeLikes === "function") {
            initializeLikes(postsContainer);
          }
          setupLazyLoading();
        } catch (error) {
          console.error("Feed switch error:", error);
          showAlert("error", "Failed to switch feeds. Please try again.", 3000);

          if (!document.getElementById("loading-indicator")) {
            const errorIndicator = document.createElement("div");
            errorIndicator.id = "loading-indicator";
            errorIndicator.style.textAlign = "center";
            errorIndicator.style.padding = "20px";
            errorIndicator.innerHTML = "<p>Failed to load feed content.</p>";
            postsContainer.appendChild(errorIndicator);
          }
        } finally {
          isLoading = false;
        }
      });
    });

    //  Scroll Event Listener
    let scrollTimeout;
    window.addEventListener(
      "scroll",
      () => {
        if (scrollTimeout) clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
          const nearBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 600;
          if (nearBottom && !isLoading && !noMorePosts) {
            loadMorePosts();
          } else if (nearBottom && noMorePosts) {
            const finalLoadingIndicator = document.getElementById("loading-indicator");
            if (finalLoadingIndicator && finalLoadingIndicator.style.display === "none") {
              finalLoadingIndicator.style.display = "block";
            }
          }
        }, 150);
      },
      { passive: true }
    );

    if (typeof initializeLikes === "function") {
      initializeLikes(postsContainer);
    }
  } else {
    console.warn("Feed essentials (#posts-container or .feed-tab) not found. Infinite scroll and tabs disabled.");
  }

  if (showMoreBtn) {
    let isLoadingMore = false;
    let noMorePosts = false;

    showMoreBtn.addEventListener("click", async function () {
      if (isLoadingMore || noMorePosts) return;

      const postsContainer = document.querySelector(".feed");
      const userId = this.dataset.userId;
      const lastPostId = postsContainer?.dataset.lastPostId;

      if (!postsContainer || !userId || !lastPostId) return;

      if (window.location.href.includes("comments")) {
        try {
          isLoadingMore = true;
          showMoreBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';

          const response = await axios.get(`/profile/${userId}/comments/more?cursor=${lastPostId}`);
          const { comments, nextCursor } = response.data.data;

          if (comments?.length) {
            // append new comments
            comments.forEach((comment) => {
              const postElement = createCommentElement(comment);
              postsContainer.appendChild(postElement);
            });

            // update the cursor
            if (nextCursor) {
              postsContainer.dataset.lastPostId = nextCursor;
            }

            // put the button back at the very bottom
            postsContainer.appendChild(showMoreBtn);

            // if there is no further cursor, hide it
            if (!nextCursor) {
              noMorePosts = true;
              showMoreBtn.style.display = "none";
            }

            // re-init any lazy loading / like buttons
            setupLazyLoading();
            if (typeof initializeLikes === "function") {
              initializeLikes(postsContainer);
            }
          } else {
            // no posts returned at all
            noMorePosts = true;
            showMoreBtn.style.display = "none";
          }
        } catch (error) {
          console.error("Failed to load more comments:", error);
          showAlert("error", "Failed to load more comments. Please try again.", 3000);
        } finally {
          isLoadingMore = false;
          showMoreBtn.innerHTML = "Show more";
          showMoreBtn.disabled = false;
        }
      } else if (window.location.href.includes("reposts")) {
        try {
          isLoadingMore = true;
          showMoreBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';

          const response = await axios.get(`/profile/${userId}/reposts/more?cursor=${lastPostId}`);
          const { reposts, nextCursor } = response.data.data;

          if (reposts?.length) {
            // append new reposts
            reposts.forEach((repost) => {
              const postElement = createRepostElement(repost);
              postsContainer.appendChild(postElement);
            });

            // update the cursor
            if (nextCursor) {
              postsContainer.dataset.lastPostId = nextCursor;
            }

            // put the button back at the very bottom
            postsContainer.appendChild(showMoreBtn);

            // if there is no further cursor, hide it
            if (!nextCursor) {
              noMorePosts = true;
              showMoreBtn.style.display = "none";
            }

            // re-init any lazy loading / like buttons
            setupLazyLoading();
            if (typeof initializeLikes === "function") {
              initializeLikes(postsContainer);
            }
          } else {
            // no posts returned at all
            noMorePosts = true;
            showMoreBtn.style.display = "none";
          }
        } catch (error) {
          console.error("Failed to load more comments:", error);
          showAlert("error", "Failed to load more comments. Please try again.", 3000);
        } finally {
          isLoadingMore = false;
          showMoreBtn.innerHTML = "Show more";
          showMoreBtn.disabled = false;
        }
      } else if (window.location.href.includes("likes")) {
        try {
          isLoadingMore = true;
          showMoreBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';

          const response = await axios.get(`/profile/${userId}/likes/more?cursor=${lastPostId}`);
          const { likes, nextCursor } = response.data.data;

          if (likes?.length) {
            // append new likes
            likes.forEach((like) => {
              let element;
              if (like.type === "post") {
                element = createLikedPostElement(like);
              } else if (like.type === "comment") {
                element = createLikedCommentElement(like);
              }
              if (element) {
                postsContainer.appendChild(element);
              }
            });

            // update the cursor
            if (nextCursor) {
              postsContainer.dataset.lastPostId = nextCursor;
            }

            // put the button back at the very bottom
            postsContainer.appendChild(showMoreBtn);

            // if there is no further cursor, hide it
            if (!nextCursor) {
              noMorePosts = true;
              showMoreBtn.style.display = "none";
            }

            // re-init any lazy loading / like buttons
            setupLazyLoading();
            if (typeof initializeLikes === "function") {
              initializeLikes(postsContainer);
            }
          } else {
            // no likes returned at all
            noMorePosts = true;
            showMoreBtn.style.display = "none";
          }
        } catch (error) {
          console.error("Failed to load more likes:", error);
          showAlert("error", "Failed to load more likes. Please try again.", 3000);
        } finally {
          isLoadingMore = false;
          showMoreBtn.innerHTML = "Show more";
          showMoreBtn.disabled = false;
        }
      } else {
        try {
          isLoadingMore = true;
          showMoreBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';

          const response = await axios.get(`/profile/${userId}/more?cursor=${lastPostId}`);
          const { posts, nextCursor } = response.data.data;

          if (posts?.length) {
            // append new posts
            posts.forEach((post) => {
              const postElement = createPostElement(post);
              postsContainer.appendChild(postElement);
            });

            // update the cursor
            if (nextCursor) {
              postsContainer.dataset.lastPostId = nextCursor;
            }

            // put the button back at the very bottom
            postsContainer.appendChild(showMoreBtn);

            // if there is no further cursor, hide it
            if (!nextCursor) {
              noMorePosts = true;
              showMoreBtn.style.display = "none";
            }

            // re-init any lazy loading / like buttons
            setupLazyLoading();
            if (typeof initializeLikes === "function") {
              initializeLikes(postsContainer);
            }
          } else {
            // no posts returned at all
            noMorePosts = true;
            showMoreBtn.style.display = "none";
          }
        } catch (error) {
          console.error("Failed to load more posts:", error);
          showAlert("error", "Failed to load more posts. Please try again.", 3000);
        } finally {
          isLoadingMore = false;
          showMoreBtn.innerHTML = "Show more";
          showMoreBtn.disabled = false;
        }
      }
    });
  }
});

function createLikedPostElement(like) {
  if (!like || !like.post) return null;

  const article = document.createElement("article");
  article.className = "post";
  article.dataset.postId = like.post.id;

  const formattedTime = typeof formatTime === "function" ? formatTime(like.post.createdAt) : like.post.createdAt;

  const isLiked = like.post.likes && Array.isArray(like.post.likes) && like.post.likes.length > 0;
  const isReposted = like.post.reposts && Array.isArray(like.post.reposts) && like.post.reposts.length > 0;
  const commentCount = like.post._count?.comments ?? 0;
  const repostCount = like.post._count?.reposts ?? 0;
  const likeCount = like.post._count?.likes ?? 0;
  const userAvatar = like.post.user?.image || "/images/default.png";
  const postText = like.post.text || "";

  // Basic sanitization
  const sanitizedText = postText.replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const imageHtml = like.post.image
    ? `<div class="post-image-container">
         <div class="post-image">
           <img src="/images/placeholder.svg" data-src="${like.post.image}" alt="Post image" class="lazy-image">
           <div class="lazy-placeholder"></div>
         </div>
       </div>`
    : "";

  article.innerHTML = `
    <a href="/posts/${like.post.id}" class="post-link"></a>
    <div class="post-avatar">
      <a href="/profile/${like.post.user.id}"><img src="${userAvatar}" alt="${like.post.user.username}'s Avatar"></a>
    </div>
    <div class="post-content">
      <div class="post-header">
        <div class="post-user-info">
          <h3><a href="/profile/${like.post.user.id}">${like.post.user.username}</a></h3>
          <span class="username">@${like.post.user.usertag}</span>
          <span class="post-time">· ${formattedTime}</span>
        </div>
      </div>
      <div class="post-text">
        <p>${sanitizedText}</p>
      </div>
      ${imageHtml}
      <div class="post-actions">
        <button class="post-action comment" data-id="${like.post.id}">
          <i class="far fa-comment"></i>
          <span>${commentCount}</span>
        </button>
        <button class="post-action repost" data-id="${like.post.id}" class="${isReposted ? "active" : ""}">
          <i class="fas fa-retweet ${isReposted ? "reposted" : ""}"></i>
          <span class="${isReposted ? "text-green-500" : ""}">${repostCount}</span>
        </button>
        <button class="post-action like" data-id="${like.post.id}">
          <i class="${isLiked ? "fas text-red-500" : "far"} fa-heart"></i>
          <span class="${isLiked ? "text-red-500" : ""}">${likeCount}</span>
        </button>
        <button class="post-action share" data-id="${like.post.id}">
          <i class="far fa-share-square"></i>
        </button>
      </div>
    </div>
  `;

  return attachEventListeners(article);
}

function createLikedCommentElement(like) {
  if (!like || !like.comment) return null;

  const article = document.createElement("article");
  article.className = "post";
  article.dataset.commentId = like.comment.id;

  const formattedTime = typeof formatTime === "function" ? formatTime(like.comment.createdAt) : like.comment.createdAt;

  const isLiked = like.comment.likes && Array.isArray(like.comment.likes) && like.comment.likes.length > 0;
  const likeCount = like.comment._count?.likes ?? 0;
  const userAvatar = like.comment.user?.image || "/images/default.png";

  article.innerHTML = `
    <a href="/posts/${like.comment.post.id}" class="post-link"></a>
    <div class="post-avatar">
      <a href="/profile/${like.comment.user.id}"><img src="${userAvatar}" alt="${
    like.comment.user.username
  }'s Avatar"></a>
    </div>
    <div class="post-content">
      <div class="post-header">
        <div class="post-user-info">
          <h3><a href="/profile/${like.comment.user.id}">${like.comment.user.username}</a></h3>
          <span class="username">@${like.comment.user.usertag}</span>
          <span class="post-time">· ${formattedTime}</span>
          <span class="replying-to">- Replying to @${like.comment.post.user.usertag}</span>
        </div>
      </div>
      <div class="post-text">
        <p>${like.comment.text}</p>
      </div>
      <div class="comment-actions-buttons">
        <button class="comment-action like" data-comment-id="${like.comment.id}" data-post-id="${like.comment.post.id}">
          <i class="${isLiked ? "fas text-red-500" : "far"} fa-heart"></i>
          <span class="${isLiked ? "text-red-500" : ""}">${likeCount}</span>
        </button>
        <button class="post-action share" data-id="${like.comment.post.id}">
          <i class="far fa-share-square"></i>
        </button>
      </div>
    </div>
  `;

  return attachEventListeners(article);
}

function attachEventListeners(element) {
  const interactiveSelector =
    ".post-menu, .post-actions button, .post a:not(.post-link), .post-user-info a, .post-avatar a";

  element.querySelectorAll(interactiveSelector).forEach((el) => {
    el.addEventListener("click", (e) => e.stopPropagation());
  });

  element.addEventListener("click", (e) => {
    if (window.getSelection()?.toString()) return;
    if (e.target.closest(interactiveSelector)) return;

    const postLink = element.querySelector(".post-link")?.getAttribute("href");
    if (postLink) window.location.href = postLink;
  });

  return element;
}

function createPostElement(post) {
  const article = document.createElement("article");
  article.className = "post";
  article.dataset.postId = post.id;

  const formattedTime = typeof formatTime === "function" ? formatTime(post.createdAt) : post.createdAt;

  const isLiked = post.likes && Array.isArray(post.likes) && post.likes.length > 0;
  const commentCount = post._count?.comments ?? 0;
  const repostCount = post._count?.reposts ?? 0;
  const likeCount = post._count?.likes ?? 0;
  const userAvatar = post.user?.image || "/images/default.png";
  const postText = post.text || "";

  // Basic sanitization
  const sanitizedText = postText.replace(/</g, "&lt;").replace(/>/g, "&gt;");

  // Enhanced image handling with lazy loading
  const imageHtml = post.image
    ? `<div class="post-image-container">
           <div class="post-image">
             <img src="/images/placeholder.svg" data-src="${post.image}" alt="Post image" class="lazy-image">
             <div class="lazy-placeholder"></div>
           </div>
         </div>`
    : "";

  article.innerHTML = `
    <a href="/posts/${post.id}" class="post-link" aria-hidden="true" tabindex="-1"></a>
    <div class="post-avatar">
      <a href="/profile/${post.user?.id}" tabindex="-1"><img src="${post.user?.image || "/images/default.png"} " alt="${
    post.user?.username
  }'s Avatar"></a>
    </div>
    <div class="post-content">
      <div class="post-header">
        <div class="post-user-info">
          <h3><a href="/profile/${post.user?.id}">${post.user?.username || "Unknown User"}</a></h3>
          <span class="username">@${post.user?.usertag || "unknown"}</span>
          <span class="post-time">· ${formattedTime}</span>
        </div>
      </div>
      <div class="post-text">
        <p>${sanitizedText}</p>
      </div>
      ${imageHtml}
      <div class="post-actions">
        <button class="post-action comment" data-id="${post.id}" aria-label="Comment on post" id="comment-btn">
          <i class="far fa-comment" aria-hidden="true"></i>
          <span>${commentCount}</span>
        </button>
        <button class="post-action repost" data-id="${post.id}" aria-label="Repost">
          <i class="fas fa-retweet" aria-hidden="true"></i>
          <span>${repostCount}</span>
        </button>
        <button class="post-action like" data-id="${post.id}" aria-label="${isLiked ? "Unlike post" : "Like post"}">
          <i class="${isLiked ? "fas text-red-500" : "far"} fa-heart" aria-hidden="true"></i>
          <span class="${isLiked ? "text-red-500" : ""}">${likeCount}</span>
        </button>
        <button class="post-action share" aria-label="Share post" data-id="${post.id}" id="share-btn">
          <i class="far fa-share-square" aria-hidden="true"></i>
        </button>
      </div>
    </div>
  `;

  // Attach event listeners
  const commentButton = article.querySelector(".post-action.comment");
  commentButton?.addEventListener("click", function (e) {
    e.stopPropagation();
    window.location.href = `/posts/${this.dataset.id}#commentText`;
  });

  if (typeof initializeLikes === "function") {
    initializeLikes(article);
  }

  const interactiveSelector =
    ".post-menu, .post-actions button, .post a:not(.post-link), .post-user-info a, .post-avatar a";
  article.querySelectorAll(interactiveSelector).forEach((el) => {
    el.addEventListener("click", (e) => e.stopPropagation());
  });

  article.addEventListener("click", (e) => {
    if (window.getSelection()?.toString()) return;
    if (e.target.closest(interactiveSelector)) return;

    const postLink = article.querySelector(".post-link")?.getAttribute("href");
    if (postLink) window.location.href = postLink;
  });

  return article;
}

function createRepostElement(post) {
  const article = document.createElement("article");
  article.className = "post";
  article.dataset.postId = post.postId;

  const formattedTime = typeof formatTime === "function" ? formatTime(post.createdAt) : post.createdAt;

  const isLiked = post.post.likes && Array.isArray(post.post.likes) && post.post.likes.length > 0;
  const isReposted = post.post.reposts && Array.isArray(post.post.reposts) && post.post.reposts.length > 0;
  const commentCount = post.post._count?.comments ?? 0;
  const repostCount = post.post._count?.reposts ?? 0;
  const likeCount = post.post._count?.likes ?? 0;
  const postText = post.post.text || "";

  // Basic sanitization
  const sanitizedText = postText.replace(/</g, "&lt;").replace(/>/g, "&gt;");

  // Enhanced image handling with lazy loading
  const imageHtml = post.image
    ? `<div class="post-image-container">
           <div class="post-image">
             <img src="/images/placeholder.svg" data-src="${post.image}" alt="Post image" class="lazy-image">
             <div class="lazy-placeholder"></div>
           </div>
         </div>`
    : "";

  article.innerHTML = `
    <a href="/posts/${post.postId}" class="post-link" aria-hidden="true" tabindex="-1"></a>
    <div class="post-avatar">
      <a href="/profile/${post.user?.id}" tabindex="-1"><img src="${post.user.image}" alt="${
    post.user?.username
  }'s Avatar"></a>
    </div>
    <div class="post-content">
      <div class="post-header">
        <div class="post-user-info">
          <h3><a href="/profile/${post.user?.id}">${post.user?.username || "Unknown User"}</a></h3>
          <span class="username">@${post.user?.usertag || "unknown"}</span>
          <span class="post-time">· ${formattedTime}</span>
        </div>
      </div>
      <div class="post-text">
        <p>${sanitizedText}</p>
      </div>
      ${imageHtml}
      <div class="post-actions">
        <button class="post-action comment" data-id="${post.postId}" aria-label="Comment on post" id="comment-btn">
          <i class="far fa-comment" aria-hidden="true"></i>
          <span>${commentCount}</span>
        </button>

        <button class="post-action repost" data-id="${post.postId}" 
          aria-label="Repost" 
          class="${isReposted ? "active" : ""}">
          <i class="fas fa-retweet ${isReposted ? "reposted" : ""}" aria-hidden="true"></i>
          <span class="${isReposted ? "text-green-500" : ""}">${repostCount}</span>
        </button>
        
        <button class="post-action like" data-id="${post.postId}" aria-label="${isLiked ? "Unlike post" : "Like post"}">
          <i class="${isLiked ? "fas text-red-500" : "far"} fa-heart" aria-hidden="true"></i>
          <span class="${isLiked ? "text-red-500" : ""}">${likeCount}</span>
        </button>
        <button class="post-action share" aria-label="Share post" data-id="${post.postId}" id="share-btn">
          <i class="far fa-share-square" aria-hidden="true"></i>
        </button>
      </div>
    </div>
  `;

  // Attach event listeners
  const commentButton = article.querySelector(".post-action.comment");
  commentButton?.addEventListener("click", function (e) {
    e.stopPropagation();
    window.location.href = `/posts/${this.dataset.id}#commentText`;
  });

  if (typeof initializeLikes === "function") {
    initializeLikes(article);
  }

  const interactiveSelector =
    ".post-menu, .post-actions button, .post a:not(.post-link), .post-user-info a, .post-avatar a";
  article.querySelectorAll(interactiveSelector).forEach((el) => {
    el.addEventListener("click", (e) => e.stopPropagation());
  });

  article.addEventListener("click", (e) => {
    if (window.getSelection()?.toString()) return;
    if (e.target.closest(interactiveSelector)) return;

    const postLink = article.querySelector(".post-link")?.getAttribute("href");
    if (postLink) window.location.href = postLink;
  });

  return article;
}

function createCommentElement(comment) {
  const article = document.createElement("article");
  article.className = "post";
  article.dataset.postId = comment.id;

  const formattedTime = typeof formatTime === "function" ? formatTime(comment.createdAt) : comment.createdAt;

  const isLiked = comment.likes && Array.isArray(comment.likes) && comment.likes.length > 0;
  const likeCount = comment._count?.likes ?? 0;
  const userAvatar = comment.user?.image || "/images/default.png";
  const postText = comment.text || "";

  // Basic sanitization
  const sanitizedText = postText.replace(/</g, "&lt;").replace(/>/g, "&gt;");

  article.innerHTML = `
    <a href="/posts/${comment.post.id}" class="post-link" aria-hidden="true" tabindex="-1"></a>
    <div class="post-avatar">
      <a href="/profile/${comment.user?.id}" tabindex="-1"><img src="${
    comment.user?.image || "/images/default.png"
  } " alt="${comment.user?.username}'s Avatar"></a>
    </div>
    <div class="post-content">
      <div class="post-header">
        <div class="post-user-info">
          <h3><a href="/profile/${comment.user?.id}">${comment.user?.username || "Unknown User"}</a></h3>
          <span class="username">@${comment.user?.usertag || "unknown"}</span>
          <span class="post-time">· ${formattedTime}</span>
          <span class="replying-to">- Replying to ${comment.post.user.username}</span>
        </div>
      </div>
      <div class="post-text">
        <p>${sanitizedText}</p>
      </div>
      <div class="post-actions">
        <button class="post-action like" data-id="${comment.id}" aria-label="${isLiked ? "Unlike post" : "Like post"}">
          <i class="${isLiked ? "fas text-red-500" : "far"} fa-heart" aria-hidden="true"></i>
          <span class="${isLiked ? "text-red-500" : ""}">${likeCount}</span>
        </button>
        <button class="post-action share" aria-label="Share post" data-id="${comment.id}" id="share-btn">
          <i class="far fa-share-square" aria-hidden="true"></i>
        </button>
      </div>
    </div>
  `;

  // Attach event listeners

  if (typeof initializeLikes === "function") {
    initializeLikes(article);
  }

  const interactiveSelector =
    ".post-menu, .post-actions button, .post a:not(.post-link), .post-user-info a, .post-avatar a";
  article.querySelectorAll(interactiveSelector).forEach((el) => {
    el.addEventListener("click", (e) => e.stopPropagation());
  });

  article.addEventListener("click", (e) => {
    if (window.getSelection()?.toString()) return;
    if (e.target.closest(interactiveSelector)) return;

    const postLink = article.querySelector(".post-link")?.getAttribute("href");
    if (postLink) window.location.href = postLink;
  });

  return article;
}
