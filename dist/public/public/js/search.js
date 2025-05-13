document.addEventListener("DOMContentLoaded", () => {
  // Search input functionality
  const searchInput = document.querySelector(".search-input input");
  const clearButton = document.querySelector(".clear-search");
  const searchForm = document.querySelector(".search-form");

  if (searchInput && clearButton && searchForm) {
    // Show/hide clear button based on input content
    searchInput.addEventListener("input", function () {
      if (this.value.trim() !== "") {
        clearButton.classList.remove("hidden");
      } else {
        clearButton.classList.add("hidden");
      }
    });

    // Clear search input
    clearButton.addEventListener("click", () => {
      searchInput.value = "";
      clearButton.classList.add("hidden");
      searchInput.focus();
    });

    // Submit form on enter
    searchInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        if (searchInput.value.trim() !== "") {
          searchForm.submit();
        }
      }
    });

    // Initialize clear button visibility
    if (searchInput.value.trim() !== "") {
      clearButton.classList.remove("hidden");
    }
  }

  // Handle search result highlighting
  function highlightSearchTerms() {
    const query = searchInput ? searchInput.value.trim() : "";
    if (!query) return;

    const terms = query
      .toLowerCase()
      .split(" ")
      .filter((term) => term.length > 2);
    if (terms.length === 0) return;

    // Highlight in post content
    document.querySelectorAll(".post-text").forEach((element) => {
      const originalText = element.textContent || "";
      let highlightedText = originalText;

      terms.forEach((term) => {
        const regex = new RegExp(`(${term})`, "gi");
        highlightedText = highlightedText.replace(regex, "<mark>$1</mark>");
      });

      if (highlightedText !== originalText) {
        element.innerHTML = highlightedText;
      }
    });

    // Highlight in user bios
    document.querySelectorAll(".user-bio").forEach((element) => {
      const originalText = element.textContent || "";
      let highlightedText = originalText;

      terms.forEach((term) => {
        const regex = new RegExp(`(${term})`, "gi");
        highlightedText = highlightedText.replace(regex, "<mark>$1</mark>");
      });

      if (highlightedText !== originalText) {
        element.innerHTML = highlightedText;
      }
    });
  }

  // Run highlighting on page load
  highlightSearchTerms();
});
