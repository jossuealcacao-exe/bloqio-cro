(function () {
  function safeReadStorage(key) {
    try {
      return window.localStorage.getItem(key);
    } catch (error) {
      return null;
    }
  }

  function safeWriteStorage(key, value) {
    try {
      window.localStorage.setItem(key, value);
    } catch (error) {
      // Ignore storage errors (private mode or blocked storage).
    }
  }

  function parseEndDate(raw) {
    if (!raw) return null;
    var normalized = raw.trim().replace(" ", "T");
    var parsed = new Date(normalized);
    if (isNaN(parsed.getTime())) return null;
    return parsed;
  }

  function formatRemaining(ms) {
    var totalSeconds = Math.floor(ms / 1000);
    var days = Math.floor(totalSeconds / 86400);
    var hours = Math.floor((totalSeconds % 86400) / 3600);
    var minutes = Math.floor((totalSeconds % 3600) / 60);
    var seconds = totalSeconds % 60;

    function pad(value) {
      return String(value).padStart(2, "0");
    }

    return (
      pad(days) + "d " + pad(hours) + "h " + pad(minutes) + "m " + pad(seconds) + "s"
    );
  }

  function initCountdown(root) {
    var countdown = root.querySelector(".topbar-cro__countdown");
    if (!countdown) return;

    var endText = countdown.getAttribute("data-countdown-end");
    var endDate = parseEndDate(endText);
    if (!endDate) {
      countdown.textContent = "Invalid end date";
      return;
    }

    function tick() {
      var remaining = endDate.getTime() - Date.now();
      if (remaining <= 0) {
        countdown.textContent = "00d 00h 00m 00s";
        window.clearInterval(timerId);
        return;
      }
      countdown.textContent = formatRemaining(remaining);
    }

    tick();
    var timerId = window.setInterval(tick, 1000);
  }

  function initTopbar(root) {
    if (!root) return;

    var storageKey = root.getAttribute("data-storage-key");
    var isClosable = root.getAttribute("data-closable") === "true";

    if (isClosable && storageKey && safeReadStorage(storageKey) === "1") {
      root.style.display = "none";
      return;
    }

    initCountdown(root);

    var closeBtn = root.querySelector(".topbar-cro__close");
    if (closeBtn && isClosable) {
      closeBtn.addEventListener("click", function () {
        root.style.display = "none";
        if (storageKey) {
          safeWriteStorage(storageKey, "1");
        }
      });
    }
  }

  document.querySelectorAll(".topbar-cro").forEach(initTopbar);
})();
