"user strict";

// reCapcha v2 reCapcha
window.addEventListener("load", () => {
  const $recaptcha = document.querySelector("#g-recaptcha-response");
  if ($recaptcha) {
    $recaptcha.setAttribute("required", "required");
  }
});
// game options based on days of the week
document.addEventListener("DOMContentLoaded", function () {
  var gameSelect = document.getElementById("game");
  var today = new Date().getDay();
  if (today === 3 || today === 5 || today === 0) {
    // Wednesday (3), Friday (5), Sunday (0)
    gameSelect.innerHTML = `
          <option value="" disabled selected>What game do you want to play today?</option>
          <option value="NLH">NLH (No limit Texas Hold’em)</option>
          <option value="PLO">PLO (Pot limit Omaha)</option>
      `;
  } else {
    gameSelect.innerHTML = `
          <option value="NLH" selected>NLH (No limit Texas Hold’em)</option>
      `;
  }
});
//Open and close waitlist
// Get the current date and time
const now = new Date();
const currentHour = now.getHours();
const currentDay = now.getDay(); // 0 (Sunday) to 6 (Saturday)
const joinBtn = document.querySelector(".cmn--btn");

joinBtn?.addEventListener("click", (event) => {
  // Prevent the default form submission behavior
  event.preventDefault();
  // Check if the current time is within the allowed time range
  const isWithinTimeRange =
    (currentDay >= 1 &&
      currentDay <= 5 &&
      currentHour >= 13 &&
      currentHour < 24) || // Monday to Friday, 1pm to 12am
    ((currentDay === 0 || currentDay === 6) &&
      currentHour >= 9 &&
      currentHour < 24); // Saturday and Sunday, 9am to 12am

  // If the current time is not within the allowed time range, prevent form submission and display an alert
  if (!isWithinTimeRange) {
    // Change alert type to alert-danger
    $(".alert").removeClass("alert-info").addClass("alert-danger");
    // Change alert message
    $(".alert").html(
      "<strong>Error:</strong> Waitlist is currently closed. Please try again during operating hours."
    );
    // Optionally, scroll to the alert for better visibility
    $("html, body").animate(
      {
        scrollTop: $(".alert").offset().top,
      },
      500
    );
  } else {
    // If the current time is within the allowed time range, allow form submission
    $(".contact-form").submit();
  }
});

// Preloader
$(window).on("load", function () {
  $(".preloader").fadeOut(1000);
});

//Menu Dropdown
$("ul>li>.sub-menu").parent("li").addClass("has-sub-menu");

$(".menu li a").on("click", function () {
  var element = $(this).parent("li");
  if (element.hasClass("open")) {
    element.removeClass("open");
    element.find("li").removeClass("open");
    element.find("ul").slideUp(300, "swing");
  } else {
    element.addClass("open");
    element.children("ul").slideDown(300, "swing");
    element.siblings("li").children("ul").slideUp(300, "swing");
    element.siblings("li").removeClass("open");
    element.siblings("li").find("li").removeClass("open");
    element.siblings("li").find("ul").slideUp(300, "swing");
  }
});

// Responsive Menu
var headerTrigger = $(".header-trigger");
headerTrigger.on("click", function () {
  $(".menu").toggleClass("active");
  $(".overlay").toggleClass("active");
});

var headerTrigger2 = $(".top-bar-trigger");
headerTrigger2.on("click", function () {
  $(".header-top").toggleClass("active");
  $(".overlay").addClass("active");
  $(".overlay").removeClass("active");
});

// Overlay Event
var over = $(".overlay");
over.on("click", function () {
  $(".overlay").removeClass("overlay-color");
  $(".overlay").removeClass("active");
  $(".menu, .header-trigger").removeClass("active");
  $(".header-top").removeClass("active");
});

// Sticky Menu
window.addEventListener("scroll", function () {
  var header = document.querySelector(".header");
  header.classList.toggle("sticky", window.scrollY > 0);
});

// Scroll To Top
var scrollTop = $(".scrollToTop");
$(window).on("scroll", function () {
  if ($(this).scrollTop() < 500) {
    scrollTop.removeClass("active");
  } else {
    scrollTop.addClass("active");
  }
});

//Click event to scroll to top
$(".scrollToTop").on("click", function () {
  $("html, body").animate(
    {
      scrollTop: 0,
    },
    300
  );
  return false;
});

