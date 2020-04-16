var fps            = 60;                      // how many 'update' frames per second
var step           = 1/fps;                   // how long is each frame (in seconds)
var width          = null;                    // logical canvas width
var height         = null;                     // logical canvas height

var centrifugal    = 0.3;                     // centrifugal force multiplier when going around curves
var offRoadDecel   = 0.99;                    // speed multiplier when off road (e.g. you lose 2% speed each update frame)
var skySpeed       = 0.001;                   // background sky layer scroll speed when going around curve (or up hill)
var hillSpeed      = 0.002;                   // background hill layer scroll speed when going around curve (or up hill)
var treeSpeed      = 0.003;                   // background tree layer scroll speed when going around curve (or up hill)
var skyOffset      = 0;                       // current sky scroll offset
var hillOffset     = 0;                       // current hill scroll offset
var treeOffset     = 0;                       // current tree scroll offset

var segments       = [];                      // array of road segments
var cars           = [];                      // array of cars on the road
// var stats          = Game.stats('fps');       // mr.doobs FPS counter
// var canvas         = Dom.get('canvas');       // our canvas...
// var ctx            = canvas.getContext('2d'); // ...and its drawing context
var background     = null;                    // our background image (loaded below)
var sprites        = null;                    // our spritesheet (loaded below)
var resolution     = null;                    // scaling factor to provide resolution independence (computed)
var roadWidth      = 2191;                    // actually half the roads width, easier math if the road spans from -roadWidth to +roadWidth

var segmentLength  = 500;                     // length of a single segment
var segmentPerDraw = 10;
var mDrawSegment   = 8;

var rumbleLength   = 3;                       // number of segments per red/white rumble strip
var trackLength    = null;                    // z length of entire track (computed)
var lanes          = 3;                       // number of lanes

var fieldOfView    = 134;                     // angle (degrees) for field of view
var cameraHeight   = 1000;                    // z height of camera
var cameraDepth    = null;                    // z distance camera is from screen (computed)
var drawDistance   = 80;                     // number of segments to draw


var playerX        = 0;                       // player x offset from center of road (-1 to 1 to stay independent of roadWidth)
var playerZ        = null;                    // player relative z distance from camera (computed)
var fogDensity     = 5;                       // exponential fog density
var position       = 0;                       // current camera Z position (add playerZ to get player's absolute Z position)
var speed          = 0;                       // current speed
// var maxSpeed       = se。gmentLength/step;      // top speed (ensure we can't move more than 1 segment in a single frame to make collision detection easier)
var accel          =  0;             // acceleration rate - tuned until it 'felt' right
// var breaking       = -maxSpeed;               // deceleration rate when braking
// var decel          = -maxSpeed/5;             // 'natural' deceleration rate when neither accelerating, nor braking
// var offRoadDecel   = -maxSpeed/2;             // off road deceleration is somewhere in between
// var offRoadLimit   =  maxSpeed/4;             // limit when off road deceleration no longer applies (e.g. you can always go at least this speed even when off road)
var lastSegment =0;


// scene settings
var indexScene =0;
var totalScene =3;
var sceneInterval=20;  // 20s for each scene
var sceneSpeedRatio=[1,1.5,2,3];
var lengthScene=1000; // segment count for scene 1
var BaseSpeed  =lengthScene*segmentLength/(sceneInterval*1.25);
var isPlaying=false;
var maxSpeed=BaseSpeed*sceneSpeedRatio[sceneSpeedRatio.length-1];

var sceneSegment=[];
var tmp=0;
for(var i=0;i<totalScene;++i){
  let len=.5*BaseSpeed*(sceneSpeedRatio[i]+sceneSpeedRatio[i+1])*sceneInterval;  
  tmp+=Math.round(len/segmentLength);
  sceneSegment.push(tmp);
}

var score=0;

var MaxLife=3;
var life=MaxLife;

var totalCars      = [10,50,60];                     // total number of cars on the road
var totalCoins     = [50,60,70];
var totalCombos    = [5,10,25];
var totalObstacles = [20,40,80];

