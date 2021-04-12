// Operator login check
$("#operatorLoginBtn").click(() => {
  if ($("#operatorPINInput").val() === "0000") {
    window.location.href = "/newCalibration.html"
  } else {
    $("#operatorLogin").modal('toggle');
    $("#wrongPIN").modal('toggle');
  }
});

// Technical login check
$("#technicalLoginBtn").click(() => {
  if ($("#technicalPINInput").val() === "9999") {
    window.location.href = "/newAnalysis.html"
  } else {
    $("#technicalLogin").modal('toggle');
    $("#wrongPIN").modal('toggle');
  }
});
