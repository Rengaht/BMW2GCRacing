//=========================================================================
// general purpose helpers (mostly math)
//=========================================================================
var yproj=[1,.67,.41,.24,.13,.07,.04,.032,.022];
var dk=[];


var Util = {

  timestamp:        function()                  { return new Date().getTime();                                    },
  toInt:            function(obj, def)          { if (obj !== null) { var x = parseInt(obj, 10); if (!isNaN(x)) return x; } return Util.toInt(def, 0); },
  toFloat:          function(obj, def)          { if (obj !== null) { var x = parseFloat(obj);   if (!isNaN(x)) return x; } return Util.toFloat(def, 0.0); },
  limit:            function(value, min, max)   { return Math.max(min, Math.min(value, max));                     },
  randomInt:        function(min, max)          { return Math.round(Util.interpolate(min, max, Math.random()));   },
  randomChoice:     function(options)           { return options[Util.randomInt(0, options.length-1)];            },
  percentRemaining: function(n, total)          { return (n%total)/total;                                         },
  accelerate:       function(v, accel, dt)      { return v + (accel * dt);                                        },
  interpolate:      function(a,b,percent)       { return a + (b-a)*percent                                        },
  easeIn:           function(a,b,percent)       { return a + (b-a)*Math.pow(percent,2);                           },
  easeOut:          function(a,b,percent)       { return a + (b-a)*(1-Math.pow(1-percent,2));                     },
  easeInOut:        function(a,b,percent)       { return a + (b-a)*((-Math.cos(percent*Math.PI)/2) + 0.5);        },
  exponentialFog:   function(distance, density) { return 1 / (Math.pow(Math.E, (distance * distance * density))); },

  increase:  function(start, increment, max) { // with looping
    var result = start + increment;
    while (result >= max)
      result -= max;
    while (result < 0)
      result += max;
    return result;
  },

  project: function(index,p, cameraX, cameraY, cameraZ, cameraDepth, width, height, roadWidth) {


   //  p.camera.x     = (p.world.x || 0) - cameraX;
   //  p.camera.y     = (p.world.y || 0) - cameraY;
   //  p.camera.z     = (p.world.z || 0) - cameraZ;
    
   // // rotate by x-axis 
   //  let rx=p.camera.x;
   //  let ry=p.camera.y*Math.cos(CameraTilt)-p.camera.z*Math.sin(CameraTilt);
   //  let rz=p.camera.y*Math.sin(CameraTilt)+p.camera.z*Math.cos(CameraTilt);

   //  p.camera.x=rx;
   //  p.camera.y=ry;
   //  p.camera.z=rz;

   //  p.screen.scale = cameraDepth/p.camera.z;
   //  p.screen.x     = Math.round((width/2)  + (p.screen.scale * p.camera.x  * width/2));
   //  p.screen.y     = Math.round((height*(1.0-RoadRatio)) - (p.screen.scale *  p.camera.y  * height*RoadRatio));
   //  p.screen.w     = Math.round(             (p.screen.scale * roadWidth   * width/2));

    p.camera.x     = (p.world.x || 0) - cameraX;
    p.camera.y     = (p.world.y || 0) - cameraY;
    p.camera.z     = (p.world.z || 0) - cameraZ;

    let iseg=Math.floor(index/segmentPerDraw);
    let inter=index/segmentPerDraw-iseg;
    let d_=Util.interpolate(dk[iseg],dk[iseg+1],inter);

    p.screen.scale = d_/p.camera.z;

    let xp=p.camera.x*cameraDepth/p.camera.z;

    
    let yp=p.camera.y*d_/p.camera.z;
    // let yp=p.camera.y* p.screen.scale;
    
    // console.log("project: "+index+" "+d_);

    p.screen.x     = Math.round((width/2)  + (xp* width/2));
    p.screen.y     = Math.round((height*(1.0-RoadRatio)) - (yp * height*RoadRatio));
    p.screen.w     = Math.round(( yp * height*RoadRatio/cameraDepth));
    // p.screen.w     = Math.round(( p.screen.scale*roadWidth * width/2));

    //  p.camera.x     = (p.world.x || 0) - cameraX;
    // p.camera.y     = (p.world.y || 0) - cameraY;
    // p.camera.z     = (p.world.z || 0) - cameraZ;

    // p.screen.scale = cameraDepth/p.camera.z;
   
    // p.screen.x     = Math.round((width/2)  + (p.screen.scale * p.camera.x  * width/2));
    // p.screen.y     = Math.round((height*(1.0-RoadRatio)) - (p.screen.scale * p.camera.y  * height*RoadRatio));
    // p.screen.w     = Math.round(             (p.screen.scale * roadWidth   * width/2));
  },

  overlap: function(x1, w1, x2, w2, percent) {
    var half = (percent || 1)/2;
    var min1 = x1 - (w1*half);
    var max1 = x1 + (w1*half);
    var min2 = x2 - (w2*half);
    var max2 = x2 + (w2*half);
    return ! ((max1 < min2) || (min1 > max2));
  }

}

