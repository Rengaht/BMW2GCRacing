var Render = {

  polygon: function(index,x1, y1, x2, y2, x3, y3, x4, y4, color) {

    var quad=_road.getChildAt(index);
    const buffer=quad.geometry.getBuffer('aVertexPosition');
    buffer.update(new Float32Array([x1, y1, x2, y2, x3, y3,
                                    x3, y3, x4, y4,x1, y1]));    
    const uv=quad.geometry.getBuffer('aTextureCoord');
    let p=1.0/drawDistance;
    index%=drawDistance;

    let i=Math.floor(index)%mDrawSegment;
    uv.update(new Float32Array([color,index*p,
                                color,(index+1)*p,
                                color,(index+1)*p,                                
                                color,(index+1)*p,
                                color,(index)*p,
                                color,index*p]));
   
  },

  //---------------------------------------------------------------------------

  segment: function(index,width, lanes, x1, y1, w1, x2, y2, w2, fog, color) {

    var r1 = Render.rumbleWidth(w1, lanes),
        r2 = Render.rumbleWidth(w2, lanes),
        l1 = Render.laneMarkerWidth(w1, lanes),
        l2 = Render.laneMarkerWidth(w2, lanes),
        lanew1, lanew2, lanex1, lanex2, lane;
    
    let n=index%drawDistance;
    Render.polygon(n*PolyPerSeg,  0, y2, 0, y1,width,y1,width,y2, 3+Math.floor(index/segmentPerDraw)%2);
    
    Render.polygon(n*PolyPerSeg+1,  x2-w2-r2, y2, x1-w1-r1, y1, x1-w1, y1, x2-w2, y2,  2);
    Render.polygon(n*PolyPerSeg+2,x2+w2+r2, y2, x1+w1+r1, y1, x1+w1, y1, x2+w2, y2,  2);
    Render.polygon(n*PolyPerSeg+3,x2-w2,    y2, x1-w1,    y1, x1+w1, y1, x2+w2, y2,  Math.floor(index/segmentPerDraw)%2);
    
    if (color.lane) {
      lanew1 = w1*2/lanes;
      lanew2 = w2*2/lanes;
      lanex1 = x1 - w1 + lanew1;
      lanex2 = x2 - w2 + lanew2;
      for(lane = 1 ; lane < lanes ; lanex1 += lanew1, lanex2 += lanew2, lane++)
        Render.polygon(n*PolyPerSeg+3+lane,lanex1 - l1/2, y1, lanex1 + l1/2, y1, lanex2 + l2/2, y2, lanex2 - l2/2, y2, 2);
    }
    
    Render.fog(0, y1, width, y2-y1, fog);
  },

  //---------------------------------------------------------------------------

  background: function(background_sprite, width, height, rotation, offset) {

    rotation = rotation || 0;
    offset   = offset   || 0;

    var imageW = background_sprite.texture.width/2;
    var imageH = background_sprite.texture.height;

    var sourceX = Math.floor(background_sprite.texture.width * rotation);
    var sourceY = 0;
    // var sourceW = Math.min(imageW, layer.x+layer.w-sourceX);
    // var sourceH = imageH;
    
    var destX = 0;
    var destY = offset;
    // var destW = Math.floor(width * (sourceW/imageW));
    // var destH = height;


    background_sprite.tilePosition.x=-sourceX;
    //TODO:
    // ctx.drawImage(background, sourceX, sourceY, sourceW, sourceH, destX, destY, destW, destH);
    // if (sourceW < imageW)
    //   ctx.drawImage(background, layer.x, sourceY, imageW-sourceW, sourceH, destW-1, destY, width-destW, destH);
  },

  //---------------------------------------------------------------------------

  sprite: function(sprite, texture, destX, destY, scale,zIndex){

    if(texture===undefined) return;

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
    // if(sprite.scale.y<0) sprite.scale.y=-sprite.scale.y;
      // return;

    sprite.visible=true;
    // _scene.addChild(sprite);

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
      _car.texture=_texture_car[_sprite_car[next_car_pos]];
    }
    _last_car_pos=next_car_pos;

    // Render.sprite(width, height, resolution, roadWidth, sprites, sprite, scale, destX, destY + bounce, -0.5, -1);
    var offsetX=-0.5;
    var offsetY=-1;
    var clipY=0;

    var destW  = _car.texture.width*scale;
    var destH  = _car.texture.height*scale;

    destX = destX + (destW * (offsetX || 0));
    destY = destY + (destH * (offsetY || 0));

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
  laneMarkerWidth: function(projectedRoadWidth, lanes) { return projectedRoadWidth/Math.max(32, 8*lanes); }

}