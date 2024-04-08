
window.onload = function () {
    var container = document.querySelector(".main-text-container");
    container.scrollTop = container.scrollHeight;
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
  updateNoti();
  getFriendRequestDB();
  getFriendsDB();

  function debounce(func, wait) {
    var timeout;
    return function() {
      var context = this, args = arguments;
      clearTimeout(timeout);
      timeout = setTimeout(function() {
        func.apply(context, args);
      }, wait);
    };
  }
  

  function alignMyText() {
    const myTextElements = $(".my-text");

    myTextElements.each(function () {
      const $this = $(this);
      const pWidth = $this.find("p").width();

      const calculatedLeft = $(".main-text-container").width() - pWidth - 80;
      $this.css("left", calculatedLeft + "px");
    });
  }
  alignMyText();
  // show menu onStart
  resize();
  setTimeout(() => {
    if (window.matchMedia("(max-width: 900px)").matches) {
      $(".content-seperator").click();
    }
  }, 200);
  // logo
  $(".logo").on("click", function () {
    location.reload();
  });
  // filter tab left
  var searchTerm = "";
  var activeFilter = "all";

  function filterUsers() {
    $(".content-user-item").each(function () {
      var username = $(this).find(".user-item-username").text().toLowerCase();
      var isActive =
        $(this).find(".user-item-active").css("background-color") ===
          "rgb(100, 229, 129)" ||
        $(this).find(".user-item-active").css("background-color") ===
          "rgb(255, 153, 0)";
      var isFavourite = $(this).hasClass("favourite");
      if (
        username.indexOf(searchTerm) !== -1 &&
        (activeFilter === "all" ||
          (activeFilter === "active" && isActive) ||
          (activeFilter === "favourite" && isFavourite))
      ) {
        $(this).show();
      } else {
        $(this).hide();
      }
    });
  }

  $("#search").on("keyup", function () {
    searchTerm = $(this).val().toLowerCase();
    filterUsers();
  });

  $(".nav-item").on("click", function () {
    $(".nav-item-active").removeClass("nav-item-active");
    $(".nav-item-active").css("opacity", "0.7");
    $(this).addClass("nav-item-active");
    $(".nav-item-active").css("opacity", "1");
    activeFilter = $(this).attr("tag");
    filterUsers();
  });
  //

  $(".add-friend-btn").on("click", () => {
    var username = $("#add-friend").val();
    sendFriendRequestDB(username);
  });

  $(".add-friend").on("click", () => {
    if ($(".add-friend-container").hasClass("friend-is-active")) {
      $(".friend-img").css("opacity", "0");
      $(".add-friend").css({
        transform: "rotate(0deg)",
        background: "linear-gradient(-40deg, #00FF94, #0AC9EC)"
      });
      setTimeout(() => {
        $(".add-friend-container").css("height", "0");
        $(".add-friend-container").removeClass("friend-is-active");
      }, 200);
    } else {
      setTimeout(() => {
        $(".friend-img").css("opacity", "1");
      }, 200);
      $(".add-friend").css({
        transform: "rotate(135deg)",
        background: "#232323"
      });
      $(".add-friend-container").addClass("friend-is-active");
      $(".add-friend-container").css("height", "40px");
    }
  });
  function resize() {
    if (window.matchMedia("(max-width: 450px)").matches) {
      if ($(".content-left-container").hasClass("item-open")) {
        $(".content-seperator").css("left", "calc(100% - 20px)");
      } else {
        $(".content-seperator").css("left", "calc(100VW - 20px)");
      }
      $(".content-left-container, .content-settings-container").css(
        "width",
        "100vw"
      );
    } else {
      $(".content-left-container, .content-settings-container").css(
        "width",
        "450px"
      );
      $(".content-seperator").css("left", "calc(450px - 6px)");
    }

    if (window.matchMedia("(max-width: 900px)").matches) {
      $(".content-seperator").css({
        "pointer-events": "all",
        opacity: "1"
      });
    } else {
      $(".content-seperator").css({
        "pointer-events": "none",
        opacity: "0"
      });
      $(".content-left-container").css("left", "0");
      $(".content-left-container").addClass("item-open");
    }
  }
  $(window).resize(function () {
    alignMyText();
    resize();
  });



  function getFriendRequestDB() {
    fetch('/get_friend_requests', {
        method: 'GET',
    })
    .then(response => response.json())
    .then(data => {
        $(".noti-container *").remove()

        $(".noti-container").append(`<div class="noti-spacer"></div>`);
        data.forEach(username => {
          var div = $('<div>', { class: 'noti-from' });

          div.html(`
              <p class="noti-from-text">New friend request from:</p>
              <p class="noti-from-username">${username}</p>
              <img src="https://i.ibb.co/R6jBVfL/accept.png" alt="accept friend request" class="accept-friend-request" />
              <img src="https://i.ibb.co/wcmncmP/delete.png" alt="deny friend request" class="deny-friend-request" />
          `);

          $('.noti-container').append(div);
      });
      $(".noti-container").append(`<div class="noti-spacer"></div>`);
      updateNoti();
      reloadEventListener();
    })
    .catch(error => console.error('Error:', error));
}

  function sendFriendRequestDB(username) {
    fetch(`/send_friend_request/${username}`, {
        method: 'POST',
    })
    .then(response => response.json())
    .then(data => {
        if (data.message) {
            // Display the message from the server
            $(".add-friend-btn").css("pointer-events", "none");
            setTimeout(() => {
              $(".add-friend-btn").css("pointer-events", "all");
            }, 500);
            if (data.message === "Friend request sent") {
              $(".err-message-container p").css("color", "green");
            } else {
              $(".err-message-container p").css("color", "red");       
            }
            $(".err-message-container p").text(data.message);
            $(".nav").css("top", "200px");
            $(".content-user-container").css("top", "245px");
            $(".err-message-container").css("opacity", "1");

            setTimeout(() => {
                $(".nav").css("top", "160px");
                $(".content-user-container").css("top", "215px");
                $(".err-message-container").css("opacity", "0");
            }, 3000);
        }
    })
    .catch(error => console.error('Error:', error));
}

  function convertStatus(userStatus) {
    if (userStatus === "rgb(100, 229, 129)") {
      userStatus = 2;
    } else if (userStatus === "rgb(255, 153, 0)") {
      userStatus = 1;
    } else {
      userStatus = 0;
    }
  }
  var currentUser = 0;

  $("#message").on("keypress", function (event) {
    var keycode = event.keyCode ? event.keyCode : event.which;
    if (keycode == "13") {
      $(".message-submit-btn").click();
    }
  });

  $(".message-submit-btn").on("click", () => {
    var newText = $("#message").val();
    if (newText === "") {
      return;
    }
    var userReceiving = $(".content-right-username").text();
    // Get the current date and time
    let now = new Date();

    now.setHours(now.getHours() + 2);

    // Convert to a string in the format 'YYYY-MM-DD HH:MM:SS'
    let timestamp = now.getUTCFullYear() +
        '-' + String(now.getUTCMonth() + 1).padStart(2, '0') +
        '-' + String(now.getUTCDate()).padStart(2, '0') +
        ' ' + String(now.getUTCHours()).padStart(2, '0') +
        ':' + String(now.getUTCMinutes()).padStart(2, '0') +
        ':' + String(now.getUTCSeconds()).padStart(2, '0');

    // Send the timestamp with the request
    fetch('/send_message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            text: newText,
            userReceiving: userReceiving,
            timestamp: timestamp  // Add the timestamp here
        })
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
    })
    .catch(error => {
        console.error(error);
    });

  
    $(".main-text-container").append(
      `<div class="main-text-message my-text"><p>${newText}</p></div>`
    );
    alignMyText();
    var container = document.querySelector(".main-text-container");
    container.scrollTop = container.scrollHeight;
    $("#message").val("");
  });
  

  $(".settings-exit").on("click", function () {
    $(".content-settings-container").css("top", "-150vh");
  });
  $(".content-settings").on("click", function () {
    $(".content-settings-container").css("top", "0");
  });

  function updateNoti() {
    if ($(".noti-from").length == 0) {
      $(".noti-amount").text("");
    } else {
      $(".noti-amount").text($(".noti-from").length); 
    }
    if ($(".noti-container").hasClass("noti-open")) {
      var height = $(".noti-from").length * 50 + 40;
      $(".noti-container").css("height", `${height}px`);
    } else {
      $(".noti-container").css("height", "0px");
    }
  }

  function getFriendsDB() {
    $.getJSON('/get_friends', function(data) {
        console.log(data);
        // for each username that get's returned here run makeChatWithUser()
        data.forEach(makeChatWithUser);
    })
    .fail(function(jqxhr, textStatus, error) {
        var err = textStatus + ", " + error;
        console.error("Request Failed: " + err);
    });
  }

  function makeChatWithUser(username) {
      // check whether there is a chat with current user:
      var currentUser = $(".pfp-text").text();
      if (username == currentUser) {
        return;
      }

      $.getJSON(`/get_chat/${currentUser},${username}`, function(data) {
        // if not create chat
        if (!data.chatExists) {
            console.log("NO CURRENT CHAT")
            $.post(`/create_chat/${currentUser},${username}`)
            .done(function() {
                console.log(`Chat created with ${username}`);
            })
            .fail(function(jqxhr, textStatus, error) {
                var err = textStatus + ", " + error;
                console.error("Request Failed: " + err);
            });
        }
        var lastText = data.lastText;
        var date = data.date;        

        console.log("DATE " + data.date)

        $(".content-user-container").prepend(`<div class="content-user-item chat-item-active ${data.isFavourite ? "favourite" : ""}"><div class="user-item-pfp"><img src="https://i.ibb.co/PYMDb0x/portrait-businesswoman-working-outside-park-sitting-with-laptop-work-documents-using.jpg" alt="pfp" /></div><div class="user-item-active "></div><p class="user-item-username">${username}</p><p class="user-item-lasttext">${lastText}</p><p class="user-item-date">${date}</p><div class="user-item-seperator"></div></div>`);
        reloadEventListener();
      })
      .fail(function(jqxhr, textStatus, error) {
          var err = textStatus + ", " + error;
          console.error("Request Failed: " + err);
      });
  }

  var amountCalled = 0;

  function reloadEventListener() {
    $(".accept-friend-request").off();
    $(".deny-friend-request").off();
    $(".content-user-item").off();
    var cudela = 0;


    $(".accept-friend-request").on("click", function () {
      var username = $(this).siblings('.noti-from-username').text();
      var element = $(this);
  
      $.ajax({
          url: `/accept_friend_request/${username}`,
          type: 'POST',
          success: function(result) {
              element.parent().remove();
              updateNoti();
  
              // Add the friend to the left side (you need to implement this part)
              $(".content-user-container").prepend(`<div class="content-user-item favourite chat-item-active"><div class="user-item-pfp"><img src="https://i.ibb.co/PYMDb0x/portrait-businesswoman-working-outside-park-sitting-with-laptop-work-documents-using.jpg" alt="pfp" /></div><div class="user-item-active "></div><p class="user-item-username">${username}</p><p class="user-item-lasttext">Have a good day</p><p class="user-item-date">12:04 Mon</p><div class="user-item-seperator"></div></div>
              `)
            reloadEventListener();
          }
      });
      

    });

    var running = false;
    $(".content-user-item").on("click", debounce(function () {
      if (running) {
        return;
      }
      running = true;
      var username = $(this).children().eq(2).text()
      var bio = $(this).children().eq(3).text();
      var imgLink = $(this).children().eq(0).children().attr("src");
      var userStatus = $(this).children().eq(1).css("background-color");
      var isFavourite = $(this).hasClass("favourite");

      if (isFavourite) {
        $(".content-right-star img:nth-child(2)").addClass("user-fav-active");
      } else if (
        $(".content-right-star img:nth-child(2)").hasClass("user-fav-active")
      ) {
        $(".content-right-star img:nth-child(2)").removeClass("user-fav-active");
      }

      currentUser = $(this).index();
      $(".content-right-active").css("background-color", userStatus);
      $(".content-right-username").text(username);
      $(".content-right-bio").text(bio);
      $(".content-right-pfp").children().attr("src", imgLink);

      $(".main-text-container *").remove();


      var currentUser2 = $(".pfp-text").text();
      var otherUser = username;

      $.ajax({
        url: `/get_user_chats/${currentUser2},${otherUser}`,
        type: 'GET',
        dataType: 'json',
        success: function(data) {
          // data is a list of messages
          console.log(data);
          // FOR EVERY MESSAGE SEND BY OTHER USER append this
          data.forEach(message => {
            console.log(message.username + " MESSAGE USR ID");
            console.log(currentUser2 + " CRT USR2");
    
            if (message.username == currentUser2) {
              // FOR EVERY MESSAGE SEND BY CURRENT USER append this
              $(".main-text-container").append(`<div class="main-text-message my-text"><p>${message.text}</p></div>`);
            } else {
              $(".main-text-container").append(`<div class="main-text-message"><p>${message.text}</p></div>`);
            }
          });
          alignMyText();
          var container = document.querySelector(".main-text-container");
          container.scrollTop = container.scrollHeight;
          setTimeout(() => {
            running = false;
          }, 200);
        },
        error: function(error) {
          console.error('Error:', error);
        }
      });
    }, 200));

    $(".deny-friend-request").on("click", function () {
      var username = $(this).siblings('.noti-from-username').text();
      var element = $(this);  // Store a reference to 'this'

      $.ajax({
          url: `/delete_friend_request/${username}`,
          type: 'DELETE',
          success: function(result) {
            element.parent().remove();
            updateNoti();
          }
      });
  });
    
  }

  $(".content-noti").on("click", () => {
    if ($(".noti-container").hasClass("noti-open")) {
      $(".noti-container").removeClass("noti-open");
      $(".noti-container").css("height", "0px");
    } else {
      $(".noti-container").addClass("noti-open");
      updateNoti();
    }
  })

  $(".content-right-star").on("click", function () {
    var currentUser2 = $(".pfp-text").text();
    var otherUser = $(".content-right-username").text();
    console.log( "reached1");
    if ($(".content-right-star img:nth-child(2)").hasClass("user-fav-active")) {
        $.ajax({
          url: `/unfavourite_chat/${currentUser2},${otherUser}`,
          type: 'POST',
          success: function(data) {
            console.log("yay")
          },
          error: function(error) {
            console.log("ney")
          }
        });




      // |||| DB Request to make current Chat for current user active
      if ($(".content-user-item").eq(currentUser).hasClass("favourite")) {
        $(".content-user-item").eq(currentUser).removeClass("favourite");
      }
      $(".content-right-star img:nth-child(2)").removeClass("user-fav-active");
    } else {
      fetch(`/favourite_chat/${currentUser2},${otherUser}`, {
        method: 'POST',
    })
       // |||| DB Request to make current Chat for current user INACTIVE, so remove it
       console.log( "reached2");
      $(".content-right-star img:nth-child(2)").addClass("user-fav-active");
      if (!$(".content-user-item").eq(currentUser).hasClass("favourite")) {
        $(".content-user-item").eq(currentUser).addClass("favourite");
      }
    }

    // remove fav tag
    filterUsers();
  });

  $("#search")
    .on("focus", function () {
      $(".search-img").css("opacity", "1");
    })
    .on("blur", function () {
      $(".search-img").css("opacity", ".3");
    });

  $(".content-seperator").on("click", () => {
    if ($(".content-left-container").hasClass("item-open")) {
      $(".content-left-container").removeClass("item-open");
      if (window.matchMedia("(max-width: 450px)").matches) {
        $(".content-left-container").css("left", "-100vw");
        $(".content-seperator").css("left", "calc(100vw - 6px)");
      } else {
        $(".content-left-container").css("left", "-450px");
        $(".content-seperator").css("left", "calc(450px - 6px)");
      }
    } else {
      if (window.matchMedia("(max-width: 450px)").matches) {
        $(".content-seperator").css("left", "calc(100% - 20px)");
      } else {
        $(".content-seperator").css("left", "calc(100% - 6px)");
      }
      $(".content-left-container").css("left", "0");
      $(".content-left-container").addClass("item-open");
    }
  });

  $(".remove-friend-button").on("click", function () {
    var username = $(".content-right-username").text();
    $.ajax({
        url: `/remove_friend/${username}`,
        type: 'DELETE',
        success: function(result) {
            // handle success, e.g. update the UI to reflect the removed friend
          }
      });
  });


});
