function hitTestRectangle(r1, r2) {
  //Define the variables we'll need to calculate
  let hit, combinedHalfWidths, combinedHalfHeights, dx, dy;

  //hit will determine whether there's a collision
  hit = false;

  //Find the half-widths and half-heights of each sprite
  r1.halfWidth = r1.width / 2;
  r1.halfHeight = r1.height / 2;
  r2.halfWidth = r2.width / 2;
  r2.halfHeight = r2.height / 2;

  //Find the center points of each sprite
  r1.centerX = r1.x + r1.halfWidth;
  r1.centerY = r1.y + r1.halfHeight;
  r2.centerX = r2.x + r2.halfWidth;
  r2.centerY = r2.y + r2.halfHeight;

  //Calculate the distance vector between the sprites
  dx = r1.centerX - r2.centerX;
  dy = r1.centerY - r2.centerY;

  //Figure out the combined half-widths and half-heights
  combinedHalfWidths = r1.halfWidth + r2.halfWidth;
  combinedHalfHeights = r1.halfHeight + r2.halfHeight;
  //Check for a collision on the x axis
  if (Math.abs(dx) < combinedHalfWidths && Math.abs(dy) < combinedHalfHeights) {
    //A collision might be occurring. Check for a collision on the y axis
    //There's definitely a collision happening
    hit = true;
    if(r2.collision) {
      return false;
    }
    //There's no collision on the y axis
  } else {
    //There's no collision on the x axis
    hit = false;
  }

  r2.collision = hit;

  //`hit` will be either `true` or `false`
  return hit;
}

export default hitTestRectangle;