//=========================================================================
// POLYFILL for requestAnimationFrame
//=========================================================================

if (!window.requestAnimationFrame) { // http://paulirish.com/2011/requestanimationframe-for-smart-animating/
  window.requestAnimationFrame = window.webkitRequestAnimationFrame || 
                                 window.mozRequestAnimationFrame    || 
                                 window.oRequestAnimationFrame      || 
                                 window.msRequestAnimationFrame     || 
                                 function(callback, element) {
                                   window.setTimeout(callback, 1000 / 60);
                                 }
}


//=========================================================================
// minimalist DOM helpers
//=========================================================================
var Dom = {

  get:  function(id)                     { return ((id instanceof HTMLElement) || (id === document)) ? id : document.getElementById(id); },
  set:  function(id, html)               { Dom.get(id).innerHTML = html;                        },
  on:   function(ele, type, fn, capture) { Dom.get(ele).addEventListener(type, fn, capture);    },
  un:   function(ele, type, fn, capture) { Dom.get(ele).removeEventListener(type, fn, capture); },
  show: function(ele, type)              { Dom.get(ele).style.display = (type || 'block');      },
  blur: function(ev)                     { ev.target.blur();                                    },

  addClassName:    function(ele, name)     { Dom.toggleClassName(ele, name, true);  },
  removeClassName: function(ele, name)     { Dom.toggleClassName(ele, name, false); },
  toggleClassName: function(ele, name, on) {
    ele = Dom.get(ele);
    var classes = ele.className.split(' ');
    var n = classes.indexOf(name);
    on = (typeof on == 'undefined') ? (n < 0) : on;
    if (on && (n < 0))
      classes.push(name);
    else if (!on && (n >= 0))
      classes.splice(n, 1);
    ele.className = classes.join(' ');
  },

  storage: window.localStorage || {}

}

//=========================================================================
// GAME LOOP helpers
//=========================================================================

