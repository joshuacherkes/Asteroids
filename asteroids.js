function MovingObject(pos){
  var d = [[1,1], [-1,-1], [1,-1],[-1,1]]
  this.direction = d[Math.floor(Math.random()*d.length)];
  this.x = pos[0];
  this.y = pos[1];
}

MovingObject.prototype.update = function(velocity){

  this.x += velocity[0]*this.direction[0];
  this.y += velocity[1]*this.direction[1];


}

MovingObject.prototype.offScreen = function(width, height){
  // console.log("My X: " + this.x);
 //  console.log("Canvas X: " + width);
  return this.x > width+25 || this.y > height+25 ||
         this.x < 0 - 25 || this.y < 0 - 25;
}

MovingObject.prototype.wrapAround = function(width, height){
  //need to find out what bound it went out of

    if (this.x > width+25){
      this.x = -24;
    }
    else if (this.y > height+25){
      this.y = -24;
    }
    else if (this.x < 0 - 25){
      this.x = width + 24;
    }
    else if(this.y < 0 - 25){
      this.y = height + 24;
    }



}

function Surrogate() {};
Surrogate.prototype = MovingObject.prototype;
Asteroid.prototype = new Surrogate();

function Asteroid(pos){
  MovingObject.call(this, pos);
};
// takes a position (like MovingObject does)
Asteroid.randomAsteroid = function(maxX, maxY){
  return new Asteroid(
    [maxX * Math.random(), maxY * Math.random()]);
}

Asteroid.prototype.draw = function(ctx){
  //skip if off screen.
  if(!this.offScreen()){
    //draw
    ctx.fillStyle = "black";
    ctx.beginPath();
    ctx.arc(
      this.x,
      this.y,
      25,
      0,
      2 * Math.PI,
      false
    );

    ctx.fill();
  }
}

Ship.prototype = new Surrogate();
  function Ship(pos){
  this.power = 0;
  this.velocity = [0,0];
  this.angle = 0;
  MovingObject.call(this, pos);
};

Ship.prototype.update = function(){
  this.x += this.velocity[0];
  this.y += this.velocity[1];
  if(this.offScreen){
    this.wrapAround(750,750);
  }
}

Ship.prototype.changePower = function(delta){
  this.velocity[0] = this.power * Math.sin(this.angle)
  this.velocity[1] = this.power * -(Math.cos(this.angle))
  this.power += delta;
}

Ship.prototype.draw = function(ctx){
  //skip if off screen.
  if(!this.offScreen()){
    //draw
    ctx.fillStyle = "blue";
    ctx.beginPath();
    ctx.arc(
      this.x,
      this.y,
      25,
      0,
      2 * Math.PI,
      false
    );
    ctx.fill();

    ctx.save();
    ctx.clearRect(0,0, this.width, this.height)
    ctx.translate(this.x,this.y);
    ctx.rotate(this.angle);
    // draw your object

    ctx.fillStyle = "red";
    ctx.beginPath();
    ctx.arc(
      0,
      0 - 25,
      10,
      0,
      2 * Math.PI,
      false
    );
    ctx.fill();
    ctx.restore();
  }
}

Ship.prototype.isHit = function(asteroid){
  delX = (this.x-asteroid.x);
  delY = (this.y-asteroid.y);
  distance = Math.sqrt((delX*delX) + (delY*delY));
  //console.log(distance);
  if (distance <= 50) {
    return true;
  }
}

Ship.prototype.fireBullet = function(game){
  game.bullets.push(new Bullet(game,this.angle, [this.x,this.y]));
}

Bullet.prototype = new Surrogate();
function Bullet(game,angle, pos){
  MovingObject.call(this, pos);
  this.velocity = [0,0];
  this.game = game
  this.angle = angle;
  this.power = 5;
  this.game.bullets.push(this);
};

