var map = {
  "resume-link": "resume",
  "email-link": "email",
  "facebook-link": "facebook",
  "linkedin-link": "linkedin",
  "github-link": "github",
};

$(".link").each(function(index) {
  $(this).hover(function() {
    var key = $(this).attr('id');
    $("#hello-link").text(map[key] + ". ");
  }, function() {
    $("#hello-link").text("hello.");
  });
});
