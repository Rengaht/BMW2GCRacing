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


var rumbleLength   = 3;                       // number of segments per red/white rumble strip
var trackLength    = null;                    // z length of entire track (computed)
var lanes          = 3;                       // number of lanes

var fieldOfView    = 134;                     // angle (degrees) for field of view
var cameraHeight   = 1000;                    // z height of camera
var cameraDepth    = null;                    // z distance camera is from screen (computed)
var drawDistance   = 80;                     // number of segments to draw
var mDrawSegment   = 8;
var segmentPerDraw = drawDistance/mDrawSegment;


var playerX        = 0;                       // player x offset from center of road (-1 to 1 to stay independent of roadWidth)
var playerZ        = 15*segmentLength;                    // player relative z distance from camera (computed)
var fogDensity     = 5;                       // exponential fog density
var position       = 0;                       // current camera Z position (add playerZ to get player's absolute Z position)
var speed          = 0;                       // current speed
// var maxSpeed       = se。gmentLength/step;      // top speed (ensure we can't move more than 1 segment in a single frame to make collision detection easier)
var accel          =  0;             // acceleration rate - tuned until it 'felt' right
// var breaking       = -maxSpeed;               // deceleration rate when braking
// var decel          = -maxSpeed/5;             // 'natural' deceleration rate when neither accelerating, nor braking
// var offRoadDecel   = -maxSpeed/2;             // off road deceleration is somewhere in between
// var offRoadLimit   =  maxSpeed/4;             // limit when off road deceleration no longer applies (e.g. you can always go at least this speed even when off road)
var lastPlayerSegment =0;


// scene settings
var indexScene =0;
var totalScene =3;
var sceneInterval=[25,20,15];  // 20s for each scene
var sceneLapsedInterval=[];
var tmp=0;
for(var i=0;i<totalScene;++i){
  tmp+=sceneInterval[i];
  sceneLapsedInterval.push(tmp);
}

var sceneSpeedRatio=[0,1.25,1.5,2];
var lengthScene=400; // segment count for scene 1
var BaseSpeed  =lengthScene*segmentLength/(sceneInterval[0]*(sceneSpeedRatio[0]+sceneSpeedRatio[1])/2);
var isPlaying=false;
var maxSpeed=BaseSpeed*sceneSpeedRatio[sceneSpeedRatio.length-1];

var sceneSegment=[];

tmp=0;
for(var i=0;i<totalScene;++i){
  let len=.5*BaseSpeed*(sceneSpeedRatio[i]+sceneSpeedRatio[i+1])*sceneInterval[i];  
  tmp+=Math.ceil(len/segmentLength);
  sceneSegment.push(tmp);
}

var score=0;

var MaxLife=3;
var life=MaxLife;

var totalCars      = [5,8,12];               // total number of cars on the road
var totalCoins     = [150,250,300];
var totalCombos    = [10,20,30];
var totalObstacles = [5,12,15];

var sidePosition=[-2,2,0];
var onRoadPosition = [-1,0,1];

