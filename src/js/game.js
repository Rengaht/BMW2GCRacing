var Container,autoDetectRenderer,loader,resources,Sprite,Texture,Rectangle;
var _app;

var _background;
var _sky,_mountain,_road,_car,_scene_side,_scene_road;

var _texture_scene=[];
var _texture_car;
var _texture_road;
var _last_car_pos;

var _shader_road,_shader_lane,_shader_rumble;

var _windowWidth,_windowHeight;
var RoadRatio=.6;
var MoutainRatio=.124;
var _spriteScale;

var PolyPerSeg=4+(lanes-1);


function onload(){

	// setup pixi
	setupPixi();	
	loadTexture();
	
	// setup hud
	hud={
		speed:{ value: null, dom: $('#_speed_value')},
		score:{ value: null, dom: $('#_hud_score')},
		time:{ value: null, dom: $('#_hud_time') },
		life:{ value: null, dom: $('#_life_star') }
	};

	Game.setKeyListener(
	   [{ keys: [KEY.LEFT,  KEY.A], mode: 'down', action: function() { keyLeft   = true;  } },
	    { keys: [KEY.RIGHT, KEY.D], mode: 'down', action: function() { keyRight  = true;  } },
	    { keys: [KEY.LEFT,  KEY.A], mode: 'up',   action: function() { keyLeft   = false; } },
	    { keys: [KEY.RIGHT, KEY.D], mode: 'up',   action: function() { keyRight  = false; } }]);


}
function setupPixi(){
	Container = PIXI.Container;
	autoDetectRenderer = PIXI.autoDetectRenderer;
	loader = PIXI.Loader.shared;
	// resources = PIXI.Loader.resources;
	Sprite = PIXI.Sprite;
	Texture=PIXI.Texture;
	Rectangle=PIXI.Rectangle;


	width=_windowWidth=window.innerWidth;
	height=_windowHeight=window.innerHeight;

	

	_app=new PIXI.Application({
	    autoResize:true,
	    resolution: devicePixelRatio,
	    antialias:true,
	    transparent:true,
	    width:_windowWidth,
	    height:_windowHeight
	    // backgroundColor:0x061639
 	 });


	document.getElementById('_game_frame').appendChild(_app.view);
}

function loadTexture(){
	
	loader.add('sky','asset/img/texture-02.png')
			.add('mountain','asset/img/texture-03.png')
			.add('road','asset/img/texture/txt-24.png')
			.add('side_road','asset/img/texture/txt-27.png')
			.add('ref','asset/img/ref.png')
			.add('car','asset/img/sprite/car.json')
			.add('road_element','asset/img/sprite/road.json')
			.add('other_car','asset/img/sprite/other_car.json')
			.add('scene1','asset/img/sprite/scene1.json')
			.add('scene2','asset/img/sprite/scene2.json')
			.add('scene3','asset/img/sprite/scene3.json')
			.add('start_sign','asset/img/start.png')
			.add('goal_sign','asset/img/goal.png')
			.load(loadFinish);

}
function loadFinish(loader,resources_){

	resources=resources_;

	_background=new Container();
	_app.stage.addChild(_background);

	_sky=new PIXI.TilingSprite(resources.sky.texture,_windowWidth,_windowHeight*(1.0-RoadRatio+yproj[drawDistance/segmentPerDraw]));	
	_sky.tileScale.x=_sky.tileScale.y=_windowWidth/resources.sky.texture.width;
	
	_mountain=new PIXI.TilingSprite(resources.mountain.texture,_windowWidth,_windowHeight*MoutainRatio);
	_mountain.y=_windowHeight*(1.0-RoadRatio+yproj[drawDistance/segmentPerDraw]-MoutainRatio);
	_mountain.tileScale.x=_mountain.tileScale.y=_windowHeight*MoutainRatio/resources.mountain.texture.height;	
	
	_ref=new PIXI.TilingSprite(resources.ref.texture,_windowWidth,_windowHeight);
	_ref.tileScale.x=_ref.tileScale.y=Math.min(_windowWidth/resources.ref.texture.width,_windowHeight/resources.ref.texture.height);
	_ref.tilePosition.x=_windowWidth*.5-_ref.tileScale.x*resources.ref.texture.width*.5;
	
	// sprite texture

	_texture_scene.push(resources.scene1.textures);
	_texture_scene.push(resources.scene2.textures);
	_texture_scene.push(resources.scene3.textures);
	

	_texture_road=resources.road_element.textures;
	_texture_car=resources.car.textures;

	// load road
	
	let vertex_shader='precision highp float;\
						attribute vec2 aVertexPosition;\
						attribute vec2 aTextureCoord;\
						uniform mat3 projectionMatrix;\
						uniform mat3 translationMatrix;\
						uniform mat3 uTextureMatrix;\
						varying vec2 vTextureCoord;\
						void main(void)\
						{\
							gl_Position.xyw = projectionMatrix * translationMatrix * vec3(aVertexPosition, 1.0);\
							gl_Position.z = 0.0;\
							vTextureCoord = aTextureCoord;\
						}';
						// vTextureCoord = (uTextureMatrix * vec3(aTextureCoord, 1.0)).xy;
	let frag_shader="varying vec2 vTextureCoord;\
					uniform vec4 uColor;\
					uniform sampler2D uSampler;\
					void main(void){\
						if(vTextureCoord.x<1.0){ gl_FragColor=vec4(0.72,0.72,0.72,1.0);}\
						else if(vTextureCoord.x<2.0){ gl_FragColor=vec4(0.59,0.59,0.59,1.0);}\
						else if(vTextureCoord.x<3.0){ gl_FragColor=vec4(1.0,1.0,1.0,1.0);}\
						else if(vTextureCoord.x<4.0){ gl_FragColor=vec4(0.5,0.91,0.56,1.0);}\
						else if(vTextureCoord.x<5.0){ gl_FragColor=vec4(0.26,0.78,0.5,1.0);}\
					}";
						//gl_FragColor = texture2D(uSampler, vTextureCoord) * uColor;\
							
	let uniforms={
		uSampler:resources.road.texture,
		uColor:new Float32Array([1.,1.,1.,1.])
	};
	_shader_road=PIXI.Shader.from(vertex_shader,frag_shader,uniforms);
	

	_road=new Container();

	_scene_side=new Container();
	_scene_road=new Container();

 	for(var n=0;n<drawDistance;n++){
 		for(var i=0;i<PolyPerSeg;++i){
 			_road.addChild(new PIXI.Mesh(createQuadGeometry(n/drawDistance,0,
 															0,0,0,0,0,0),
 										_shader_road));
	 	}
	 	// scene object
	 	let sprite_left=new PIXI.Sprite();
	 	let sprite_right=new PIXI.Sprite();
	 	
	 	sprite_left.zIndex=sprite_right.zIndex=drawDistance-n;

	 	_scene_side.addChild(sprite_left);
	 	_scene_side.addChild(sprite_right);

	 	// road object
	 	let coin_left=new PIXI.Sprite();
	 	let coin_center=new PIXI.Sprite();
	 	let coin_right=new PIXI.Sprite();

	 	coin_left.zIndex=coin_center.zIndex=coin_right.zIndex=drawDistance-n;

	 	_scene_road.addChild(coin_left);
	 	_scene_road.addChild(coin_center);
	 	_scene_road.addChild(coin_right);

 	}


	_scene_road.sortableChildren=true;
	_scene_side.sortableChildren=true;


	
	// laod car texture
	_car=new PIXI.Sprite(_texture_car['car1-left.png']);
	
	_driver_color='blue';
	setupCarSprite(_driver_color);
	

	_background.addChild(_sky);
	_background.addChild(_mountain);

	_background.addChild(_road);
	_background.addChild(_scene_side);
	_background.addChild(_scene_road);
	_background.addChild(_car);

	_spriteScale=0.3*(1/_car.texture.width);
	// _app.ticker.add(delta=>gameLoop(delta));
	
}
function setupCarSprite(color_){
	let id=null;
	switch(color_){
		case 'blue': id='1'; break;
		case 'red': id='2'; break;
		case 'gray': id='3'; break;
		case 'white': id='4'; break;
	}
	_sprite_car={'center':'car'+id+'-center.png',
				 'left':'car'+id+'-left.png',
				 'right':'car'+id+'-right.png'};
	_last_car_pos='center';

	_car.texture=_texture_car[_sprite_car[_last_car_pos]];
}


