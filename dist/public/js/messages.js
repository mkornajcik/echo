import { showAlert } from "./alerts.js";

document.addEventListener("DOMContentLoaded", () => {
  // Initialize socket
  const socket = io();

  // Elements
  const elements = {
    messageForm: document.querySelector("#message-form"),
    messageInput: document.querySelector("#message-input"),
    sendButton: document.querySelector("#send-message-btn"),
    messageBody: document.querySelector("#message-body"),
    conversationItems: document.querySelectorAll(".conversation-item"),
    newMessageBtn: document.querySelector(".new-message-btn"),
    startConversationBtns: document.querySelectorAll(".start-conversation-btn"),
    newMessageModal: document.getElementById("new-message-modal"),
    conversationInfoModal: document.getElementById("conversation-info-modal"),
    messagesSidebar: document.querySelector(".messages-sidebar"),
    messageContent: document.querySelector("#message-content"),
    userSearch: document.getElementById("user-search"),
    userList: document.getElementById("user-list"),
    startChatBtn: document.getElementById("start-chat-btn"),
    conversationSearch: document.getElementById("conversation-search"),
    conversationList: document.getElementById("conversation-list"),
    backButton: document.querySelector(".back-button"),
    fileUpload: document.getElementById("file-upload"),
    attachMediaBtn: document.getElementById("attach-media-btn"),
    attachGifBtn: document.getElementById("attach-gif-btn"),
    emojiBtn: document.getElementById("emoji-btn"),
    conversationInfoBtn: document.getElementById("conversation-info-btn"),
    conversationInfoContent: document.getElementById("conversation-info-content"),
    statusIcon: document.querySelector(".message-status"),
    closeBtn: document.querySelector(".close-modal"),
    messageActions: document.querySelector(".message-input-actions"),
  };

  const currentUser = window.CURRENT_USER || {};
  const activeConversation = window.ACTIVE_CONVERSATION || null;

  // Track selected user for new conversation
  let selectedUserId = null;

  initMessageInput();

  initConversationList();

  initNewMessage();

  initMobileView();

  initSocketEvents();

  // Scroll after all images have loaded
  if (elements.messageBody) {
    const imgs = elements.messageBody.querySelectorAll("img");
    if (imgs.length > 0) {
      let loaded = 0;
      imgs.forEach((img) => {
        // whenever an image loads check if its the last one
        img.addEventListener("load", () => {
          loaded++;
          if (loaded === imgs.length) {
            scrollToBottom();
          }
        });
        // if it was cached count it immediately
        if (img.complete) {
          loaded++;
        }
      });
      // if all are cached already scroll right away
      if (loaded === imgs.length) {
        scrollToBottom();
      }
    } else {
      // no images at all
      scrollToBottom();
    }
  }

  // Msg input and send functionality
  function initMessageInput() {
    const { messageForm, messageInput } = elements;

    if (!messageForm) return;

    // Handle form submission
    messageForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      await sendMessage();
    });

    // Auto-resize textarea
    messageInput.addEventListener("input", function () {
      this.style.height = "auto";
      this.style.height = this.scrollHeight + "px";
    });
  }

  const mediaButton = document.getElementById("attach-media-btn");
  const imageUpload = document.getElementById("message-image-upload");
  const messageForm = document.getElementById("message-form");

  //  Image upload
  if (mediaButton && imageUpload) {
    mediaButton.addEventListener("click", () => {
      imageUpload.click();
    });
  }

  if (imageUpload) {
    imageUpload.addEventListener("change", handleImageSelect);
  }

  if (messageForm) {
    messageForm.addEventListener("submit", handleImageSubmit);
  }

  function handleImageSelect(e) {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      showAlert("error", "Only image files are allowed", 3000);
      e.target.value = "";
      return;
    }

    // Validate file size
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      showAlert("error", "Image size must be less than 5MB", 3000);
      e.target.value = "";
      return;
    }

    showAlert("success", `Image "${file.name}" selected. Press send.`, 4000);
    elements.messageInput.disabled = true;
    elements.attachGifBtn.disabled = true;
    elements.emojiBtn.disabled = true;
    elements.messageInput.value = "";
    elements.messageInput.placeholder = `Image "${file.name}" selected.`;
  }

  async function handleImageSubmit(e) {
    e.preventDefault();
    const imageFile = imageUpload.files[0];

    if (!imageFile) {
      return;
    }

    const formData = new FormData();
    formData.append("image", imageFile);

    try {
      showAlert("info", "Posting...", 1500);
      const response = await axios.post(`/files/${activeConversation.id}/message`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.status === "success") {
        showAlert("success", "Uploaded successfully!", 2000);
        const message = response.data.data.message; // Get message from response

        socket.emit("newMessage", {
          conversationId: activeConversation.id,
          message: {
            id: message.id,
            image: message.image,
            createdAt: message.createdAt,
            senderId: message.senderId,
            readAt: message.readAt,
          },
        });
      }
    } catch (error) {
      if (error.status === 429) {
        showAlert("error", "Too many requests. Try again later.", 5000);
      } else {
        showAlert("error", error.response?.data?.message || "Failed to upload image", 3000);
      }
    } finally {
      imageUpload.value = "";
      elements.messageInput.disabled = false;
      elements.attachGifBtn.disabled = false;
      elements.emojiBtn.disabled = false;
      elements.messageInput.value = "";
      elements.messageInput.placeholder = "Type your message...";
    }
  }

  async function markAsRead() {
    if (!activeConversation) return;

    try {
      await axios.patch(`/api/messages/${activeConversation.id}/read`);
    } catch (error) {
      console.error("Error marking conversation as read:", error);
    }
  }

  async function sendMessage() {
    const { messageInput, sendButton } = elements;

    if (!activeConversation) {
      showAlert("error", "No active conversation", 2000);
      return;
    }

    const messageText = messageInput.value.trim();
    if (messageText.length === 0) return;

    sendButton.disabled = true;

    try {
      const response = await axios.post(`/api/messages/${activeConversation.id}`, {
        content: messageText,
      });

      if (response.data.status === "success") {
        const message = response.data.data.message;

        messageInput.value = "";

        socket.emit("newMessage", {
          conversationId: activeConversation.id,
          message: {
            id: message.id,
            content: message.content,
            createdAt: message.createdAt,
            senderId: message.senderId,
            readAt: message.readAt,
          },
        });
      }
    } catch (error) {
      console.error("Error sending message:", error);
      showAlert("error", "Failed to send message. Please try again.", 3000);
    } finally {
      sendButton.disabled = false;
    }
  }

  function addMessageToChat(messageId, type, content, image, timestamp, isRead = false) {
    const { messageBody } = elements;
    if (!messageBody) return;

    const messageElement = document.createElement("div");
    messageElement.className = `message ${type}`;
    messageElement.dataset.messageId = messageId;

    const currentTime = new Date(timestamp).toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    const readStatusIcon =
      type === "sent" ? `<i class="${isRead ? "fas fa-check-double" : "fas fa-check"} message-status"></i>` : "";

    // Create message content
    const bubble = document.createElement("div");
    bubble.className = "message-bubble";

    if (image) {
      const img = document.createElement("img");
      img.className = "message-image";
      img.alt = "Uploaded image";
      img.src = image;

      // Scroll when image loads
      img.onload = () => scrollToBottom();

      // If image is cached and already loaded
      if (img.complete) scrollToBottom();

      bubble.appendChild(img);
    } else {
      const text = document.createElement("p");
      text.textContent = content;
      bubble.appendChild(text);
    }

    // Create time container
    const timeContainer = document.createElement("span");
    timeContainer.className = "message-time";
    timeContainer.innerHTML = `${currentTime} ${readStatusIcon}`;

    // Assemble message
    messageElement.appendChild(bubble);
    messageElement.appendChild(timeContainer);
    messageBody.appendChild(messageElement);

    // Initial scroll
    scrollToBottom();
  }

  function scrollToBottom() {
    if (!elements.messageBody) return;

    elements.messageBody.scrollTo({
      top: elements.messageBody.scrollHeight,
      behavior: "smooth",
    });

    markAsRead();
  }

  function initConversationList() {
    const { conversationItems } = elements;

    conversationItems.forEach((item) => {
      item.addEventListener("click", function () {
        const conversationId = this.dataset.conversationId;
        if (conversationId) {
          window.location.href = `/messages/${conversationId}`;
        }
      });
    });

    // Handle conversation search
    if (elements.conversationSearch) {
      elements.conversationSearch.addEventListener("input", function () {
        const searchTerm = this.value.toLowerCase().trim();

        document.querySelectorAll(".conversation-item").forEach((item) => {
          const username = item.querySelector("h3").textContent.toLowerCase();

          if (username.includes(searchTerm) || searchTerm === "") {
            item.style.display = "flex";
          } else {
            item.style.display = "none";
          }
        });
      });
    }
  }

  function initNewMessage() {
    const { newMessageModal, userList } = elements;

    // Close when clicking outside
    window.addEventListener("click", (e) => {
      if (e.target === newMessageModal || e.target === elements.conversationInfoModal) {
        closeModals();
      }
    });

    if (elements.closeBtn) {
      elements.closeBtn.addEventListener("click", () => {
        closeModals();
      });
    }

    // User selection
    if (userList) {
      userList.addEventListener("click", (e) => {
        const userItem = e.target.closest(".user-item");
        if (!userItem) return;

        // Toggle selected state
        document.querySelectorAll(".user-item").forEach((item) => {
          item.classList.remove("selected");
        });

        userItem.classList.add("selected");
        selectedUserId = userItem.dataset.userId;
      });
    }

    // Conversation info button
    if (elements.conversationInfoBtn) {
      elements.conversationInfoBtn.addEventListener("click", () => {
        if (!activeConversation) return;

        // Populate conversation info
        if (elements.conversationInfoContent) {
          const userInfo = document.querySelector(".message-user-info");
          const otherUser = document.querySelector(".message-user-info h3").textContent;
          const otherUserTag = document.querySelector(".message-user-info p").textContent;
          const otherUserId = userInfo.dataset.userId;

          elements.conversationInfoContent.innerHTML = `
            <div class="conversation-info">
              <div class="conversation-info-avatar">
                <img src="${otherUser.image || "/images/default.png"}" alt="${otherUser}">
              </div>
              <h3>${otherUser}</h3>
              <p>${otherUserTag}</p>
              <div class="conversation-actions">
                <a href="/profile/${otherUserId}" class="btn btn-primary">
                  View Profile
                </a>
              </div>
            </div>
          `;

          // Show the modal
          elements.conversationInfoModal.classList.add("active");
        }
      });
    }
  }

  function closeModals() {
    if (elements.newMessageModal) {
      elements.newMessageModal.classList.remove("active");
    }

    if (elements.conversationInfoModal) {
      elements.conversationInfoModal.classList.remove("active");
    }

    // Reset selected user
    selectedUserId = null;

    // Disable start chat button
    if (elements.startChatBtn) {
      elements.startChatBtn.disabled = true;
    }
  }

  function initMobileView() {
    // Handle back button for mobile view
    if (elements.backButton) {
      elements.backButton.addEventListener("click", () => {
        const { messagesSidebar, messageContent } = elements;

        if (messagesSidebar && messageContent) {
          messagesSidebar.classList.add("active");
          messageContent.style.display = "none";
        }
      });
    }

    // Show/hide elements based on screen size
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        // On mobile, if we have an active conversation, hide the sidebar
        if (activeConversation && elements.messagesSidebar && elements.messageContent) {
          elements.messagesSidebar.classList.remove("active");
          elements.messageContent.style.display = "flex";
        }
      }
    };

    // Call on load and resize
    handleResize();
    window.addEventListener("resize", handleResize);
  }

  function initSocketEvents() {
    // Connect to socket
    socket.on("connect", () => {
      if (currentUser && currentUser.id) {
        socket.emit("joinUser", { userId: currentUser.id });
      }

      // Join conversation room if active
      if (activeConversation) {
        socket.emit("joinConversation", {
          conversationId: activeConversation.id,
          userId: currentUser.id,
        });
      }
    });

    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });

    // Handle new messages
    socket.on("newMessage", (data) => {
      if (activeConversation && data.conversationId === activeConversation.id) {
        const messageType = data.message.senderId === currentUser.id ? "sent" : "received";
        addMessageToChat(
          data.message.id,
          messageType,
          data.message.content,
          data.message.image,
          data.message.createdAt,
          data.message.readAt
        );
        scrollToBottom();
      } else {
        const previewText = data.message.image ? "📷 Image" : data.message.content;
        updateConversationPreview(data.conversationId, previewText);
      }
    });

    // Handle disconnect
    socket.on("disconnect", () => {
      console.log("Disconnected from socket server");
    });
  }

  function updateConversationPreview(conversationId, messageText) {
    const conversationItem = document.querySelector(`.conversation-item[data-conversation-id="${conversationId}"]`);
    if (!conversationItem) return;

    // Update preview text
    const previewElement = conversationItem.querySelector(".conversation-preview");
    if (previewElement) {
      previewElement.textContent = messageText.length > 30 ? messageText.substring(0, 30) + "..." : messageText;
    }

    // Update time
    const timeElement = conversationItem.querySelector(".conversation-time");
    if (timeElement) {
      timeElement.textContent = "now";
    }

    // Mark as unread if not active conversation
    if (!activeConversation || activeConversation.id !== conversationId) {
      conversationItem.classList.add("unread");
    }

    // Move conversation to top of list
    const conversationList = conversationItem.parentElement;
    if (conversationList) {
      conversationList.prepend(conversationItem);
    }
  }

  function debounce(func, wait) {
    let timeout;
    return function (...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }
});
