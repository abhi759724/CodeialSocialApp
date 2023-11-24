class PostCommentTime {
  constructor(timestamp) {
    this.getTimeAgo(timestamp);
  }
  getTimeAgo(timestamp) {
    const now = new Date();
    const created = new Date(timestamp);
    const timeDiff = now - created;
    const seconds = Math.floor(timeDiff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 1) {
      return created.toDateString(); // Return the actual date if more than a day has passed
    } else if (days === 1) {
      return "Yesterday";
    } else if (hours >= 1) {
      return hours === 1 ? "1 hour ago" : `${hours} hours ago`;
    } else if (minutes >= 1) {
      return minutes === 1 ? "1 minute ago" : `${minutes} minutes ago`;
    } else {
      return "Just now";
    }
  }
}
