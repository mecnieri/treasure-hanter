import { left, up, right, down } from "./keyboard.js";
import hitTestRectangle from "./hitTestRectangle.js";
import contain from "./contain.js";

 let Application = PIXI.Application,
  loader = PIXI.loader,
  resources = PIXI.loader.resources,
  Sprite = PIXI.Sprite,
  TextureCache = PIXI.utils.TextureCache,
  Rectangle = PIXI.Rectangle,
  Container = PIXI.Container,
  TextStyle = PIXI.TextStyle,
  Text = PIXI.Text;

//Create a Pixi Application
let app = new Application({
  width: 512,
  height: 512,
  antialias: true,
  transparent: false,
  resolution: 1
});

//Add the canvas that Pixi automatically created for you to the HTML document
document.body.appendChild(app.view);

//load an image and run the `setup` function when it's done
loader
  .add("images/treasureHunter.json")
  .add("anime/up.json")
  .add("anime/down.json")
  .add("anime/left.json")
  .add("anime/right.json")
  .load(setup);

//#region  Create Global Variables

let state,
  dungeon,
  naruto,
  treasure,
  door,
  id,
  blob,
  healthBar,
  outerBar,
  message,
  gameScene,
  gameOverScene;

//#endregion

//This `setup` function will run when the image has loaded
function setup() {
  //Set the game state
  state = play;

  //#region set gameScene and gameOverScene
  gameScene = new Container();
  app.stage.addChild(gameScene);

  gameOverScene = new Container();
  gameOverScene.visible = false;
  app.stage.addChild(gameOverScene);
  //#endregion

  //There are 3 ways to make sprites from textures atlas frames

  //1. Access the `TextureCache` directly

  //#region background
  let dungeonTexture = TextureCache["dungeon.png"];
  dungeon = new Sprite(dungeonTexture);
  gameScene.addChild(dungeon);
  //#endregion

  //3. Create an optional alias called `id` for all the texture atlas
  //frame id textures.
  id = PIXI.loader.resources["images/treasureHunter.json"].textures;

  //#region  Create treasure
  //Make the treasure box using the alias
  treasure = new Sprite(id["treasure.png"]);

  //Position the treasure next to the right edge of the canvas
  treasure.x = app.stage.width - treasure.width - 48;
  treasure.y = app.stage.height / 2 - treasure.height / 2;
  gameScene.addChild(treasure);
  //#endregion

  //#region  Create door

  door = new Sprite(id["door.png"]);
  door.position.set(32, 0);
  gameScene.addChild(door);

  //#endregion

  //#region  Create the health bar

  healthBar = new PIXI.Container();
  healthBar.position.set(app.stage.width - 170, 4);
  gameScene.addChild(healthBar);

  //Create the black background rectangle
  let innerBar = new PIXI.Graphics();
  innerBar.beginFill(0x000000);
  innerBar.drawRect(0, 0, 128, 8);
  innerBar.endFill();
  healthBar.addChild(innerBar);

  //Create the front red rectangle
  outerBar = new PIXI.Graphics();
  outerBar.beginFill(0xff3300);
  outerBar.drawRect(0, 0, 128, 8);
  outerBar.endFill();
  healthBar.addChild(outerBar);

  healthBar.outer = outerBar;
  //#endregion

  //#region  Create message
  let style = new TextStyle({
    fontFamily: "Futura",
    fontSize: 64,
    fill: "white"
  });
  message = new Text("The End!", style);
  message.x = 120;
  message.y = app.stage.height / 2 - 32;
  gameOverScene.addChild(message);

  //#endregion

  //#region  Creating blobs

  let numberOfBlobs = 6,
    spacing = 48,
    xOffset = 150;

  let blobs = [];
  //Make as many blobs as there are `numberOfBlobs`
  for (let i = 0; i < numberOfBlobs; i++) {
    //Make a blob
    blob = new Sprite(id["blob.png"]);

    //Space each blob horizontally according to the `spacing` value.
    //`xOffset` determines the point from the left of the screen
    //at which the first blob should be added.
    let x = spacing * i + xOffset;

    //Give the blob a random y position
    //(`randomInt` is a custom function - see below)
    let y = randomInt(blob.height, app.stage.height - blob.height);
    blob.vy = (Math.random() - 0.5) * 5;
    //Set the blob's position
    blob.x = x;
    blob.y = y;
    blob.collision = false;
    gameScene.addChild(blob);
    //Add the blob sprite to the stage
    blobs.push(blob);
  }

  //#endregion
 
  //#region  Create naruto

  let naruto = new Container();
  let narutoTexture = TextureCache["tile000.png"];
  let narutoSprite = new Sprite(narutoTexture);

  //#endregion

  //#region  left animation

  let leftSheet = PIXI.loader.resources["anime/left.json"].spritesheet;
  let leftAnim = new PIXI.AnimatedSprite(leftSheet.animations["tile"]);
  leftAnim.animationSpeed = 0.25;
  leftAnim.play();
  leftAnim.visible = false;

  app.stage.addChild(leftAnim);

  //#endregion

  //#region  right animation

  let rightSheet = PIXI.loader.resources["anime/right.json"].spritesheet;
  let rightAnim = new PIXI.AnimatedSprite(rightSheet.animations["tile"]);
  rightAnim.animationSpeed = 0.25;
  rightAnim.play();
  rightAnim.visible = false;
  app.stage.addChild(rightAnim);

  //#endregion

  //#region  up animation

  let upSheet = PIXI.loader.resources["anime/up.json"].spritesheet;
  let upAnim = new PIXI.AnimatedSprite(upSheet.animations["tile"]);
  upAnim.animationSpeed = 0.25;
  upAnim.play();
  upAnim.visible = false;
  app.stage.addChild(upAnim);

  //#endregion

  //#region  down animation

  let downSheet = PIXI.loader.resources["anime/down.json"].spritesheet;
  let downAnim = new PIXI.AnimatedSprite(downSheet.animations["tile"]);
  downAnim.animationSpeed = 0.25;
  downAnim.play();
  downAnim.visible = false;
  app.stage.addChild(downAnim);

  //#endregion

  naruto.position.set(50, 200);
  naruto.vx = 0;
  naruto.vy = 0;
  naruto.scale.set(0.6, 0.6);
  naruto.addChild(narutoSprite);
  naruto.addChild(upAnim);
  naruto.addChild(downAnim);
  naruto.addChild(leftAnim);
  naruto.addChild(rightAnim);
  gameScene.addChild(naruto);
 
  //Start the game loop
  app.ticker.add(delta => gameLoop(delta));
  function gameLoop(delta) {
    //Update the current game state:
    state(delta);
  }

  function play(delta) {
    blobs.forEach(function(blob) {
      //Move the blob
      blob.y += blob.vy;

      //Check the blob's screen boundaries
      let blobHitsWall = contain(blob, {
        x: 28,
        y: 32,
        width: 488,
        height: 480
      });

      //If the blob hits the top or bottom of the stage, reverse
      //its direction
      // console.log(blobHitsWall)
      if (blobHitsWall === "top" || blobHitsWall === "bottom") {
        blob.vy *= -1;
      }

      //Test for a collision. If any of the enemies are touching
      //the naruto, set `narutoHit` to `true`
      if (hitTestRectangle(naruto, blob)) {
        outerBar.width -= 64;
        naruto.alpha = 0.5;
      }
    });

    contain(naruto, {
      x: 28,
      y: 22,
      width: 488,
      height: 480
    });

    if (hitTestRectangle(naruto, treasure)) {
      treasure.x = 60;
      treasure.y = 80;
      naruto.addChild(treasure);
    }

    if (outerBar.width == 0) {
      state = end;
      message.text = "You lost!";
    }

    if (hitTestRectangle(naruto, door)) {
      if (naruto.children.length == 6) {
        console.log(naruto)
        state = end;
        message.text = "You won!";
      }
    }

    if (up.isDown) {
      narutoSprite.visible = false;
      downAnim.visible = false;
      rightAnim.visible = false;
      leftAnim.visible = false;
      upAnim.visible = true;
      naruto.vy = -3;
      naruto.vx = 0;
      narutoSprite.texture = TextureCache[upAnim.texture.textureCacheIds];
    }
    //Up arrow key `release` method

    if (left.isDown) {
      narutoSprite.visible = false;
      rightAnim.visible = false;
      upAnim.visible = false;
      downAnim.visible = false;
      leftAnim.visible = true;

      naruto.vx = -3;
      naruto.vy = 0;
      narutoSprite.texture = TextureCache[leftAnim.texture.textureCacheIds];
      // console.log(leftAnim.currentFrame)
    }

    if (right.isDown) {
      narutoSprite.visible = false;
      upAnim.visible = false;
      downAnim.visible = false;
      leftAnim.visible = false;
      rightAnim.visible = true;
      naruto.vx = 3;
      naruto.vy = 0;
      narutoSprite.texture = TextureCache[rightAnim.texture.textureCacheIds];
    }

    if (down.isDown) {
      narutoSprite.visible = false;
      upAnim.visible = false;
      rightAnim.visible = false;
      leftAnim.visible = false;
      downAnim.visible = true;
      naruto.vy = 3;
      naruto.vx = 0;
      narutoSprite.texture = TextureCache[downAnim.texture.textureCacheIds];
    }

    if (!down.isDown && !right.isDown && !left.isDown && !up.isDown) {
      narutoSprite.visible = true;
      upAnim.visible = false;
      downAnim.visible = false;
      rightAnim.visible = false;
      leftAnim.visible = false;
      naruto.vy = 0;
      naruto.vx = 0;
    }

    naruto.x += naruto.vx;
    naruto.y += naruto.vy;
  }

  function end() {
    gameScene.visible = false;
    gameOverScene.visible = true;
  }

  function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}