var sidePosition=[-2,2];
var onRoadPosition = [-0.8,0,0.8];


var currentLapTime = 0;                       // current lap time
var lastLapTime    = null;                    // last lap time

var keyLeft        = false;
var keyRight       = false;
var keyFaster      = false;
var keySlower      = false;


var hud = null;


//=========================================================================
// UPDATE THE GAME WORLD
//=========================================================================

function update(dt) {

  if(isPlaying){
    position = Util.increase(position, dt * speed, trackLength);
    speed=Util.increase(speed, dt * accel,sceneSpeedRatio[indexScene+1]*BaseSpeed);
    currentLapTime+=dt;
  }


  var n, car, carW, sprite, spriteW;
  var playerSegment = findSegment(position+playerZ);
  


  // var playerW       = SPRITES.PLAYER_STRAIGHT.w * SPRITES.SCALE;
  var playerW       = _texture_car['car1-center.png'].width * _spriteScale;
  var speedPercent  = speed/maxSpeed;
  var dx            = dt * 2 * speedPercent; // at top speed, should be able to cross from left to right (-1 to 1) in 1 second
  var startPosition = position;

  if(playerSegment.index>=sceneSegment[indexScene]){
    if(indexScene<totalScene-1){
      setupScene(indexScene+1);
      indexScene++;
    }
    else endGame();
  }

  updateCars(dt, playerSegment, playerW);

  

  if (keyLeft)
    playerX = playerX - dx;
  else if (keyRight)
    playerX = playerX + dx;

  // playerX = playerX - (dx * speedPercent * playerSegment.curve * centrifugal);
  

  

  if ((playerX < -1) || (playerX > 1)) {

    // if (speed > offRoadLimit)
    //   speed = Util.accelerate(speed, offRoadDecel, dt);

    for(n = 0 ; n < playerSegment.sprites.length ; n++) {
      // sprite  = playerSegment.sprites[n];
      // spriteW = sprite.source.w * SPRITES.SCALE;
      // if (Util.overlap(playerX, playerW, sprite.offset + spriteW/2 * (sprite.offset > 0 ? 1 : -1), spriteW)) {
      //   // speed = maxSpeed/5;
      //   // position = Util.increase(playerSegment.p1.world.z, -playerZ, trackLength); // stop in front of sprite (at front of segment)
      //   break;
      // }
    }
  }

  for(n = 0 ; n < playerSegment.cars.length ; n++) {
    car  = playerSegment.cars[n];
    carW = car.sprite.w * SPRITES.SCALE;
    if (speed > car.speed) {
      if (Util.overlap(playerX, playerW, car.offset, carW, 0.8)) {
        // speed    = car.speed * (car.speed/speed);
        // position = Util.increase(car.z, -playerZ, trackLength);
        break;
      }
    }
  }

  playerX = Util.limit(playerX, -1, 1);     // dont ever let it go too far out of bounds
  // speed   = Util.limit(speed, 0, maxSpeed); // or exceed maxSpeed

  skyOffset  = Util.increase(skyOffset,  skySpeed  * playerSegment.curve * (position-startPosition)/segmentLength, 1);
  hillOffset = Util.increase(hillOffset, hillSpeed * playerSegment.curve * (position-startPosition)/segmentLength, 1);
  treeOffset = Util.increase(treeOffset, treeSpeed * playerSegment.curve * (position-startPosition)/segmentLength, 1);


  if(isPlaying) updateHud();
}

//-------------------------------------------------------------------------

function updateCars(dt, playerSegment, playerW) {
  var n, car, oldSegment, newSegment;
  for(n = 0 ; n < cars.length ; n++) {
    car         = cars[n];
    oldSegment  = findSegment(car.z);
    car.offset  = car.offset + updateCarOffset(car, oldSegment, playerSegment, playerW);
    car.z       = Util.increase(car.z, dt * car.speed, trackLength);
    car.percent = Util.percentRemaining(car.z, segmentLength); // useful for interpolation during rendering phase
    newSegment  = findSegment(car.z);
    if (oldSegment != newSegment) {
      index = oldSegment.cars.indexOf(car);
      oldSegment.cars.splice(index, 1);
      newSegment.cars.push(car);
    }
  }
}

