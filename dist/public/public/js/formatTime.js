function formatTime(createdAt) {
  const now = new Date();

  // Ensure createdAt is a Date object
  const createdDate = createdAt instanceof Date ? createdAt : new Date(createdAt);

  // Check if the date is valid
  if (isNaN(createdDate.getTime())) {
    return "Invalid date";
  }

  const diffMs = now.getTime() - createdDate.getTime();

  // Calculate time differences
  const diffSeconds = Math.floor(diffMs / 1000);
  if (diffSeconds < 60) {
    return diffSeconds + "s ago";
  }

  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  if (diffMinutes < 60) {
    return diffMinutes + "m ago";
  }

  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffHours < 24) {
    return diffHours + "h ago";
  }

  // For older than 24 hours - show formatted date
  return createdDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export { formatTime };