$(".feature__slider").slick({
  fade: false,
  slidesToShow: 4,
  slidesToScroll: 1,
  infinite: true,
  autoplay: true,
  pauseOnHover: true,
  centerMode: false,
  dots: false,
  arrows: true,
  nextArrow: '<i class="las la-arrow-right arrow-right"></i>',
  prevArrow: '<i class="las la-arrow-left arrow-left"></i> ',
  responsive: [
    {
      breakpoint: 1199,
      settings: {
        slidesToShow: 3,
      },
    },
    {
      breakpoint: 991,
      settings: {
        slidesToShow: 2,
      },
    },
    {
      breakpoint: 767,
      settings: {
        slidesToShow: 2,
      },
    },
    {
      breakpoint: 575,
      settings: {
        slidesToShow: 1,
      },
    },
  ],
});

$(".testimonial-slider").slick({
  fade: false,
  slidesToShow: 3,
  slidesToScroll: 1,
  infinite: true,
  autoplay: true,
  pauseOnHover: true,
  centerMode: false,
  dots: true,
  arrows: false,
  nextArrow: '<i class="las la-arrow-right arrow-right"></i>',
  prevArrow: '<i class="las la-arrow-left arrow-left"></i> ',
  responsive: [
    {
      breakpoint: 1199,
      settings: {
        slidesToShow: 3,
      },
    },
    {
      breakpoint: 992,
      settings: {
        slidesToShow: 2,
      },
    },
    {
      breakpoint: 767,
      settings: {
        slidesToShow: 1,
      },
    },
    {
      breakpoint: 575,
      settings: {
        slidesToShow: 1,
      },
    },
  ],
});

$(".top-investor-slider").slick({
  fade: false,
  slidesToShow: 3,
  slidesToScroll: 1,
  infinite: true,
  autoplay: true,
  pauseOnHover: true,
  centerMode: false,
  dots: false,
  arrows: false,
  responsive: [
    {
      breakpoint: 1199,
      settings: {
        slidesToShow: 3,
      },
    },
    {
      breakpoint: 991,
      settings: {
        slidesToShow: 4,
      },
    },
    {
      breakpoint: 767,
      settings: {
        slidesToShow: 3,
      },
    },
    {
      breakpoint: 400,
      settings: {
        slidesToShow: 2,
      },
    },
  ],
});

// Odometer Counter
$(".counter__item, .dashboard__card__item").each(function () {
  $(this).isInViewport(function (status) {
    if (status === "entered") {
      for (var i = 0; i < document.querySelectorAll(".odometer").length; i++) {
        var el = document.querySelectorAll(".odometer")[i];
        el.innerHTML = el.getAttribute("data-odometer-final");
      }
    }
  });
});

//Faq
$(".faq-item__title").on("click", function (e) {
  var element = $(this).parent(".faq-item");
  if (element.hasClass("open")) {
    element.removeClass("open");
    element.find(".faq-item__content").removeClass("open");
    element.find(".faq-item__content").slideUp(300, "swing");
  } else {
    element.addClass("open");
    element.children(".faq-item__content").slideDown(300, "swing");
    element
      .siblings(".faq-item")
      .children(".faq-item__content")
      .slideUp(300, "swing");
    element.siblings(".faq-item").removeClass("open");
    element
      .siblings(".faq-item")
      .find(".faq-item__content")
      .slideUp(300, "swing");
  }
});

$(".user-thumb").on("click", function () {
  $(".dashboard__sidebar").addClass("active");
  $(".overlay").addClass("active");
});

$(".single-select").on("click", function () {
  $(".single-select").removeClass("active");
  $(this).addClass("active");
});

$(".btn-close, .overlay").on("click", function () {
  $(".overlay").removeClass("active");
  $(".menu").removeClass("active");
});

$(".how-item").on("mouseover", function () {
  $(".how-item").removeClass("active");
  $(this).addClass("active");
});

// Dashboard Collapse Expand
$(".user-toggler").on("click", function () {
  $(".dashboard-sidebar").toggleClass("active");
  $(".overlay").toggleClass("overlay-color");
});
$(".close-dashboard, .overlay").on("click", function () {
  $(".dashboard-sidebar").removeClass("active");
  $(".overlay").removeClass("overlay-color");
});
