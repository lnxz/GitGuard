$(document).ready(function() {
  $('ul.sidebar-nav li').click(function(e) {
    loadRepo($(this).find("a").text());
  });
});

function loadRepo(e) {
  $('#title').html(e);
}