var CoinFlyVel=0.1;
var startGateZ=33*segmentLength;              // position of start gate !!!!

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

  var n, car, carW, sprite, spriteW;
  var playerSegment = findSegment(position+playerZ);
  

  if(isPlaying){

    position = Math.min(position+dt * speed, trackLength);
    if(speed<BaseSpeed*.5) speed=Math.min(speed+dt * accel*5,sceneSpeedRatio[indexScene+1]*BaseSpeed);
    else speed=Math.min(speed+dt * accel,sceneSpeedRatio[indexScene+1]*BaseSpeed);
    currentLapTime+=dt;

    updateCars(dt, playerSegment, playerW);

  }else{
    speed=Math.max(speed-accel*120*dt,0);
  }


  if(playerSegment.index>sceneSegment[indexScene]){
    if(indexScene<totalScene-1) setupScene(indexScene+1);    
    else{
      endGame();
    } 
  }

 // update projection coordinates 
  var baseSegment   = findSegment(position);
  var basePercent   = Util.percentRemaining(position, segmentLength);
  var playerPercent = Util.percentRemaining(position+playerZ, segmentLength*segmentPerDraw);
  var playerY       = Util.interpolate(playerSegment.p1.world.y, playerSegment.p2.world.y, playerPercent);
 
  var x  = 0;
  var dx = - (baseSegment.curve * basePercent);

  for(n = 0 ; n < drawDistance ; n++) {

    segment        = segments[(baseSegment.index + n) % segments.length];
    segment.looped = segment.index < baseSegment.index;
    segment.fog    = Util.exponentialFog(n/drawDistance, fogDensity);
    // segment.clip   = maxy;

    Util.project(n,segment.p1, 
                (playerX  * roadWidth) - x, playerY + cameraHeight, position - (segment.looped ? trackLength : 0), 
                cameraDepth, width, height, roadWidth);
    Util.project((n+1),segment.p2, 
                (playerX  * roadWidth) - x - dx, playerY + cameraHeight, position - (segment.looped ? trackLength : 0), 
                cameraDepth, width, height, roadWidth);


    x  = x + dx;
    dx = dx + segment.curve;


    // update coins
    for(var i=0;i<segment.coins.length;i++){
        if(segment.coins[i].offsetY>0)
            segment.coins[i].offsetY=Math.min(segment.coins[i].offsetY+CoinFlyVel,1);        
    }
    for(var i=0;i<segment.obstacles.length;i++){
        if(segment.obstacles[i].offsetY>0)
            segment.obstacles[i].offsetY=Math.min(segment.obstacles[i].offsetY+CoinFlyVel,1);        
    }
    for(var i=0;i<segment.cars.length;i++){
        if(segment.cars[i].offsetY>0)
            segment.cars[i].offsetY=Math.min(segment.cars[i].offsetY+CoinFlyVel,1);        
    }
  }

  // var playerW       = SPRITES.PLAYER_STRAIGHT.w * SPRITES.SCALE;
  var playerW       = _texture_car['car1-center.png'].width * CarScale;
  var speedPercent  = speed/maxSpeed;
  var dx            = dt * 2 * speedPercent; // at top speed, should be able to cross from left to right (-1 to 1) in 1 second
  var startPosition = position;

 
  
  

  if (keyLeft)
    playerX = playerX - dx;
  else if (keyRight)
    playerX = playerX + dx;

  // playerX = playerX - (dx * speedPercent * playerSegment.curve * centrifugal);
  playerX = Util.limit(playerX, -1, 1);     // dont ever let it go too far out of bounds
  

  // check coins and obstacles
  if(lastPlayerSegment!=playerSegment.index){

    let firstSegment=segments[playerSegment.index];
    let ss=firstSegment.p1.project.y*height*RoadRatio*SideSpriteXScale*SpriteScale;

    for(n = 0 ; n < firstSegment.coins.length ; n++) {
        
        sprite = firstSegment.coins[n];
        spriteW = .5;

        if(Util.overlap(playerX, .5, sprite.offsetX + spriteW/2 * (sprite.offset > 0 ? 1 : -1), spriteW)){
            // console.log('---------- got coin! '+playerSegment.index+'------------');
            score+=firstSegment.coins[n].score;
            sprite.offsetY+=CoinFlyVel;
            if(firstSegment.coins[n].score>1) _sound_fx['combo'].play();
            else _sound_fx['coin'].play();
        }
    }
    for(n = 0 ; n < firstSegment.obstacles.length ; n++) {
        sprite = firstSegment.obstacles[n];
        spriteW = .5;
        if(Util.overlap(playerX, .5, sprite.offsetX + spriteW/2 * (sprite.offset > 0 ? 1 : -1), spriteW)){
            // console.log('---------- bump!'+firstSegment.index+' ------------');
            life=life-1;
            sprite.offsetY+=CoinFlyVel;
            _sound_fx['bump'].play();

            // if(life<=0) endGame();
            break;
        }
    }
  }


  // TODO: check car overlap
  for(n = 0 ; n < playerSegment.cars.length ; n++) {

    car  = playerSegment.cars[n];
    carW = .5;
    if (speed > car.speed) {
      if (Util.overlap(playerX, .5, car.offset, carW, 0.8)){
        life=life-1;
        car.offsetY+=CoinFlyVel;
        _sound_fx['bump'].play();

        // if(life<=0) endGame();

        break;
      }
    }
  }
  

  // speed   = Util.limit(speed, 0, maxSpeed); // or exceed maxSpeed

  skyOffset  = Util.increase(skyOffset,  skySpeed  * playerSegment.curve * (position-startPosition)/segmentLength, 1);
  hillOffset = Util.increase(hillOffset, hillSpeed * playerSegment.curve * (position-startPosition)/segmentLength, 1);
  treeOffset = Util.increase(treeOffset, treeSpeed * playerSegment.curve * (position-startPosition)/segmentLength, 1);

  
  lastPlayerSegment=playerSegment.index;

  if(indexScene>0){
    let dest_=baseSegment.index-sceneSegment[indexScene-1];
    if(dest_<=40){
      setShaderUniforms(indexScene-1,indexScene,Math.min(1,dest_/30));  
    }
    
  }
  updateHud();
}

