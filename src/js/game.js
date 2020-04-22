var Container,autoDetectRenderer,loader,resources,Sprite,Texture,Rectangle;
var _app;

var _background;
var _sky,_mountain,_road,_car,_scene_side,_scene_road;
var _ribbon;
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
var RibbonCount=80;

var PolyPerSeg=6+(lanes-1);

var _sound_bgm,_sound_game;
var _sound_fx={};
var _resize_timeout;

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

	 window.addEventListener('resize', resize);


	if(window.PointerEvent){
		 document.getElementById('_game').addEventListener('pointerdown',onGameClick);
		 document.getElementById('_game').addEventListener('pointerup',onGameMouseUp);
	}
	document.getElementById('_game_frame').addEventListener('touchstart',function(event){
		event.preventDefault(); 
		if(!isPlaying) return;

		var x=event.pageX/width;
		
	    if(x<ClickBorder) keyLeft=true;
	  	else if(x>1.0-ClickBorder) keyRight=true;
	});
	document.getElementById('_game_frame').addEventListener('touchend',function(event){
		 event.preventDefault(); 

		 keyLeft=false;
		 keyRight=false;

	});
	
	
	document.getElementById('_game').addEventListener('mousedown',onGameClick);
	document.getElementById('_game').addEventListener('mouseup',onGameMouseUp);	
	
	$('#_input_driver').bind("change paste keyup",function(){
		toggleNameError(false);		
		$('#_input_driver').val($('#_input_driver').val().replace(/ /g,''));
	});

	$('#_input_lottery_name').bind("change paste keyup",function(){
		toggleLotteryError(false);		
		$('#_input_lottery_name').val($('#_input_lottery_name').val().replace(/ /g,''));
	});
	$('#_input_lottery_phone').bind("change paste keyup",function(){
		toggleLotteryError(false);		
		$(this).val($(this).val().replace(/[^\d]+/g,''));
		$(this).val($(this).val().replace(/(\d{4})\-?(\d{3})\-?(\d{3})/,'$1-$2-$3'))
	});
	$('#_input_lottery_email').bind("change paste keyup",function(){
		toggleLotteryError(false);		
		$('#_input_lottery_email').val($('#_input_lottery_email').val().replace(/ /g,''));
	});
}
function resize(){
	clearTimeout(_resize_timeout);
	_resize_timeout=setTimeout(doResize,100);
}
function doResize(){
	var ww_ = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth; 
  	var wh_ = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;

  	// var ww_ = (window.innerWidth > 0) ? window.innerWidth : screen.width;
  	// var wh_ = (window.innerHeight > 0) ? window.innerHeight : screen.height;
  	

  	console.log('window size:'+ww_+' x '+wh_);

  	_windowWidth=width=ww_;
  	_windowHeight=height=wh_;

  	if(_app){
  		
  		_sky.width=ww_;
  		_sky.height=wh_*(1.0-RoadRatio+yproj[drawDistance/segmentPerDraw]);	
		_sky.tileScale.x=_sky.tileScale.y=ww_/resources.sky.texture.width;
	
		_mountain.width=ww_;
		_mountain.height=wh_*MoutainRatio;
		_mountain.y=wh_*(1.0-RoadRatio+yproj[drawDistance/segmentPerDraw]-MoutainRatio);
		_mountain.tileScale.x=_mountain.tileScale.y=wh_*MoutainRatio/resources.mountain.texture.height;	



		 _app.renderer.resize(ww_,wh_);
  	}
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
			.add('mountain','asset/img/mountain-1.png')
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
			.add('ribbon','asset/img/sprite/ribbon.json')
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
	
	// _ref=new PIXI.TilingSprite(resources.ref.texture,_windowWidth,_windowHeight);
	// _ref.tileScale.x=_ref.tileScale.y=Math.min(_windowWidth/resources.ref.texture.width,_windowHeight/resources.ref.texture.height);
	// _ref.tilePosition.x=_windowWidth*.5-_ref.tileScale.x*resources.ref.texture.width*.5;
	
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
	let uniforms={
		uSampler:resources.road.texture,
		uColor:new Float32Array([1.,1.,1.,1.]),
		vColor:1.0,
		width:width,
		height:height,
		roadColor1:SceneColor[indexScene].roadColor1,
	    roadColor2:SceneColor[indexScene].roadColor2,
	    laneColor1:SceneColor[indexScene].laneColor1,
	    laneColor2:SceneColor[indexScene].laneColor2,
	    grassColor1:SceneColor[indexScene].grassColor1,
	    grassColor2:SceneColor[indexScene].grassColor2,
	    grassColor3:SceneColor[indexScene].grassColor3,
	    grassColor4:SceneColor[indexScene].grassColor4,
	    sideColor1:SceneColor[indexScene].sideColor1,
	    sideColor2:SceneColor[indexScene].sideColor2
	};
	_shader_road=PIXI.Shader.from(vertex_shader,frag_shader,uniforms);
	

	_road=new Container();

	_scene_side=new Container();
	_scene_road=new Container();

	_scene_road.sortableChildren=true;
	_scene_side.sortableChildren=true;

 	for(var n=0;n<drawDistance;n++){
 		for(var i=0;i<PolyPerSeg;++i){
 			_road.addChild(new PIXI.Mesh(createQuadGeometry((n%segmentPerDraw)/segmentPerDraw,0,0,
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

 	_ribbon=new Container();
 	for(var n=0;n<RibbonCount;++n){
 		var index=Math.floor(Math.random()*12)+1;
 		var ribbon=new PIXI.Sprite(resources.ribbon.textures['ribbon-'+pad(index,2)+'.png']);
 		ribbon.scaleX=Math.random();
 		ribbon.scaleY=Math.random(); 		
 		ribbon.angle=Math.random()*360;
 		ribbon.speed=Math.random()*.01+.01;
 		_ribbon.addChild(ribbon);
 	}


	
	// laod car texture
	_car=new PIXI.Sprite(_texture_car['car1-center.png']);
	CarScale=width/3*.8/_texture_car['car1-center.png'].width;

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
	_background.addChild(_ribbon);
	

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
	roadWidth			   = height*RoadRatio/cameraDepth;

	
	// roadWidth				 = width*0.65/(cameraDepth/segmentLength*(width/2));
	// segmentLength			 = (zfar)/drawDistance;

	// setup projection  
	if(dk.length==0){  
		for(var i=0;i<mDrawSegment+1;++i){
			dk.push((yproj[i])*(((i+1)*segmentLength*segmentPerDraw-cameraDepth)/cameraHeight));
		}
	}

	setupCarSprite(_driver_color);

	indexScene=0;
	setupScene(indexScene);
	setShaderUniforms(indexScene,indexScene,0);

	// if(segments.length==0)
	resetRoad('map-2.csv',function(){
		
		indexScene=0;
		_ribbon.visible=false;
	
		_app.ticker.start();

		setTrafficLight(0);	
		
	});
}

function startGame(){

	hideItem($('#_hint'));	
	_sound_fx['button_large'].play();

	_sound_game.seek(0);	
	_sound_game.stop();
	
	for(var n=0;n<RibbonCount;++n)
		_ribbon.getChildAt(i).visible=false;

	setTimeout(function(){
	
		_sound_bgm.stop();
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
			
			_sound_game.play();
			_sound_game.fade(0.5,1.0,1000);
			_sound_game.seek(0);
		},3000);

		
	},500);


}

function createQuadGeometry(index,x1, y1, x2, y2, x3, y3, x4, y4){

	var vertices=[x1, y1, x2, y2, x3, y3,x4, y4];

	// var uvs=[0,x1,0,x1+.2,1,x1+.2,
	// 		1,x1+.2,1,x1+.2,0,x1];
	var uvs=[0,index+1.0/segmentPerDraw,
			 0,index,
			 1,index,
			 1,index+1.0/segmentPerDraw];
	
	var index=[0,1,2,0,2,3];
	
	let geometry=new PIXI.Geometry();
	geometry.addAttribute('aVertexPosition',vertices,2);
	geometry.addAttribute('aTextureCoord',uvs,2);
	geometry.addIndex(index);

	return geometry;
}


function endGame(fail){

  if(!isPlaying) return;

  if(fail){
  	_sound_fx['fail'].play();
  }else{
	  _sound_fx['goal'].play();
	  _sound_fx['goal'].volume(1.0);
  }
  // _sound_fx['goal'].fade(0.0,1.0,500);

  _sound_game.stop();
  isPlaying=false;
  	   
 

  console.log("------------- End Game "+formatTime(currentLapTime)+"-------------");
 
  setDriverScore(score);

  setTimeout(function(){
  		
  	   sendScore(function(){
  	    
  	    showScore();  	   
  	   	if(_sound_fx['goal'].playing())
  	   		_sound_fx['goal'].fade(1.0,0.0,500);
  	    _sound_bgm.play();
  		_sound_bgm.fade(0.0,1.0,2000);

  		_app.ticker.stop();

  	  });
  },500);
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
		src:['asset/sound/274_full_dirt-and-bones_0163_preview.mp3'],
		loop:true
	});
	_sound_bgm.play();

	_sound_game=new Howl({
		src:['asset/sound/Sport_Electronic_Trailer.mp3']		
	});



	_sound_fx['button_large']=new Howl({src:['asset/sound/button_large.mp3']});
	_sound_fx['button_small']=new Howl({src:['asset/sound/button_small.mp3']});
	_sound_fx['button_disable']=new Howl({src:['asset/sound/button_disable.mp3']});
	
	_sound_fx['light_count']=new Howl({src:['asset/sound/light_count.wav']});

	_sound_fx['coin']=new Howl({src:['asset/sound/coin_1.mp3']});
	_sound_fx['combo']=new Howl({src:['asset/sound/combo_2.mp3']});
	_sound_fx['bump']=new Howl({src:['asset/sound/bump_2.wav']});
	
	_sound_fx['horn']=new Howl({src:['asset/sound/horn.mp3']});
	_sound_fx['engine']=new Howl({src:['asset/sound/engine.mp3']});

	_sound_fx['goal']=new Howl({src:['asset/sound/goal.mp3']});

	_sound_fx['other_car']=new Howl({src:['asset/sound/other_car.mp3']});
	
	_sound_fx['fail']=new Howl({src:['asset/sound/fail.mp3']});
}

function updateRibbon(gateX,gateY,gateScale,zIndex){
	
	gateX=width/2;
	gateY=height;
	gateScale=1;
	let gateW=width;//2000*gateScale;
    let gateH=height;//800*gateScale;

    gateX=gateX-gateW/2;
    gateY=gateY-gateH;

	var ribbon;
	for(var n=0;n<RibbonCount;++n){
		ribbon=_ribbon.getChildAt(n);
		// ribbon.x=Math.random()*resources.gate.textures['goal.png'].width;
		ribbon.x=ribbon.scaleX*gateW+gateX
		ribbon.y=ribbon.scaleY*gateH+gateY; 		
		// ribbon.scale.x=gateScale;
		// ribbon.scale.y=gateScale;
		ribbon.angle=(ribbon.angle+.01)%360;

		ribbon.scaleY+=ribbon.speed;
		if(ribbon.scaleY>=1) ribbon.scaleY=-Math.random()*.3;

		// 、ribbon.angle=Math.random()*360;
	}
}
