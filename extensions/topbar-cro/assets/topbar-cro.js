(function () {
  function mountTopbarToBody(root) {
    if (!root || !document.body) return;
    if (root.parentElement !== document.body) {
      document.body.appendChild(root);
    }
  }

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

  function updateLayoutOffset(root) {
    if (!root || !document.body) return;
    var isClosed = root.style.display === "none";
    var isHidden = root.classList.contains("topbar-cro--hidden");
    var offset = !isClosed && !isHidden ? root.offsetHeight : 0;
    document.body.style.paddingTop = offset > 0 ? offset + "px" : "";
  }

  function scheduleLayoutOffsetUpdate(root) {
    window.requestAnimationFrame(function () {
      updateLayoutOffset(root);
    });
  }

  function setHiddenState(root, hidden) {
    if (!root) return;
    var wasHidden = root.classList.contains("topbar-cro--hidden");
    root.classList.toggle("topbar-cro--hidden", hidden);
    if (hidden) {
      updateLayoutOffset(root);
      return;
    }

    if (wasHidden) {
      window.setTimeout(function () {
        updateLayoutOffset(root);
        scheduleLayoutOffsetUpdate(root);
      }, 220);
    } else {
      updateLayoutOffset(root);
    }
  }

  function initSmartScroll(root) {
    var nearTopThreshold = 24;

    function onScroll() {
      var currentY = window.pageYOffset || 0;

      if (currentY <= nearTopThreshold) {
        setHiddenState(root, false);
        return;
      }

      setHiddenState(root, true);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", function () {
      scheduleLayoutOffsetUpdate(root);
    });
  }

  function initTopbar(root) {
    if (!root) return;
    if (root.getAttribute("data-topbar-cro-initialized") === "1") return;

    mountTopbarToBody(root);
    root.setAttribute("data-topbar-cro-initialized", "1");

    var storageKey = root.getAttribute("data-storage-key");
    var isClosable = root.getAttribute("data-closable") === "true";

    if (isClosable && storageKey && safeReadStorage(storageKey) === "1") {
      root.style.display = "none";
      updateLayoutOffset(root);
      return;
    }

    initSmartScroll(root);
    initCountdown(root);
    updateLayoutOffset(root);
    scheduleLayoutOffsetUpdate(root);

    var closeBtn = root.querySelector(".topbar-cro__close");
    if (closeBtn && isClosable) {
      closeBtn.addEventListener("click", function () {
        root.style.display = "none";
        updateLayoutOffset(root);
        if (storageKey) {
          safeWriteStorage(storageKey, "1");
        }
      });
    }
  }

  document.querySelectorAll(".topbar-cro").forEach(initTopbar);
})();