//-------------------------------------------------------------------------

function updateCars(dt, playerSegment, playerW) {
  

  // TODO: update cars

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

  var i, j, dir, segment, otherCar, otherCarW, lookahead = 20;

  // optimization, dont bother steering around other cars when 'out of sight' of the player
  if ((carSegment.index - playerSegment.index) > drawDistance)
    return 0;

  for(i = 1 ; i < lookahead ; i++) {
    segment = segments[(carSegment.index+i)%segments.length];

    if ((segment === playerSegment) && (car.speed > speed) && (Util.overlap(playerX, .5, car.offset, .5, 1.2))) {
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
      // otherCarW = otherCar.sprite.w * SPRITES.SCALE;
      if ((car.speed > otherCar.speed) && Util.overlap(car.offset, .5, otherCar.offset, .5, 1.2)) {
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
  
  let map_speed=Util.interpolate(0,200,speed/maxSpeed);
  updateHudElement('speed',Math.round(map_speed));
  
  // update speed meter
  let speed_angle=Util.interpolate(-50,135,map_speed/200);
  $('#_speed_pointer').css('transform','rotate('+speed_angle+'deg)');

  let seg_offset=playerZ/segmentLength;
  updateHudElement('time', formatTime(sceneLapsedInterval[totalScene-1]*Math.max(0,1-(lastPlayerSegment-seg_offset)/(sceneSegment[totalScene-1]-seg_offset))));  
  updateHudElement('life',Math.max(0,life));
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

  // var x  = 0;
  // var dx = - (baseSegment.curve * basePercent);

  // ctx.clearRect(0, 0, width, height);

  //TODO:
  Render.background(_sky, width, height, skyOffset,  resolution * skySpeed  * playerY, baseSegment.index/sceneSegment[totalScene-1]);
  Render.background(_mountain, width, height, hillOffset, resolution * hillSpeed * playerY,0);
  // Render.background(background, width, height, BACKGROUND.TREES, treeOffset, resolution * treeSpeed * playerY);

  
  var n, i, segment, car, spriteScale, spriteX, spriteY,sprite;
  var coin, road, obstacle,texture,alpha;


  // reset all scene sprite
  for(n=0;n<_scene_road.children.length;++n){
    _scene_road.getChildAt(n).visible=false;
  }
  for(n=0;n<_scene_side.children.length;++n){
    _scene_side.getChildAt(n).visible=false;
  }
  _start_gate.visible=false;


  for(n = 0 ; n < drawDistance ; n++) {

    if((baseSegment.index + n)>segments.length-1) continue;

    segment        = segments[(baseSegment.index + n)];
    // segment.looped = segment.index < baseSegment.index;
    // segment.fog    = Util.exponentialFog(n/drawDistance, fogDensity);
    // segment.clip   = maxy;

    // Util.project(n,segment.p1, 
    //             (playerX  * roadWidth) - x, playerY + cameraHeight, position - (segment.looped ? trackLength : 0), 
    //             cameraDepth, width, height, roadWidth);
    // Util.project((n+1),segment.p2, 
    //             (playerX  * roadWidth) - x - dx, playerY + cameraHeight, position - (segment.looped ? trackLength : 0), 
    //             cameraDepth, width, height, roadWidth);

    // x  = x + dx;
    // dx = dx + segment.curve;

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
                   segment.scene);

    maxy = segment.p1.screen.y;
  }

  for(n=0;n<drawDistance;++n){
    
    if((baseSegment.index + n)>segments.length-1) continue;
    segment = segments[(baseSegment.index + n)];

    

    let index_draw=(baseSegment.index + n)%drawDistance;
    let index_scene=findSegmentScene(segment.index);

    for(i = 0 ; i < segment.sprites.length ; i++) {

      sprite      = segment.sprites[i];

      spriteScale = segment.p1.project.y*height*RoadRatio*SideSpriteXScale*SpriteScale;
      spriteX     = segment.p1.screen.x + ( sprite.offset *Math.abs(segment.p1.screen.w));
      spriteY     = segment.p1.screen.y;      
      alpha=1;//Math.min(segment.p1.project.y/0.08,1);
      let zIndex=drawDistance-n;

      if(sprite.source===GATE.START){
        texture=resources.gate.textures[sprite.source];
        zIndex=drawDistance;
        Render.trafficLight(_container_traffic_light,
                            spriteX,spriteY,spriteScale,zIndex);

        Render.sprite(_start_gate,                   
                    texture, 
                    spriteX, spriteY, 
                    spriteScale,zIndex,alpha);
        continue;

      }else if(sprite.source===GATE.GOAL) 
        texture=resources.gate.textures[sprite.source];
      else texture     = _texture_scene[index_scene][sprite.source];

      Render.sprite(_scene_side.getChildAt(index_draw*2+(sprite.offset<0?0:1)),                   
                    texture, 
                    spriteX, spriteY, 
                    spriteScale,zIndex,alpha);
      // console.log('updage '+n+' -> '+sprite.source);
    }

    for(i=0;i<segment.coins.length;++i){
      
      coin=segment.coins[i];
      spriteScale = segment.p1.project.y*height*RoadRatio*RoadSpriteXScale*SpriteScale*(1-coin.offsetY);
      spriteX     = segment.p1.screen.x + ( coin.offsetX *Math.abs(segment.p1.screen.w)/lanes*2);
      spriteY     = segment.p1.screen.y - Util.easeInOut(0,1,coin.offsetY)*height;      
      alpha=1;//Math.min(segment.p1.project.y/0.08,1);
      
      if(coin.source===SPRITE_ROAD.COMBO[0]){
        if(Math.floor(currentLapTime*1000)%600>=300) texture=_texture_road[SPRITE_ROAD.COMBO[0]];
        else texture=_texture_road[SPRITE_ROAD.COMBO[1]];
      }else
        texture     = _texture_road[coin.source];

      road=(coin.offset==0)?0:(coin.offset<0?1:2);

      Render.sprite(_scene_road.getChildAt(index_draw*3+road),
                    texture,
                    spriteX, spriteY, 
                    spriteScale,drawDistance-n,alpha);

    }
    for(i=0;i<segment.obstacles.length;++i){
      
      obstacle=segment.obstacles[i];
      spriteScale = segment.p1.project.y*height*RoadRatio*RoadSpriteWScale*SpriteScale*1.2*(1-obstacle.offsetY);
      spriteX     = segment.p1.screen.x + ( obstacle.offsetX *Math.abs(segment.p1.screen.w)/lanes*2);
      spriteY     = segment.p1.screen.y-  Util.easeInOut(0,1,obstacle.offsetY)*height;      
      
      alpha=1;//Math.min(segment.p1.project.y/0.08,1);

      texture     = _texture_road[obstacle.source];
      road=(obstacle.offset==0)?0:(obstacle.offset<0?1:2);

      Render.sprite(_scene_road.getChildAt(index_draw*3+road),
                    texture,
                    spriteX, spriteY, 
                    spriteScale,drawDistance-n,alpha);

    }
    for(i = 0 ; i < segment.cars.length ; i++) {
      car         = segment.cars[i];

      sprite = (Math.abs(car.offsetX-playerX)<.5)?OTHER_CAR[car.color].center:
               (car.offsetX<playerX)?OTHER_CAR[car.color].left:
               OTHER_CAR[car.color].right;
     
      texture      = resources.other_car.textures[sprite];
      
      spriteScale = segment.p1.project.y*height*RoadRatio*RoadSpriteWScale*SpriteScale*1.2*(1-car.offsetY);
      spriteX     = segment.p1.screen.x + ( car.offsetX *Math.abs(segment.p1.screen.w)/lanes*2);
      spriteY     = segment.p1.screen.y-  Util.easeInOut(0,1,car.offsetY)*height;      
      
      road=(car.offset==0)?0:(car.offset<0?1:2);

      Render.sprite(_scene_road.getChildAt(index_draw*3+road),
                    texture,
                    spriteX, spriteY, 
                    spriteScale,drawDistance-n,alpha);
    }


    if (segment == playerSegment) {
      Render.player(resolution, speed/BaseSpeed,
                    CarScale,
                    width/2,
                    // (height/2) - (cameraDepth/playerZ * Util.interpolate(playerSegment.p1.camera.y, playerSegment.p2.camera.y, playerPercent) * height/2),
                    height,
                    speed * (keyLeft ? -1 : keyRight ? 1 : 0));
    }
  }
  
  // console.log("--------------------------------");
}

function findSegment(z) {
  return segments[Math.floor(z/segmentLength) % segments.length]; 
}
function findSegmentScene(index){
  for(var i=0;i<totalScene;++i)
    if(index<sceneSegment[i]) return i;
}

//=========================================================================
// BUILD ROAD GEOMETRY
//=========================================================================

function lastY() { return (segments.length == 0) ? 0 : segments[segments.length-1].p2.world.y; }

function addSegment(curve, y,scene) {
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
      color: Math.floor(n/rumbleLength)%2 ? COLORS.DARK : COLORS.LIGHT,
      scene: scene
  });
}

