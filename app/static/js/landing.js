function reloadItems() {
  if (window.matchMedia("(max-width: 1300px)").matches) {
    $(".nav-items, .nav-items2").css("width", "100vw");
    $(".spline-phone").css("display", "none");
    $("input").css("width", "calc(70vw)");
    $(".nav-items p:nth-child(8), .nav-items2 p:nth-child(11)").css(
      "left", "calc(50vw - 0.5 * 56px)"
    );
    console.log("less than 1300")
  } else {
    console.log("greater than 1300");
    $(".nav-items, .nav-items2").css("width", "30vw");
    $(".spline-phone").css("display", "none");
    $("input").css("width", "calc(0.7 * 30vw)");
    $(".nav-items p:nth-child(8), .nav-items2 p:nth-child(11)").css(
      "left", "calc(4vw + (0.7 * 15vw) - 0.5 * 56px)"
    );
  }
}

window.onload = function () {
  reloadItems();
  const textElements = document.querySelectorAll(
    ".mid-left *:not(.get-started-two)"
  );
  const imgElements = document.querySelectorAll(".img-enter");
  setTimeout(() => {
    $(".preloader").css("opacity", "0");
    $(".preloader").css("top", "-100vh");
    $(".fade-in").css("opacity", "1");
    $(".credits p").css("animation", "entryCredits .43s var(--cubic-1) forwards .12s 1");

    anime({
      targets: textElements,
      translateX: [-60, 0],
      opacity: [0, 1],
      delay: anime.stagger(100),
      duration: 800,
      easing: "easeOutExpo"
    });

    anime({
      targets: imgElements,
      translateX: [60, 0],
      opacity: [0, 1],
      delay: 100,
      duration: 800,
      easing: "easeOutExpo"
    });
  }, 1300);
};