Bullet.prototype.draw = function(ctx){
  if(!this.offScreen()){
    //draw
    ctx.fillStyle = "green";
    ctx.beginPath();
    ctx.arc(
      this.x,
      this.y,
      2,
      0,
      2 * Math.PI,
      false
    );
    ctx.fill();
  }
}

Bullet.prototype.isHit = function(asteroid){
  delX = (this.x-asteroid.x);
  delY = (this.y-asteroid.y);
  distance = Math.sqrt((delX*delX) + (delY*delY));
  //console.log(distance);
  if (distance <= 24) {
    return true;
  }
}

Bullet.prototype.update = function(){
  this.velocity[0] = this.power * Math.sin(this.angle)
  this.velocity[1] = this.power * -(Math.cos(this.angle))
  this.x += this.velocity[0];
  this.y += this.velocity[1];
  //check to see if we hit anything
}


function Game(contextEl){
  this.bullets = [];
  this.width = contextEl.width;
  this.height = contextEl.height;
  this.ctx = contextEl.getContext("2d");
  var that = this;
  this.asteroids = function(){
   asteroids = [];
   for(var i=0; i < 20; i++){
     asteroids.push(Asteroid.randomAsteroid(that.width, that.height))}
     return asteroids;
   }();
  this.ship = new Ship([this.width/2, this.height/2]);
}

Game.prototype.draw = function(){
  //clears the board
   this.ctx.clearRect(0,0, this.width, this.height)
  //make asteroids
  for(var i=0; i < this.asteroids.length; i++){
    this.asteroids[i].draw(this.ctx);
  }
  this.ship.draw(this.ctx);
   for(var j=0; j<this.bullets.length; j++){
     this.bullets[j].draw(this.ctx);
   }
}

Game.prototype.gameOver = function(){
  this.ctx.clearRect(0,0, this.width, this.height);
  var that = this;
  var img = new Image();
  img.onload = function () {
    that.ctx.drawImage(img, 200, 200);
  };
  img.src = './game-over.jpg';
}

Game.prototype.win = function(ctx){
  this.ctx.clearRect(0,0, this.width, this.height);
  var that = this;
  var img = new Image();
  img.onload = function () {
    that.ctx.drawImage(img, 200, 200);
  };
  img.src = './you-win.gif';
}

Game.prototype.update = function(){
  //write update code here
  this.ship.update();
  //asteroids_dup = this.asteroids.slice(0);
  if (this.asteroids.length === 0) {
    this.win();
    window.clearInterval(this.timerID);
  }
  for(var i=0; i < this.asteroids.length; i++){
    if (this.ship.isHit(this.asteroids[i])) {
      this.gameOver();
      window.clearInterval(this.timerID);
    }
    this.asteroids[i].update([1,1]);
    if (this.asteroids[i].offScreen(this.width, this.height)){
      //this.asteroids.splice(i, 1);
      this.asteroids[i].wrapAround(this.width, this.height);
      //console.log(this.asteroids.length)
    }
  }
  for(var j=0; j<this.bullets.length; j++){
    this.bullets[j].update();
    if (this.bullets[j].offScreen(this.width, this.height)) {
      this.bullets.splice(j, 1);
    }
    for(var k=0; k< this.asteroids.length; k++){
      if(this.bullets[j].isHit(asteroids[k])){
        this.bullets.splice(j,1);
        this.asteroids.splice(k,1);
      }
    }
  }
  //this.asteroids = asteroids_dup.slice(0);
}


Game.prototype.start = function(){

  var that = this;
  this.timerID = window.setInterval(
    function(){
      that.update();
      that.draw();
  }
  , 31.25);
  key('up', function(){
    that.ship.changePower(1);});
  key('down', function(){
    that.ship.changePower(-1);});
  key('left', function(){
    that.ship.angle -= 0.08726;});
  key('right', function(){
    that.ship.angle += 0.08726;});
  key('space', function(){
    that.ship.fireBullet(that);});
}



