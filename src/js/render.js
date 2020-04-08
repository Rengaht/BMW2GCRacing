var Render = {

  polygon: function(x1, y1, x2, y2, x3, y3, x4, y4, color) {
    // ctx.fillStyle = color;
    // ctx.beginPath();
    // ctx.moveTo(x1, y1);
    // ctx.lineTo(x2, y2);
    // ctx.lineTo(x3, y3);
    // ctx.lineTo(x4, y4);
    // ctx.closePath();
    // ctx.fill();

    let quad=createQuad(x1, y1, x2, y2, x3, y3, x4, y4);
    _road.addChild(quad);
  },

  //---------------------------------------------------------------------------

  segment: function(width, lanes, x1, y1, w1, x2, y2, w2, fog, color) {

    var r1 = Render.rumbleWidth(w1, lanes),
        r2 = Render.rumbleWidth(w2, lanes),
        l1 = Render.laneMarkerWidth(w1, lanes),
        l2 = Render.laneMarkerWidth(w2, lanes),
        lanew1, lanew2, lanex1, lanex2, lane;
    
    // ctx.fillStyle = color.grass;
    // ctx.fillRect(0, y2, width, y1 - y2);
    
    // Render.polygon(x1-w1-r1, y1, x1-w1, y1, x2-w2, y2, x2-w2-r2, y2, color.rumble);
    // Render.polygon(x1+w1+r1, y1, x1+w1, y1, x2+w2, y2, x2+w2+r2, y2, color.rumble);
    // Render.polygon(x1-w1,    y1, x1+w1, y1, x2+w2, y2, x2-w2,    y2, color.road);
    Render.polygon(x2-w2-r2, y2, x1-w1-r1, y1, x1-w1, y1, x2-w2, y2,  color.rumble);
    Render.polygon(x2+w2+r2, y2, x1+w1+r1, y1, x1+w1, y1, x2+w2, y2,  color.rumble);
    Render.polygon(x2-w2,    y2, x1-w1,    y1, x1+w1, y1, x2+w2, y2,  color.road);
    
    if (color.lane) {
      lanew1 = w1*2/lanes;
      lanew2 = w2*2/lanes;
      lanex1 = x1 - w1 + lanew1;
      lanex2 = x2 - w2 + lanew2;
      for(lane = 1 ; lane < lanes ; lanex1 += lanew1, lanex2 += lanew2, lane++)
        Render.polygon(lanex1 - l1/2, y1, lanex1 + l1/2, y1, lanex2 + l2/2, y2, lanex2 - l2/2, y2, color.lane);
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

    _scene_sprite.addChild(sprite);

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

    var texture;
    if (steer < 0)
      texture = resources.sprite.textures['car-right.png'];
    else if (steer > 0)
      texture = resources.sprite.textures['car-center.png'];
    else
      texture = resources.sprite.textures['car-left.png'];

    sprite=new PIXI.TilingSprite(texture);

    Render.sprite(width, height, resolution, roadWidth, sprites, sprite, scale, destX, destY + bounce, -0.5, -1);
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