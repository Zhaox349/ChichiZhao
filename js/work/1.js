$(window).ready(function () {
  $("#magazine").turn({
    autoCenter: true,
    display: "double",
    acceleration: true,
    gradients: !$.isTouch,
    elevation: 50,
    when: {
      turned: function (e, page) {
        /*console.log('Current view: ', $(this).turn('view'));*/
      },
    },
  });

  $("#magazine").css("margin-left", `${-1152 / 2}px`);
});

$(window).bind("keydown", function (e) {
  if (e.keyCode == 37) $("#magazine").turn("previous");
  else if (e.keyCode == 39) $("#magazine").turn("next");
});

$(".thumbnails li").on("click", (event) => {
  $("#magazine").turn("page", event.target.className.split("-")[1]);
});
