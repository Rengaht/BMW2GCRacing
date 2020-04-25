var totalCoins     = [150,250,300]; //
var totalCombos    = [10,20,30]; //60
var totalObstacles = [5,12,15];

var ROAD_SCALE=5;

var SPRITE_ROAD_TAG={
  COIN:   ['COIN'],  
  COMBO:  ['COMBO'],
  CONE:   ['CONE1','CONE2','CONE3'],
  BLOCK:   ['BLOCK1','BLOCK2','BLOCK3'],
  LIGHT:   ['LIGHT1','LIGHT2','LIGHT3']
}
var SPRITES1_TAG={
  TURN:{left:['TURNLEFT'],
          right:  ['TURNRIGHT']},
  TREE:        ['TREE1','TREE2'],
  GRASS:       ['GRASS1','GRASS2','GRASS3','GRASS4','GRASS5','GRASS6'],
  HOUSE:  {left:['HOUSE-1LEFT','HOUSE-2LEFT'], 
            right: ['HOUSE1RIGHT','HOUSE2LEFT']}, 
  BOARD:       ['BOARD1','BOARD2'],
  TOWER:       ['TOWER1','TOWER2']
};


var SPRITES2_TAG={
  TURN:{left:['TURNLEFT'],
          right:  ['TURNRIGHT']},
  BOARD:       ['BOARD1','BOARD2'],
  BRIDGE:      ['BRIDGE'],
  HOUSE: {left:['HOUSE3LEFT','HOUSE4LEFT','HOUSE5LEFT','HOUSE6LEFT'], 
          right:['HOUSE3RIGHT','HOUSE4RIGHT','HOUSE5RIGHT','HOUSE6RIGHT']}, 
  LIGHT: {left:['LIGHTLEFT'], right:['LIGHTRIGHT']}  
};

var SPRITES3_TAG={
  TURN:{left:['TURNLEFT'],
          right:  ['TURNRIGHT']},
  BOARD:       ['BOARD1','BOARD2'],
  CHAIR:      ['CHAIR1','CHAIR2','CHAIR3'],
  HOUSE: {left:['HOUSE7'], 
          right:[]}, 
  UMBRELLA: ['UMBRELLA1','UMBRELLA1','UMBRELLA1','UMBRELLA1'],
  TREE:{left:['TREE3LEFT','TREE4LEFT'],
		right:['TREE3RIGHT','TREE4RIGHT']}
};

function generateMap(){
  resetSprites();
  resetCoins();
  resetObstacles();
  
  resetCars();
  
}
function resetSprites() {
  
  var n, i;

  let offsetZ=startGateZ/segmentLength;
  
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
          txt=SPRITES1_TAG.TREE[Math.round(Math.random()*2)];
          break;
        case 1:  
          txt=SPRITES1_TAG.GRASS[Math.round(Math.random()*4)];
          break;
        case 2:
          if(dir_<0) txt=SPRITES1_TAG.HOUSE.left[Math.round(Math.random()*2)];
          else txt=SPRITES1_TAG.HOUSE.right[Math.round(Math.random()*2)];
          break;
        case 3:
          txt=SPRITES1_TAG.BOARD[Math.round(Math.random()*2)];
          break;
        case 4:
          txt=SPRITES1_TAG.TOWER[Math.round(Math.random()*2)];
          break;
      }
      break;
    case 1:
      switch(opt_){
        case 0:  
          txt=SPRITES2_TAG.BRIDGE[0];
          break;
        case 1:
          if(dir_<0) txt=SPRITES2_TAG.HOUSE.left[Math.round(Math.random()*4)];
          else txt=SPRITES2_TAG.HOUSE.right[Math.round(Math.random()*4)];
          break;
        case 2:
          txt=SPRITES2_TAG.BOARD[Math.round(Math.random()*2)];
          break;
        case 3:
          if(dir_<0) txt=SPRITES2_TAG.LIGHT.left[0];
          else  txt=SPRITES2_TAG.LIGHT.right[0];
          break;
      }
      break;
    case 2:
      switch(opt_){
        case 0:  
          txt=SPRITES3_TAG.CHAIR[Math.round(Math.random()*3)];
          break;
        case 1:
          if(dir_<0) txt=SPRITES3_TAG.HOUSE.left[0];
          break;
        case 2:
          txt=SPRITES3_TAG.BOARD[Math.round(Math.random()*2)];
          break;
        case 3:
          txt=SPRITES3_TAG.UMBRELLA[Math.round(Math.random()*4)];
          break;
        case 4:
          if(dir_<0) txt=SPRITES3_TAG.TREE.left[Math.round(Math.random()*2)];
          else txt=SPRITES3_TAG.TREE.right[Math.round(Math.random()*2)];
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
                    source:(combo.indexOf(arr[i])>-1)?'COMBO':'COIN',
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
                      source:(Math.random()*2<1)?'CONE-'+(scene_+1):'BLOCK-'+(scene_+1)};

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

