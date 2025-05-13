// emoji sets organized by category
const emojiData = {
  smileys: [
    "😀",
    "😃",
    "😄",
    "😁",
    "😆",
    "😅",
    "🤣",
    "😂",
    "🙂",
    "🙃",
    "😉",
    "😊",
    "😇",
    "🥰",
    "😍",
    "🤩",
    "😘",
    "😗",
    "😚",
    "😙",
    "😋",
    "😛",
    "😜",
    "🤪",
    "😝",
    "🤑",
    "🤗",
    "🤭",
    "🤫",
    "🤔",
    "🤐",
    "🤨",
    "😐",
    "😑",
    "😶",
    "😏",
    "😒",
    "🙄",
    "😬",
    "🤥",
  ],
  people: [
    "👍",
    "👎",
    "👌",
    "✌️",
    "🤞",
    "🤟",
    "🤘",
    "🤙",
    "👈",
    "👉",
    "👆",
    "👇",
    "☝️",
    "👋",
    "🤚",
    "🖐️",
    "✋",
    "🖖",
    "👏",
    "🙌",
    "👐",
    "🤲",
    "🤝",
    "🙏",
    "💪",
    "🦾",
    "🦿",
    "🦵",
    "🦶",
    "👂",
    "🦻",
    "👃",
    "🧠",
    "🫀",
    "🫁",
    "🦷",
    "🦴",
    "👀",
    "👁️",
    "👅",
  ],
  nature: [
    "🐶",
    "🐱",
    "🐭",
    "🐹",
    "🐰",
    "🦊",
    "🐻",
    "🐼",
    "🐨",
    "🐯",
    "🦁",
    "🐮",
    "🐷",
    "🐸",
    "🐵",
    "🙈",
    "🙉",
    "🙊",
    "🐒",
    "🦆",
    "🦅",
    "🦉",
    "🦇",
    "🐺",
    "🐗",
    "🐴",
    "🦄",
    "🐝",
    "🪱",
    "🐛",
    "🦋",
    "🐌",
    "🐞",
    "🐜",
    "🪰",
    "🪲",
    "🪳",
    "🦟",
    "🦗",
    "🕷️",
  ],
  food: [
    "🍎",
    "🍐",
    "🍊",
    "🍋",
    "🍌",
    "🍉",
    "🍇",
    "🍓",
    "🫐",
    "🍈",
    "🍒",
    "🍑",
    "🥭",
    "🍍",
    "🥥",
    "🥝",
    "🍅",
    "🍆",
    "🥑",
    "🥦",
    "🥬",
    "🥒",
    "🌶️",
    "🫑",
    "🌽",
    "🥕",
    "🧄",
    "🧅",
    "🥔",
    "🍠",
    "🥐",
    "🥯",
    "🍞",
    "🥖",
    "🥨",
    "🧀",
    "🥚",
    "🍳",
    "🧈",
    "🥞",
  ],
  activities: [
    "⚽",
    "🏀",
    "🏈",
    "⚾",
    "🥎",
    "🎾",
    "🏐",
    "🏉",
    "🥏",
    "🎱",
    "🪀",
    "🏓",
    "🏸",
    "🏒",
    "🏑",
    "🥍",
    "🏏",
    "🪃",
    "🥅",
    "⛳",
    "🪁",
    "🏹",
    "🎣",
    "🤿",
    "🥊",
    "🥋",
    "🎽",
    "🛹",
    "🛼",
    "🛷",
    "⛸️",
    "🥌",
    "🎿",
    "⛷️",
    "🏂",
    "🪂",
    "🏋️",
    "🤼",
    "🤸",
    "⛹️",
  ],
  travel: [
    "🚗",
    "🚕",
    "🚙",
    "🚌",
    "🚎",
    "🏎️",
    "🚓",
    "🚑",
    "🚒",
    "🚐",
    "🛻",
    "🚚",
    "🚛",
    "🚜",
    "🦯",
    "🦽",
    "🦼",
    "🛴",
    "🚲",
    "🛵",
    "🏍️",
    "🛺",
    "🚨",
    "🚔",
    "🚍",
    "🚘",
    "🚖",
    "🚡",
    "🚠",
    "🚟",
    "🚃",
    "🚋",
    "🚞",
    "🚝",
    "🚄",
    "🚅",
    "🚈",
    "🚂",
    "🚆",
    "🚇",
  ],
  objects: [
    "⌚",
    "📱",
    "📲",
    "💻",
    "⌨️",
    "🖥️",
    "🖨️",
    "🖱️",
    "🖲️",
    "🕹️",
    "🗜️",
    "💽",
    "💾",
    "💿",
    "📀",
    "📼",
    "📷",
    "📸",
    "📹",
    "🎥",
    "📽️",
    "🎞️",
    "📞",
    "☎️",
    "📟",
    "📠",
    "📺",
    "📻",
    "🎙️",
    "🎚️",
    "🎛️",
    "🧭",
    "⏱️",
    "⏲️",
    "⏰",
    "🕰️",
    "⌛",
    "⏳",
    "📡",
    "🔋",
  ],
  symbols: [
    "❤️",
    "🧡",
    "💛",
    "💚",
    "💙",
    "💜",
    "🖤",
    "🤍",
    "🤎",
    "💔",
    "❣️",
    "💕",
    "💞",
    "💓",
    "💗",
    "💖",
    "💘",
    "💝",
    "💟",
    "☮️",
    "✝️",
    "☪️",
    "🕉️",
    "☸️",
    "✡️",
    "🔯",
    "🕎",
    "☯️",
    "☦️",
    "🛐",
    "⛎",
    "♈",
    "♉",
    "♊",
    "♋",
    "♌",
    "♍",
    "♎",
    "♏",
    "♐",
  ],
  flags: [
    "🏁",
    "🚩",
    "🎌",
    "🏴",
    "🏳️",
    "🏳️‍🌈",
    "🏳️‍⚧️",
    "🏴‍☠️",
    "🇦🇨",
    "🇦🇩",
    "🇦🇪",
    "🇦🇫",
    "🇦🇬",
    "🇦🇮",
    "🇦🇱",
    "🇦🇲",
    "🇦🇴",
    "🇦🇶",
    "🇦🇷",
    "🇦🇸",
    "🇦🇹",
    "🇦🇺",
    "🇦🇼",
    "🇦🇽",
    "🇦🇿",
    "🇧🇦",
    "🇧🇧",
    "🇧🇩",
    "🇧🇪",
    "🇧🇫",
    "🇧🇬",
    "🇧🇭",
    "🇧🇮",
    "🇧🇯",
    "🇧🇱",
    "🇧🇲",
    "🇧🇳",
    "🇧🇴",
    "🇧🇶",
    "🇧🇷",
  ],
};

