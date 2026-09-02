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

const lenis = new Lenis();

lenis.on("scroll", ScrollTrigger.update);

gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});

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
  $("[sub-trigger]").on("click", function () {
    $("body").addClass("show-signup");
  });

  $(".signup-bg, .signup-close").on("click", function () {
    $("body").removeClass("show-signup");
  });
  $("img").attr("loading", "auto");
  lenis.resize();
  lenis.start();
  addLenisPreventAttribute();
  ScrollTrigger.refresh();
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
  $(".size-toggle").each(function () {
    let sizeToggle = $(this);
    let sizeChoice = $(".size-variation_btn");
    let sizeGroup = $(".size-button_group");
    let sizeBtn = $(".size-button");
    let sizeSelected = $(".size-selected");

    sizeToggle.on("click", function (e) {
      e.stopPropagation(); // Prevent the event from bubbling to the document
      sizeChoice.toggleClass("show");
    });

    $(".size-button").on("click", function (e) {
      e.stopPropagation();
      let selectedSize = $(this).find(".size-choice").text();
      sizeSelected.text(selectedSize);
      $(".size-variation_btn").removeClass("show");
    });

    // Click outside to close
    $(document).on("click", function (e) {
      if (!$(e.target).closest(".size-toggle, .size-variation_btn").length) {
        sizeChoice.removeClass("show");
      }
    });
  });

  $(".product-draggable_wrap").each(function () {
    const sliderEl = $(this);
    const content = sliderEl.find("[product-slider]");
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
    setTimeout(function () {
      $("[sub-trigger]").click();
    }, 10000);
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
  // THEME PATCH: load the vendored copy from assets/ instead of the original store CDN.
  script.src =
    window.UdeslyCartScript ||
    "https://oddritualgolf.com/cdn/shop/t/2/assets/udesly-shopify.min.js?v=47719611079594064521747896222";
  script.async = true;
  document.body.appendChild(script);
}
reinitUdeslyCart();

barba.hooks.enter((data) => {
  gsap.set(data.next.container, {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
  });
});
barba.hooks.before((data) => {
  lenis.stop();
});

barba.hooks.beforeEnter((data) => {
  checkPreloader();
  reinitUdeslyCart();
});

barba.hooks.afterEnter(() => {});

barba.hooks.after((data) => {
  gsap.set(data.next.container, { position: "relative" });
  $(window).scrollTop(0);
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
    return /\/(checkout|account|orders|tools|challenge|services|apps|policies)(\/|$|\?)/.test(href);
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

        barbaTransitionTl.fromTo(
          data.current.container,
          {
            opacity: 1,
            marginTop: "0vh",
          },
          {
            opacity: 0.4,
            // ease: "expo.inOut",
            marginTop: "20vh",
          }
        );

        barbaTransitionTl.fromTo(
          data.next.container,
          {
            marginTop: "-20vh",
            clipPath: "polygon(0% 0%, 100% 0%, 100% 0vh, 0% 0vh)",
          },
          {
            marginTop: "0vh",
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
