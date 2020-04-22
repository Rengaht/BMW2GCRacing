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

function readMap(callback){

	 $.ajax({
        type: "GET",
        url: "http://127.0.0.1/2gc/asset/map/map-1.csv",
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
        if (data.length == mcolumn) {

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
	for(var n=0;n<lines.length;++n){

			let seg=segments[lines[n][0]];

			let textureMap;
			if(n>sceneSegment[2]) textureMap=SPRITES3;
			else if(n>sceneSegment[1]) textureMap=SPRITES2;
			else textureMap=SPRITES1;
			
			let tag=lines[n][1];
			let texture;
			if(tag.length>0){
				texture=textureMap[tag][0];

				if(lines[n][1].length>0) seg.sprites.push({
					source:texture,
					offset:sidePosition[0]
				});
			}

			tag=lines[n][5];
			if(tag.length>0){
				texture=textureMap[tag][0];
				console.log(tag+"-"+texture);

				seg.sprites.push({
					source:texture,
					offset:sidePosition[1]
				});
			}

			textureMap=SPRITE_ROAD;

			for(var k=2;k<5;++k){
				if(lines[n][k].length<1) continue;

				tag=lines[n][k];
				if(tag.length<1) continue;

				texture=textureMap[tag][0];

				if(lines[n][k]==="COIN")
					seg.coins.push({
						source:texture,
						offsetX:onRoadPosition[k-2],
						offsetY:0,
						score:1
					});
				else 
					seg.coins.push({
						source:texture,
						offsetX:onRoadPosition[k-2],
						offsetY:0,
						score:5
					});
			}
		
	}

}