function updateCarOffset(car, carSegment, playerSegment, playerW) {

  var i, j, dir, segment, otherCar, otherCarW, lookahead = 20, carW = car.sprite.w * SPRITES.SCALE;

  // optimization, dont bother steering around other cars when 'out of sight' of the player
  if ((carSegment.index - playerSegment.index) > drawDistance)
    return 0;

  for(i = 1 ; i < lookahead ; i++) {
    segment = segments[(carSegment.index+i)%segments.length];

    if ((segment === playerSegment) && (car.speed > speed) && (Util.overlap(playerX, playerW, car.offset, carW, 1.2))) {
      if (playerX > 0.5)
        dir = -1;
      else if (playerX < -0.5)
        dir = 1;
      else
        dir = (car.offset > playerX) ? 1 : -1;
      return dir * 1/i * (car.speed-speed)/maxSpeed; // the closer the cars (smaller i) and the greated the speed ratio, the larger the offset
    }

    for(j = 0 ; j < segment.cars.length ; j++) {
      otherCar  = segment.cars[j];
      otherCarW = otherCar.sprite.w * SPRITES.SCALE;
      if ((car.speed > otherCar.speed) && Util.overlap(car.offset, carW, otherCar.offset, otherCarW, 1.2)) {
        if (otherCar.offset > 0.5)
          dir = -1;
        else if (otherCar.offset < -0.5)
          dir = 1;
        else
          dir = (car.offset > otherCar.offset) ? 1 : -1;
        return dir * 1/i * (car.speed-otherCar.speed)/maxSpeed;
      }
    }
  }

  // if no cars ahead, but I have somehow ended up off road, then steer back on
  if (car.offset < -0.9)
    return 0.1;
  else if (car.offset > 0.9)
    return -0.1;
  else
    return 0;
}

//-------------------------------------------------------------------------
function updateHud(){
  updateHudElement('speed',Math.round(Util.interpolate(0,200,speed/maxSpeed)));
  updateHudElement('time', formatTime(totalScene*sceneInterval-currentLapTime));
  updateHudElement('life', life);
  updateHudElement('score',pad(score,4));
}

function updateHudElement(key, value){ // accessing DOM can be slow, so only do it if value has changed
  if(hud[key].value!==value){
    hud[key].value=value;
    Dom.set(key, value,hud[key].dom);
  }
}

