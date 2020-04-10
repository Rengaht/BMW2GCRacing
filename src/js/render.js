var Render = {

  polygon: function(index,x1, y1, x2, y2, x3, y3, x4, y4, color) {
    // ctx.fillStyle = color;
    // ctx.beginPath();
    // ctx.moveTo(x1, y1);
    // ctx.lineTo(x2, y2);
    // ctx.lineTo(x3, y3);
    // ctx.lineTo(x4, y4);
    // ctx.closePath();
    // ctx.fill();

    var quad=_road.getChildAt(index);
    const buffer=quad.geometry.getBuffer('aVertexPosition');
    buffer.update(new Float32Array([x1, y1, x2, y2, x3, y3,
          x3, y3, x4, y4,x1, y1]));    
    const uv=quad.geometry.getBuffer('aTextureCoord');
    let p=1.0/drawDistance;
    index%=drawDistance;
    // uv.update(new Float32Array([x1/_windowWidth,index*p,
    //                             x2/_windowWidth,(index+1)*p,
    //                             x3/_windowWidth,(index+1)*p,
                                
    //                             x3/_windowWidth,(index+1)*p,
    //                             x4/_windowWidth,(index)*p,
    //                             x1/_windowWidth,index*p]));
    // console.log(index%2);
    let i=Math.floor(index)%8;
    uv.update(new Float32Array([color,index*p,
                                color,(index+1)*p,
                                color,(index+1)*p,                                
                                color,(index+1)*p,
                                color,(index)*p,
                                color,index*p]));
    // uv.update(new Float32Array([0,y1/1024.0,0,y2/1024.0,1,y3/1024.0,
    //                             1,y3/1024.0,1,y4/1024.0,0,y1/1024.0]));
   
  },

  //---------------------------------------------------------------------------

  segment: function(n,width, lanes, x1, y1, w1, x2, y2, w2, fog, color) {

    var r1 = Render.rumbleWidth(w1, lanes),
        r2 = Render.rumbleWidth(w2, lanes),
        l1 = Render.laneMarkerWidth(w1, lanes),
        l2 = Render.laneMarkerWidth(w2, lanes),
        lanew1, lanew2, lanex1, lanex2, lane;
    
    // ctx.fillStyle = color.grass;
    // ctx.fillRect(0, y2, width, y1 - y2);
    Render.polygon(n*PolyPerSeg,  0, y2, 0, y1,width,y1,width,y2, 3+Math.floor(n/segPerSeg)%2);
    
    // Render.polygon(x1-w1-r1, y1, x1-w1, y1, x2-w2, y2, x2-w2-r2, y2, color.rumble);
    // Render.polygon(x1+w1+r1, y1, x1+w1, y1, x2+w2, y2, x2+w2+r2, y2, color.rumble);
    // Render.polygon(x1-w1,    y1, x1+w1, y1, x2+w2, y2, x2-w2,    y2, color.road);
    Render.polygon(n*PolyPerSeg+1,  x2-w2-r2, y2, x1-w1-r1, y1, x1-w1, y1, x2-w2, y2,  2);
    Render.polygon(n*PolyPerSeg+2,x2+w2+r2, y2, x1+w1+r1, y1, x1+w1, y1, x2+w2, y2,  2);
    Render.polygon(n*PolyPerSeg+3,x2-w2,    y2, x1-w1,    y1, x1+w1, y1, x2+w2, y2,  Math.floor(n/segPerSeg)%2);
    
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

  background: function(background, width, height, layer, rotation, offset) {

    rotation = rotation || 0;
    offset   = offset   || 0;

    var imageW = layer.w/2;
    var imageH = layer.h;

    var sourceX = layer.x + Math.floor(layer.w * rotation);
    var sourceY = layer.y
    var sourceW = Math.min(imageW, layer.x+layer.w-sourceX);
    var sourceH = imageH;
    
    var destX = 0;
    var destY = offset;
    var destW = Math.floor(width * (sourceW/imageW));
    var destH = height;

    //TODO:
    // ctx.drawImage(background, sourceX, sourceY, sourceW, sourceH, destX, destY, destW, destH);
    // if (sourceW < imageW)
    //   ctx.drawImage(background, layer.x, sourceY, imageW-sourceW, sourceH, destW-1, destY, width-destW, destH);
  },

  //---------------------------------------------------------------------------

  sprite: function(width, height, resolution, roadWidth, sprites, sprite, scale, destX, destY, offsetX, offsetY, clipY) {

                    //  scale for projection AND relative to roadWidth (for tweakUI)
    var destW  = (sprite.texture.width * scale * width/2) * (_spriteScale * roadWidth);
    var destH  = (sprite.texture.height * scale * width/2) * (_spriteScale * roadWidth);

    destX = destX + (destW * (offsetX || 0));
    destY = destY + (destH * (offsetY || 0));

    var clipH = clipY ? Math.max(0, destY+destH-clipY) : 0;

    //TODO:
    // if (clipH < destH)
    //   ctx.drawImage(sprites, sprite.x, sprite.y, sprite.w, sprite.h - (sprite.h*clipH/destH), destX, destY, destW, destH - clipH);
    sprite.x=destX;
    sprite.y=destY;
    sprite.width=destW;
    sprite.height=destH-clipH;

    _scene.addChild(sprite);

  },

  //---------------------------------------------------------------------------

  player: function(width, height, resolution, roadWidth, sprites, speedPercent, scale, destX, destY, steer, updown) {

    var bounce = (1.5 * Math.random() * speedPercent * resolution) * Util.randomChoice([-1,1]);
    var sprite;
    // if (steer < 0)
    //   sprite = (updown > 0) ? SPRITES.PLAYER_UPHILL_LEFT : SPRITES.PLAYER_LEFT;
    // else if (steer > 0)
    //   sprite = (updown > 0) ? SPRITES.PLAYER_UPHILL_RIGHT : SPRITES.PLAYER_RIGHT;
    // else
    //   sprite = (updown > 0) ? SPRITES.PLAYER_UPHILL_STRAIGHT : SPRITES.PLAYER_STRAIGHT;

    // switch car sprite
    var next_car_pos;
    if (steer < 0)
      next_car_pos='left';
    else if (steer > 0)
      next_car_pos='right';
    else
      next_car_pos='center';

    sprite=_sprite_car[_last_car_pos];

    if(_last_car_pos!=next_car_pos){
      _car.removeChildren();
      
      sprite=_sprite_car[next_car_pos];
      _car.addChild(sprite);
    }
    _last_car_pos=next_car_pos;

    // Render.sprite(width, height, resolution, roadWidth, sprites, sprite, scale, destX, destY + bounce, -0.5, -1);
    var offsetX=-0.5;
    var offsetY=-1;
    var clipY=0;

    var destW  = (sprite.texture.width * scale * width/2) * (_spriteScale * roadWidth);
    var destH  = (sprite.texture.height * scale * width/2) * (_spriteScale * roadWidth);

    destX = destX + (destW * (offsetX || 0));
    destY = destY + (destH * (offsetY || 0));

    var clipH = clipY ? Math.max(0, destY+destH-clipY) : 0;

    sprite.x=destX;
    sprite.y=destY;
    sprite.width=destW;
    sprite.height=destH-clipH;

    
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