$(document).ready(function () {
  console.log("Hi! Welcome :)");
  // from here till comment ||| is regarding front-end, after |||
  // code will be regarding form and err management
  $(".navbar-container").on("mouseenter", function () {
    if (!$(".navbar").hasClass("navbar-active")) {
      $(".navbar").addClass("navbar-hover");
    }
    $(".background-signal").css("opacity", "1");
  });
  $(".navbar-container").on("mouseleave", function () {
    if (!$(".navbar").hasClass("navbar-active")) {
      $(".navbar").removeClass("navbar-hover");
    }
    $(".background-signal").css("opacity", "0");
  });
  $(".navbar-container").on("click", function () {
    setTimeout(() => {
      if (!$(".navbar").hasClass("navbar-active")) {
        $(".navbar").removeClass("navbar-hover");
        $(".navbar").addClass("navbar-active");
        $(".nav-items, .nav-items2").css("left", "0");
        $(".content").css("opacity", ".25");
      } else {
        $(".navbar").removeClass("navbar-active");
        $(".nav-items, .nav-items2").css("left", "-100vw");
        $(".content").css("opacity", "1");
      }
      var navItems = document.querySelectorAll(
        ".nav-item-active p, .nav-item-active div"
      );
      anime({
        targets: navItems,
        translateX: [60, 0],
        opacity: [0, 1],
        delay: anime.stagger(75),
        duration: 800,
        easing: "easeOutExpo"
      });
    }, 200);
  });
  $(".content").on("click", function () {
    if ($(".navbar").hasClass("navbar-active")) {
      $(".navbar-container").click();
    }
  });

  // get started
  $(".get-started").on("mouseenter", function () {
    $(".get-started-two").css("opacity", "1");
    $(".get-started-one").css("opacity", "0");
    $(".get-started-p").css("opacity", "0.5");
  });

  $(".get-started").on("mouseleave", function () {
    $(".get-started-two").css("opacity", "0");
    $(".get-started-one, .get-started-p").css("opacity", "1");
  });
  $(".get-started").on("click", function () {
    if ($(".nav-sign").hasClass("nav-item-active")) {
      switchForm();
    }

    $(".navbar-container").click();
  });
  // logo
  $(".logo").on("click", function() {
    location.reload();
  })
  // switch form
  $(".switch-form").on("click", function () {
    switchForm();
  });

  function animateOut(el) {
    anime({
      targets: el,
      translateX: ["0vw", "20vw"],
      duration: 600,
      delay: 400,
      easing: "easeOutExpo",
      delay: anime.stagger(75),
      loop: -1
    });
  }

  function switchForm() {
    var navItems = document.querySelectorAll(
      ".nav-item-active p, .nav-item-active div"
    );
    anime({
      targets: navItems,
      translateX: [0, 60],
      opacity: [1, 0],
      delay: anime.stagger(75),
      duration: 800,
      easing: "easeOutExpo"
    });
    if ($(".nav-sign").hasClass("nav-item-active")) {
      $(".nav-sign").removeClass("nav-item-active");
      $(".nav-register").addClass("nav-item-active");
    } else {
      $(".nav-register").removeClass("nav-item-active");
      $(".nav-sign").addClass("nav-item-active");
    }
    var navItems = document.querySelectorAll(
      ".nav-item-active p, .nav-item-active div"
    );
    anime({
      targets: navItems,
      translateX: [60, 0],
      opacity: [0, 1],
      delay: anime.stagger(75),
      duration: 800,
      easing: "easeOutExpo"
    });
  }
  // on scroll
  $(window).on("scroll", function () {
    if ($(window).scrollTop() > 0.8 * $(window).height()) {
      $(".navbar div").css("background-color", "white");
      $(".spline-bg").css("opacity", "1");
    } else {
      $(".navbar div").css("background-color", "black");
      $(".spline-bg").css("opacity", "0");
    }
  });
  // mobile support
  $(window).resize(function () {
    reloadItems();
  });

  //|||

  //Login form
  $('.submit-button-login').on("click", function(e) {
    e.preventDefault();
    var username = $('#username').val();
    var password = $('#password').val();

    console.log("username " + username + ", " + "password " + password);
    if (username.length > 32) {
      $('.error-message-login').html('Username cannot exceed 32 characters');
    } else if (username.length === 0 || password.length === 0) {
      $('.error-message-login').html('Username and password cannot be empty');
    } else {
      $.ajax({
        url: '/',
        type: 'POST',
        data: {
          username: username,
          password: password,
          login_submit: '',
          csrf_token: $('input[name=csrf_token]').val() 
        },
        success: function(response) {
          console.log("Server response: ", response); 
          console.log("|||||||||||||||||||||||||");
          console.log(response.error);
          if (response.error) {
            $('.error-message-login').html(response.error);
          } else {
            $(".preloader").css("opacity", "1");
            $(".preloader").css("top", "0");
            setTimeout(() => {
              window.location.href = response.redirect_url;
            }, 2300);
          }
        },
        error: function(jqXHR, textStatus, errorThrown) {
          console.log(textStatus, errorThrown);
        }
      });
    }
  });
  // register form
  $('.submit-button-register').on("click", function(e) {
    console.log("Hi!")
    e.preventDefault();
    $.ajax({
        url: '/',
        type: 'POST',
        data: {
            username: $('#username-reg').val(),
            email: $('#email-reg').val(),
            password: $('#password-reg').val(),
            password2: $('#password-repeat-reg').val(),
            register_submit: ''
        },
        success: function(response) {
            if (response.error) {
              $('.error-message-register').css("color", "red");
              var firstKey = Object.keys(response.form_errors)[0];
              var firstErrorMessage = response.form_errors[firstKey][0];

              if (firstErrorMessage === "This field is required.") {
                firstErrorMessage = "Please enter all fields."
              } else if (firstErrorMessage === "Field must be equal to password.") {
                firstErrorMessage = "Password repeat is not equal to password."
              }
              $('.error-message-register').html(firstErrorMessage);
            } else {
               $('.error-message-register').css("color", "green");
               $('.error-message-register').html("Successful registration!");
            }
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.log(textStatus, errorThrown);
        }
    });
  });

 
});
