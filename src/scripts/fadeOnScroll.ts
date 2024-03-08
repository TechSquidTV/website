document.addEventListener("DOMContentLoaded", () => {
  // Hides all elements with class "fade-on-scroll".
  // This ensures they are always visible when JavaScript is disabled.
  document.querySelectorAll(".fade-on-scroll").forEach((el) => {
    el.classList.add("fadeable");
  });

  // Fades in sections as user scrolls
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("fade-in-scroll");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.2,
    }
  );

  document.querySelectorAll(".fade-on-scroll").forEach((section) => {
    observer.observe(section);
  });
});
