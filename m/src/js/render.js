var Render = {

  polygon: function(index,x1, y1, x2, y2, x3, y3, x4, y4, color,uv_index,scene_) {

    var quad=_road.getChildAt(index);
    if(!quad) 
      return;


    const buffer=quad.geometry.getBuffer('aVertexPosition');
    // buffer.update(new Float32Array([x1, y1, x2, y2, x3, y3,
    //                                 x1, y1,x3, y3,x4, y4]));    
    buffer.update(new Float32Array([x1, y1, x2, y2, x3, y3,x4, y4]));    
    const uv=quad.geometry.getBuffer('aTextureCoord');
    
    let p=1.0/segmentPerDraw;
    
    let i=parseFloat(Math.floor(index/PolyPerSeg)%segmentPerDraw);
    uv.update(new Float32Array([color,uv_index+p,
                                color,uv_index,
                                color+.5,uv_index,
                                color+.5,uv_index+p]));
    // console.log(i*p);
    // _shader_road.uniforms.vColor=color;

    
    // if(i%2==0) return;
     // uv.update(new Float32Array([0,uv_index+1.0/drawDistance,
     //                              0,uv_index,
     //                              1,uv_index,                                  
     //                              1,uv_index+1.0/drawDistance]));
   
   // uv.update(new Float32Array([x1/width, 1/drawDistance*index, x2/width, 1/drawDistance*(index+1), x3/width, 1/drawDistance*(index+1),
   //                            x3/width, 1/drawDistance*(index+1), x4/width, 1/drawDistance*index,x1/width,1/drawDistance*index]));
  },

  //---------------------------------------------------------------------------

  segment: function(index,width, lanes, x1, y1, w1, x2, y2, w2, fog,scene) {

    var r1 = Render.rumbleWidth(w1, lanes),
        r2 = Render.rumbleWidth(w2, lanes),
        l1 = Render.laneMarkerWidth(w1, lanes),
        l2 = Render.laneMarkerWidth(w2, lanes),
        lanew1, lanew2, lanex1, lanex2, lane;
    
    let n=index%drawDistance;
    let uv_index=(index%segmentPerDraw)/segmentPerDraw;
    // let uv_index=(index%drawDistance)/drawDistance;
    
    let seg_index=Math.floor(index/segmentPerDraw)%2;


    Render.polygon(n*PolyPerSeg,
                  0, y2, 0, y1,
                  offset_width*2+width,y1,
                  offset_width*2+width,y2, 3+seg_index,uv_index,scene);
    
    Render.polygon(n*PolyPerSeg+1,  
                  offset_width+x2-w2-r2, y2, 
                  offset_width+x1-w1-r1, y1, 
                  offset_width+x1-w1, y1, 
                  offset_width+x2-w2, y2,  5+seg_index,uv_index,scene);
    Render.polygon(n*PolyPerSeg+2,  
                  offset_width+x2+w2+r2, y2, 
                  offset_width+x1+w1+r1, y1, 
                  offset_width+x1+w1, y1, 
                  offset_width+x2+w2, y2,  5+seg_index,uv_index,scene);

    Render.polygon(n*PolyPerSeg+3,
                    offset_width+x2-w2,    y2, 
                    offset_width+x1-w1,    y1, 
                    offset_width+x1+w1, y1, 
                    offset_width+x2+w2, y2,  seg_index,uv_index,scene);
    
    // Render.polygon(n,  0, y2, 0, y1,width,y1,width,y2, 3+Math.floor(index/segmentPerDraw)%2);
    
    // Render.polygon(n,  x2-w2-r2, y2, x1-w1-r1, y1, x1-w1, y1, x2-w2, y2,  2);
    // Render.polygon(n,x2+w2+r2, y2, x1+w1+r1, y1, x1+w1, y1, x2+w2, y2,  2);
    // Render.polygon(n,x2-w2,    y2, x1-w1,    y1, x1+w1, y1, x2+w2, y2,  Math.floor(index/segmentPerDraw)%2);
    
    if((n+segmentPerDraw/2)%(segmentPerDraw*2)<segmentPerDraw){
      lanew1 = w1*2/lanes;
      lanew2 = w2*2/lanes;
      lanex1 = x1 - w1 + lanew1;
      lanex2 = x2 - w2 + lanew2;
      // let start_lane=
      // for(lane = 1 ; lane < lanes ; lanex1 += lanew1, lanex2 += lanew2, lane++)
        Render.polygon(n*PolyPerSeg+4,
          offset_width+lanex2 - l2/2, y2,
          offset_width+lanex1 - l1/2, y1, 
          offset_width+lanex1 + l1/2, y1, 
          offset_width+lanex2 + l2/2, y2, 
           2,uv_index,scene);

        Render.polygon(n*PolyPerSeg+5,
          offset_width+lanex2-lanew2+l2 - l2/2, y2,
          offset_width+lanex1-lanew1+l1 - l1/2, y1, 
          offset_width+lanex1-lanew1+l1 + l1/2, y1, 
          offset_width+lanex2-lanew2+l2+ l2/2, y2, 
           7,uv_index,scene);
        
        lanex1+=lanew1;
        lanex2+=lanew2;

        Render.polygon(n*PolyPerSeg+6,
          offset_width+lanex2 + l2/2, y2, 
          offset_width+lanex1 + l1/2, y1, 
          offset_width+lanex1 - l1/2, y1, 
          offset_width+lanex2 - l2/2, y2,
           2,uv_index,scene);

         Render.polygon(n*PolyPerSeg+7,
          offset_width+lanex2+lanew2-l2 + l2/2, y2, 
          offset_width+lanex1+lanew1-l1 + l1/2, y1, 
          offset_width+lanex1+lanew1-l1 - l1/2, y1, 
          offset_width+lanex2+lanew2-l2 - l2/2, y2,
           7,uv_index,scene);
    }
    
    Render.fog(0, y1, width, y2-y1, fog);
  },

  //---------------------------------------------------------------------------

  background: function(background_sprite, width, height, rotation, offsetX,offsetY) {

    rotation = rotation || 0;
    offsetX   = offsetX   || 0;
    offsetY = offsetY ||0;

    var imageW = background_sprite.texture.width/2;
    var imageH = background_sprite.texture.height;

    var sourceX = Math.floor(background_sprite.texture.width * rotation);
    var sourceY = 0;
    // var sourceW = Math.min(imageW, layer.x+layer.w-sourceX);
    // var sourceH = imageH;
    
    // var destX = 0;
    // var destY = offsetX;
    // var destW = Math.floor(width * (sourceW/imageW));
    // var destH = height;


    background_sprite.tilePosition.x=-sourceX;
    background_sprite.tilePosition.y=-offsetY*(background_sprite.texture.height*background_sprite.tileScale.y-background_sprite.height);
    //TODO:
    // ctx.drawImage(background, sourceX, sourceY, sourceW, sourceH, destX, destY, destW, destH);
    // if (sourceW < imageW)
    //   ctx.drawImage(background, layer.x, sourceY, imageW-sourceW, sourceH, destW-1, destY, width-destW, destH);
  },

  //---------------------------------------------------------------------------

  sprite: function(sprite, texture, destX, destY, scale,zIndex,alpha){

    if(texture===undefined) return;
    alpha=alpha||1;

    sprite.texture=texture;
    
    // var destW  = (destW);
    var destW=  texture.width*scale;
    var destH  = texture.height*scale;

    destX = destX -destW/2;
    destY=destY-destH;
    // destY = destY + (destH * (offsetY || 0));

    // var clipH = clipY ? Math.max(0, destY+destH-clipY) : 0;

    sprite.x=destX;
    sprite.y=destY;
    sprite.width=destW;
    sprite.height=destH;
    sprite.zIndex=zIndex;
    sprite.alpha=alpha;
    // if(sprite.scale.y<0) sprite.scale.y=-sprite.scale.y;
      // return;

    sprite.visible=true;
    // _scene.addChild(sprite);

  },
  trafficLight(container,gateX,gateY,gateScale,zIndex){
    
    if(!container) return;


    let gateW=1766*gateScale;
    let gateH=626*gateScale;

    gateX=gateX-gateW/2;
    gateY=gateY-gateH;

    let x=[0.11,0.91];
    let y=[0.44,0.55,0.66];

    for(var i=0;i<2;++i){
      for(var j=0;j<3;++j){

          let child=container.getChildAt(i*3+j);
          child.x=gateX+x[i]*gateW;
          child.y=gateY+y[j]*gateH;
          child.height=child.width=gateScale*54;
          child.zIndex=zIndex+1;
      }
    }
    container.zIndex=zIndex+1;
  },

  //---------------------------------------------------------------------------

  player: function(resolution, speedPercent, scale, destX, destY, steer) {

    var bounce = (1.5 * Math.random() * speedPercent * resolution) * Util.randomChoice([-1,1]);
    
    // if (steer < 0)
    //   sprite = (updown > 0) ? SPRITES.PLAYER_UPHILL_LEFT : SPRITES.PLAYER_LEFT;
    // else if (steer > 0)
    //   sprite = (updown > 0) ? SPRITES.PLAYER_UPHILL_RIGHT : SPRITES.PLAYER_RIGHT;
    // else
    //   sprite = (updown > 0) ? SPRITES.PLAYER_UPHILL_STRAIGHT : SPRITES.PLAYER_STRAIGHT;

    // switch car sprite
    var next_car_pos;
    if (steer < 0)
      next_car_pos='right';
    else if (steer > 0)
      next_car_pos='left';
    else
      next_car_pos='center';

    
    if(_last_car_pos!=next_car_pos){
      // _car.texture=_texture_car[_sprite_car[next_car_pos]];
      _car.textures=_car_texture_arr[next_car_pos];
      _car.gotoAndPlay(0);
    }
    _last_car_pos=next_car_pos;

    // Render.sprite(width, height, resolution, roadWidth, sprites, sprite, scale, destX, destY + bounce, -0.5, -1);
    var offsetX=-0.5;
    var offsetY=-1;
    var clipY=0;

    var destW  = _car.texture.width*scale;
    var destH  = _car.texture.height*scale;

    destX = destX - destW/2;
    destY = destY - destH;

    var clipH = clipY ? Math.max(0, destY+destH-clipY) : 0;

    _car.x=destX;
    _car.y=destY;
    _car.width=destW;
    _car.height=destH-clipH;

    
  },

  //---------------------------------------------------------------------------

  fog: function(x, y, width, height, fog) {

    //TODO:
    // if (fog < 1) {
    //   ctx.globalAlpha = (1-fog)
    //   ctx.fillStyle = COLORS.FOG;
    //   ctx.fillRect(x, y, width, height);
    //   ctx.globalAlpha = 1;
    // }
  },

  rumbleWidth:     function(projectedRoadWidth, lanes) { return projectedRoadWidth/Math.max(6,  2*lanes); },
  laneMarkerWidth: function(projectedRoadWidth, lanes) { return projectedRoadWidth/Math.max(24, 6*lanes); }

}