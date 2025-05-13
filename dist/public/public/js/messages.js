import { showAlert } from "./alerts.js";

document.addEventListener("DOMContentLoaded", () => {
  // DOM elements
  const elements = {
    messageInput: document.querySelector(".message-input-container textarea"),
    sendButton: document.querySelector(".send-message-btn"),
    messageBody: document.querySelector(".message-body"),
    conversationItems: document.querySelectorAll(".conversation-item"),
    newMessageBtn: document.querySelector(".new-message-btn"),
    newMessageModal: document.getElementById("new-message-modal"),
    messagesSidebar: document.querySelector(".messages-sidebar"),
    messageContent: document.querySelector(".message-content"),
  };

  // Initialize message input functionality
  initMessageInput();

  // Initialize conversation list
  initConversationList();

  // Initialize new message functionality
  initNewMessage();

  // Initialize mobile view functionality
  initMobileView();

  // Scroll message body to bottom on load
  if (elements.messageBody) {
    elements.messageBody.scrollTop = elements.messageBody.scrollHeight;
  }

  /**
   * Initializes message input and send functionality
   */
  function initMessageInput() {
    const { messageInput, sendButton, messageBody } = elements;

    if (!messageInput || !sendButton) return;

    // Auto-resize textarea as user types
    messageInput.addEventListener("input", function () {
      this.style.height = "auto";
      this.style.height = this.scrollHeight + "px";

      // Enable/disable send button based on content
      sendButton.disabled = this.value.trim().length === 0;
    });

    // Handle send button click
    sendButton.addEventListener("click", sendMessage);

    // Handle Enter key to send message (allow Shift+Enter for new line)
    messageInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        if (!sendButton.disabled) {
          sendMessage();
        }
      }
    });
  }

  /**
   * Sends a message and simulates a response
   */
  function sendMessage() {
    const { messageInput, sendButton, messageBody } = elements;

    if (messageInput.value.trim().length === 0) return;

    // Get the message text
    const messageText = messageInput.value.trim();

    // Add user message to chat
    addMessageToChat("sent", messageText);

    // Clear the input
    messageInput.value = "";
    messageInput.style.height = "auto";
    sendButton.disabled = true;

    // Simulate a response after a delay
    setTimeout(() => {
      addMessageToChat("received", "Thanks for your message! I'll get back to you soon.");
      showAlert("info", "New message from Jane Smith", 2000);
    }, 2000);
  }

  /**
   * Adds a message to the chat window
   * @param {string} type - "sent" or "received"
   * @param {string} text - Message content
   */
  function addMessageToChat(type, text) {
    const { messageBody } = elements;
    if (!messageBody) return;

    const messageElement = document.createElement("div");
    messageElement.className = `message ${type}`;

    const currentTime = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    messageElement.innerHTML = `
      <div class="message-bubble">
        <p>${text}</p>
      </div>
      <span class="message-time">${currentTime}</span>
    `;

    messageBody.appendChild(messageElement);
    messageBody.scrollTop = messageBody.scrollHeight;
  }

  /**
   * Initializes conversation list functionality
   */
  function initConversationList() {
    const { conversationItems } = elements;

    conversationItems.forEach((item) => {
      item.addEventListener("click", function () {
        // Update active conversation
        conversationItems.forEach((i) => i.classList.remove("active"));
        this.classList.add("active");
        this.classList.remove("unread");

        // Get conversation details
        const avatar = this.querySelector(".conversation-avatar img").src;
        const name = this.querySelector("h3").textContent;
        const isOnline = this.querySelector(".online-indicator") !== null;

        // Update message header
        updateMessageHeader(name, avatar, isOnline);

        // Show notification
        showAlert("info", `Viewing conversation with ${name}`, 1500);

        // On mobile, show the message content and hide the sidebar
        handleMobileConversationView();
      });
    });
  }

  /**
   * Updates the message header with user information
   */
  function updateMessageHeader(name, avatar, isOnline) {
    const messageHeader = document.querySelector(".message-user-info");
    if (!messageHeader) return;

    messageHeader.innerHTML = `
      <div class="message-avatar">
        <img src="${avatar}" alt="${name}">
        ${isOnline ? '<span class="online-indicator"></span>' : ""}
      </div>
      <div>
        <h3>${name}</h3>
        <p>@${name.toLowerCase().replace(/\s+/g, "")}</p>
      </div>
    `;
  }

  /**
   * Handles mobile view for conversations
   */
  function handleMobileConversationView() {
    const { messagesSidebar, messageContent } = elements;

    if (window.innerWidth <= 768 && messagesSidebar && messageContent) {
      messagesSidebar.classList.remove("active");
      messageContent.style.display = "flex";
    }
  }

  /**
   * Initializes new message functionality
   */
  function initNewMessage() {
    const { newMessageBtn, newMessageModal } = elements;
    const closeModalBtn = newMessageModal?.querySelector(".close-modal");

    if (!newMessageBtn || !newMessageModal) return;

    newMessageBtn.addEventListener("click", () => {
      newMessageModal.classList.add("active");
    });

    // Close modal function
    const closeModal = () => {
      newMessageModal.classList.remove("active");
    };

    if (closeModalBtn) {
      closeModalBtn.addEventListener("click", closeModal);
    }

    // Close when clicking outside
    newMessageModal.addEventListener("click", (e) => {
      if (e.target === newMessageModal) {
        closeModal();
      }
    });

    // User item click functionality
    const userItems = newMessageModal.querySelectorAll(".user-item");
    const nextBtn = newMessageModal.querySelector(".form-actions .btn");

    userItems.forEach((item) => {
      item.addEventListener("click", function () {
        // Toggle selected state
        userItems.forEach((i) => i.classList.remove("selected"));
        this.classList.add("selected");

        // Enable next button
        if (nextBtn) {
          nextBtn.disabled = false;
        }
      });
    });

    // Next button functionality
    if (nextBtn) {
      nextBtn.addEventListener("click", () => {
        const selectedUser = newMessageModal.querySelector(".user-item.selected");
        if (selectedUser) {
          const userName = selectedUser.querySelector("h4").textContent;
          closeModal();
          showAlert("success", `Started a new conversation with ${userName}`, 2000);
        }
      });
    }
  }

  /**
   * Initializes mobile view functionality
   */
  function initMobileView() {
    // Add back button for mobile view
    const addBackButton = () => {
      if (window.innerWidth <= 768) {
        const messageHeader = document.querySelector(".message-header");
        if (messageHeader && !messageHeader.querySelector(".back-btn")) {
          const backBtn = document.createElement("button");
          backBtn.className = "message-action-btn back-btn";
          backBtn.innerHTML = '<i class="fas fa-arrow-left"></i>';

          backBtn.addEventListener("click", () => {
            const { messagesSidebar, messageContent } = elements;

            if (messagesSidebar && messageContent) {
              messagesSidebar.classList.add("active");
              messageContent.style.display = "none";
            }
          });

          messageHeader.insertBefore(backBtn, messageHeader.firstChild);
        }
      }
    };

    // Call on load and resize
    addBackButton();
    window.addEventListener("resize", addBackButton);
  }
});