function addSprite(n, texture, offset) {

  segments[n].sprites.push({ source: texture, offset: offset });

}

function addRoad(enter, hold, leave, curve, y,scene) {
  var startY   = lastY();
  var endY     = startY + (Util.toInt(y, 0) * segmentLength);
  var n, total = enter + hold + leave;
  for(n = 0 ; n < enter ; n++)
    addSegment(Util.easeIn(0, curve, n/enter), Util.easeInOut(startY, endY, n/total),scene);
  for(n = 0 ; n < hold  ; n++)
    addSegment(curve, Util.easeInOut(startY, endY, (enter+n)/total),scene);
  for(n = 0 ; n < leave ; n++)
    addSegment(Util.easeInOut(curve, 0, n/leave), Util.easeInOut(startY, endY, (enter+hold+n)/total),scene);
}

var ROAD = {
  LENGTH: { NONE: 0, SHORT:  25, MEDIUM:   50, LONG:  100 },
  HILL:   { NONE: 0, LOW:    20, MEDIUM:   40, HIGH:   60 },
  CURVE:  { NONE: 0, EASY:    2, MEDIUM:    4, HARD:    6 }
};

function addStraight(num,scene) {
  num = num || ROAD.LENGTH.MEDIUM;
  addRoad(0, num, 0, 0, 0,scene);
}