// Initialize emoji picker
function initEmojiPicker() {
  document
    .querySelectorAll(
      '.compose-tools button[title="Emoji"], .comment-tools button[title="Emoji"], .message-input-actions button[title="Emoji"]'
    )
    .forEach((button) => {
      if (button.querySelector(".emoji-picker")) return;

      // Create emoji picker container
      const emojiPicker = document.createElement("div");
      emojiPicker.className = "emoji-picker";

      // Create header with category buttons
      const header = document.createElement("div");
      header.className = "emoji-picker-header";

      // Add category buttons
      const categories = [
        { name: "smileys", icon: "😀" },
        { name: "people", icon: "👍" },
        { name: "nature", icon: "🐶" },
        { name: "food", icon: "🍎" },
        { name: "activities", icon: "⚽" },
        { name: "travel", icon: "🚗" },
        { name: "objects", icon: "💻" },
        { name: "symbols", icon: "❤️" },
        { name: "flags", icon: "🏁" },
      ];

      categories.forEach((category) => {
        const categoryBtn = document.createElement("button");
        categoryBtn.setAttribute("data-category", category.name);
        categoryBtn.innerHTML = category.icon;
        categoryBtn.title = category.name.charAt(0).toUpperCase() + category.name.slice(1);
        header.appendChild(categoryBtn);
      });

      const content = document.createElement("div");
      content.className = "emoji-picker-content";

      populateEmojiCategory(content, "smileys", emojiData.smileys);

      emojiPicker.appendChild(header);
      emojiPicker.appendChild(content);

      button.parentNode.appendChild(emojiPicker);

      button.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();

        document.querySelectorAll(".emoji-picker.active").forEach((picker) => {
          if (picker !== emojiPicker) {
            picker.classList.remove("active");
          }
        });

        emojiPicker.classList.toggle("active");

        if (emojiPicker.classList.contains("active")) {
          const firstCategoryBtn = emojiPicker.querySelector(".emoji-picker-header button");
          if (firstCategoryBtn) {
            emojiPicker.querySelectorAll(".emoji-picker-header button").forEach((btn) => {
              btn.classList.remove("active");
            });
            firstCategoryBtn.classList.add("active");
          }
        }
      });

      emojiPicker.querySelectorAll(".emoji-picker-header button").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();

          emojiPicker.querySelectorAll(".emoji-picker-header button").forEach((b) => {
            b.classList.remove("active");
          });
          btn.classList.add("active");

          const category = btn.getAttribute("data-category");
          content.innerHTML = "";
          populateEmojiCategory(content, category, emojiData[category]);
        });
      });

      const firstCategoryBtn = emojiPicker.querySelector(".emoji-picker-header button");
      if (firstCategoryBtn) {
        firstCategoryBtn.classList.add("active");
      }
    });

  document.addEventListener("click", (e) => {
    if (!e.target.closest(".emoji-picker") && !e.target.closest('button[title="Emoji"]')) {
      document.querySelectorAll(".emoji-picker.active").forEach((picker) => {
        picker.classList.remove("active");
      });
    }
  });
}