function printMap(){
	// var n = segments.length;
 //  segments.push({
 //      index: n,
 //         p1: { world: { y: lastY(), z:  n   *segmentLength }, camera: {}, screen: {},project:[] },
 //         p2: { world: { y: y,       z: (n+1)*segmentLength }, camera: {}, screen: {},project:[] },
 //      curve: curve,
 //    sprites: [],
 //       cars: [],
 //      coins:[],
 //  obstacles:[],
 //      color: Math.floor(n/rumbleLength)%2 ? COLORS.DARK : COLORS.LIGHT,
 //      scene: scene
 //  });
	var output="";
	for(var n=0;n<segments.length;++n){

		if(n%(segmentPerDraw/2)!=0) continue;

		let seg=segments[n];

		output+=seg.index+',';

		var left_sprite=null;
		var right_sprite=null;
		for(var k=0;k<seg.sprites.length;++k){
			if(seg.sprites[k].offset<0) left_sprite=seg.sprites[k];
			else right_sprite=seg.sprites[k];
		}

		var left_road=null;
		var center_road=null;
		var right_road=null;

		for(var k=0;k<seg.coins.length;++k){
			if(seg.coins[k].offsetX<0) left_road=seg.coins[k];
			else if(seg.coins[k].offsetX>0) right_road=seg.coins[k];
			else center_road=seg.coins[k];
		}

		for(var k=0;k<seg.obstacles.length;++k){
			if(seg.obstacles[k].offsetX<0) left_road=seg.obstacles[k];
			else if(seg.obstacles[k].offsetX>0) right_road=seg.obstacles[k];
			else center_road=seg.obstacles[k];
		}

		if(left_sprite!==null) output+=left_sprite.source+',';
		else output+=',';

		if(left_road!==null) output+=left_road.source+',';
		else output+=',';

		if(center_road!==null) output+=center_road.source+',';
		else output+=',';


		if(right_road!==null) output+=right_road.source+',';
		else output+=',';

		if(right_sprite!==null) output+=right_sprite.source+'\n';
		else output+='\n';

	}

	console.log(output);
    window.open('data:text/csv;charset=utf-8,' + escape(output));
}

// resetRoad(); 
// printMap();
// readMap();

function readMap(file_url_,callback){

	 $.ajax({
        type: "GET",
        url: file_url_,
        dataType: "text",
        success: function(data){
        	processData(data);
        	callback();
        }
     });
}
function processData(data){

	let mcolumn=6;
	var allTextLines = data.split(/\r\n|\n/);
    var lines = [];

    for (var i=1; i<allTextLines.length; i++) {
        var data = allTextLines[i].split(',');
        if (data.length >= mcolumn) {

            var tarr = [];
            for (var j=0; j<mcolumn; j++) {
                tarr.push(data[j]);
            }
            lines.push(tarr);
        }
    }

	// for(var scene_=0;scene_<totalScene;++scene_){

	//     let start_seg=scene_<1?0:sceneSegment[scene_-1];
 //    	let end_seg=sceneSegment[scene_];

	//     for(var n=start_seg;n<end_seg;++n){
   ROAD_SCALE=sceneSegment[2]/lines.length;
   cars=[];

	for(var n=0;n<lines.length;++n){

		let index=Math.floor(lines[n][0]*ROAD_SCALE);
    if(index>=sceneSegment[2]) continue;

		var scene=(index<sceneSegment[0])?0:(index<sceneSegment[1]?1:2);
		let seg=segments[index];

    var percent;
		let textureMap;
		if(index>=sceneSegment[1]){
        textureMap=SPRITES3;
        percent=index/(sceneSegment[2]-sceneSegment[1]);
    } else if(index>=sceneSegment[0]){
        textureMap=SPRITES2;
        percent=index/(sceneSegment[1]-sceneSegment[0]);
    } 
		else{
      textureMap=SPRITES1;
      percent=index/(sceneSegment[0]);
    } 
		
		let tag=lines[n][1];
		let texture;

		try{
			if(tag.length>0){
				if(textureMap[tag]!==undefined){									
					texture=textureMap[tag][0];

					seg.sprites.push({
						source:texture,
						offset:(tag==="BRIDGE")?0:sidePosition[0]
					});
				}
			}

			tag=lines[n][5];
			if(tag.length>0){
				if(textureMap[tag]!==undefined){
					texture=textureMap[tag][0];
					// console.log(tag+"-"+texture);

					seg.sprites.push({
						source:texture,
						offset:(tag==="BRIDGE")?0:sidePosition[1]
					});
				}
			}

			textureMap=SPRITE_ROAD;

			for(var k=2;k<5;++k){
				
				tag=lines[n][k];
				if(tag.length<1) continue;

				if(tag==="CAR"){
					var z=index*segmentLength;
				    var color=Math.floor(Math.random()*3);
				    var sprite = onRoadPosition[k-2]<0?OTHER_CAR[color].left:(onRoadPosition[k-2]>0?OTHER_CAR[color].right:OTHER_CAR[color].center);
				    var speed  = Util.interpolate(sceneSpeedRatio[scene],sceneSpeedRatio[scene+1],percent+.05) * BaseSpeed;
				    
				    car = { offsetX: onRoadPosition[k-2], 
				              offsetY:0,
				              z: z, 
				              source: sprite, 
				              speed: speed, color:color,
				              index:cars.length,
				          	  segment:index,
                      playsound:false};
				    // seg.cars.push(car);
            // console.log(speed);
				    // cars.push(car);
					continue;
				}
				
				if(textureMap[tag]===undefined) continue;

				texture=textureMap[tag][0];

				if(tag==="COIN" || tag==="COMBO")
					seg.coins.push({
						source:texture,
						offsetX:onRoadPosition[k-2],
						offsetY:0,
						score:(tag==="COIN")?1:5
					});
				else 
					seg.obstacles.push({
						source:texture,
						offsetX:onRoadPosition[k-2],
						offsetY:0
					});
			}
		}catch(e){
			console.log(e);
		}
		
	}

}