function addHill(num, height,scene) {
  num    = num    || ROAD.LENGTH.MEDIUM;
  height = height || ROAD.HILL.MEDIUM;
  addRoad(num, num, num, 0, height,scene);
}

function addCurve(num, curve, height,scene) {
  num    = num    || ROAD.LENGTH.MEDIUM;
  curve  = curve  || ROAD.CURVE.MEDIUM;
  height = height || ROAD.HILL.NONE;
  addRoad(num, num, num, curve, height,scene);
}
    
function addLowRollingHills(num, height,scene) {
  num    = num    || ROAD.LENGTH.SHORT;
  height = height || ROAD.HILL.LOW;
  addRoad(num, num, num,  0,                height/2,scene);
  addRoad(num, num, num,  0,               -height,scene);
  addRoad(num, num, num,  ROAD.CURVE.EASY,  height,scene);
  addRoad(num, num, num,  0,                0,scene);
  addRoad(num, num, num, -ROAD.CURVE.EASY,  height/2,scene);
  addRoad(num, num, num,  0,                0,scene);
}

function addSCurves(scene) {
  addRoad(ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM,  -ROAD.CURVE.EASY,    ROAD.HILL.NONE,scene);
  addRoad(ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM,   ROAD.CURVE.MEDIUM,  ROAD.HILL.MEDIUM,scene);
  addRoad(ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM,   ROAD.CURVE.EASY,   -ROAD.HILL.LOW,scene);
  addRoad(ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM,  -ROAD.CURVE.EASY,    ROAD.HILL.MEDIUM,scene);
  addRoad(ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM,  -ROAD.CURVE.MEDIUM, -ROAD.HILL.MEDIUM,scene);
}

