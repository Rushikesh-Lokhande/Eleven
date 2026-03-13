// Shared UI behaviours: nav, footer year, smooth anchors

document.addEventListener("DOMContentLoaded", function () {
    var navToggle = document.getElementById("nav-toggle");
    var mainNav = document.getElementById("main-nav");
  
    if (navToggle && mainNav) {
      navToggle.addEventListener("click", function () {
        mainNav.classList.toggle("open");
      });
  
      mainNav.addEventListener("click", function (evt) {
        if (evt.target.matches("a.nav-link")) {
          mainNav.classList.remove("open");
        }
      });
    }
  
    var yearEl = document.getElementById("footer-year");
    if (yearEl) {
      yearEl.textContent = new Date().getFullYear().toString();
    }
  
    // Smooth scroll for same-page links
    document.body.addEventListener("click", function (evt) {
      var link = evt.target.closest("a[href^='#']");
      if (!link) return;
      var targetId = link.getAttribute("href").slice(1);
      if (!targetId) return;
      var target = document.getElementById(targetId);
      if (!target) return;
      evt.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });