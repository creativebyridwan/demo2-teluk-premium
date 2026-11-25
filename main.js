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

  /* ---------- Services: OvershootTicker Velox (port JS polos) ---------- */
  var mountOvershootTicker = function (root) {
    var stage = root.querySelector(".velox-overshoot-ticker__stage");
    var rail = root.querySelector(".velox-overshoot-ticker__rail");
    var slots = Array.prototype.slice.call(root.querySelectorAll(".velox-overshoot-ticker__slot"));
    if (!stage || !rail || slots.length < 4) return function () {};
    var loop = Math.floor(slots.length / 2);
    var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    var abort = new AbortController();
    var signal = abort.signal;
    var clones = new Map();
    var observer, resized, restyled;
    var disposed = false;
    var timer = 0;
    var dispose = function () {
      disposed = true;
      abort.abort();
      if (observer) observer.disconnect();
      if (resized) resized.disconnect();
      if (restyled) restyled.disconnect();
      clearTimeout(timer);
      clones.forEach(function (clone) { clone.remove(); });
      clones.clear();
      root.removeAttribute("data-snap");
      root.style.removeProperty("--k");
      stage.removeAttribute("tabindex");
    };
    try {
      var number = function (element, property, fallback) {
        var value = parseFloat(getComputedStyle(element).getPropertyValue(property));
        return Number.isFinite(value) ? value : fallback;
      };
      var size = "";
      var fill = function () {
        var width = slots[0].offsetWidth;
        var height = slots[0].offsetHeight;
        if (disposed || !width || !height) return;
        var next = stage.clientWidth + " " + stage.clientHeight + " " + width;
        if (next !== size) {
          root.setAttribute("data-snap", "");
          void root.offsetHeight;
          root.removeAttribute("data-snap");
        }
        size = next;
        var lead = number(stage, "--lead", 2);
        var stepX = width * (100 - number(root, "--overshoot-ticker-overlap", 15)) / 100;
        var stepY = stepX * Math.tan(number(root, "--overshoot-ticker-angle", 30) * Math.PI / 180);
        var reachX = stepX > 0 ? Math.ceil((stage.clientWidth + width) / 2 / stepX) : Infinity;
        var reachY = stepY > 0 ? Math.ceil((stage.clientHeight + height) / 2 / stepY) : Infinity;
        var reach = Math.min(24, Math.max(2, Math.min(reachX, reachY) + 1));
        var first = Math.floor(lead) - reach;
        var last = loop + Math.ceil(lead) + reach;
        clones.forEach(function (clone, i) {
          if (i >= first && i <= last) return;
          clone.remove();
          clones.delete(i);
        });
        for (var i = first; i <= last; i++) {
          if ((i >= 0 && i < slots.length) || clones.has(i)) continue;
          var clone = slots[((i % loop) + loop) % loop].cloneNode(true);
          clone.style.setProperty("--i", i);
          clone.setAttribute("aria-hidden", "true");
          clone.setAttribute("data-clone", "");
          rail.appendChild(clone);
          clones.set(i, clone);
        }
      };
      var geometry = function () {
        return ["--overshoot-ticker-card-max", "--overshoot-ticker-overlap", "--overshoot-ticker-angle"].map(function (name) { return root.style.getPropertyValue(name); }).join();
      };
      var lastGeometry = geometry();
      var restyle = function () {
        var next = geometry();
        if (next === lastGeometry) return;
        lastGeometry = next;
        fill();
      };
      var k = 0;
      var started = false;
      var onScreen = false;
      var hovered = stage.matches(":hover");
      var focused = root.matches(":focus-within");
      var pausesOnHover = function () { return root.getAttribute("data-pause-on-hover") !== "false"; };
      var sync = function () {
        if (disposed || !onScreen || (hovered && pausesOnHover()) || focused || reducedMotion.matches) {
          clearTimeout(timer);
          timer = 0;
          return;
        }
        if (timer) return;
        var dwell = number(root, "--overshoot-ticker-dwell", 750);
        var settle = number(root, "--overshoot-ticker-step", 900) + number(root, "--overshoot-ticker-stagger", 84) * 6;
        timer = setTimeout(advance, started ? settle + dwell : dwell);
      };
      var advance = function () {
        timer = 0;
        if (disposed) return;
        if (k >= loop) {
          root.setAttribute("data-snap", "");
          k -= loop;
          root.style.setProperty("--k", k);
          void root.offsetHeight;
          root.removeAttribute("data-snap");
        }
        k += 1;
        started = true;
        root.style.setProperty("--k", k);
        sync();
      };
      stage.setAttribute("tabindex", "0");
      stage.addEventListener("pointerenter", function () { hovered = true; sync(); }, { signal: signal });
      stage.addEventListener("pointerleave", function () { hovered = false; sync(); }, { signal: signal });
      root.addEventListener("focusin", function () { focused = true; sync(); }, { signal: signal });
      root.addEventListener("focusout", function () { focused = false; sync(); }, { signal: signal });
      reducedMotion.addEventListener("change", sync, { signal: signal });
      observer = new IntersectionObserver(function (entries) { onScreen = entries[0].isIntersecting; sync(); });
      observer.observe(root);
      fill();
      resized = new ResizeObserver(fill);
      resized.observe(stage);
      resized.observe(slots[0]);
      restyled = new MutationObserver(function () { restyle(); sync(); });
      restyled.observe(root, { attributes: true, attributeFilter: ["style", "data-pause-on-hover"] });
    } catch (error) {
      dispose();
      throw error;
    }
    return dispose;
  };
  var tickerRoot = document.getElementById("servicesTicker");
  if (tickerRoot) mountOvershootTicker(tickerRoot);

  /* ---------- Service modal (popup info lengkap) ---------- */
  var SERVICES = {
    "implant": {
      title: "زراعة الأسنان",
      img: "assets/service-implant.jpg",
      alt: "زراعة الأسنان، برغي زرعة يمسك بالملقط فوق نموذج فك",
      desc: "نعوض السن المفقود بزرعة تثبت في عظم الفك وتعمل كجذر طبيعي، ثم نركب عليها تاجا يشبه السن الطبيعي في الشكل واللون. قبل الزراعة نجهز تخطيطا رقميا ثلاثي الأبعاد ونعطيك خطة مكتوبة بالتكلفة والمدة.",
      price: "تبدأ من 2,199 د.ل. للزرعة الواحدة.",
      includes: ["تخطيط رقمي ثلاثي الأبعاد قبل الزراعة", "خطة مكتوبة بالتكلفة والمدة مسبقا", "متابعة بعد الزراعة للتأكد من ثبات النتيجة"]
    },
    "hollywood": {
      title: "ابتسامة هوليود",
      img: "assets/service-hollywood.jpg",
      alt: "ابتسامة هوليود، ابتسامة طبيعية",
      desc: "نصمم ابتسامة متكاملة تناسب ملامح وجهك ولون بشرتك، بالجمع بين التبييض والفينير حسب حاجتك، ونشرح لك الخيارات والتكلفة قبل أن نبدأ.",
      price: "التبييض يبدأ من 429 د.ل.، وتصميم ابتسامة هوليود يحدد بعد الاستشارة.",
      includes: ["تبييض الأسنان: 429 - 959 د.ل.", "الفينير: 489 - 1,099 د.ل. للسن الواحد", "تصميم متكامل يحدد بعد الاستشارة"]
    },
    "veneer": {
      title: "الفينير",
      img: "assets/service-veneer.jpg",
      alt: "الفينير، قشرة خزفية يمسك بها الملقط فوق نموذج أسنان",
      desc: "قشور خزفية رقيقة تلصق على واجهة السن لتصحيح اللون والشكل والفراغات الصغيرة، مع الحفاظ على السن الطبيعي قدر الإمكان.",
      price: "الفينير: 489 - 1,099 د.ل. للسن الواحد.",
      includes: ["قشور خزفية رقيقة", "تصحح اللون والشكل", "تحافظ على السن الطبيعي"]
    },
    "aligner": {
      title: "التقويم الشفاف",
      img: "assets/service-aligner.jpg",
      alt: "التقويم الشفاف، قالب شفاف يمسك به اليد",
      desc: "قوالب شفافة شبه غير مرئية تصحح اصطفاف الأسنان تدريجيا دون أسلاك معدنية، ويمكن إزالتها عند الأكل وتنظيف الأسنان.",
      price: "يحدد بعد الفحص والاستشارة.",
      includes: ["قوالب شفافة شبه غير مرئية", "بدون أسلاك معدنية", "قابلة للإزالة عند الأكل وتنظيف الأسنان"]
    },
    "root-canal": {
      title: "علاج الجذور",
      img: "assets/service-root-canal.jpg",
      alt: "علاج الجذور، ملف قناة الجذر تحت المجهر مع حاجز مطاطي",
      desc: "علاج دقيق يزيل الالتهاب من داخل السن ويحافظ عليه بدلا من خلعه، ثم نغلق القناة بحشو يحمي السن على المدى الطويل.",
      price: "علاج الجذور: يحدد بعد الفحص.",
      includes: ["حشو تجميلي: 86 - 189 د.ل.", "حشوات بلون السن الطبيعي", "علاج دقيق يحافظ على السن الطبيعي"]
    },
    "filling": {
      title: "حشو الأسنان",
      img: "assets/service-filling.jpg",
      alt: "حشو الأسنان، علاج السن",
      desc: "نعالج التسوس بحشوات تجميلية بلون السن الطبيعي، تعيد للسن شكله ووظيفته وتحافظ على بنيته.",
      price: "الحشو التجميلي: 86 - 189 د.ل.",
      includes: ["حشوات تجميلية بلون السن الطبيعي", "تدوم طويلا", "تحافظ على بنية السن"]
    },
    "cleaning": {
      title: "تنظيف الأسنان",
      img: "assets/service-cleaning.jpg",
      alt: "تنظيف الأسنان بالموجات فوق الصوتية",
      desc: "جلسة تنظيف وتلميع تزيل الجير والتصبغات وتحافظ على صحة اللثة، مع فحص شامل للأسنان واللثة.",
      price: "الكشف والاستشارة يبدآن من 27 د.ل.",
      includes: ["فحص شامل للثة والأسنان", "تنظيف بالموجات فوق الصوتية", "تلميع يحافظ على بياض الأسنان"]
    }
  };
  var modal = document.getElementById("serviceModal");
  var modalImg = document.getElementById("serviceModalImg");
  var modalTitle = document.getElementById("serviceModalTitle");
  var modalDesc = document.getElementById("serviceModalDesc");
  var modalPrice = document.getElementById("serviceModalPrice");
  var modalIncludes = document.getElementById("serviceModalIncludes");
  var lastTrigger = null;
  function openServiceModal(key, trigger) {
    var data = SERVICES[key];
    if (!data || !modal) return;
    lastTrigger = trigger || null;
    modalImg.src = data.img;
    modalImg.alt = data.alt;
    modalTitle.textContent = data.title;
    modalDesc.textContent = data.desc;
    modalPrice.textContent = data.price;
    modalIncludes.innerHTML = "";
    data.includes.forEach(function (item) {
      var li = document.createElement("li");
      var check = document.createElement("span");
      check.setAttribute("aria-hidden", "true");
      check.textContent = "✓";
      li.appendChild(check);
      li.appendChild(document.createTextNode(item));
      modalIncludes.appendChild(li);
    });
    modal.hidden = false;
    document.body.classList.add("modal-open");
    var closeBtn = modal.querySelector(".service-modal__close");
    if (closeBtn) closeBtn.focus();
  }
  function closeServiceModal() {
    if (!modal || modal.hidden) return;
    modal.hidden = true;
    document.body.classList.remove("modal-open");
    if (lastTrigger) lastTrigger.focus();
  }
  if (modal) {
    document.querySelectorAll(".service-card__more").forEach(function (btn) {
      btn.addEventListener("click", function () { openServiceModal(btn.getAttribute("data-service"), btn); });
    });
    modal.querySelectorAll("[data-close]").forEach(function (el) {
      el.addEventListener("click", closeServiceModal);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeServiceModal();
    });
  }
})();