function addBumps(scene) {
  addRoad(10, 10, 10, 0,  5,scene);
  addRoad(10, 10, 10, 0, -2,scene);
  addRoad(10, 10, 10, 0, -5,scene);
  addRoad(10, 10, 10, 0,  8,scene);
  addRoad(10, 10, 10, 0,  5,scene);
  addRoad(10, 10, 10, 0, -7,scene);
  addRoad(10, 10, 10, 0,  5,scene);
  addRoad(10, 10, 10, 0, -2,scene);
}

function addDownhillToEnd(num,scene) {
  num = num || 200;
  addRoad(num, num, num, -ROAD.CURVE.EASY, -lastY()/segmentLength,scene);
}

function resetRoad() {
  segments = [];

  addStraight(sceneSegment[0],0);
  addStraight(sceneSegment[1]-sceneSegment[0],1);

  let offsetZ=startGateZ/segmentLength;
  addStraight(sceneSegment[2]-sceneSegment[1]+offsetZ*2,2);
  // addSCurves();
  // addCurve(ROAD.LENGTH.SHORT, ROAD.CURVE.MEDIUM, ROAD.HILL.NONE);

  resetSprites();
  resetCoins();
  resetObstacles();
  
  resetCars();


  segments[findSegment(playerZ).index + 2].color = COLORS.START;
  segments[findSegment(playerZ).index + 3].color = COLORS.START;
  for(var n = 0 ; n < rumbleLength ; n++)
    segments[segments.length-1-n].color = COLORS.FINISH;

  trackLength = segments.length * segmentLength;
}