var Game = {  // a modified version of the game loop from my previous boulderdash game - see http://codeincomplete.com/posts/2011/10/25/javascript_boulderdash/#gameloop

  run: function(options) {

    // Game.loadImages(options.images, function(images) {

      options.ready(); // tell caller to initialize itself because images are loaded and we're ready to rumble

      Game.setKeyListener(options.keys);

      var canvas = options.canvas,    // canvas render target is provided by caller
          update = options.update,    // method to update game logic is provided by caller
          render = options.render,    // method to render the game is provided by caller
          step   = options.step,      // fixed frame step (1/fps) is specified by caller
          stats  = options.stats,     // stats instance is provided by caller
          now    = null,
          last   = Util.timestamp(),
          dt     = 0,
          gdt    = 0;

      function frame() {
        now = Util.timestamp();
        // console.log(now);

        dt  = Math.min(1, (now - last) / 1000); // using requestAnimationFrame have to be able to handle large delta's caused when it 'hibernates' in a background or non-visible tab
        gdt = gdt + dt;
        while (gdt > step) {
          gdt = gdt - step;
          update(step);
        }
        render();
        // stats.update();
        last = now;
        requestAnimationFrame(frame, canvas);
      }
      frame(); // lets get this party started
      // Game.playMusic();
    // });
  },

  //---------------------------------------------------------------------------

  loadImages: function(names, callback) { // load multiple images and callback when ALL images have loaded
    var result = [];
    var count  = names.length;

    var onload = function() {
      if (--count == 0)
        callback(result);
    };

    for(var n = 0 ; n < names.length ; n++) {
      var name = names[n];
      result[n] = document.createElement('img');
      Dom.on(result[n], 'load', onload);
      result[n].src = "images/" + name + ".png";
    }
  },

  //---------------------------------------------------------------------------

  setKeyListener: function(keys) {
    var onkey = function(keyCode, mode) {
      var n, k;
      for(n = 0 ; n < keys.length ; n++) {
        k = keys[n];
        k.mode = k.mode || 'up';
        if ((k.key == keyCode) || (k.keys && (k.keys.indexOf(keyCode) >= 0))) {
          if (k.mode == mode) {
            k.action.call();
          }
        }
      }
    };
    Dom.on(document, 'keydown', function(ev) { onkey(ev.keyCode, 'down'); } );
    Dom.on(document, 'keyup',   function(ev) { onkey(ev.keyCode, 'up');   } );
  },

  //---------------------------------------------------------------------------

  stats: function(parentId, id) { // construct mr.doobs FPS counter - along with friendly good/bad/ok message box

    // var result = new Stats();
    // result.domElement.id = id || 'stats';
    // Dom.get(parentId).appendChild(result.domElement);

    // var msg = document.createElement('div');
    // msg.style.cssText = "border: 2px solid gray; padding: 5px; margin-top: 5px; text-align: left; font-size: 1.15em; text-align: right;";
    // msg.innerHTML = "Your canvas performance is ";
    // Dom.get(parentId).appendChild(msg);

    // var value = document.createElement('span');
    // value.innerHTML = "...";
    // // document.getElementById("_stats").appendChild(value);

    // setInterval(function() {
    //   var fps   = result.current();
    //   var ok    = (fps > 50) ? 'good'  : (fps < 30) ? 'bad' : 'ok';
    //   var color = (fps > 50) ? 'green' : (fps < 30) ? 'red' : 'gray';
    //   value.innerHTML       = ok;
    //   value.style.color     = color;
    //   msg.style.borderColor = color;
    // }, 5000);
    // return result;
  },

  //---------------------------------------------------------------------------

  playMusic: function() {
    var music = Dom.get('music');
    music.loop = true;
    music.volume = 0.05; // shhhh! annoying music!
    music.muted = (Dom.storage.muted === "true");
    music.play();
    Dom.toggleClassName('mute', 'on', music.muted);
    Dom.on('mute', 'click', function() {
      Dom.storage.muted = music.muted = !music.muted;
      Dom.toggleClassName('mute', 'on', music.muted);
    });
  }

}

var KEY = {
  LEFT:  37,
  UP:    38,
  RIGHT: 39,
  DOWN:  40,
  A:     65,
  D:     68,
  S:     83,
  W:     87
};

var COLORS = {
  SKY:  '#72D7EE',
  TREE: '#005108',
  FOG:  '#005108',
  LIGHT:  { road: '#6B6B6B', grass: '#10AA10', rumble: '#555555', lane: '#CCCCCC'  },
  DARK:   { road: '#696969', grass: '#009A00', rumble: '#BBBBBB'                   },
  START:  { road: 'white',   grass: 'white',   rumble: 'white'                     },
  FINISH: { road: 'black',   grass: 'black',   rumble: 'black'                     }
};
var SPRITE_ROAD={
  COIN:   ['logo.png'],  
  COMBO:  ['logo2-1.png'],
  CONE:   ['cone-1.png','cone-2.png','cone-3.png'],
  BLOCK:   ['block-1.png','block-2.png','block-3.png'],
  LIGHT:   ['light-1.png','light-2.png','light-3.png']
}
var SPRITES1={
  TREE:        ['1-tree-1.png','1-tree-2.png'],
  TURN_LEFT:        ['1-turn-left.png'],
  TURN_RIGHT:       ['1-turn-right.png'],
  GRASS:       ['1-grass1.png','1-grass2.png','1-grass3.png','1-grass4.png','1-grass5.png','1-grass6.png'],
  HOUSE_LEFT:  ['1-house1-left.png','1-house2-left.png'], 
  HOUSE_RIGHT:  ['1-house1-right.png','1-house2-right.png'], 
  BOARD:       ['1-board1.png','1-board2.png'],
  TOWER:       ['1-tower1.png','1-tower2.png'],
  START:['start.png']
};



