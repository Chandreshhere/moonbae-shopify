let mm = gsap.matchMedia();
gsap.registerPlugin(Observer);
// add a media query. When it matches, the associated function will run
mm.add("(min-width: 800px)", () => {});

CustomEase.create(
  "loaderEase",
  "M0,0,C0,0,0.10,0.34,0.238,0.442,0.305,0.506,0.322,0.514,0.396,0.54,0.478,0.568,0.468,0.56,0.522,0.584,0.572,0.606,0.61,0.719,0.714,0.826,0.798,0.912,1,1,1,1"
);

CustomEase.create("ease-1", "M0,0 C0.15,0 0.15,1 1,1");

CustomEase.create(
  "ease-2",
  "M0,0 C0.071,0.505 0.192,0.726 0.318,0.852 0.45,0.984 0.504,1 1,1"
);

CustomEase.create("ease-3", "0.65, 0.01, 0.05, 0.99");

let splitText;
let richTextSplit;
let stickySplit;
function runSplit() {
  splitText = new SplitType("[split-it]", {
    types: "lines, words",
    lineClass: "s-l",
    wordClass: "s-w",
  });

  richTextSplit = new SplitType("[split-rich] p", {
    types: "lines, words",
    lineClass: "s-l",
    wordClass: "s-w",
  });

  stickySplit = new SplitType("[team-split] p", {
    types: "lines, words",
    lineClass: "s-l",
  });
}
runSplit();

let windowWidth = $(window).innerWidth();
window.addEventListener("resize", function () {
  if (windowWidth !== $(window).innerWidth()) {
    windowWidth = $(window).innerWidth();
    splitText.revert();
    richTextSplit.revert();
    stickySplit.revert();
    runSplit();
  }
});

function addLenisPreventAttribute() {
  $(".cart-list").attr("data-lenis-prevent", "");
}

$(".date").text(new Date().getFullYear());

// Keep the fixed nav sitting directly under the announcement banner while the
// banner is on screen, and flush to the top once it has scrolled away. Reads
// the banner's own rect rather than assuming a height, so a two-line message
// on a phone is handled the same as one line on desktop.
(function navFollowsBanner() {
  const nav = () => document.querySelector(".orgc-nav");
  let queued = false;
  function apply() {
    queued = false;
    if (!nav()) return;
    // No banner is a real answer, not a reason to give up: the bar can be set
    // to the home page only, and bailing out here left the last page's offset
    // in place, so the header on every other page hung a banner's height below
    // the top of the screen with nothing above it.
    const bar = document.querySelector(".announcement-bar");
    const offset = bar ? Math.max(0, bar.getBoundingClientRect().bottom) : 0;
    document.documentElement.style.setProperty("--announcement-offset", offset + "px");
  }
  function onScroll() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(apply);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
  // This runs at parse time, before the banner exists in the DOM, so the first
  // apply() found nothing and the nav started flush at 0 — overlapping the
  // banner until the first scroll. Re-apply once the document is built.
  document.addEventListener("DOMContentLoaded", apply);
  window.addEventListener("load", apply);

  // lenis and barba are declared with const further down this file. Touching
  // them from here — even with typeof, which throws for a const in its
  // temporal dead zone rather than returning "undefined" — aborts the whole
  // script. Defer to a task that runs after this file has finished executing.
  setTimeout(function attachScrollSources() {
    try {
      if (lenis && lenis.on) lenis.on("scroll", onScroll);
    } catch (e) {}
    try {
      // Barba swaps the container, not the banner, but the nav is inside the
      // container — so re-apply after a transition or the new nav starts at 0.
      if (barba && barba.hooks) barba.hooks.after(apply);
    } catch (e) {}
  }, 0);

  apply();
})();

// Tab-away message. Swaps the document title while the tab is in the
// background and restores the real one on return — including whatever the
// Barba transition set it to, so it never restores a stale page's title.
(function tabAwayMessage() {
  const raw = document.documentElement.getAttribute("data-tab-away-text");
  if (!raw) return;
  // Pipe-separated in theme settings so a merchant can write as many as they
  // like without touching this file.
  const lines = raw.split("|").map((s) => s.trim()).filter(Boolean);
  if (!lines.length) return;

  let realTitle = document.title;
  let timer;
  let i = -1;

  // Start somewhere random, then walk the list — so someone who tabs away
  // twice does not get the same line both times.
  const next = () => {
    if (lines.length === 1) return lines[0];
    i = i < 0 ? Math.floor(Math.random() * lines.length) : (i + 1) % lines.length;
    return lines[i];
  };

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      realTitle = document.title;
      document.title = next();
      // Cycle slowly: a title that changes too fast reads as a glitch.
      timer = setInterval(() => { document.title = next(); }, 4000);
    } else {
      clearInterval(timer);
      document.title = realTitle;
    }
  });
})();

const lenis = new Lenis();

lenis.on("scroll", ScrollTrigger.update);

gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});
// With Lenis driving scroll, GSAP's lag smoothing makes a dropped frame jump
// the timeline to "catch up", which reads as a stutter on scrubbed animations.
gsap.ticker.lagSmoothing(0);

function footerImgFollow() {
  let footerProductsList = $(".footer-products_list");
  let footerImgFollowWrap = $(".footer-img_follow-wrap");

  if (!footerProductsList.length || !footerImgFollowWrap.length) return;

  // Preload all images
  let imageSrcs = [];
  $("[footer-img_trigger]").each(function () {
    let src = $(this).find(".m-product-img_wrap img").attr("src");
    if (src) {
      imageSrcs.push(src);
      let preloadImg = new Image();
      preloadImg.src = src;
    }
  });

  mm.add("(min-width: 992px) and (pointer: fine)", () => {
    footerProductsList.on("mouseenter", function () {
      gsap.fromTo(
        footerImgFollowWrap[0],
        {
          clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
        },
        {
          clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
          duration: 0.6,
          ease: "expo.inOut",
        }
      );
    });

    footerProductsList.on("mouseleave", function () {
      gsap.to(footerImgFollowWrap[0], {
        clipPath: "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)",
        duration: 0.6,
        ease: "expo.inOut",
      });
    });

    let followHeight = footerImgFollowWrap.outerHeight();
    let initialOffset;

    let followYTl = gsap.quickTo(footerImgFollowWrap[0], "y", {
      duration: 0.4,
      ease: "power3",
    });

    let lastMouseY = null;
    let isHovering = false;
    let currentSrc = null;

    // Create a single image element to reuse
    let followImg = $("<img>").addClass("img-fill");
    footerImgFollowWrap.append(followImg);

    // Function to calculate dimensions
    const calculateDimensions = () => {
      gsap.set(footerImgFollowWrap[0], { y: 0 });
      followHeight = footerImgFollowWrap.outerHeight();
      let listRect = footerProductsList[0].getBoundingClientRect();
      let followRect = footerImgFollowWrap[0].getBoundingClientRect();
      initialOffset = followRect.top - listRect.top;
    };

    // Initial calculation
    calculateDimensions();

    // Debounced resize handler
    let resizeTimeout;
    $(window).on("resize", function () {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(function () {
        calculateDimensions();
      }, 150);
    });

    const updateFollowPosition = (clientY) => {
      let listRect = footerProductsList[0].getBoundingClientRect();

      let mouseRelativeToList = clientY - listRect.top;
      let targetTopInList = mouseRelativeToList - followHeight / 2;

      targetTopInList = Math.max(0, targetTopInList);
      targetTopInList = Math.min(
        targetTopInList,
        listRect.height - followHeight
      );

      let requiredY = targetTopInList - initialOffset;

      followYTl(requiredY);
    };

    footerProductsList.on("mouseenter", function () {
      isHovering = true;
    });

    footerProductsList.on("mousemove", function (e) {
      lastMouseY = e.clientY;
      updateFollowPosition(e.clientY);

      // Find which trigger we're over and update image
      let trigger = $(e.target).closest("[footer-img_trigger]");
      if (trigger.length) {
        let imgSrc = trigger.find(".m-product-img_wrap img").attr("src");
        if (imgSrc && imgSrc !== currentSrc) {
          currentSrc = imgSrc;
          followImg.attr("src", imgSrc);
        }
      }
    });

    footerProductsList.on("mouseleave", function () {
      isHovering = false;
      lastMouseY = null;
      currentSrc = null;
    });

    $(window).on("scroll", function () {
      if (isHovering && lastMouseY !== null) {
        updateFollowPosition(lastMouseY);
      }
    });
  });
}