function resetSprites() {
  
  var n, i;

  let offsetZ=startGateZ/segmentLength;
  addSprite(offsetZ,GATE.START,0);
  addSprite(sceneSegment[totalScene-1],GATE.GOAL,0);

  for(var scene_=0;scene_<totalScene;++scene_){

    let start_seg=scene_<1?0:sceneSegment[scene_-1];
    let end_seg=sceneSegment[scene_];

    let option_=[Math.round(Math.random()*(scene_<1?5:4)),
                 Math.round(Math.random()*(scene_<1?5:4))];

    for(var i=start_seg;i<end_seg;++i){

      if(i%(segmentPerDraw/2)!=0) continue;
      if(i<offsetZ) continue;

      for(var j=0;j<2;++j){
        
        let dir=sidePosition[j];

        if(Math.random()*10>1){ // prob. no sprite
          let txt=getRandomSprite(scene_,option_[j],dir);

          if(txt===SPRITES2.BRIDGE[0]) dir=0;
          if(txt!=null) addSprite(i,txt,dir);
        }


        if(Math.random()*5<1)
          option_[j]=Math.round(Math.random()*(scene_<1?5:4));


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

function resetCars(){

  let offsetZ=startGateZ/segmentLength;
  
  cars = [];
  var n, car, segment, offset, z, sprite, speed,color;
  
  for(var scene_=0;scene_<totalScene;++scene_){
    
    let start_seg=scene_<1?offsetZ:sceneSegment[scene_-1];
    let end_seg=(scene_==totalScene-1?-offsetZ:0)+sceneSegment[scene_];

    for(var n = 0 ; n<totalCars[scene_] ; n++){

      offset = Util.randomChoice(onRoadPosition);
      z      = Math.floor(Math.random()*(end_seg-start_seg)+start_seg)*segmentLength;
      
      color=Math.floor(Math.random()*3);
      sprite = offset<0?OTHER_CAR[color].left:(offset>0?OTHER_CAR[color].right:OTHER_CAR[color].center);
      speed  = sceneSpeedRatio[scene_]/2 + Math.random() * BaseSpeed;
    
      car = { offsetX: offset, 
              offsetY:0,
              z: z, 
              source: sprite, 
              speed: speed, color:color };
    
      segment = findSegment(car.z);
      segment.cars.push(car);
      cars.push(car);
    
    }

  }

}

function resetCoins(){

  let offsetZ=startGateZ/segmentLength;

  for(var scene_=0;scene_<totalScene;++scene_){

    let start_seg=scene_<1?offsetZ:sceneSegment[scene_-1];
    let end_seg=sceneSegment[scene_];

    var count=totalCoins[scene_]+totalCombos[scene_];

    var arr=[];
    for(var i=start_seg;i<end_seg;++i){
        if(i%(segmentPerDraw/2)!=0) continue;
        arr.push(i);
    } 
      
    shuffleArray(arr);
    
    arr=arr.slice(0,count);
    let combo=arr.slice(0,totalCombos[scene_]);

    arr.sort((a,b)=>a-b);

    let dir=Math.floor(Math.random()*onRoadPosition.length);
      
    var added=0;
    for(var i=0;i<arr.length && added<count;++i){
        
        
        if(Math.random()*(1+totalScene-scene_)<1) 
            dir=Math.floor(Math.random()*onRoadPosition.length);

        let mm=Math.random()*2<1?1:Math.floor(Math.random()*2+1);
        for(var k=0;k<mm;++k){

          let off=onRoadPosition[(dir+k)%3];
          let coin={offsetX:off,
                    offsetY:0,
                    source:(combo.indexOf(arr[i])>-1)?'logo2-1.png':'logo.png',
                    score:(combo.indexOf(arr[i])>-1)?5:1};

          segments[arr[i]].coins.push(coin);
          added++;
        }

    }
    console.log(added+" coins added!");

  }
}
function resetObstacles(){

    let offsetZ=startGateZ/segmentLength;

  for(var scene_=0;scene_<totalScene;++scene_){

    let start_seg=scene_<1?offsetZ:sceneSegment[scene_-1];
    let end_seg=sceneSegment[scene_];

    var count=totalObstacles[scene_];

    var arr=[];
    for(var i=start_seg;i<end_seg;++i){
        if(i%(segmentPerDraw/2)!=0) continue;
        arr.push(i);
    } 
    
    shuffleArray(arr);
    // arr=arr.slice(0,count);
    // arr.sort((a,b)=>a-b);

    var added=0;
    for(var i=0;i<count;++i){
        
        let pos_=[];
        for(var k=0;k<onRoadPosition.length;++k){
          
          let off=onRoadPosition[k];
          
          if(segmentHasCoin(arr[i],off)) continue;
          for(var d=0;d<segmentPerDraw/2;++d){
              if(segmentHasCoin(arr[i]-d,off)||segmentHasCoin(arr[i]+d,off)) continue;
          }
          pos_.push(onRoadPosition[k]);
          break;
        }

        if(pos_.length<1) continue;

        let offset=Util.randomChoice(pos_);
        let obstacle={offsetX:offset,
                      offsetY:0,
                      source:(Math.random()*2<1)?'cone-'+(scene_+1)+'.png':'block-'+(scene_+1)+'.png'};

        segments[arr[i]].obstacles.push(obstacle);
        added++;

    }
    console.log(added+" obstacles added!");

  }
}
function segmentHasCoin(index,offset){

  if(index<0 || index>segments.length-1) return false;

  let seg=segments[index];
  for(var i=0;i<seg.coins.length;++i){
    if(seg.coins[i].offsetX==offset) return true;
  }
  return false;
}


function shuffleArray(array){
    for (var i = array.length - 1; i > 0; i--) {
        var rand = Math.floor(Math.random() * (i + 1));
        [array[i], array[rand]] = [array[rand], array[i]]
    }
}

function setupScene(index){
  
  indexScene=index;

  console.log("-------------Enter scene "+index+"  "+formatTime(currentLapTime)+"-------------");
  speed=sceneSpeedRatio[index]*BaseSpeed;
  accel=(sceneSpeedRatio[index+1]*BaseSpeed-speed)/sceneInterval[index];
  console.log("v= "+speed+"  a= "+accel);

  
}
function lerpColor(c1,c2,inter){
  return new Float32Array([Util.interpolate(c1[0],c2[0],inter),
                          Util.interpolate(c1[1],c2[1],inter),
                          Util.interpolate(c1[2],c2[2],inter),
                          Util.interpolate(c1[3],c2[3],inter)]);
}
function setShaderUniforms(index1,index2,inter){

  // console.log(index1+' '+index2+''+inter);

  _shader_road.uniforms.roadColor1=lerpColor(SceneColor[index1].roadColor1,SceneColor[index2].roadColor1,inter);
  _shader_road.uniforms.roadColor2=lerpColor(SceneColor[index1].roadColor2,SceneColor[index2].roadColor2,inter);
  _shader_road.uniforms.laneColor1=lerpColor(SceneColor[index1].laneColor1,SceneColor[index2].laneColor1,inter);
  _shader_road.uniforms.laneColor2=lerpColor(SceneColor[index1].laneColor2,SceneColor[index2].laneColor2,inter);
  _shader_road.uniforms.grassColor1=lerpColor(SceneColor[index1].grassColor1,SceneColor[index2].grassColor1,inter);
  _shader_road.uniforms.grassColor2=lerpColor(SceneColor[index1].grassColor2,SceneColor[index2].grassColor2,inter);
  _shader_road.uniforms.grassColor3=lerpColor(SceneColor[index1].grassColor3,SceneColor[index2].grassColor3,inter);
  _shader_road.uniforms.grassColor4=lerpColor(SceneColor[index1].grassColor4,SceneColor[index2].grassColor4,inter);
  _shader_road.uniforms.sideColor1=lerpColor(SceneColor[index1].sideColor1,SceneColor[index2].sideColor1,inter);
  _shader_road.uniforms.sideColor2=lerpColor(SceneColor[index1].sideColor2,SceneColor[index2].sideColor2,inter);
}


