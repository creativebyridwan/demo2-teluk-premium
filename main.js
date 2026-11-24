/* عيادة النخبة — Demo 2 "Teluk Premium" (biru)
   Vanilla JS. RTL-aware (range input membalik otomatis di RTL). */
(function () {
  "use strict";

  /* ---------- Mobile nav ---------- */
  var header = document.getElementById("siteHeader");
  var navToggle = document.getElementById("navToggle");
  if (navToggle && header) {
    navToggle.addEventListener("click", function () {
      var open = header.classList.toggle("nav-open");
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
      navToggle.setAttribute("aria-label", open ? "إغلاق القائمة" : "فتح القائمة");
    });
    header.querySelectorAll(".main-nav a").forEach(function (link) {
      link.addEventListener("click", function () {
        header.classList.remove("nav-open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------- Header shadow via sentinel (tanpa scroll listener) ---------- */
  var sentinel = document.getElementById("headerSentinel");
  if (sentinel && header && "IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      header.classList.toggle("is-scrolled", !entries[0].isIntersecting);
    }).observe(sentinel);
  }

  /* ---------- Reveal on scroll ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var revealIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealIO.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(function (el) { revealIO.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---------- FAQ accordion ---------- */
  document.querySelectorAll(".faq-item").forEach(function (item) {
    var btn = item.querySelector(".faq-q");
    var panel = item.querySelector(".faq-a");
    if (!btn || !panel) return;
    btn.addEventListener("click", function () {
      var isOpen = item.classList.contains("is-open");
      document.querySelectorAll(".faq-item.is-open").forEach(function (other) {
        if (other !== item) {
          other.classList.remove("is-open");
          other.querySelector(".faq-q").setAttribute("aria-expanded", "false");
          other.querySelector(".faq-a").style.maxHeight = "0px";
        }
      });
      item.classList.toggle("is-open", !isOpen);
      btn.setAttribute("aria-expanded", !isOpen ? "true" : "false");
      panel.style.maxHeight = !isOpen ? panel.scrollHeight + "px" : "0px";
    });
  });

  /* ---------- Before / after slider ----------
     Range input di RTL: nilai 0 عند الطرف الأيمن، 100 عند الأيسر.
     --pos = نسبة "قبل" الظاهرة من جهة اليمين. */
  var baRange = document.getElementById("baRange");
  var baAfter = document.getElementById("baAfter");
  var baHandle = document.getElementById("baHandle");
  if (baRange && baAfter && baHandle) {
    var setPos = function (value) {
      var pos = Math.max(0, Math.min(100, Number(value)));
      baAfter.style.setProperty("--pos", pos + "%");
      baHandle.style.setProperty("--pos", pos + "%");
    };
    baRange.addEventListener("input", function () { setPos(baRange.value); });
    setPos(baRange.value);
  }

  /* ---------- Booking form (tanpa backend) ---------- */
  var form = document.getElementById("bookingForm");
  var success = document.getElementById("bookingSuccess");
  var resetBtn = document.getElementById("bookingReset");
  if (form && success) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var name = document.getElementById("bkName");
      var phone = document.getElementById("bkPhone");
      var service = document.getElementById("bkService");
      var valid = true;
      [name, phone, service].forEach(function (field) {
        if (!field.value || !field.value.trim()) {
          field.style.borderColor = "#B3261E";
          valid = false;
        } else {
          field.style.borderColor = "";
        }
      });
      if (!valid) return;
      form.style.display = "none";
      success.classList.add("is-shown");
      success.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }
  if (resetBtn && form && success) {
    resetBtn.addEventListener("click", function () {
      form.reset();
      form.style.display = "";
      success.classList.remove("is-shown");
    });
  }
})();
