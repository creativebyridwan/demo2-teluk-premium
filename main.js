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

  /* ---------- Hero coverflow ala Hero 231 (RTL: DIR = -1) ---------- */
  var heroCards = Array.prototype.slice.call(document.querySelectorAll(".hero-card"));
  var heroStage = document.getElementById("heroStage");
  var heroDots = document.getElementById("heroDots");
  if (heroCards.length && heroStage && heroDots) {
    var DIR = document.documentElement.dir === "rtl" ? -1 : 1;
    var heroN = heroCards.length;
    var heroCurrent = 0;
    var heroTimer = null;
    var heroReduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    var heroOffset = function (i) {
      var d = (i - heroCurrent + heroN) % heroN;
      if (d > heroN / 2) d -= heroN;
      return d;
    };
    var heroRender = function () {
      heroCards.forEach(function (card, i) {
        var off = heroOffset(i);
        var abs = Math.abs(off);
        if (abs > 2) { card.hidden = true; return; }
        card.hidden = false;
        var x = off * 62 * DIR;
        var rot = off * -32 * DIR;
        var z = -abs * 90;
        var scale = 1 - abs * 0.12;
        card.style.transform = "translateX(" + x + "%) rotateY(" + rot + "deg) translateZ(" + z + "px) scale(" + scale + ")";
        card.style.zIndex = String(10 - abs);
        card.style.opacity = String(1 - abs * 0.28);
      });
      Array.prototype.forEach.call(heroDots.children, function (dot, i) {
        dot.setAttribute("aria-current", i === heroCurrent ? "true" : "false");
      });
    };
    var heroStop = function () { if (heroTimer) { clearInterval(heroTimer); heroTimer = null; } };
    var heroRestart = function () {
      if (heroReduce) return;
      heroStop();
      heroTimer = setInterval(heroNext, 3500);
    };
    var heroGoTo = function (i) { heroCurrent = (i + heroN) % heroN; heroRender(); heroRestart(); };
    var heroNext = function () { heroGoTo(heroCurrent + 1); };
    var heroPrev = function () { heroGoTo(heroCurrent - 1); };

    heroCards.forEach(function (card, i) {
      var dot = document.createElement("button");
      dot.type = "button";
      dot.className = "hero-dot";
      dot.setAttribute("role", "tab");
      dot.setAttribute("aria-label", "عرض الصورة " + (i + 1));
      dot.addEventListener("click", function () { heroGoTo(i); });
      heroDots.appendChild(dot);
    });
    var heroNextBtn = document.getElementById("heroNext");
    var heroPrevBtn = document.getElementById("heroPrev");
    if (heroNextBtn) heroNextBtn.addEventListener("click", heroNext);
    if (heroPrevBtn) heroPrevBtn.addEventListener("click", heroPrev);
    heroStage.addEventListener("mouseenter", heroStop);
    heroStage.addEventListener("mouseleave", heroRestart);
    heroStage.addEventListener("focusin", heroStop);
    heroStage.addEventListener("focusout", heroRestart);
    document.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") heroNext();
      if (e.key === "ArrowRight") heroPrev();
    });
    var heroStartX = null;
    heroStage.addEventListener("pointerdown", function (e) { heroStartX = e.clientX; });
    heroStage.addEventListener("pointerup", function (e) {
      if (heroStartX === null) return;
      var dx = e.clientX - heroStartX;
      if (dx < -40) heroNext();
      if (dx > 40) heroPrev();
      heroStartX = null;
    });
    heroRender();
    heroRestart();
  }

  /* ---------- AnimatedCounter: angka stats naik saat terlihat ---------- */
  var statNums = Array.prototype.slice.call(document.querySelectorAll(".stat__num"));
  var counterReduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var formatNum = function (value, decimals) {
    if (decimals > 0) return value.toFixed(decimals);
    return Math.round(value).toLocaleString("en-US");
  };
  var animateNum = function (el) {
    var target = parseFloat(el.getAttribute("data-target") || "0");
    var prefix = el.getAttribute("data-prefix") || "";
    var decimals = parseInt(el.getAttribute("data-decimals") || "0", 10);
    var duration = 1400;
    var start = null;
    var step = function (now) {
      if (start === null) start = now;
      var p = Math.min((now - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = prefix + formatNum(target * eased, decimals);
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  if (statNums.length && !counterReduce && "IntersectionObserver" in window) {
    statNums.forEach(function (el) {
      var prefix = el.getAttribute("data-prefix") || "";
      var decimals = parseInt(el.getAttribute("data-decimals") || "0", 10);
      el.textContent = prefix + formatNum(0, decimals);
    });
    var counterIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target.querySelector(".stat__num");
        if (el && !el.getAttribute("data-counted")) {
          el.setAttribute("data-counted", "true");
          animateNum(el);
        }
        counterIO.unobserve(entry.target);
      });
    }, { threshold: 0.4 });
    document.querySelectorAll(".stat").forEach(function (stat) { counterIO.observe(stat); });
  }

  /* ---------- Testimoni carousel (satu tampil, autoplay 5 detik) ---------- */
  var testiSlides = Array.prototype.slice.call(document.querySelectorAll(".testi"));
  var testiCarousel = document.getElementById("testiCarousel");
  var testiDots = document.getElementById("testiDots");
  if (testiSlides.length && testiCarousel && testiDots) {
    var testiN = testiSlides.length;
    var testiCurrent = 0;
    var testiTimer = null;
    var testiReduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var testiRender = function () {
      testiSlides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === testiCurrent);
      });
      Array.prototype.forEach.call(testiDots.children, function (dot, i) {
        dot.setAttribute("aria-current", i === testiCurrent ? "true" : "false");
      });
    };
    var testiStop = function () { if (testiTimer) { clearInterval(testiTimer); testiTimer = null; } };
    var testiRestart = function () {
      if (testiReduce) return;
      testiStop();
      testiTimer = setInterval(testiNext, 5000);
    };
    var testiGoTo = function (i) { testiCurrent = (i + testiN) % testiN; testiRender(); testiRestart(); };
    var testiNext = function () { testiGoTo(testiCurrent + 1); };
    var testiPrev = function () { testiGoTo(testiCurrent - 1); };
    testiSlides.forEach(function (slide, i) {
      var dot = document.createElement("button");
      dot.type = "button";
      dot.className = "testi-dot";
      dot.setAttribute("role", "tab");
      dot.setAttribute("aria-label", "عرض الرأي " + (i + 1));
      dot.addEventListener("click", function () { testiGoTo(i); });
      testiDots.appendChild(dot);
    });
    var testiNextBtn = document.getElementById("testiNext");
    var testiPrevBtn = document.getElementById("testiPrev");
    if (testiNextBtn) testiNextBtn.addEventListener("click", testiNext);
    if (testiPrevBtn) testiPrevBtn.addEventListener("click", testiPrev);
    testiCarousel.addEventListener("mouseenter", testiStop);
    testiCarousel.addEventListener("mouseleave", testiRestart);
    testiCarousel.addEventListener("focusin", testiStop);
    testiCarousel.addEventListener("focusout", testiRestart);
    document.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") testiNext();
      if (e.key === "ArrowRight") testiPrev();
    });
    testiRender();
    testiRestart();
  }
})();
