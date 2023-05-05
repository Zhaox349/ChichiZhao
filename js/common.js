$(document).on("ready", function () {
  const url = new URL(location.href);
  if (url.pathname == "/" && url.hash == "#work") {
    setTimeout(() => {
      const target = document.getElementById("hash-work");
      if (target) {
        target.scrollIntoView({
          block: "start",
          behavior: "smooth",
        });
        history.replaceState("", "", "/");
      }
    }, 200);
    return;
  }

  $("#header-work").on("click", () => {
    const url = new URL(location.href);
    if (url.pathname == "/") {
      const target = document.getElementById("hash-work");
      if (target) {
        target.scrollIntoView({
          block: "start",
          behavior: "smooth",
        });
      }
      return;
    } else {
      location.href = "/#work";
    }
  });
});
