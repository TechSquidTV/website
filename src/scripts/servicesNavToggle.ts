document.addEventListener("DOMContentLoaded", () => {

  const primaryNav = document.querySelector("#services-nav") as HTMLElement;
  const secondaryNav = document.querySelector(
    "#services-nav-secondary"
  ) as HTMLElement;

  // Show secondary nav when the primary nav is not in view. Hide when it is.
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (! entry.isIntersecting) {
        secondaryNav.classList.remove("fade-out-scroll");
        secondaryNav.classList.add("fade-in-scroll");
      }
      else {
        secondaryNav.classList.remove("fade-in-scroll");
        secondaryNav.classList.add("fade-out-scroll");
      }
    });
  })
  observer.observe(primaryNav);
});
