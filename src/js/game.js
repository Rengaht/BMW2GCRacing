var Container,autoDetectRenderer,loader,resources,Sprite,Texture,Rectangle;
var _app;

var _background;
var _sky,_mountain,_road,_car,_scene_side,_scene_road;
var _container_traffic_light,_start_gate;
var _index_traffic_light;

var _texture_scene=[];
var _texture_car;
var _texture_road;
var _last_car_pos;




var _shader_road,_shader_lane,_shader_rumble;

var _windowWidth,_windowHeight;
var RoadRatio=.6;
var MoutainRatio=.124;
var CarScale;
var SpriteScale=1.0/513;

var PolyPerSeg=4+(lanes-1);

var _sound_bgm;
var _sound_fx={};


function onload(){

	// setup pixi
	setupPixi();	
	loadTexture();
	loadSound();
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
			.add('gate','asset/img/sprite/gate.json')
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

	_container_traffic_light=new PIXI.Container();
	for(var i=0;i<6;++i){
		_container_traffic_light.addChild(new PIXI.Sprite(resources.gate.textures['light_cover.png']));
	}
	setTrafficLight(0);
	_start_gate=new PIXI.Sprite(resources.gate.textures['start.png']);

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
						// if(vTextureCoord.x<1.0){ gl_FragColor=vec4(0.72,0.72,0.72,1.0);}\
						// else if(vTextureCoord.x<2.0){ gl_FragColor=vec4(0.59,0.59,0.59,1.0);}\
						// else if(vTextureCoord.x<3.0){ gl_FragColor=vec4(1.0,1.0,1.0,1.0);}\
						// else if(vTextureCoord.x<4.0){ gl_FragColor=vec4(0.5,0.91,0.56,1.0);}\
						// else if(vTextureCoord.x<5.0){ gl_FragColor=vec4(0.26,0.78,0.5,1.0);}\
						
							
	let uniforms={
		uSampler:resources.road.texture,
		uColor:new Float32Array([1.,1.,1.,1.])
	};
	_shader_road=PIXI.Shader.from(vertex_shader,frag_shader,uniforms);
	

	_road=new Container();

	_scene_side=new Container();
	_scene_road=new Container();

	_scene_road.sortableChildren=true;
	_scene_side.sortableChildren=true;

 	for(var n=0;n<drawDistance;n++){
 		for(var i=0;i<PolyPerSeg;++i){
 			_road.addChild(new PIXI.Mesh(createQuadGeometry(n/drawDistance,0,
 															0,0,0,0,0,0),
 										_shader_road));
	 	}
	 	// scene object
	 	let sprite_left=new PIXI.Sprite();
	 	let sprite_right=new PIXI.Sprite();
	 	
	 	let z=drawDistance-n;
	 	sprite_left.zIndex=z;
	 	sprite_right.zIndex=z;

	 	_scene_side.addChild(sprite_left);
	 	_scene_side.addChild(sprite_right);

	 	// road object
	 	let coin_left=new PIXI.Sprite();
	 	let coin_center=new PIXI.Sprite();
	 	let coin_right=new PIXI.Sprite();

	 	coin_left.zIndex=drawDistance-n;
	 	coin_center.zIndex=drawDistance-n;
	 	coin_right.zIndex=drawDistance-n;

	 	_scene_road.addChild(coin_left);
	 	_scene_road.addChild(coin_center);
	 	_scene_road.addChild(coin_right);

 	}




	
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

	_background.addChild(_start_gate);
	_background.addChild(_container_traffic_light);

	CarScale=width/1800;

   _app.ticker.add(function(delta){

   		if(segments.length<1) return;
   		
   		let dt=_app.ticker.deltaMS/1000;

   		// while(dt>step){
   			update(dt);
   		// 	dt-=step;
   		// }
   		render();
   });
	
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
	position=0;
	score=0;
	life=MaxLife;
	currentLapTime=0;
	speed=0;
	lastSegment=0;
	setupScene(0);
	playerX=0;

	updateHud();

	cameraDepth            = 1 / Math.tan((fieldOfView/2) * Math.PI/180);
	// playerZ                = 15*segmentLength;
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
	// if(segments.length==0)
	resetRoad(); // only rebuild road when necessary

	showItem($('#_hint'));
	setupCarSprite(_driver_color);

	indexScene=0;
	setupScene(indexScene);

	_app.ticker.start();

	setTrafficLight(0);	
	_sound_bgm.fade(0.5,1.0,1000);
}

function startGame(){

	hideItem($('#_hint'));		

	

	setTimeout(function(){
		_sound_fx['light_count'].play();
		//TODO: countdown here 
		setTrafficLight(0);	
		setTimeout(function(){
			setTrafficLight(1);
			
		},1000);
		setTimeout(function(){
			setTrafficLight(2);
		
		},2000);

		setTimeout(function(){
			isPlaying=true;	
			console.log("------------- Start Game -------------");	
			_sound_bgm.seek(0);
			_sound_bgm.play();	
		},3000);

		
	},500);


}

function createQuadGeometry(x1, y1, x2, y2, x3, y3, x4, y4){

	var vertices=[x1, y1, x2, y2, x3, y3,
				  x3, y3, x4, y4,x1, y1];

	// var uvs=[0,x1,0,x1+.2,1,x1+.2,
	// 		1,x1+.2,1,x1+.2,0,x1];
	var uvs=[0,0,0,0,0,0,0,0,0,0,0];
	
	var index=[0,1,2,3,4,5,6];
	
	let geometry=new PIXI.Geometry();
	geometry.addAttribute('aVertexPosition',vertices,2);
	geometry.addAttribute('aTextureCoord',uvs,2);
	geometry.addIndex(index);

	return geometry;
}


function endGame(){

  if(!isPlaying) return;

  _sound_fx['goal'].play();
  _sound_bgm.fade(1.0,0,1500);

  console.log("------------- End Game "+formatTime(currentLapTime)+"-------------");
  isPlaying=false;
  setDriverScore(score);

  setTimeout(function(){

  	   _app.ticker.stop();

	  showItem($('#_score'));
	  showItem($('#_button_rank'));
  },2000);
}

function setTrafficLight(set_){
	for(var i=0;i<2;++i){
		for(var j=0;j<3;++j){
			if(j==set_) _container_traffic_light.getChildAt(i*3+j).visible=false;
			else _container_traffic_light.getChildAt(i*3+j).visible=true;
		}
	}
}

function loadSound(){
	_sound_bgm=new Howl({
		src:['asset/sound/Running_Scared.mp3'],
		loop:true
	});

	_sound_fx['button_large']=new Howl({src:['asset/sound/button_large.mp3']});
	_sound_fx['button_small']=new Howl({src:['asset/sound/button_small.mp3']});
	_sound_fx['button_disable']=new Howl({src:['asset/sound/button_disable.mp3']});
	
	_sound_fx['light_count']=new Howl({src:['asset/sound/light_count.wav']});

	_sound_fx['coin']=new Howl({src:['asset/sound/coin_1.mp3']});
	_sound_fx['combo']=new Howl({src:['asset/sound/combo_2.mp3']});
	_sound_fx['bump']=new Howl({src:['asset/sound/bump_2.wav']});
	
	_sound_fx['horn']=new Howl({src:['asset/sound/engine.mp3']});
	_sound_fx['engine']=new Howl({src:['asset/sound/engine.mp3']});

	_sound_fx['goal']=new Howl({src:['asset/sound/goal.mp3']});
	
}