function formatTime(dt) {
  
  var seconds = Math.floor(dt);
  var tenths  = Math.floor(10 * (dt - Math.floor(dt)));

  return pad(seconds,2) + ":" + pad(tenths,2);
}
function pad(n,width,z){
  z = z || '0';
  n = n + '';
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

//=========================================================================
// RENDER THE GAME WORLD
//=========================================================================

function render() {

	// _scene.removeChildren();
	// _road.removeChildren();

	// console.log("---------------render loop---------------");

  var baseSegment   = findSegment(position);
  var basePercent   = Util.percentRemaining(position, segmentLength);
  var playerSegment = findSegment(position+playerZ);
  var playerPercent = Util.percentRemaining(position+playerZ, segmentLength);
  var playerY       = Util.interpolate(playerSegment.p1.world.y, playerSegment.p2.world.y, playerPercent);
  var maxy          = height;

  var x  = 0;
  var dx = - (baseSegment.curve * basePercent);

  // ctx.clearRect(0, 0, width, height);

  //TODO:
  Render.background(_sky, width, height, skyOffset,  resolution * skySpeed  * playerY);
  Render.background(_mountain, width, height, hillOffset, resolution * hillSpeed * playerY);
  // Render.background(background, width, height, BACKGROUND.TREES, treeOffset, resolution * treeSpeed * playerY);

  
  var n, i, segment, car, spriteScale, spriteX, spriteY,sprite;
  var coin, road, obstacle;


  // reset all scene sprite
  for(n=0;n<_scene_road.children.length;++n){
    _scene_road.getChildAt(n).visible=false;
  }
  for(n=0;n<_scene_side.children.length;++n){
    _scene_side.getChildAt(n).visible=false;
  }

  for(n = 0 ; n < drawDistance ; n++) {

    segment        = segments[(baseSegment.index + n) % segments.length];
    segment.looped = segment.index < baseSegment.index;
    segment.fog    = Util.exponentialFog(n/drawDistance, fogDensity);
    segment.clip   = maxy;

    Util.project(n,segment.p1, 
                (playerX  * roadWidth) - x, playerY + cameraHeight, position - (segment.looped ? trackLength : 0), 
                cameraDepth, width, height, roadWidth);
    Util.project((n+1),segment.p2, 
                (playerX  * roadWidth) - x - dx, playerY + cameraHeight, position - (segment.looped ? trackLength : 0), 
                cameraDepth, width, height, roadWidth);

    x  = x + dx;
    dx = dx + segment.curve;

     if ((segment.p1.camera.z <= cameraDepth)         || // behind us
    	 (segment.p2.screen.y >= segment.p1.screen.y) || // back face cull
        (segment.p2.screen.y >= maxy))                  // clip by (already rendered) hill
      continue;

    Render.segment(Math.round(baseSegment.index +n),width, lanes,
                   segment.p1.screen.x,
                   segment.p1.screen.y,
                   segment.p1.screen.w,
                   segment.p2.screen.x,
                   segment.p2.screen.y,
                   segment.p2.screen.w,
                   segment.fog,
                   segment.color);

    maxy = segment.p1.screen.y;
  }

  for(n=0;n<drawDistance;++n){
    segment = segments[(baseSegment.index + n) % segments.length];

    let index_draw=(baseSegment.index + n)%drawDistance;
    // for(i = 0 ; i < segment.cars.length ; i++) {
    //   car         = segment.cars[i];
    //   sprite      = car.sprite;
    //   spriteScale = Util.interpolate(segment.p1.screen.scale, segment.p2.screen.scale, car.percent);
    //   spriteX     = Util.interpolate(segment.p1.screen.x,     segment.p2.screen.x,     car.percent) + (spriteScale * car.offset * roadWidth * width/2);
    //   spriteY     = Util.interpolate(segment.p1.screen.y,     segment.p2.screen.y,     car.percent);
    //   Render.sprite(ctx, width, height, resolution, roadWidth, sprites, car.sprite, spriteScale, spriteX, spriteY, -0.5, -1, segment.clip);
    // }

    for(i = 0 ; i < segment.sprites.length ; i++) {

      sprite      = segment.sprites[i];

      spriteScale = segment.p1.project.y*height*RoadRatio*SideSpriteXScale/600;
      spriteX     = segment.p1.screen.x + ( sprite.offset *Math.abs(segment.p1.screen.w));
      spriteY     = segment.p1.screen.y;      

     
      Render.sprite(_scene_side.getChildAt(index_draw*2+(sprite.offset<0?0:1)),                   
                    _texture_scene[indexScene][sprite.source], 
                    spriteX, spriteY, 
                    spriteScale);
      // console.log('updage '+n+' -> '+sprite.source);
    }

    for(i=0;i<segment.coins.length;++i){
      
      coin=segment.coins[i];
      spriteScale = segment.p1.project.y*height*RoadRatio*RoadSpriteXScale/386;
      spriteX     = segment.p1.screen.x + ( coin.offset *Math.abs(segment.p1.screen.w));
      spriteY     = segment.p1.screen.y;      
      
      road=(coin.offset==0)?0:(coin.offset<0?1:2);

      Render.sprite(_scene_road.getChildAt(index_draw*3+road),
                    _texture_road[coin.source], 
                    spriteX, spriteY, 
                    spriteScale);

    }
    for(i=0;i<segment.obstacles.length;++i){
      
      obstacle=segment.obstacles[i];
      spriteScale = segment.p1.project.y*height*RoadRatio*RoadSpriteWScale/386;
      spriteX     = segment.p1.screen.x + ( obstacle.offset *Math.abs(segment.p1.screen.w));
      spriteY     = segment.p1.screen.y;      
      
      road=(obstacle.offset==0)?0:(obstacle.offset<0?1:2);

      Render.sprite(_scene_road.getChildAt(index_draw*3+road),
                    _texture_road[obstacle.source], 
                    spriteX, spriteY, 
                    spriteScale);

    }


    if (segment == playerSegment) {
      Render.player(width, height, resolution, roadWidth, sprites, BaseSpeed/speed,
                    cameraDepth/playerZ,
                    width/2,
                    (height/2) - (cameraDepth/playerZ * Util.interpolate(playerSegment.p1.camera.y, playerSegment.p2.camera.y, playerPercent) * height/2),
                    speed * (keyLeft ? -1 : keyRight ? 1 : 0),
                    playerSegment.p2.world.y - playerSegment.p1.world.y);
    }
  }
  
  // console.log("--------------------------------");
}

function findSegment(z) {
  return segments[Math.floor(z/segmentLength) % segments.length]; 
}

//=========================================================================
// BUILD ROAD GEOMETRY
//=========================================================================

function lastY() { return (segments.length == 0) ? 0 : segments[segments.length-1].p2.world.y; }

function addSegment(curve, y) {
  var n = segments.length;
  segments.push({
      index: n,
         p1: { world: { y: lastY(), z:  n   *segmentLength }, camera: {}, screen: {},project:[] },
         p2: { world: { y: y,       z: (n+1)*segmentLength }, camera: {}, screen: {},project:[] },
      curve: curve,
    sprites: [],
       cars: [],
      coins:[],
  obstacles:[],
      color: Math.floor(n/rumbleLength)%2 ? COLORS.DARK : COLORS.LIGHT
  });
}

function addSprite(n, texture, offset) {

  segments[n].sprites.push({ source: texture, offset: offset });

}

function addRoad(enter, hold, leave, curve, y) {
  var startY   = lastY();
  var endY     = startY + (Util.toInt(y, 0) * segmentLength);
  var n, total = enter + hold + leave;
  for(n = 0 ; n < enter ; n++)
    addSegment(Util.easeIn(0, curve, n/enter), Util.easeInOut(startY, endY, n/total));
  for(n = 0 ; n < hold  ; n++)
    addSegment(curve, Util.easeInOut(startY, endY, (enter+n)/total));
  for(n = 0 ; n < leave ; n++)
    addSegment(Util.easeInOut(curve, 0, n/leave), Util.easeInOut(startY, endY, (enter+hold+n)/total));
}

var ROAD = {
  LENGTH: { NONE: 0, SHORT:  25, MEDIUM:   50, LONG:  100 },
  HILL:   { NONE: 0, LOW:    20, MEDIUM:   40, HIGH:   60 },
  CURVE:  { NONE: 0, EASY:    2, MEDIUM:    4, HARD:    6 }
};

function addStraight(num) {
  num = num || ROAD.LENGTH.MEDIUM;
  addRoad(num, num, num, 0, 0);
}

function addHill(num, height) {
  num    = num    || ROAD.LENGTH.MEDIUM;
  height = height || ROAD.HILL.MEDIUM;
  addRoad(num, num, num, 0, height);
}

function addCurve(num, curve, height) {
  num    = num    || ROAD.LENGTH.MEDIUM;
  curve  = curve  || ROAD.CURVE.MEDIUM;
  height = height || ROAD.HILL.NONE;
  addRoad(num, num, num, curve, height);
}
    
function addLowRollingHills(num, height) {
  num    = num    || ROAD.LENGTH.SHORT;
  height = height || ROAD.HILL.LOW;
  addRoad(num, num, num,  0,                height/2);
  addRoad(num, num, num,  0,               -height);
  addRoad(num, num, num,  ROAD.CURVE.EASY,  height);
  addRoad(num, num, num,  0,                0);
  addRoad(num, num, num, -ROAD.CURVE.EASY,  height/2);
  addRoad(num, num, num,  0,                0);
}

function addSCurves() {
  addRoad(ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM,  -ROAD.CURVE.EASY,    ROAD.HILL.NONE);
  addRoad(ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM,   ROAD.CURVE.MEDIUM,  ROAD.HILL.MEDIUM);
  addRoad(ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM,   ROAD.CURVE.EASY,   -ROAD.HILL.LOW);
  addRoad(ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM,  -ROAD.CURVE.EASY,    ROAD.HILL.MEDIUM);
  addRoad(ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM,  -ROAD.CURVE.MEDIUM, -ROAD.HILL.MEDIUM);
}

function addBumps() {
  addRoad(10, 10, 10, 0,  5);
  addRoad(10, 10, 10, 0, -2);
  addRoad(10, 10, 10, 0, -5);
  addRoad(10, 10, 10, 0,  8);
  addRoad(10, 10, 10, 0,  5);
  addRoad(10, 10, 10, 0, -7);
  addRoad(10, 10, 10, 0,  5);
  addRoad(10, 10, 10, 0, -2);
}

function addDownhillToEnd(num) {
  num = num || 200;
  addRoad(num, num, num, -ROAD.CURVE.EASY, -lastY()/segmentLength);
}

function resetRoad() {
  segments = [];

  addStraight(sceneSegment[0]);
  addStraight(sceneSegment[1]-sceneSegment[0]);
  addStraight(sceneSegment[2]-sceneSegment[1]);
  // addSCurves();
  // addCurve(ROAD.LENGTH.SHORT, ROAD.CURVE.MEDIUM, ROAD.HILL.NONE);

  resetSprites();
  resetCoins();
  resetObstacles();
  
  //resetCars();


  segments[findSegment(playerZ).index + 2].color = COLORS.START;
  segments[findSegment(playerZ).index + 3].color = COLORS.START;
  for(var n = 0 ; n < rumbleLength ; n++)
    segments[segments.length-1-n].color = COLORS.FINISH;

  trackLength = segments.length * segmentLength;
}

function resetSprites() {
  
  var n, i;


  // scene 1
  addSprite(20,SPRITES1.START[0],-1);

  for(var scene_=0;scene_<totalScene;++scene_){

    let start_seg=scene_<1?0:sceneSegment[scene_-1];
    let end_seg=sceneSegment[scene_];

    for(var i=start_seg;i<end_seg;++i){
       
      if(i%(segmentPerDraw)!=0) continue;
 
      for(var j=0;j<2;++j){
        
        let dir=sidePosition[j];

        if(Math.random()*1<1){
          let option_=Math.round(Math.random()*(i<1?5:4));
          let txt=getRandomSprite(scene_,option_,dir);

          if(txt!=null) 
            addSprite(i,txt,dir);
        }

      }

    }

  }
  
}
function getRandomSprite(index_,opt_,dir_){

  let txt=null;
  switch(index_){
    case 0:
      switch(opt_){
        case 0:  
          txt=SPRITES1.TREE[Math.round(Math.random()*2)];
          break;
        case 1:  
          txt=SPRITES1.GRASS[Math.round(Math.random()*4)];
          break;
        case 2:
          if(dir_<0) txt=SPRITES1.HOUSE.left[Math.round(Math.random()*2)];
          else txt=SPRITES1.HOUSE.right[Math.round(Math.random()*2)];
          break;
        case 3:
          txt=SPRITES1.BOARD[Math.round(Math.random()*2)];
          break;
        case 4:
          txt=SPRITES1.TOWER[Math.round(Math.random()*2)];
          break;
      }
      break;
    case 1:
      switch(opt_){
        case 0:  
          txt=SPRITES2.BRIDGE[0];
          break;
        case 1:
          if(dir_<0) txt=SPRITES2.HOUSE.left[Math.round(Math.random()*4)];
          else txt=SPRITES2.HOUSE.right[Math.round(Math.random()*4)];
          break;
        case 2:
          txt=SPRITES2.BOARD[Math.round(Math.random()*2)];
          break;
        case 3:
          if(dir_<0) txt=SPRITES2.LIGHT.left[0];
          else  txt=SPRITES2.LIGHT.right[0];
          break;
      }
      break;
    case 2:
      switch(opt_){
        case 0:  
          txt=SPRITES3.CHAIR[Math.round(Math.random()*3)];
          break;
        case 1:
          if(dir_<0) txt=SPRITES3.HOUSE.left[0];
          break;
        case 2:
          txt=SPRITES3.BOARD[Math.round(Math.random()*2)];
          break;
        case 3:
          txt=SPRITES3.UMBRELLA[Math.round(Math.random()*4)];
          break;
      }
      break;
    default:
      break;
  }
  return txt;
}

function resetCars() {
  cars = [];
  var n, car, segment, offset, z, sprite, speed;
  for (var n = 0 ; n < totalCars ; n++) {
    offset = Math.random() * Util.randomChoice([-0.8, 0.8]);
    z      = Math.floor(Math.random() * segments.length) * segmentLength;
    sprite = Util.randomChoice(SPRITES.CARS);
    speed  = maxSpeed/4 + Math.random() * maxSpeed/(sprite == SPRITES.SEMI ? 4 : 2);
    car = { offset: offset, z: z, sprite: sprite, speed: speed };
    segment = findSegment(car.z);
    segment.cars.push(car);
    cars.push(car);
  }
}

function resetCoins(){

  for(var scene_=0;scene_<totalScene;++scene_){

    let start_seg=scene_<1?0:sceneSegment[scene_-1];
    let end_seg=sceneSegment[scene_];

    var count=totalCoins[scene_]+totalCombos[scene_];

    var arr=[];
    for(var i=start_seg;i<end_seg;++i) arr.push(i);
    shuffleArray(arr);

    for(var i=0;i<count;++i){

        let offset=Util.randomChoice(onRoadPosition);
        let coin={offset:offset,
                  source:(i<totalCombos[scene_])?'logo2-1.png':'logo.png',
                  score:(i<totalCombos[scene_])?5:1};

        segments[arr[i]].coins.push(coin);
    }

  }
}
function resetObstacles(){

  for(var scene_=0;scene_<totalScene;++scene_){

    let start_seg=scene_<1?0:sceneSegment[scene_-1];
    let end_seg=sceneSegment[scene_];

    var count=totalObstacles[scene_];

    var arr=[];
    for(var i=start_seg;i<end_seg;++i) arr.push(i);
    shuffleArray(arr);

    for(var i=0;i<count;++i){

        let pos_=[];
        let coin_pos=null;
        if(segments[arr[i]].coins.length>0){
          coin_pos=segments[arr[i]].coins[0].offset;
        }
        for(var k=0;k<onRoadPosition.length;++k){
          if(onRoadPosition[k]!=coin_pos) pos_.push(onRoadPosition[k]);
        }

        let offset=Util.randomChoice(pos_);
        let obstacle={offset:offset,
                      source:(Math.random()*2<1)?'cone-'+(scene_+1)+'.png':'block-'+(scene_+1)+'.png'};

        segments[arr[i]].obstacles.push(obstacle);
    }

  }
}



function shuffleArray(array){
    for (var i = array.length - 1; i > 0; i--) {
        var rand = Math.floor(Math.random() * (i + 1));
        [array[i], array[rand]] = [array[rand], array[i]]
    }
}

function setupScene(index){
  console.log("-------------Enter scene "+index+"  "+formatTime(currentLapTime)+"-------------");
  speed=sceneSpeedRatio[index]*BaseSpeed;
  accel=(sceneSpeedRatio[index+1]*BaseSpeed-speed)/sceneInterval;
  console.log("v= "+speed+"  a= "+accel);
}