//Home Slider
function globalScripts() {
  lenis.resize();
  lenis.start();
  addLenisPreventAttribute();
  ScrollTrigger.refresh();

  // ScrollTrigger measures the page once, here, before lazy images have
  // arrived. Every pinned and triggered section is then anchored to a height
  // the page no longer has, which is why a reload "fixed" the layout: the
  // second time the images came from cache and were there to be measured.
  // Re-measure as they land, debounced so a gallery does not thrash it.
  (function remeasureWhenImagesLand() {
    let pending;
    let lastHeight = document.documentElement.scrollHeight;
    const commit = () => {
      // Refreshing while the user is scrolling recomputes every scrubbed
      // value mid-motion, which shows up as a jump. Wait for a still moment.
      if (lenis.isScrolling) return void (pending = setTimeout(commit, 200));
      const h = document.documentElement.scrollHeight;
      if (h === lastHeight) return; // nothing moved; a refresh would only cost a jump
      lastHeight = h;
      // Lenis clamps scrolling to a limit it measured when the page was still
      // short, so re-measure that too or the page cannot be scrolled to its
      // new bottom until Lenis notices on its own.
      lenis.resize();
      ScrollTrigger.refresh();
    };
    const refresh = () => {
      clearTimeout(pending);
      pending = setTimeout(commit, 200);
    };
    window.addEventListener("load", refresh, { once: true });
    document.querySelectorAll("img").forEach((img) => {
      if (img.complete) return;
      img.addEventListener("load", refresh, { once: true });
      img.addEventListener("error", refresh, { once: true });
    });
  })();
  //Counting items
  $("[count-items=wrap]").each(function () {
    const countWrap = $(this);
    const itemCount = countWrap.find("[count-items=item]").length;
    countWrap
      .find("[count-items=total]")
      .text(itemCount.toString().padStart(2, "0"));
  });

  $(".page-main").each(function () {
    let pageEl = $(this);
    let navEl = pageEl.find(".orgc-nav");
    let navToggleEl = pageEl.find(".nav-component");
    let footerEl = pageEl.find(".footer");
    let cursorItem = pageEl.find(".cursor");
    let ctaCursorWrap = pageEl.find("[cta-cursor_wrap]");
    let cursorParagraph = cursorItem.find("p");
    let targets = pageEl.find("[data-cursor]");
    let floatingSvg = pageEl.find(".floating-icon_svg-wrap");
    let aboutHero = pageEl.find(".about-hero");
    let xOffset = 60;
    let yOffset = 60;
    let cursorIsOnRight = false;
    let currentTarget = null;
    let lastText = "";
    let darkTriggers = pageEl.find("[nav-dark]");
    let lightTriggers = pageEl.find("[nav-light]");
    darkTriggers.each(function () {
      ScrollTrigger.create({
        trigger: $(this),
        start: "top top",
        end: "bottom top",
        // markers: true,
        onEnter: () => {
          $(navToggleEl).addClass("dark");
        },
        onEnterBack: () => {
          $(navToggleEl).addClass("dark");
        },
      });
    });

    {
      // ScrollTrigger only fires on a scroll boundary, so at scroll 0 neither
      // set has run and the nav keeps whatever colour it loaded with. Seed it
      // from whichever trigger comes first in the page.
      const firstTrigger = pageEl.find("[nav-dark],[nav-light]").first();
      if (firstTrigger.length) {
        $(navToggleEl).toggleClass("dark", firstTrigger.is("[nav-dark]"));
      }
    }

    lightTriggers.each(function () {
      ScrollTrigger.create({
        trigger: $(this),
        start: "top top",
        end: "bottom top",
        // markers: true,
        onEnter: () => {
          $(navToggleEl).removeClass("dark");
        },
        onEnterBack: () => {
          $(navToggleEl).removeClass("dark");
        },
      });
    });

    aboutHero.each(function () {
      ScrollTrigger.create({
        trigger: $(this),
        start: "top top",
        end: "bottom top",
        // markers: true,
        onEnter: () => {
          $(navToggleEl).removeClass("dark");
        },
        onEnterBack: () => {
          $(navToggleEl).removeClass("dark");
        },
      });
    });

    mm.add("(min-width: 992px) and (pointer: fine)", () => {
      ctaCursorWrap.each(function () {
        let $wrap = $(this);
        let $cursor = $wrap.find("[cta-cursor_el]");
        let cursorHeight = $cursor.outerHeight();

        let cursorYTl = gsap.quickTo($cursor[0], "y", {
          duration: 0.4,
          ease: "power3",
        });
        let lastMouseY = null;

        const updateCursor = (clientY) => {
          let rect = $wrap[0].getBoundingClientRect();
          relativeY = clientY - rect.top - cursorHeight / 2;
          relativeY = Math.max(
            0,
            Math.min(relativeY, rect.height - cursorHeight)
          );
          cursorYTl(relativeY);
        };

        $wrap.on("mousemove mouseover", function (e) {
          lastMouseY = e.clientY;
          updateCursor(e.clientY);
        });

        $(window).on("scroll", function () {
          if (lastMouseY !== null) {
            updateCursor(lastMouseY);
          }
        });
      });

      gsap.set(cursorItem, { xPercent: xOffset, yPercent: yOffset });

      let xTo = gsap.quickTo(cursorItem[0], "x", { ease: "power3" });
      let yTo = gsap.quickTo(cursorItem[0], "y", { ease: "power3" });

      $(window).on("mousemove", function (e) {
        let windowWidth = $(window).width();
        let windowHeight = $(window).height();
        let scrollY = $(window).scrollTop();
        let cursorX = e.clientX;
        let cursorY = e.clientY + scrollY;
        let xPercent = xOffset;
        let yPercent = yOffset;

        if (cursorX > windowWidth * 0.9) {
          cursorIsOnRight = true;
          xPercent = -100;
        } else {
          cursorIsOnRight = false;
        }
        if (cursorY > scrollY + windowHeight * 0.9) {
          yPercent = -100;
        }

        if (currentTarget) {
          let newText = currentTarget.attr("data-cursor");
          if (currentTarget.is("[data-easteregg]") && cursorIsOnRight) {
            newText = currentTarget.attr("data-easteregg");
          }

          if (newText !== lastText) {
            cursorParagraph.html(newText);
            lastText = newText;
          }
        }

        gsap.to(cursorItem, {
          xPercent: xPercent,
          yPercent: yPercent,
          duration: 0.1,
          ease: "power3",
        });

        xTo(cursorX);
        yTo(cursorY - scrollY);
      });

      targets.each(function () {
        let target = $(this);
        target.on("mousemove", function () {
          $("body").addClass("c-vis");
        });
        target.on("mouseleave", function () {
          $("body").removeClass("c-vis");
        });
        target.on("mouseover", function () {
          currentTarget = target;
          let newText = target.is("[data-easteregg]")
            ? target.attr("data-easteregg")
            : target.attr("data-cursor");

          if (newText !== lastText) {
            cursorParagraph.html(newText);
            lastText = newText;
          }
        });
      });
    });
    if (footerEl.length) {
      ScrollTrigger.create({
        trigger: footerEl,
        start: "clamp(top 20%)",
        onEnter: () => {
          navEl.addClass("pull-up");
        },
        onLeaveBack: () => {
          navEl.removeClass("pull-up");
        },
      });
    }

    let floatingSvgTl = gsap.timeline({});
    mm.add("(min-width: 992px) and (pointer: fine)", () => {
      floatingSvgTl.fromTo(
        floatingSvg,
        {
          yPercent: -30,
        },
        {
          scrollTrigger: {
            trigger: floatingSvg,
            start: "top bottom",
            end: "bottom -25%",
            scrub: 1,
          },
          yPercent: 15,
          ease: "linear",
        }
      );
    });
  });

  $("[full-slider], .hero-slider").each(function () {
    let sliderEl = $(this);
    let childArrow = sliderEl.find(".slider_btn");
    let childItems = sliderEl.find(".hero-slider_item").hide();
    let slideNumber = sliderEl.find(".hero-slider_nav-item");
    let activeIndex = 0;
    let totalSlides = childItems.length;
    childItems.first().css("display", "flex");
    $(".hero-slider_nav-item").first().addClass("active");
    let showIndex = sliderEl.find(".slide-current");

    // MAIN SLIDER CODE
    function moveSlide(nextIndex, forwards) {
      childItems.hide();

      let prevItem = childItems.eq(activeIndex).css("display", "flex");
      let prevItemImg = childItems.eq(activeIndex).find(".hero-visual_el");
      let nextItem = childItems.eq(nextIndex).css("display", "flex");
      let nextItemImg = childItems.eq(nextIndex).find(".hero-visual_el");
      let tl = gsap.timeline({ defaults: { duration: 1, ease: "ease-2" } });
      if (forwards) {
        tl.fromTo(
          nextItem,
          { clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)" },
          {
            clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
          }
        );
        tl.fromTo(
          prevItem,
          { clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)" },
          {
            clipPath: "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)",
          },
          "<"
        );
        tl.fromTo(prevItemImg, { yPercent: 0 }, { yPercent: 10 }, "<");
        tl.fromTo(nextItemImg, { yPercent: -10 }, { yPercent: 0 }, "<");
      } else {
        tl.fromTo(
          nextItem,
          { clipPath: "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)" },
          {
            clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
          }
        );
        tl.fromTo(
          prevItem,
          { clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)" },
          {
            clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
          },
          "<"
        );
        tl.fromTo(prevItemImg, { yPercent: 0 }, { yPercent: -10 }, "<");
        tl.fromTo(nextItemImg, { yPercent: 10 }, { yPercent: 0 }, "<");
      }

      activeIndex = nextIndex;
    }

    // CLICK OF DOTS
    slideNumber.on("click", function () {
      let dotIndex = $(this).index();
      if ($(this).hasClass("active")) {
        $(this).removeClass("active");
        return;
      }

      slideNumber.removeClass("active");
      $(this).addClass("active");

      if (activeIndex > dotIndex) {
        moveSlide(dotIndex, false);
      } else if (activeIndex < dotIndex) {
        moveSlide(dotIndex, true);
      }
    });
    slideNumber.on("mouseenter", function () {
      $(".slide-overlay").addClass("darken");
    });

    slideNumber.on("mouseleave", function () {
      $(".slide-overlay").removeClass("darken");
    });

    // ARROWS
    function goNext(num) {
      let nextIndex = num;
      if (nextIndex > totalSlides - 1) nextIndex = 0;
      moveSlide(nextIndex, true);
    }

    childArrow.filter(".is-next").on("click", function () {
      goNext(activeIndex + 1);
      showIndex.text(activeIndex + 1);
    });
    // go prev
    childArrow.filter(".is-prev").on("click", function () {
      let nextIndex = activeIndex - 1;
      if (nextIndex < 0) nextIndex = totalSlides - 1;
      moveSlide(nextIndex, false);
      showIndex.text(nextIndex + 1);
    });

    let hammer = new Hammer(this);
    hammer.on("swipeleft", function () {
      let nextIndex = activeIndex + 1;
      if (nextIndex >= totalSlides) {
        nextIndex = 0; // Loop back to the first slide
      }
      moveSlide(nextIndex, true);
    });

    hammer.on("swiperight", function () {
      let prevIndex = activeIndex - 1;
      if (prevIndex < 0) {
        prevIndex = totalSlides - 1; // Loop back to the last slide
      }
      moveSlide(prevIndex, false);
    });
  });

  $(".pillars-section").each(function () {
    let pillarsSection = $(this);
    let pillars = pillarsSection.find(".pillars-item");
    let blueTrigger = $(".dark-section_wrap");
    let pillarIcons = $(".pillar-icon_item");
    let colorTl = gsap.timeline({
      scrollTrigger: {
        trigger: blueTrigger,
        start: "bottom top",
        end: "bottom bottom",
        endTrigger: pillarsSection,
        onEnter: () => {
          colorTl.play();
          $("body").addClass("theme-blue");
        },

        onLeaveBack: () => {
          colorTl.reverse();
          $("body").removeClass("theme-blue");
        },
      },
    });

    colorTl.to("body", {
      backgroundColor: "#050FFF",
      duration: 0.2,
      ease: "power2.inOut",
    });

    colorTl.to(
      ".page-collection",
      {
        color: "#050FFF",
        duration: 0.2,
        ease: "power2.inOut",
      },
      "<"
    );

    colorTl.to(
      ".pillars-outer",
      {
        color: "#fff",
        backgroundColor: "#050FFF",
        duration: 0.2,
        ease: "power2.inOut",
      },
      "<"
    );
    colorTl.to(
      ".pillars-blue_title",
      {
        color: "#fff",
        backgroundColor: "#050FFF",
        duration: 0.2,
        ease: "power2.inOut",
      },
      "<"
    );
  });

  // Announcement bar: rotate only when there is more than one message.
  $("[data-announcement-rotate]").each(function () {
    const bar = this;
    const items = [...bar.querySelectorAll(".announcement-bar_item")];
    if (items.length < 2) return;
    const every = (parseInt(bar.getAttribute("data-announcement-rotate"), 10) || 5) * 1000;
    let i = 0;
    setInterval(() => {
      items[i].classList.remove("is-active");
      i = (i + 1) % items.length;
      items[i].classList.add("is-active");
    }, every);
  });

  // Header search: toggle open, focus the field, close on Escape or outside.
  $("[data-nav-search]").each(function () {
    const wrap = this;
    const btn = wrap.querySelector("[data-nav-search-toggle]");
    const input = wrap.querySelector(".nav-search_input");
    const set = (open) => {
      wrap.setAttribute("data-open", open ? "true" : "false");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      if (open) setTimeout(() => input && input.focus(), 60);
    };
    set(false);
    btn.addEventListener("click", () => set(wrap.getAttribute("data-open") !== "true"));
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") set(false); });
    document.addEventListener("click", (e) => { if (!wrap.contains(e.target)) set(false); });
  });

  // Free shipping progress. Rendered server-side for the first paint, then kept
  // in step with the cart as items are added without a page load.
  // Format paise the way the shop does, so the amount in the sentence matches
  // every other price on the page.
  function formatMoney(cents, withCurrency) {
    const attr = withCurrency ? "data-money-currency-format" : "data-money-format";
    const fmt = document.documentElement.getAttribute(attr)
      || document.documentElement.getAttribute("data-money-format")
      || "Rs. {{amount}}";
    const n = (cents / 100).toFixed(2);
    const [whole, dec] = n.split(".");
    // Indian grouping: last three digits, then pairs.
    const lakh = whole.length > 3
      ? whole.slice(0, -3).replace(/\B(?=(\d{2})+(?!\d))/g, ",") + "," + whole.slice(-3)
      : whole;
    return fmt
      .replace(/\{\{\s*amount\s*\}\}/g, lakh + "." + dec)
      .replace(/\{\{\s*amount_no_decimals\s*\}\}/g, lakh)
      .replace(/\{\{\s*amount_with_comma_separator\s*\}\}/g, lakh + "," + dec)
      .replace(/\{\{\s*amount_no_decimals_with_comma_separator\s*\}\}/g, lakh);
  }

  // A short confetti burst, drawn as plain divs rather than pulling in a
  // library for one moment. Skipped entirely for anyone who asked for reduced
  // motion, and it removes itself so nothing accumulates in the DOM.
  //
  // The host is fixed to the viewport rather than parented to the progress
  // block. Inside it the bits were clipped to a box a couple of centimetres
  // tall, so the burst was over before it had cleared the bar — and the drawer
  // is rendered twice (nav and menu), so whichever copy happened to be hidden
  // could swallow the whole thing.
  window.celebrate = function (anchor) {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const host = document.createElement("div");
    host.className = "confetti";
    // Burst from the bar that was just filled, when we can find it on screen;
    // otherwise from the top of the viewport.
    const box = anchor && anchor.getBoundingClientRect && anchor.getBoundingClientRect();
    if (box && box.width > 0) {
      host.style.left = box.left + "px";
      host.style.top = box.top + "px";
      host.style.width = box.width + "px";
    }
    document.body.appendChild(host);
    const colors = ["#050fff", "#ffffff", "#000000", "#9aa0ff"];
    for (let i = 0; i < 46; i++) {
      const bit = document.createElement("i");
      bit.className = "confetti_bit";
      bit.style.left = Math.random() * 100 + "%";
      bit.style.background = colors[i % colors.length];
      bit.style.animationDelay = (Math.random() * 0.22).toFixed(2) + "s";
      // A little variation in size and travel, so 46 identical rectangles do
      // not fall as one block.
      const scale = 0.7 + Math.random() * 0.8;
      bit.style.width = (5 * scale).toFixed(1) + "px";
      bit.style.height = (9 * scale).toFixed(1) + "px";
      bit.style.setProperty("--drift", (Math.random() * 2 - 1).toFixed(2));
      bit.style.setProperty("--fall", Math.round(180 + Math.random() * 220) + "px");
      bit.style.setProperty("--spin", Math.round(Math.random() * 900 - 450) + "deg");
      host.appendChild(bit);
    }
    setTimeout(() => host.remove(), 2400);
  };

  // The drawer is rendered twice — once for the nav, once for the menu — and
  // the cart page has its own copy, so every one of these must be updated or
  // whichever the visitor opens second shows a stale number.
  window.updateCartProgress = function (cart) {
    const total = cart && typeof cart.total_price === "number" ? cart.total_price : null;
    if (total === null) return;
    const bars = [...document.querySelectorAll("[data-cart-progress]")];
    bars.forEach((el) => updateOneProgress(el, total));
    // Celebrating inside updateOneProgress fired once per copy of the drawer,
    // and the first copy to run is not necessarily the one on screen. Collect
    // the milestones crossed by this update instead, then fire once, at the bar
    // the visitor can actually see.
    const crossed = bars.reduce((acc, el) => acc.concat(el.__crossed || []), []);
    if (!crossed.length) return;
    const visible = bars.find((el) => el.getBoundingClientRect().width > 0) || bars[0];
    window.celebrate(visible && visible.querySelector(".cart-progress_track"));
  };

  // Where a milestone sits on the track, and how full the bar is for a given
  // total. Both are read off the legend the Liquid rendered, so the script and
  // the server cannot drift apart on the geometry — see cart-progress.liquid
  // for why the milestones are evenly spaced rather than scaled to the money.
  function stopsOf(el) {
    return [...el.querySelectorAll(".cart-milestone")]
      .map((m) => ({
        el: m,
        at: parseInt(m.getAttribute("data-tier"), 10) || 0,
        pos: parseFloat(m.getAttribute("data-pos")) || 0,
        kind: m.getAttribute("data-kind") || "tier",
        label: (m.getAttribute("data-label") || "").trim(),
        code: (m.getAttribute("data-code") || "").trim(),
      }))
      .sort((a, b) => a.at - b.at);
  }

  function fillFor(total, stops) {
    if (!stops.length) return 0;
    if (total >= stops[stops.length - 1].at) return 100;
    let prevAt = 0;
    let prevPos = 0;
    for (const s of stops) {
      if (total < s.at) {
        const span = s.at - prevAt;
        return span > 0 ? prevPos + ((s.pos - prevPos) * (total - prevAt)) / span : prevPos;
      }
      prevAt = s.at;
      prevPos = s.pos;
    }
    return 100;
  }

  function updateOneProgress(el, total) {
    const stops = stopsOf(el);
    el.__crossed = [];
    if (!stops.length) return;

    const pct = fillFor(total, stops);
    const fill = el.querySelector("[data-cart-progress-fill]");
    if (fill) fill.style.width = pct + "%";
    const track = el.querySelector(".cart-progress_track");
    if (track) track.setAttribute("aria-valuenow", Math.round(pct));
    el.classList.toggle("is-complete", total >= stops[stops.length - 1].at);

    // Mark whichever milestones the cart has passed, and note the ones crossed
    // just now — re-opening the drawer should not re-fire the celebration, and
    // neither should the second copy of the same drawer.
    //
    // A milestone is forgotten again the moment the cart drops back below it,
    // so stepping the quantity down past a reward and back up celebrates the
    // second unlock as well as the first. Remembering it forever meant the one
    // person most likely to look — someone trying the steppers to see what the
    // bar does — saw the confetti once and never again.
    const seen = (window.__celebrated = window.__celebrated || new Set());
    stops.forEach((s) => {
      const reached = total >= s.at;
      const was = s.el.classList.contains("is-reached");
      s.el.classList.toggle("is-reached", reached);
      const node = el.querySelector('[data-node="' + s.at + '"]');
      if (node) node.classList.toggle("is-reached", reached);
      if (!reached) {
        seen.delete(s.at);
        return;
      }
      if (!was && !seen.has(s.at)) {
        seen.add(s.at);
        el.__crossed.push(s.at);
      }
    });

    // One sentence, about the nearest goal still ahead — shipping or a tier,
    // whichever comes first. Naming every unreached tier at once reads as noise.
    const text = el.querySelector("[data-cart-progress-text]");
    if (!text) return;
    const next = stops.find((s) => total < s.at);
    if (next) {
      const away = formatMoney(next.at - total);
      text.textContent =
        next.kind === "ship"
          ? el.getAttribute("data-prefix") + " " + away + " " + el.getAttribute("data-suffix")
          : el.getAttribute("data-tier-prefix") + " " + away + " " +
            el.getAttribute("data-tier-suffix") + " " + next.label +
            (next.code ? " with code " + next.code : "");
      return;
    }
    // Nothing left ahead: say what was unlocked rather than going blank.
    text.textContent = stops
      .map((s) => (s.kind === "ship" ? el.getAttribute("data-reached") : s.label))
      .filter(Boolean)
      .join(" · ");
  }

  // "You may also like" — Shopify's own recommendations, keyed on what is
  // actually in the cart, so the list cannot go stale the way a hand-picked
  // one does.
  // On window rather than in the closure: globalScripts() re-runs after every
  // transition and rebuilds these functions, but the click handlers are bound
  // once and hold the first closure — so a plain local would have the add
  // handler clearing one copy of this while updateCartRecs read another, and
  // the suggestions would quietly stop refreshing after the first page change.
  window.__cartRecsFor = window.__cartRecsFor || null;
  window.updateCartRecs = function (cart) {
    const wraps = [...document.querySelectorAll("[data-cart-recs]")];
    const lists = [...document.querySelectorAll("[data-cart-recs-list]")];
    if (!wraps.length || !lists.length) return;
    const first = cart && cart.items && cart.items[0];
    if (!first) { wraps.forEach((w) => (w.hidden = true)); return; }
    if (window.__cartRecsFor === first.product_id) return; // already showing these
    window.__cartRecsFor = first.product_id;
    const inCart = new Set((cart.items || []).map((i) => i.product_id));
    // Shopify builds recommendations from order history and product
    // relationships, so a new store returns none. Fall back to the catalogue
    // itself — still real products, just not yet personalised.
    const render = (picks) => {
        if (!picks.length) { wraps.forEach((w) => (w.hidden = true)); return; }
        const html = picks
          .map((p) => {
            const img = p.featured_image || (p.images && p.images[0]) || "";
            return (
              '<div class="cart-rec">' +
              '<a class="cart-rec_link" href="' + p.url + '">' +
              (img ? '<img class="cart-rec_img" src="' + img + '" alt="" loading="lazy" decoding="async">' : "") +
              '<span class="cart-rec_info">' +
              '<span class="cart-rec_title body-upper">' + p.title + "</span>" +
              '<span class="cart-rec_price body-upper">' + formatMoney(p.price) + "</span>" +
              "</span></a>" +
              // Straight into the cart, whichever variant it is. Asking for a
              // size first put a second tap between a shopper and an impulse
              // buy for the sake of a decision they can change in the line
              // item a moment later — the select on the cart row does that,
              // and it is in front of them rather than behind a button.
              (function () {
                const vs = p.__variants || [];
                if (!vs.length) return "";
                return '<button type="button" class="cart-rec_add" data-add-variant="' + vs[0].id +
                  '" aria-label="Add ' + p.title.replace(/"/g, "&quot;") + ' to cart">+</button>';
              })() +
              "</div>"
            );
          })
          .join("");
        lists.forEach((l) => (l.innerHTML = html));
        wraps.forEach((w) => (w.hidden = false));
    };

    const fromCatalogue = () =>
      fetch("/products.json?limit=12", { headers: { Accept: "application/json" } })
        .then((r) => r.json())
        .then((d) =>
          render(
            (d.products || [])
              .filter((p) => !inCart.has(p.id))
              .slice(0, 3)
              .map((p) => ({
                id: p.id,
                title: p.title,
                url: "/products/" + p.handle,
                // products.json prices are decimal strings; recommendations
                // are integer paise. Normalise to paise.
                price: Math.round(parseFloat((p.variants[0] || {}).price || "0") * 100),
                featured_image: (p.images[0] || {}).src || "",
                __variants: (p.variants || []).filter((v) => v.available !== false),
              }))
          )
        )
        .catch(() => { wraps.forEach((w) => (w.hidden = true)); });

    fetch("/recommendations/products.json?product_id=" + first.product_id + "&limit=6", {
      headers: { Accept: "application/json" },
    })
      .then((r) => r.json())
      .then((data) => {
        const picks = (data.products || []).filter((p) => !inCart.has(p.id)).slice(0, 3);
        picks.forEach((p) => {
          p.__variants = (p.variants || []).filter((v) => v.available !== false);
        });
        if (picks.length) render(picks);
        else fromCatalogue();
      })
      .catch(fromCatalogue);
  };

  // The cart bridge posts its own change and tells us nothing about when it
  // lands, so a single fetch on a fixed timer is a race we lose often enough to
  // notice: /cart.js answers with the total from before the change, the bar
  // snaps back to where it was, and nothing comes along afterwards to correct
  // it. That is the drawer bar glitching. When a nudge has told us what the
  // total should be, keep asking until the server agrees.
  function refreshCartProgress(tries) {
    const left = typeof tries === "number" ? tries : 4;
    setTimeout(() => {
      fetch("/cart.js", { headers: { Accept: "application/json" } })
        .then((r) => r.json())
        .then((cart) => {
          const expected = window.__expectedTotal;
          if (typeof expected === "number" && cart.total_price !== expected && left > 0) {
            refreshCartProgress(left - 1);
            return; // the answer is stale; leave the bar where the tap put it
          }
          window.__expectedTotal = null;
          // Kept so the rows can be rebuilt after the bridge re-renders them
          // without paying for another round trip to say the same thing.
          window.__lastCart = cart;
          window.updateCartProgress(cart);
          window.updateCartRecs(cart);
          window.updateCartVariants(cart);
        })
        .catch(() => {});
    }, left === 4 ? 450 : 350);
  }
  // Everything from here to the matching close is delegated on document, so it
  // wants binding exactly once. globalScripts() runs again after every Barba
  // transition, and these were re-bound each time — by the third page a single
  // tap on a recommendation's + posted four adds and put four of the thing in
  // the cart.
  if (!window.__cartHandlersBound) {
    window.__cartHandlersBound = true;

  // The cart bridge fires no event we can listen for, so refresh after any
  // interaction that can change the cart: adding, opening the drawer, and
  // changing or removing a line inside it.
  document.addEventListener("click", (e) => {
    const removing = e.target.closest('[data-node-type="cart-remove-link"]');
    if (removing) {
      // Same reasoning as the steppers: take the whole line off the bar now
      // rather than letting it sit at the old total until the cart answers.
      const id = parseInt(removing.getAttribute("data-product-id"), 10);
      const cart = window.__lastCart;
      const line = cart && (cart.items || []).find((i) => i.variant_id === id || i.id === id);
      if (line) window.nudgeCartProgress(-(line.final_line_price || line.line_price || 0));
    }
    if (
      removing ||
      e.target.closest('[data-node-type="commerce-add-to-cart-button"]') ||
      e.target.closest('[data-node-type="commerce-cart-open-link"]') ||
      e.target.closest("[data-sticky-atc-btn]")
    ) {
      refreshCartProgress();
    }
  });
  document.addEventListener("change", (e) => {
    if (e.target.closest('[data-node-type="cart-quantity"]')) refreshCartProgress();
  });

  // Size on the cart line, not in front of the add button.
  //
  // The drawer's rows are rendered by the cart bridge from a Webflow template
  // that only knows the variant that is already in the cart — no siblings, no
  // handle. So the other sizes have to be fetched: /cart.js for the handle and
  // the variant id of each row, then the product's own .js for its variants,
  // cached per product because three rows of the same tee is one request.
  const variantCache = {};
  function variantsFor(handle) {
    if (variantCache[handle]) return variantCache[handle];
    variantCache[handle] = fetch("/products/" + handle + ".js", { headers: { Accept: "application/json" } })
      .then((r) => (r.ok ? r.json() : null))
      .then((prod) => (prod && prod.variants) || [])
      .catch(() => []);
    return variantCache[handle];
  }

  window.updateCartVariants = function (cart) {
    const items = (cart && cart.items) || [];
    if (!items.length) return;
    // The template puts the variant id on the remove link and on the quantity
    // input's name, which is the only thread back from a row to a cart line.
    document.querySelectorAll(".cart-item").forEach((row) => {
      const idEl = row.querySelector("[data-product-id]") || row.querySelector(".w-commerce-commercecartquantity");
      const id = parseInt(idEl && (idEl.getAttribute("data-product-id") || idEl.getAttribute("name")), 10);
      if (!id) return;
      const line = items.find((i) => i.variant_id === id || i.id === id);
      if (!line || !line.handle) return;
      // A product with nothing but Shopify's own Default Title has no size to
      // offer, and a select with one meaningless option in it is just noise.
      if (line.product_has_only_default_variant) return;
      if (row.__variantFor === id) return; // already built for this variant
      row.__variantFor = id;

      variantsFor(line.handle).then((variants) => {
        if (row.__variantFor !== id) return; // the row was re-rendered underneath us
        const sellable = variants.filter((v) => v.available || v.id === id);
        if (sellable.length < 2) return;
        let select = row.querySelector(".cart-item_variant");
        if (!select) {
          select = document.createElement("select");
          select.className = "cart-item_variant body-upper";
          select.setAttribute("aria-label", "Size");
          const host = row.querySelector(".cart-details_contain") || row;
          const price = host.querySelector(".cart-item_price");
          if (price && price.nextSibling) host.insertBefore(select, price.nextSibling);
          else host.appendChild(select);
        }
        select.innerHTML = sellable
          .map((v) =>
            '<option value="' + v.id + '"' + (v.id === id ? " selected" : "") + ">" +
            String(v.title || "").replace(/</g, "&lt;") + "</option>"
          )
          .join("");
        select.dataset.from = String(id);
      });
    });
  };

  // Swapping a size is a remove and an add: Shopify has no call that changes
  // the variant of a line in place. /cart/update.js takes both in one request,
  // which keeps it atomic — a change.js pair can leave the cart empty of the
  // row if the second call fails. Quantities are carried across, and folded in
  // if the size being switched to is already in the cart on its own line.
  document.addEventListener("change", (e) => {
    const select = e.target.closest(".cart-item_variant");
    if (!select) return;
    const from = parseInt(select.dataset.from, 10);
    const to = parseInt(select.value, 10);
    if (!from || !to || from === to) return;
    select.disabled = true;
    fetch("/cart.js", { headers: { Accept: "application/json" } })
      .then((r) => r.json())
      .then((cart) => {
        const items = cart.items || [];
        const moving = items.find((i) => i.variant_id === from || i.id === from);
        const already = items.find((i) => i.variant_id === to || i.id === to);
        const updates = {};
        updates[from] = 0;
        updates[to] = (moving ? moving.quantity : 1) + (already ? already.quantity : 0);
        return fetch("/cart/update.js", {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({ updates: updates }),
        });
      })
      .then(() => {
        window.__cartRecsFor = null;
        refreshCartProgress();
        if (window.Udesly && window.Udesly.dispatch) window.Udesly.dispatch("cart-should-be-updated");
      })
      .catch(() => {})
      .finally(() => { select.disabled = false; });
  });

  // Quick add from a recommendation.
  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-add-variant]");
    if (!btn) return;
    e.preventDefault();
    btn.disabled = true;
    fetch("/cart/add.js", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ id: parseInt(btn.getAttribute("data-add-variant"), 10), quantity: 1 }),
    })
      .then((r) => r.json())
      .then(() => {
        window.__cartRecsFor = null; // the cart changed, so the suggestions should too
        refreshCartProgress();
        // Ask the cart bridge to re-render its line items where it stands.
        // It renders them from its own copy of the cart and listens on its own
        // event bus for exactly two names — neither of which is a DOM event on
        // document. So the item reached Shopify and the drawer went on showing
        // the cart as it was before the click, which reads as nothing having
        // happened. cart-should-be-updated re-fetches and re-renders without
        // touching whether the drawer is open, which matters because it is
        // already open and toggling it would shut it.
        if (window.Udesly && window.Udesly.dispatch) {
          window.Udesly.dispatch("cart-should-be-updated");
        }
      })
      .catch(() => {})
      .finally(() => { btn.disabled = false; });
  });

  } // end of the bind-once block

  // This one does run on every transition: the bars in the page that just
  // arrived are rendered from the cart as it was when the page was cached.
  refreshCartProgress();

  // What one of a line costs, read off the cart we last fetched. final_price is
  // the per-unit price after line discounts, which is what the total moves by.
  function unitPriceOf(input) {
    // The cart page says so on the input itself. Its name is updates[], which
    // is what the no-JavaScript Update button posts and tells us nothing about
    // which line it is — so the bar there never moved at all.
    const stated = parseInt(input.getAttribute("data-unit-price"), 10);
    if (!isNaN(stated)) return stated;
    const cart = window.__lastCart;
    const id = parseInt(input.getAttribute("name"), 10);
    const line = cart && (cart.items || []).find((i) => i.variant_id === id || i.id === id);
    if (!line) return 0;
    if (typeof line.final_price === "number") return line.final_price;
    if (typeof line.price === "number") return line.price;
    return line.quantity ? Math.round((line.final_line_price || line.line_price || 0) / line.quantity) : 0;
  }

  // Move the bar by a known amount now, and keep the running total in step so
  // three taps in a row add up instead of each one starting from the same
  // stale number.
  window.nudgeCartProgress = function (deltaCents) {
    const cart = window.__lastCart;
    if (!cart || typeof cart.total_price !== "number" || !deltaCents) return;
    cart.total_price = Math.max(0, cart.total_price + deltaCents);
    // What the reconcile has to see before it is allowed to overwrite this.
    window.__expectedTotal = cart.total_price;
    window.updateCartProgress(cart);
  };

  // The cart page changes its own lines.
  //
  // Its quantity inputs are all called updates[], which is a form post waiting
  // on the Update button — so pressing + moved a number and left the price, the
  // subtotal, the count and the bar all saying what they said before, until you
  // found a second button and pressed that too. The name stays for anyone
  // without JavaScript; with it, the line changes where it stands.
  // The subtotal is rendered with money_with_currency, so rewriting it with the
  // plain format quietly dropped the INR off the end of it.
  function money(cents, withCurrency) { return formatMoney(cents, withCurrency); }

  document.addEventListener("change", (e) => {
    const input = e.target.closest("[data-cart-line]");
    if (!input) return;
    const line = parseInt(input.getAttribute("data-cart-line"), 10);
    const quantity = Math.max(0, parseInt(input.value, 10) || 0);
    if (!line) return;
    input.disabled = true;
    fetch("/cart/change.js", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ line: line, quantity: quantity }),
    })
      .then((r) => r.json())
      .then((cart) => {
        // change.js answers with the whole cart, so this is the authoritative
        // total rather than something to be reconciled later.
        window.__expectedTotal = null;
        window.__lastCart = cart;
        window.__cartRecsFor = null;
        window.updateCartProgress(cart);
        window.updateCartRecs(cart);

        const el = document.querySelector("[data-cart-subtotal]");
        if (el) el.textContent = money(cart.total_price, true);
        const count = document.querySelector("[data-cart-count]");
        if (count) count.textContent = cart.item_count;
        (cart.items || []).forEach((item, i) => {
          const total = document.querySelector('[data-line-total="' + (i + 1) + '"]');
          if (total) total.textContent = money(item.final_line_price);
          const qty = document.querySelector('[data-cart-line="' + (i + 1) + '"]');
          if (qty) {
            qty.value = item.quantity;
            qty.setAttribute("data-unit-price", item.final_price);
          }
        });
        // A line removed outright renumbers everything after it, and patching
        // that up in place is more ways to be wrong than it is worth.
        if (quantity === 0) window.location.reload();
      })
      .catch(() => {})
      .finally(() => { input.disabled = false; });
  });

  // Quantity steppers. The number inputs stay exactly where they are — the
  // cart bridge listens for their change event and the cart page posts them as
  // updates[] — so the buttons drive the real input and fire the same event a
  // keystroke would. Replacing the inputs would mean reimplementing both.
  window.enhanceQuantity = function (root) {
    (root || document).querySelectorAll(".w-commerce-commercecartquantity").forEach((input) => {
      if (input.closest(".qty-stepper")) return; // already wrapped

      const wrap = document.createElement("div");
      wrap.className = "qty-stepper";
      input.parentNode.insertBefore(wrap, input);

      const make = (dir, label) => {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "qty-stepper_btn";
        b.setAttribute("aria-label", label);
        b.textContent = dir < 0 ? "\u2212" : "+";
        b.addEventListener("click", () => {
          const min = parseInt(input.getAttribute("min"), 10);
          const floor = isNaN(min) ? 0 : min;
          const next = Math.max(floor, (parseInt(input.value, 10) || 0) + dir);
          const was = parseInt(input.value, 10) || 0;
          if (next === was) return;
          input.value = next;
          // The bar moves on the tap, not on the answer. Nothing here can know
          // the new total for certain — the cart lives on the server — but it
          // can know the price of the line being stepped, and that is enough to
          // be right about the arithmetic. The reconcile a moment later comes
          // back to the same number, so the correction is invisible; without
          // this the bar sat still for a beat and then jumped, which reads as
          // the button not having worked.
          window.nudgeCartProgress((next - was) * unitPriceOf(input));
          // Both, because the bridge and the cart form listen for different ones.
          input.dispatchEvent(new Event("input", { bubbles: true }));
          input.dispatchEvent(new Event("change", { bubbles: true }));
        });
        return b;
      };

      wrap.appendChild(make(-1, "Decrease quantity"));
      wrap.appendChild(input);
      wrap.appendChild(make(1, "Increase quantity"));
    });
  };
  window.enhanceQuantity(document);

  // The drawer re-renders its line items from a template whenever the cart
  // changes, which throws the wrappers away — so re-apply when it does.
  document.querySelectorAll('[data-node-type="commerce-cart-list"], .cart-list').forEach((list) => {
    if (list.__qtyObserved) return;
    list.__qtyObserved = true;
    new MutationObserver(() => {
      window.enhanceQuantity(list);
      // The size selects are thrown away with the rows, and waiting for the
      // next cart fetch to put them back left a row with no size on it for
      // half a second every time anything changed.
      if (window.__lastCart) window.updateCartVariants(window.__lastCart);
    }).observe(list, { childList: true, subtree: true });
  });

  // Collection filters. The form is a real GET to the collection URL, so it
  // works without any of this; the script only submits on change so a filter
  // applies in one click rather than two, and handles the open/close states.
  $("[data-filters-form]").each(function () {
    const form = this;
    form.addEventListener("change", (e) => {
      if (e.target.matches('input[type="number"]')) return; // wait for blur on price
      form.submit();
    });
    form.addEventListener("blur", (e) => {
      if (e.target.matches('input[type="number"]')) form.submit();
    }, true);
  });
  $("[data-filter-head]").each(function () {
    const head = this;
    const group = head.closest("[data-filter-group]");
    group.setAttribute("data-open", "true");
    head.addEventListener("click", () => {
      const open = group.getAttribute("data-open") !== "false";
      group.setAttribute("data-open", open ? "false" : "true");
      head.setAttribute("aria-expanded", open ? "false" : "true");
    });
  });
  $("[data-filters-toggle]").each(function () {
    const btn = this;
    const rail = btn.closest(".collection-filters");
    rail.setAttribute("data-open", "false");
    btn.addEventListener("click", () => {
      const open = rail.getAttribute("data-open") === "true";
      rail.setAttribute("data-open", open ? "false" : "true");
      btn.setAttribute("aria-expanded", open ? "false" : "true");
    });
  });

  // Scroll parallax for [data-parallax] frames (the gallery slides). Scrubbed
  // to scroll so it runs off native scroll on mobile and Lenis on desktop
  // alike. Slides that are display:none simply have nothing to move until the
  // slider shows them; invalidateOnRefresh re-measures when that happens.
  if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    // Phones get a deeper drift: the frame is shorter, so the same percentage
    // reads as far less movement. The CSS gives mobile a taller image to match.
    const travel = window.matchMedia("(max-width: 767px)").matches ? 14 : 8;
    $("[data-parallax]").each(function () {
      const frame = this;
      const img = frame.querySelector("img");
      if (!img) return;
      gsap.fromTo(
        img,
        { yPercent: -travel },
        {
          yPercent: travel,
          ease: "none",
          scrollTrigger: {
            trigger: frame.closest(".hero-slider_wrap") || frame,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
            invalidateOnRefresh: true,
          },
        }
      );
    });
  }

  // Sticky mobile add-to-cart: show the bar while the real button is off
  // screen, and route its click to the real button so the one form and the
  // cart drawer handle everything. Price follows the real price element,
  // which the cart script rewrites on variant change.
  $("[data-sticky-atc]").each(function () {
    const bar = this;
    const form = document.querySelector(bar.getAttribute("data-sticky-atc"));
    const real = form && form.querySelector('[data-node-type="commerce-add-to-cart-button"]');
    if (!real || !("IntersectionObserver" in window)) return;
    new IntersectionObserver(
      ([entry]) => bar.classList.toggle("is-visible", !entry.isIntersecting && !real.disabled),
      { threshold: 0 }
    ).observe(real);
    bar.querySelector("[data-sticky-atc-btn]").addEventListener("click", () => real.click());
    const price = document.querySelector("[data-product-price]");
    const mirror = bar.querySelector("[data-sticky-atc-price]");
    if (price && mirror && "MutationObserver" in window) {
      new MutationObserver(() => (mirror.textContent = price.textContent))
        .observe(price, { childList: true, characterData: true, subtree: true });
    }
  });

  $(".product-accordion").each(function () {
    $(this).on("click", function () {
      if ($(this).hasClass("open")) {
        $(this).removeClass("open");
      } else {
        $(".product-accordion").removeClass("open");
        $(this).addClass("open");
      }
    });
  });
  // Variant options. Every selector here used to be global: .size-variation_btn
  // is the wrapper around *all* the options, so opening Size opened Colour with
  // it, and $(".size-selected").text() wrote the chosen value into every
  // option's label at once. Each option is its own <fieldset class="option">,
  // so scope everything to that.
  $(".size-toggle").each(function () {
    const toggle = $(this);
    const option = toggle.closest(".option");
    const group = option.find(".size-button_group");
    const selected = option.find(".size-selected");

    toggle.on("click", function (e) {
      e.stopPropagation();
      const wasOpen = group.hasClass("show");
      // Only one option list open at a time, or they overlap each other.
      $(".size-button_group").removeClass("show");
      if (!wasOpen) group.addClass("show");
    });

    option.find(".size-button").on("click", function (e) {
      e.stopPropagation();
      selected.text($(this).find(".size-choice").text());
      group.removeClass("show");
    });
  });

  // One document-level handler rather than one per option.
  $(document).on("click.variantOptions", function (e) {
    if (!$(e.target).closest(".size-toggle, .size-button_group").length) {
      $(".size-button_group").removeClass("show");
    }
  });

  $(".product-draggable_wrap").each(function () {
    const sliderEl = $(this);
    const content = sliderEl.find("[product-slider]");
    // A short catalogue renders without the marquee attribute; with no track
    // to measure, content.width() is undefined and the wrap maths yields NaN,
    // which would translate the row off screen.
    if (!content.length) return;
    const cards = sliderEl.find(".product-card");
    let total = 0;
    const itemValues = [];

    const cardsLength = cards.length / 2;
    const half = content.width() / 2;

    const wrap = gsap.utils.wrap(-half, 0);

    const xTo = gsap.quickTo(content[0], "x", {
      duration: 0.5, // transitions over 0.5s
      ease: "power3", // non-linear easing
      modifiers: {
        x: gsap.utils.unitize(wrap),
      },
    });

    // Generate an array of random values between -10 and 10
    for (let i = 0; i < cardsLength; i++) {
      itemValues.push((Math.random() - 0.5) * 20);
    }

    const tl = gsap.timeline({ paused: true });
    tl.to(cards, {
      scale: 0.95,
      duration: 0.3,
      ease: "linear",
      delay: 0.1,
    });

    Observer.create({
      target: content[0],
      type: "pointer,touch", // detect both pointer and touch events
      onPress: function () {
        tl.play();
      },
      onDrag: (self) => {
        self.target.classList.add("dragging");
        total += self.deltaX;
        xTo(total);
        lenis.stop();
      },
      onRelease: function (self) {
        tl.reverse();
        self.target.classList.remove("dragging");
        lenis.start();
      },
      onStop: function (self) {
        tl.reverse();
        self.target.classList.remove("dragging");
      },
    });

    gsap.ticker.add(tick);

    function tick(time, deltaTime) {
      total -= deltaTime / 20; // Adjust the speed of automatic scrolling
      xTo(total);
    }
  });

  gsap.defaults({
    ease: "ease-1",
    duration: 1,
  });

  function initMenu() {
    let navWrap = document.querySelector(".nav");
    let state = navWrap.getAttribute("data-nav");
    let overlay = navWrap.querySelector(".overlay");
    let imgsWrap = navWrap.querySelector(".menu-img_inner");
    let menu = navWrap.querySelector(".menu");
    let menuLogoBg = navWrap.querySelector(".bg-panel_full");
    let bgPanels = navWrap.querySelectorAll(".bg-panel");
    let menuToggles = document.querySelectorAll("[data-menu-toggle]");
    let menuLinks = navWrap.querySelectorAll(".menu-link");
    let fadeTargets = navWrap.querySelectorAll("[data-menu-fade]");

    let tl = gsap.timeline({});

    const openNav = () => {
      lenis.stop();
      navWrap.setAttribute("data-nav", "open");

      tl.clear()
        .set(navWrap, { display: "block" })
        .set(menu, { yPercent: 0 }, "<")
        .set(
          imgsWrap,
          { clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)" },
          "<"
        )

        .fromTo(overlay, { autoAlpha: 0 }, { autoAlpha: 1, ease: "expo" }, "<")
        .fromTo(
          menuLogoBg,
          { yPercent: -101 },
          { yPercent: 0, ease: "expo" },
          "<"
        )
        .fromTo(
          bgPanels,
          { yPercent: -101 },
          { yPercent: 0, stagger: 0.1, duration: 0.575 },
          "<15%"
        )
        .fromTo(
          imgsWrap,
          {
            clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
            yPercent: -50,
          },
          {
            clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
            yPercent: 0,
            duration: 0.575,
          },
          "<20%"
        )
        .fromTo(
          menuLinks,
          { yPercent: -140 },
          {
            yPercent: 0,
            stagger: 0.05,
            duration: 0.575,
            // onComplete: () => {
            //   alert("hi");
            // },
          },
          "<"
        )
        .fromTo(
          fadeTargets,
          { autoAlpha: 0 },
          {
            autoAlpha: 1,
            duration: 0.575,
            ease: "sine.out",
          },
          "<70%"
        );
    };

    const closeNav = () => {
      lenis.start();
      navWrap.setAttribute("data-nav", "closed");

      tl.clear()
        .to(overlay, { autoAlpha: 0 })
        .to(
          fadeTargets,
          { autoAlpha: 0, duration: 0.575, ease: "expo.out" },
          "<"
        )

        .to(
          bgPanels,
          { yPercent: -101, stagger: 0.12, duration: 0.575, ease: "expo.out" },
          "<"
        )
        .to(menuLogoBg, { yPercent: -101, ease: "expo.out" }, "<10%")

        .to(
          imgsWrap,
          {
            clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
            yPercent: -50,
            duration: 0.575,
            ease: "expo.out",
          },
          "<"
        )
        .to(
          menuLinks,
          { yPercent: -140, duration: 0.575, ease: "expo.out" },
          "<"
        )

        .set(navWrap, { display: "none" });
    };

    // Toggle menu open / close depending on its current state
    menuToggles.forEach((toggle) => {
      toggle.addEventListener("click", () => {
        state = navWrap.getAttribute("data-nav");
        if (state === "open") {
          closeNav();
        } else {
          openNav();
        }
      });
    });

    // If menu is open, you can close it using the "escape" key
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && navWrap.getAttribute("data-nav") === "open") {
        closeNav();
      }
    });
  }
  initMenu();

  $("[img-hover_wrap], footer").each(function () {
    let triggersWrap = $(this);
    let container = triggersWrap.find("[img-hover_triggers-wrap]");
    let hoverTriggers = triggersWrap.find("[img-hover_trigger]");
    let targetWrapper = triggersWrap.find("[target-img_wrap]");
    let hiddenImages = triggersWrap.find("[target-imgs_hidden] img");
    let mediaUrls = hiddenImages
      .map(function () {
        return $(this).attr("src");
      })
      .get();

    if (!targetWrapper.length || !hoverTriggers.length) return;

    mm.add("(min-width: 992px) and (pointer: fine)", () => {
      // Enter and leave animations for the wrapper
      container.on("mouseenter", function () {
        gsap.fromTo(
          targetWrapper[0],
          {
            clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
          },
          {
            clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
            duration: 0.6,
            ease: "expo.inOut",
          }
        );
      });

      container.on("mouseleave", function () {
        gsap.to(targetWrapper[0], {
          clipPath: "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)",
          duration: 0.6,
          ease: "expo.inOut",
        });
      });
    });

    // Hover trigger image handling
    hoverTriggers.each(function (index) {
      mm.add("(min-width: 992px) and (pointer: fine)", () => {
        $(this).on("mouseenter", function () {
          let imageUrl = mediaUrls[index];
          if (!imageUrl) return;

          let container = $("<div></div>");
          let image = $("<img>").attr("src", imageUrl);

          container.append(image);
          targetWrapper.append(container);

          gsap.to([container[0], image[0]], {
            y: 0,
            duration: 0.6,
            ease: "expo.inOut",
          });

          // Limit number of children
          if (targetWrapper.children().length > 20) {
            targetWrapper.children().first().remove();
          }
        });
      });
    });
  });

  // mm.add("(min-width: 992px) and (pointer: fine)", () => {
  //   document.querySelectorAll("[img-hover_wrap]").forEach((el) => {
  //     new ImageHoverEffect(el);
  //   });
  // });

  $("[img-scroll]").each(function () {
    let parallaxImgWrap = $(this);
    let parallaxImg = parallaxImgWrap.find("img");
    const imgScrollTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: $(this),
        start: "clamp(top bottom)",
        end: "clamp(bottom top)",
        scrub: true,
      },
    });

    imgScrollTimeline.fromTo(
      parallaxImg,
      { yPercent: 0 },
      { yPercent: 20, ease: "linear" }
    );
  });

  $("[solo-img_hov]").each(function (index) {
    let soloImg = $(this).find("[solo-img]");
    mm.add("(min-width: 992px) and (pointer: fine)", () => {
      $(this).on("mouseenter", function () {
        gsap.fromTo(
          soloImg.find("img, video"),
          {
            opacity: 0,
            clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
          },
          {
            opacity: 1,
            clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
            duration: 0.6,
            ease: "ease-1",
          }
        );
      });

      $(this).on("mouseleave", function () {
        gsap.to(soloImg.find("img, video"), {
          clipPath: "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)",
          duration: 0.6,
          ease: "ease-1",
        });
        gsap.to(soloImg.find("img, video"), {
          duration: 0.6,
          opacity: 0,
          ease: "linear",
        });
      });
    });
  });

  $(".is-giving").each(function (index) {
    let soloImg = $(this).find("[solo-img]");
    let soloTrig = $(this).find("[solo-trig]");
    soloTrig.on("mouseenter", function () {
      gsap.fromTo(
        soloImg.find("img"),
        {
          opacity: 0,
          clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
        },
        {
          opacity: 1,
          clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
          duration: 0.6,
          ease: "ease-1",
        }
      );
    });

    soloTrig.on("mouseleave", function () {
      gsap.to(soloImg.find("img"), {
        clipPath: "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)",
        duration: 0.6,
        ease: "ease-1",
      });
      gsap.to(soloImg.find("img"), {
        duration: 0.6,
        opacity: 0,
        ease: "linear",
      });
    });
  });

  // $(".signup-popup").each(function () {
  //   let subPopup = $(this);
  //   let subBg = subPopup.find(".signup-bg");
  //   let subClose = subPopup.find(".signup-close");

  //   let subPopupTl = gsap.timeline({
  //     paused: true,
  //   });

  //   subPopupTl.set(subPopup, { display: "flex" });

  //   $("[sub-trigger]").on("click", function () {
  //     subPopupTl.restart();
  //   });

  //   $(".signup-bg").on("click", function () {
  //     subPopupTl.reverse();
  //   });

  //   $(".signup-close").on("click", function () {
  //     subPopupTl.reverse();
  //   });

  //   subBg.add(subClose).on("click", function () {
  //     subPopupTl.reverse();
  //   });
  // });

  // .menu-list-item

  $(".menu-list-item").on("mouseenter", function () {
    $(".menu-list-item").not(this).addClass("inactive");
  });

  $(".menu-list-item").on("mouseleave", function () {
    $(".menu-list-item").removeClass("inactive");
  });

  $("[data-scroll-overlap]").each(function () {
    const $section = $(this);
    mm.add("(min-width: 992px) and (pointer: fine)", () => {});
    gsap
      .timeline({
        scrollTrigger: {
          trigger: this,
          start: "top top",
          end: "+500px",
          scrub: true,
        },
      })
      .to(this, { yPercent: 50, ease: "power1.in" });
  });

  $("[data-scroll-overlap-pillar]").each(function () {
    mm.add("(min-width: 992px) and (pointer: fine)", () => {
      const $section = $(this);
      const sectionHeight = $section.outerHeight();

      gsap
        .timeline({
          scrollTrigger: {
            trigger: this,
            start: "top 30%",
            end: `top -=${sectionHeight}`,
            scrub: true,
          },
        })
        .to(this, { yPercent: 40, ease: "power1.in" });
    });
  });

  $(".easter-egg").each(function () {
    let easterEl = $(this);
    let easterBg = easterEl.find(".easter-bg");

    let easterElTl = gsap.timeline({
      paused: true,
    });

    mm.add("(min-width: 992px) and (pointer: fine)", () => {
      easterElTl.set(easterEl, { display: "flex" });

      $("[easter-trigger]").on("mouseenter", function () {
        easterElTl.restart();
      });

      $("[easter-trigger]").on("mouseleave", function () {
        easterElTl.reverse();
      });
    });
  });

  $("[flickthrough-wrap]").each(function () {
    var $flickwrap = $(this);
    var $flickImgs = $flickwrap.find(".flickthrough-img");
    var interval;
    var index = $flickImgs.index($flickImgs.filter(".show"));

    function nextImage() {
      $flickImgs.removeClass("show");
      index = (index + 1) % $flickImgs.length;
      $flickImgs.eq(index).addClass("show");
    }

    // Desktop with pointer
    mm.add("(min-width: 992px) and (pointer: fine)", () => {
      $flickwrap.on("mouseover", function () {
        nextImage(); // Change immediately
        interval = setInterval(nextImage, 300); // Then every 300ms
      });

      $flickwrap.on("mouseleave", function () {
        clearInterval(interval);
      });
    });

    // Mobile and small screens
    mm.add("(max-width: 991px)", () => {
      interval = setInterval(nextImage, 500);
    });
  });

  $(".floating-icon").each(function () {
    let floatingWrap = $(this);
    let flickImgs = floatingWrap.find(".floating-svg");
    let imgCount = flickImgs.length;

    // Create doubled sequence: [0, 1, 2, 0, 1, 2] for 3 images
    let sequence = [];
    for (let i = 0; i < imgCount; i++) {
      sequence.push(i);
    }
    for (let i = 0; i < imgCount; i++) {
      sequence.push(i);
    }

    // Hide all initially
    gsap.set(flickImgs, { autoAlpha: 0 });

    // Show the first image before scroll starts
    gsap.set(flickImgs.eq(0), { autoAlpha: 1 });

    mm.add("(min-width: 992px) and (pointer: fine)", () => {
      let scrollFlick = gsap.timeline({
        scrollTrigger: {
          trigger: this,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      });

      sequence.forEach(function (imgIndex, i) {
        scrollFlick.set(
          flickImgs,
          {
            autoAlpha: (index) => (index === imgIndex ? 1 : 0),
            duration: 0.1,
            overwrite: "auto",
          },
          i / (sequence.length - 1)
        );
      });
    });

    mm.add("(max-width: 991px)", () => {
      let scrollFlick = gsap.timeline({
        scrollTrigger: {
          trigger: this,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      });

      sequence.forEach(function (imgIndex, i) {
        scrollFlick.set(
          flickImgs,
          {
            autoAlpha: (index) => (index === imgIndex ? 1 : 0),
            duration: 0.1,
            overwrite: "auto",
          },
          i / (sequence.length - 1)
        );
      });
    });
  });

  $("[footer-img_trigger]").each(function (index) {
    $(this)
      .on("mouseenter", function () {
        $("[footer-img_item]").removeClass("show").eq(index).addClass("show");
      })
      .on("mouseleave", function () {
        $("[footer-img_item]").removeClass("show");
      });
  });

  footerImgFollow();
}
globalScripts();

function preloader() {
  let loader = $(".preloader_wrap");
  let loaderInner = $(".preloader-inner");
  let loaderLogo = $(".preloader_logo-contain");
  let loaderImageWrap = $(".preloader_img-contain");
  let loaderImages = loaderImageWrap.find(".preloader-img");
  let loaderInnerBg = $(".preloader-inner_bg");
  let loaderDuration = 2;
  let itemsCount = loaderImages.length;
  loaderImages;

  let preloaderTl = gsap.timeline({
    defaults: {
      duration: loaderDuration,
      ease: "ease-3",
    },
    onStart: () => {
      lenis.stop();
    },
    onComplete: () => {
      lenis.start();
      $("body").removeClass("show-preloader");
    },
  });

  preloaderTl.fromTo(
    loaderLogo,
    {
      opacity: 0,
    },
    {
      delay: 0.5,
      ease: "sine.in",
      duration: loaderDuration / 2,
      opacity: 1,
    }
  );

  preloaderTl.fromTo(
    loaderInnerBg,
    {
      clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
    },
    {
      clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
      duration: loaderDuration / 2,
    }
  );

  preloaderTl.fromTo(
    loaderImageWrap,
    {
      clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
    },
    {
      clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
      duration: loaderDuration / 2,
    },
    "<15%"
  );
  preloaderTl.fromTo(
    loaderImages,
    {
      yPercent: -30,
    },
    {
      yPercent: 0,
      duration: loaderDuration / 2,
    },
    "<"
  );

  // preloaderTl.to(
  //   loaderImages,
  //   {
  //     opacity: 1,
  //     stagger: {
  //       amount: 1.5,
  //     },
  //     duration: 0.1,
  //   },
  //   "<70%"
  // );

  preloaderTl.to(loaderInner, {
    clipPath: "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)",
    duration: loaderDuration / 2,
  });

  preloaderTl.to(
    loaderImages,
    {
      yPercent: 10,
      duration: loaderDuration / 2,
    },
    "<"
  );

  preloaderTl.to(
    loader,
    {
      clipPath: "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)",
      duration: loaderDuration / 2,
    },
    "<30%"
  );
}

function checkPreloader() {
  if (sessionStorage.getItem("visited") !== null) {
    $("body").removeClass("show-preloader");
  } else {
    preloader();
  }
  sessionStorage.setItem("visited", "true");
}

function resetShopify(data) {
  let dom = $(
    new DOMParser().parseFromString(data.next.html, "text/html")
  ).find("html");

  // Get Shopify-specific attributes
  let shopifyThemeId = $(dom).find("html").attr("data-theme-id");
  let shopifyShopId = $(dom).find("html").attr("data-shop-id");

  // Update current page attributes
  if (shopifyThemeId) $("html").attr("data-theme-id", shopifyThemeId);
  if (shopifyShopId) $("html").attr("data-shop-id", shopifyShopId);

  // Reset Shopify theme JavaScript
  if (window.theme && window.theme.unload) {
    window.theme.unload();
  }

  // Reinitialize Shopify theme
  if (window.theme && window.theme.init) {
    window.theme.init();
  }

  // Reset Shopify sections
  if (window.Shopify && window.Shopify.theme && window.Shopify.theme.sections) {
    // Unload existing sections
    Object.keys(window.Shopify.theme.sections.instances).forEach(
      (sectionId) => {
        if (window.Shopify.theme.sections.instances[sectionId].onUnload) {
          window.Shopify.theme.sections.instances[sectionId].onUnload();
        }
      }
    );

    // Reload sections
    window.Shopify.theme.sections.load("*");
  }

  // Reset cart functionality
  if (window.CartJS) {
    window.CartJS.init();
  } else if (window.cart && window.cart.init) {
    window.cart.init();
  }

  // Reset active navigation classes
  $(".active, .current, .is-active").removeClass("active current is-active");
  $("a").each(function () {
    const href = $(this).attr("href");
    if (
      href === window.location.pathname ||
      href === window.location.pathname + window.location.search
    ) {
      $(this).addClass("active");
      $(this).closest("li").addClass("active");
    }
  });

  // Reset collection filters if present
  if (window.CollectionFilters) {
    window.CollectionFilters.init();
  }

  // Reset search functionality
  if (window.PredictiveSearch) {
    window.PredictiveSearch.init();
  }

  // Trigger custom theme events
  $(document).trigger("shopify:section:load");
  $(document).trigger("theme:loaded");

  // Reset any custom scripts specific to your theme
  initCustomScripts();
}

// THEME PATCH: this function is called both at top level and from
// barba.hooks.beforeEnter, and beforeEnter also fires on the very first page load.
// Its original guard matched 'udesly-shopify.min.js' by filename, so with the script
// vendored under a different name nothing was ever removed and the bundle executed
// twice — giving every cart link two click listeners. One click then toggled the
// drawer open and immediately shut again, so the cart never appeared.
//
// Binding is per Barba container, which is what the re-init is actually for: bind
// once for the current container, and again only after a page transition swaps it.
let udeslyBoundContainer = null;
function reinitUdeslyCart() {
  const container =
    document.querySelector('[data-barba="container"]') || document.body;
  if (udeslyBoundContainer === container) return;
  udeslyBoundContainer = container;

  const existingScript = document.querySelector("script[data-udesly-cart]");
  if (existingScript) existingScript.remove(); // remove old instance

  const script = document.createElement("script");
  script.setAttribute("data-udesly-cart", "");
  // THEME PATCH: load the vendored copy from assets/ (layout/theme.liquid sets
  // window.UdeslyCartScript). Fail closed rather than falling back to the
  // original store's CDN, which we do not control.
  if (!window.UdeslyCartScript) return;
  script.src = window.UdeslyCartScript;
  script.async = true;
  document.body.appendChild(script);
}
reinitUdeslyCart();

// How far down the page the container sits once it is back in normal flow.
// The announcement bar is outside the Barba container, in flow above it, so a
// container pinned to top: 0 during the transition is sitting exactly one
// banner higher than where it will land — and every page dropped by that much
// the moment the transition released it. That is the lurch: the hero "moving
// down after loading" on every page. Measure the banner and start there.
function flowOffset(current) {
  // The outgoing container is still sitting in flow at exactly the spot the
  // incoming one will take, so measure that rather than adding up whatever
  // happens to be above it. window.scrollY turns the viewport rect back into a
  // document position — the visitor may well have scrolled before clicking.
  if (current) {
    const box = current.getBoundingClientRect();
    // Not rounded: the banner's height is a rem value that rarely lands on a
    // whole pixel, and rounding it left half a pixel of movement behind.
    if (box.height > 0) return Math.max(0, box.top + window.scrollY);
  }
  const bar = document.querySelector(".announcement-bar");
  return bar ? bar.offsetHeight || 0 : 0;
}

// The nav is position:fixed, but it lives inside the Barba container, and both
// containers carry a transform for the length of the transition — which makes
// the container, not the viewport, the containing block its top is measured
// from. Neither header survives that on its own, so both are pinned by hand for
// the duration and handed back to CSS in hooks.after.
barba.hooks.enter((data) => {
  const current = data.current && data.current.container;

  // Measured before anything is moved: taking the container out of flow first
  // would be measuring the answer after changing the question.
  //
  // The nav's resolved top, not its rect: the header carries a
  // translateY(-100%) whenever it has hidden itself on the way down the page,
  // and a rect includes that, so freezing on the rect would have applied the
  // hide twice. While the containing block is still the viewport, the resolved
  // top is exactly where the header sits on screen.
  let leaving = null;
  let leavingTop = 0;
  if (current) {
    leaving = current.querySelector(".orgc-nav");
    if (leaving) {
      const shown = parseFloat(getComputedStyle(leaving).top) || 0;
      leavingTop = shown - current.getBoundingClientRect().top;
    }
  }

  gsap.set(data.next.container, {
    position: "fixed",
    top: flowOffset(current),
    left: 0,
    width: "100%",
  });

  // Arriving header: measured from its own container rather than the viewport
  // for the same reason, so it wants the height of whatever sits above it
  // inside that container. That is the banner on a page that has one and
  // nothing at all on a page that does not — which is the whole point of the
  // bar being in here.
  // The rect's height, not offsetHeight: the bar is sized in rem and lands on
  // 33.6px, which offsetHeight rounds to 34 and leaves half a pixel of movement
  // behind at the end of every arrival.
  const arrivingBar = data.next.container.querySelector(".announcement-bar");
  const nav = data.next.container.querySelector(".orgc-nav");
  if (nav) gsap.set(nav, { top: arrivingBar ? arrivingBar.getBoundingClientRect().height : 0 });

  // Departing header: the same trap, and by far the more visible one, because
  // it happens the instant you click rather than at the end. At the top of a
  // page it threw the header down by a banner. Anywhere further down — which is
  // where most clicks happen — it threw it off the top of the screen: 566px in
  // a single frame on a page scrolled 600. Freeze it where the eye last saw it
  // and let it slide away with the rest of the page.
  if (leaving) gsap.set(leaving, { top: leavingTop });
});
barba.hooks.before((data) => {
  lenis.stop();
});

// Everything the theme does with inline <script> tags is lost on a Barba
// transition, because Barba inserts the fetched HTML without executing them.
// section-class.liquid is the only such script and it carries its values as
// data attributes precisely so this can replay it: wrapper class, the
// nav-dark / nav-light attributes the header colour is driven by, and the
// merchant's padding. Without this every swapped-in page had the raw
// shopify-section wrappers, no nav attributes (so the header stayed white on
// white) and no spacing — until a reload ran the scripts for real.
function applySectionClasses(root) {
  if (!root) return;
  root.querySelectorAll("script[data-section-class]").forEach((t) => {
    const s = t.closest(".shopify-section") || t.parentElement;
    if (!s) return;
    const d = t.dataset;
    if (d.sectionId) s.id = d.sectionId;
    s.setAttribute("class", d.sectionClass);
    if (d.sectionAttrs) d.sectionAttrs.split(",").forEach((a) => { a = a.trim(); if (a) s.setAttribute(a, ""); });
    if (d.sectionPt) s.style.paddingTop = d.sectionPt + "px";
    if (d.sectionPb) s.style.paddingBottom = d.sectionPb + "px";
  });
}

// <body> keeps whatever template classes the first-loaded page had, so the
// header clearance for page templates followed you home ("images move down")
// and never arrived on About. Copy the incoming container's classes across.
function syncTemplateClasses(container) {
  if (!container) return;
  const next = (container.getAttribute("data-template-classes") || "").split(/\s+/).filter(Boolean);
  [...document.body.classList].forEach((k) => {
    if (/^template-/.test(k) || k === "u-theme-light") document.body.classList.remove(k);
  });
  next.forEach((k) => document.body.classList.add(k));
}

barba.hooks.beforeEnter((data) => {
  checkPreloader();
  reinitUdeslyCart();
  applySectionClasses(data.next.container);
  syncTemplateClasses(data.next.container);
  if (data.next.html) {
    const m = data.next.html.match(/<title>([^<]*)<\/title>/i);
    if (m) {
      // The title is raw HTML source, so decode its entities (&ndash;) first.
      const decoded = new DOMParser().parseFromString(m[1], "text/html").documentElement.textContent;
      document.title = decoded.replace(/\s+/g, " ").trim();
    }
  }
});

barba.hooks.afterEnter(() => {});

barba.hooks.after((data) => {
  // clearProps on the enter tween drops the container's own inline styles, but
  // it never touched the nav — that one has to be handed back by hand, and in
  // the same beat, or the header flashes at the top of the screen.
  gsap.set(data.next.container, { position: "relative" });
  const nav = data.next.container.querySelector(".orgc-nav");
  if (nav) gsap.set(nav, { clearProps: "top" });
  $(window).scrollTop(0);
  // The previous page's triggers were never killed, so each transition
  // stacked another set measured against a page that no longer exists.
  ScrollTrigger.getAll().forEach((t) => t.kill());
  globalScripts();
  resetShopify(data);
});

barba.init({
  preventRunning: true,
  cacheFirstPage: true,
  timeout: 10000,
  // Barba intercepts every same-origin link click to run its own page
  // transition. Shopify's checkout, account and order pages are not Barba
  // containers, so those clicks were swallowed and nothing happened. Hand
  // them back to the browser so they navigate for real.
  prevent: function (data) {
    var el = data && data.el;
    if (!el) return false;
    if (el.hasAttribute("data-barba-prevent")) return true;
    if (el.hasAttribute("download")) return true;
    if (el.getAttribute("target") === "_blank") return true;
    var href = data.href || el.getAttribute("href") || "";
    if (/^(mailto:|tel:|#)/.test(href)) return true;
    // "checkouts" (plural) is the real Shopify checkout host path — matching
    // only "checkout" let /checkouts/cn/... fall through to Barba, which has no
    // container to swap on those pages.
    return /\/(checkouts?|cart|account|orders|tools|challenge|services|apps|policies|wallets|pay)(\/|$|\?)/.test(href);
  },
  transitions: [
    {
      sync: true,
      enter(data) {
        let barbaTransitionTl = gsap.timeline({
          defaults: {
            duration: 1,
            ease: "ease-3",
          },
        });

        // Transform rather than margin: animating marginTop reflows the
        // document every frame, which the browser reports as layout shift and
        // the eye reads as the page lurching. y moves the same distance on the
        // compositor and costs no layout at all.
        barbaTransitionTl.fromTo(
          data.current.container,
          {
            opacity: 1,
            y: "0vh",
          },
          {
            opacity: 0.4,
            y: "20vh",
          }
        );

        barbaTransitionTl.fromTo(
          data.next.container,
          {
            y: "-20vh",
            clipPath: "polygon(0% 0%, 100% 0%, 100% 0vh, 0% 0vh)",
          },
          {
            y: "0vh",
            clipPath: "polygon(0% 0%, 100% 0%, 100% 100vh, 0% 100vh)",
            // ease: "expo.inOut",
            clearProps: "all",
            onComplete: () => {
              setTimeout(function () {
                $(".hero-slider_nav-item").first().click();
              }, 1);
            },
          },
          "<"
        );
        return barbaTransitionTl;
      },
    },
  ],
});
