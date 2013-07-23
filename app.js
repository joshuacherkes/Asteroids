$(function () {
  var canvas = $("<canvas width='" + 750 +
                 "' height='" + 750 + "'></canvas>");
  $('body').append(canvas);

  // `canvas.get(0)` unwraps the jQuery'd DOM element;
  var game = new Game(canvas.get(0));
  game.start();
});