function setupGame(){

	// show hint
	showItem($('#_hint'));
	setupCarSprite(_driver_color);

	Game.run({
	  render: render, 
	  update: update,
	  step: step,
	  ready: function() {
	    reset();

	    indexScene=0;
	   	setupScene(indexScene);
	  }
	});


}

function startGame(){

	hideItem($('#_hint'));
		
	setTimeout(function(){
		
		//TODO: countdown here 


		isPlaying=true;
		console.log("------------- Start Game -------------");		
	},500);


}

function createQuadGeometry(x1, y1, x2, y2, x3, y3, x4, y4){

	var vertices=[x1, y1, x2, y2, x3, y3,
				  x3, y3, x4, y4,x1, y1];

	// var uvs=[0,x1,0,x1+.2,1,x1+.2,
	// 		1,x1+.2,1,x1+.2,0,x1];
	var uvs=[0,0.5,0,0.5,1,0.5,
			1,0.5,1,0.5,0,0.5];
	
	var index=[0,1,2,3,4,5,6];
	
	let geometry=new PIXI.Geometry();
	geometry.addAttribute('aVertexPosition',vertices,2);
	geometry.addAttribute('aTextureCoord',uvs);
	// geometry.addIndex(index);

	return geometry;
}


 function reset(){
  
  position=0;
  score=0;
  life=MaxLife;
  currentLapTime=0;
  speed=0;

  updateHud();
  
  cameraDepth            = 1 / Math.tan((fieldOfView/2) * Math.PI/180);
  playerZ                = (cameraHeight * cameraDepth);
  resolution             = height/480;
  roadWidth				 = height*RoadRatio/cameraDepth;
  
  // roadWidth				 = width*0.65/(cameraDepth/segmentLength*(width/2));
  // segmentLength			 = (zfar)/drawDistance;

  // setup projection  
  if(dk.length==0){  
	  for(var i=0;i<mDrawSegment+1;++i){
	  	dk.push((yproj[i])*(((i+1)*segmentLength*segmentPerDraw-cameraDepth)/cameraHeight));
	  }
  }
  if(segments.length==0)
    resetRoad(); // only rebuild road when necessary

}

function endGame(){

if(!isPlaying) return;

  console.log("------------- End Game "+formatTime(currentLapTime)+"-------------");
  isPlaying=false;

  setDriverScore(score);
  showItem($('#_score'));
  showItem($('#_button_rank'));
}

