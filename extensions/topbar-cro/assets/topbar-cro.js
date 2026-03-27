(function () {
  function initTopbar(root) {
    if (!root) return;

    var countdown = root.querySelector(".topbar-cro__countdown");
    if (countdown) {
      var endText = countdown.getAttribute("data-countdown-end");
      if (endText) {
        countdown.textContent = "Ends: " + endText;
      }
    }

    var closeBtn = root.querySelector(".topbar-cro__close");
    if (closeBtn) {
      closeBtn.addEventListener("click", function () {
        root.style.display = "none";
      });
    }
  }

  document.querySelectorAll(".topbar-cro").forEach(initTopbar);
})();
