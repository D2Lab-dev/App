// Administrator login check
$("#administratorLoginBtn").click(() => {
  if ($("#administratorPINInput").val() === "0000") {
    window.location.href = window.location.href.split("index.html")[0] + "overview.html"
  } else {
    $("#administratorLogin").modal('toggle');
    $("#wrongPIN").modal('toggle');
  }
});