// Populate emoji category in the picker
function populateEmojiCategory(container, categoryName, emojis) {
  const category = document.createElement("div");
  category.className = "emoji-category";

  const title = document.createElement("div");
  title.className = "emoji-category-title";
  title.textContent = categoryName.charAt(0).toUpperCase() + categoryName.slice(1);

  const grid = document.createElement("div");
  grid.className = "emoji-grid";

  emojis.forEach((emoji) => {
    const item = document.createElement("div");
    item.className = "emoji-item";
    item.textContent = emoji;
    item.addEventListener("click", () => {
      insertEmoji(emoji);
    });
    grid.appendChild(item);
  });

  category.appendChild(title);
  category.appendChild(grid);
  container.appendChild(category);
}

// Insert emoji into the active textarea
function insertEmoji(emoji) {
  // Find the active textarea
  let textarea;
  const activePicker = document.querySelector(".emoji-picker.active");

  if (document.activeElement.tagName === "TEXTAREA") {
    textarea = document.activeElement;
  } else if (activePicker) {
    // Find the closest textarea to the active picker
    const parentTools = activePicker.closest(".compose-tools, .comment-tools, .message-input-actions");
    if (parentTools) {
      if (parentTools.classList.contains("compose-tools")) {
        textarea = parentTools.closest(".compose-input-container").querySelector("textarea");
      } else if (parentTools.classList.contains("comment-tools")) {
        textarea = parentTools.closest(".comment-input-container").querySelector("textarea");
      } else if (parentTools.classList.contains("message-input-actions")) {
        textarea = parentTools.closest(".message-input-container").querySelector("textarea");
      }
    }
  }

  if (textarea) {
    // Get cursor position
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    // Insert emoji at cursor position
    const text = textarea.value;
    textarea.value = text.substring(0, start) + emoji + text.substring(end);

    // Reset cursor position after the inserted emoji
    textarea.selectionStart = textarea.selectionEnd = start + emoji.length;

    // Focus back on textarea
    textarea.focus();

    // Trigger input event to update character count
    const event = new Event("input", { bubbles: true });
    textarea.dispatchEvent(event);

    if (activePicker) {
      activePicker.classList.remove("active");
    }
  }
}

document.addEventListener("DOMContentLoaded", initEmojiPicker);
