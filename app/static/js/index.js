
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
    }, 900);
};

$(document).ready(function () {
  updateNoti();
  getFriendRequestDB();
  getFriendsDB();
  getUserPrivacy();

  if (localStorage.getItem("nav")) {
    $(".nav-item").removeClass("nav-item-active");;
    if  (localStorage.getItem("nav") == "active") {
      $(".nav-item").eq(0).addClass("nav-item-active");
    } else if  (localStorage.getItem("nav") == "favourite") {
      $(".nav-item").eq(1).addClass("nav-item-active");
    } else {
      $(".nav-item").eq(2).addClass("nav-item-active");
    }


  }

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
    if (localStorage.getItem("nav")) {
      localStorage.removeItem("nav");
    }
    localStorage.setItem("nav", `${$(this).attr("tag")}`)

    $(".nav-item-active").removeClass("nav-item-active");
    $(".nav-item-active").css("opacity", "0.7");
    $(this).addClass("nav-item-active");
    $(".nav-item-active").css("opacity", "1");
    activeFilter = $(this).attr("tag");
    filterUsers();
  });
  

  function getUserPrivacy() {
    $.ajax({
        url: '/get_user_privacy',
        type: 'GET',
        success: function(response) {

            if (response.privacy === "public") {
              $(".item-very-active").removeClass("item-very-active");
              $(".item-public").addClass("item-very-active")
            }
        },
        error: function(error) {
            console.error('Error:', error);
        }
    });
}


  
  $("#add-friend").on("keypress", function (event) {
    var keycode = event.keyCode ? event.keyCode : event.which;
    if (keycode == "13") {
      $(".add-friend-btn").click();
    }
  });

  $(".add-friend-btn").on("click", () => {
    var username = $("#add-friend").val();
    sendFriendRequestDB(username);
  });

  $("#add-user").on("keypress", function (event) {
    var keycode = event.keyCode ? event.keyCode : event.which;
    if (keycode == "13") {
      $(".add-user-btn").click();
    }
  });


  $(".add-user-btn").on("click", () => {
    var username = $("#add-user").val();
    var currentChatUsers = $(".content-right-username").text();
    // Create a new chat with these users
    $.ajax({
      url: '/chat_add_user',
      type: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({
          new_user: username,
          current_chat_users: currentChatUsers
      }),
      success: function(data) {
          getFriendsDB();
      },
      error: function(error) {
          console.error('Error:', error);
          if (error) {
              var errorMessage = error.responseJSON.message;
              $(".adduser-err-msg").text(errorMessage);
              $(".adduser-err-msg").css("opacity", "1");
              $(".content-adduser-open").css("height", "145px");
  
              setTimeout(() => {
                  $(".adduser-err-msg").css("opacity", "0");
                  $(".content-adduser-open").css("height", "120px");
              }, 3000);
          }
      }
  });
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
      $(".content-left-container, .content-settings-container, .content-publiclist-container").css(
        "width",
        "100vw"
      );
    } else {
      $(".content-left-container, .content-settings-container, .content-publiclist-container").css(
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
        $(".noti-container").append(`<p class="noti-empty">No friend requests</p>`)
        var total = 0;

        data.forEach(username => {
          total++;
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

    // WILL LATER CHANGE THIS SUCH THAT ONEWEEKAGO IS CHECKED UPON LOADING
    // Get the current date and time
    let now = new Date();
    now.setHours(now.getHours() + 2);
  
    let timestampNow = new Intl.DateTimeFormat('en-US', { weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'UTC' }).format(now);

    let timestamp = now.getUTCFullYear() +
    '-' + String(now.getUTCMonth() + 1).padStart(2, '0') +
    '-' + String(now.getUTCDate()).padStart(2, '0') +
    ' ' + String(now.getUTCHours()).padStart(2, '0') +
    ':' + String(now.getUTCMinutes()).padStart(2, '0') +
    ':' + String(now.getUTCSeconds()).padStart(2, '0');

    $(".chat-item-active").children().eq(3).text(newText);
    $(".chat-item-active").children().eq(4).text(timestampNow);

    // Send the timestamp with the request
    $.ajax({
      url: '/send_message',
      type: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({
          text: newText,
          userReceiving: userReceiving,
          timestamp: timestamp  // Add the timestamp here
      }),
      success: function(data) {
        organizeLeftNav();
      },
      error: function(error) {
          console.error(error);
      }
    });

  
    $(".main-text-container").append(
      `<div class="main-text-message my-text"><p>${newText}</p><p>${timestampNow}</p></div>`
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

  $(".publiclist-exit").on("click", function () {
    $(".content-publiclist-container").css("top", "-150vh");
  });

  $(".public-usr-btn").on("click", function () {
    $(".content-publiclist-container").css("top", "0");
    
    // AJAX request
    $.ajax({
        url: '/get_public_users',
        type: 'GET',
        success: function(data) {

            $(".publiclist-p-item").remove();

            for (let i = 0; i < data.length; i++) {
                let p = $('<p></p>').text(data[i]).addClass('publiclist-p-item');
        
                $(".content-publiclist-container").append(p);
            }

        },
        error: function(error) {
            console.error('Error:', error);
        }
    });
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

    if ($(".noti-container").children().length === 3) {
      $(".noti-empty").css("opacity", "1");
    } else {
      $(".noti-empty").css("opacity", "0");
    }
  }

  function getFriendsDB() {
    let now = new Date();
    now.setHours(now.getHours() + 2);
    let timestamp = now.getUTCFullYear() +
    '-' + String(now.getUTCMonth() + 1).padStart(2, '0') +
    '-' + String(now.getUTCDate()).padStart(2, '0') +
    ' ' + String(now.getUTCHours()).padStart(2, '0') +
    ':' + String(now.getUTCMinutes()).padStart(2, '0') +
    ':' + String(now.getUTCSeconds()).padStart(2, '0');
    
    $.getJSON(`/get_chats?timestamp=${timestamp}`, function(data) {
        $(".content-user-container").children().remove();
        if (data.length === 0) {
          $(".content-right-empty").css({
            "opacity": "1",
            "pointer-events": "all"
          }); 
          $(".add-friend").click();
        } else {
          $(".content-right-empty").css({
            "opacity": "0",
            "pointer-events": "none"
          });
        }
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
            $.post(`/create_chat/${currentUser},${username}`)
            .done(function() {
            })
            .fail(function(jqxhr, textStatus, error) {
                var err = textStatus + ", " + error;
                console.error("Request Failed: " + err);
            });
        }

        var lastText = data.lastText;
        var date = data.date;        

        function getRandomFilter() {
          var hue = Math.floor(Math.random() * 360);
          var saturation = Math.floor(Math.random() * 100 + 100);
          var brightness = Math.floor(Math.random() * 30 + 80);
      
          return `hue-rotate(${hue}deg) saturate(${saturation}%) brightness(${brightness}%)`;
        }
        
        $(".content-user-container").prepend(`<div class="content-user-item ${data.isFavourite ? "favourite" : ""}"><div class="user-item-pfp"><img src="https://i.ibb.co/fkpCm6F/user.png" alt="pfp" style="filter: ${getRandomFilter()};"/></div><div class="user-item-active "></div><p class="user-item-username">${username}</p><p class="user-item-lasttext">${lastText}</p><p class="user-item-date">${date}</p><div class="user-item-seperator"></div></div>`);

        if ($(".content-user-container").children().length === 1) {
          setTimeout(() => {
            $(".content-user-item").first().click();
          }, 200);
        }
        reloadEventListener();
        organizeLeftNav();
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
              getFriendsDB();
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

      $(".chat-item-active").removeClass("chat-item-active");
      $(this).addClass("chat-item-active");

      var username = $(this).children().eq(2).text()
      var bio = $(this).children().eq(3).text();
      var imgLink = $(this).children().eq(0).children().attr("src");
      var imgFilter = $(this).children().eq(0).children().css("filter");
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
      $(".content-right-pfp").children().css("filter", imgFilter);

      $(".main-text-container *").remove();

      var userList = username;

      $.ajax({
        url: `/get_user_chats/${userList}`,
        type: 'GET',
        dataType: 'json',
        success: function(data) {
            data.forEach(message => {

                var name = "";
                if (userList.includes(",")) {
                  name = " - " + message.username;
                }
                if (message.username == $(".pfp-text").text()) {
                    $(".main-text-container").append(`<div class="main-text-message my-text"><p>${message.text}</p><p>${message.timestamp + name}</p></div>`);
                } else {
                    $(".main-text-container").append(`<div class="main-text-message"><p>${message.text}</p><p>${message.timestamp + name}</p></div>`);
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
      $(".")
    } else {
      $(".noti-container").addClass("noti-open");
      updateNoti();
    }
  })

  $(".content-right-adduser").on("click", function() {
    if ($(".content-right-adduser-maincontainer").hasClass("content-adduser-open")) {
      $(".content-right-adduser-maincontainer").removeClass("content-adduser-open");
    } else {
      $(".content-right-adduser-maincontainer").addClass("content-adduser-open");
    }
  })

  $(".content-right-star").on("click", function () {
    var userList = $(".content-right-username").text();
    if ($(".content-right-star img:nth-child(2)").hasClass("user-fav-active")) {
        $.ajax({
          url: `/unfavourite_chat/${userList}`,
          type: 'POST',
          success: function(data) {
          },
          error: function(error) {
            console.log(error)
          }
        });

      if ($(".content-user-item").eq(currentUser).hasClass("favourite")) {
        $(".content-user-item").eq(currentUser).removeClass("favourite");
      }
      $(".content-right-star img:nth-child(2)").removeClass("user-fav-active");
    } else {
      fetch(`/favourite_chat/${userList}`, {
        method: 'POST',
    })
      $(".content-right-star img:nth-child(2)").addClass("user-fav-active");
      if (!$(".content-user-item").eq(currentUser).hasClass("favourite")) {
        $(".content-user-item").eq(currentUser).addClass("favourite");
      }
    }
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
  })

  $(".public-usr-btn").on("click", () => {
    if ($(".content-publiclist-container").hasClass("publiclist-active")) {
      $(".content-publiclist-container").removeClass("publiclist-active")
    } else {
      $(".content-publiclist-container").addClass("publiclist-active")
    }
  })

  $(".settings-logout").on("click", () => {
    window.location.href = '/logout';
  })

  $(".content").on("click", () => {
    if ( $(".recheck").hasClass("recheck-open")) {
      $(".recheck").removeClass("recheck-open")
    }
  })

  function organizeLeftNav() {
    let container = $(".content-user-container");
    let daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    container.children(".content-user-item").sort(function(a, b) {
        let dateA = $(a).find(".user-item-date").text().split(' ');
        let dateB = $(b).find(".user-item-date").text().split(' ');

        // Compare the days of the week
        let dayComparison = daysOfWeek.indexOf(dateB[0]) - daysOfWeek.indexOf(dateA[0]);
        if (dayComparison !== 0) {
            return dayComparison;
        }

        // If the days of the week are the same, compare the times
        return new Date('1970/01/01 ' + dateB[1]) - new Date('1970/01/01 ' + dateA[1]);
    }).appendTo(container);
}



  $(".recheck-btn").on("click", () => {
    var usernames = $(".content-right-username").text();
    $.ajax({
      url: `/delete_chat/${usernames}`,
      type: 'DELETE',
      success: function(result) {
        if ( $(".recheck").hasClass("recheck-open")) {
          $(".recheck").removeClass("recheck-open")
        }
        setTimeout(() => {
          getFriendsDB();
        }, 200)
        }
    });
  })

  $(".item-public").on("click", function () {
    if ($(this).hasClass("item-very-active")) {
      return;
    }
    $(".item-very-active").removeClass("item-very-active");
    $(".item-public").addClass("item-very-active")

    $.ajax({
        url: '/set_user_to_public',
        type: 'POST',
        success: function(response) {
            if (response.status === 'success') {
            }
        },
        error: function(error) {
            console.error('Error:', error);
        }
    });
});

$(".item-private").on("click", function () {
  if ($(this).hasClass("item-very-active")) {
    return;
  }
  $(".item-very-active").removeClass("item-very-active");
  $(".item-private").addClass("item-very-active")

  $.ajax({
      url: '/set_user_to_private',
      type: 'POST',
      success: function(response) {
          if (response.status === 'success') {
          }
      },
      error: function(error) {
          console.error('Error:', error);
      }
  });
});



  $(".remove-friend-btn").on("click", function () {
    if ($(".recheck").hasClass("recheck-open")) {
      return;
    }
    setTimeout(() => {
      $(".recheck").addClass("recheck-open")
    }, 200);
  });

  // Function to check for new messages
  function checkForNewMessages() {
    getFriendRequestDB();
    var now = new Date();
    now.setHours(now.getHours() + 2);
    var timestamp = now.getUTCFullYear() +
    '-' + String(now.getUTCMonth() + 1).padStart(2, '0') +
    '-' + String(now.getUTCDate()).padStart(2, '0') +
    ' ' + String(now.getUTCHours()).padStart(2, '0') +
    ':' + String(now.getUTCMinutes()).padStart(2, '0') +
    ':' + String(now.getUTCSeconds()).padStart(2, '0');

    $.ajax({
        url: `/check_new_messages?timestamp=${timestamp}`,
        type: 'GET',
        success: function(data) {
            if (data.newMessages) {
                $(".chat-item-active").click();
            } else {
            }
        },
        error: function(error) {
            console.error('Error:', error);
        }
    });
}

setInterval(checkForNewMessages, 5000)
});