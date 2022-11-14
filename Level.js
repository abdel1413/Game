// /**
//  * trim() used to remove empty spaces and
//  * The remaining string is split on newline characters,
//  *  and each line is spread into an array, producing arrays
//  * of characters.
//  *
//  */

var simpleLevelPlan = `
......................
..#................#..
..#..............=.#..
..#.........o.o....#..
..#.@......#####...#..
..#####............#..
......#++++++++++++#..
......##############..
......................`;

var Level = class Level {
  constructor(plan) {
    let rows = plan
      .trim()
      .split("\n")
      .map((l) => [...l]);
    this.height = rows.length;
    this.width = rows[0].length;
    this.startActors = [];

    //create arrays, we map over the
    //rows and then over their content passing 2nd arg,
    // which is index of array so here the indice are xy coord of the game
    this.rows = rows.map((row, y) => {
      return row.map((ch, x) => {
        //Using LevelChar object to map background elements to strings
        //and actor characters to classes
        //create a Vector object with coord xy and ch wich is pushed in
        //startActor array
        let type = levelChars[ch];
        if (typeof type === "string") return type;
        this.startActors.push(type.create(new Vec(x, y), ch));
        return "empty";
      });
    });
  }
};

// /**
//  * Createe  a state class that will track the state of
//  * running game
//  */

var State = class State {
  constructor(level, actors, status) {
    this.level = level;
    this.actors = actors;
    this.status = status;
  }
  static start(level) {
    return new State(level, level.startActors, "playing");
  }

  get player() {
    return this.actors.find((a) => a.type == "player");
  }
};

/**
 * the Vec class that we’ll use for our two-dimensional
 * values, such as the position and size of actors.
 */
var Vec = class Vec {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  plus(other) {
    return new Vec(this.x + other.x, this.y + other.y);
  }

  //need to multiply a speed vector by a
  //time interval to get the distance traveled during that time.
  times(factor) {
    return new Vec(this.x * factor, this.y * factor);
  }
};

// /**
//  * The player class has a property speed that
//  * stores its current speed to simulate momentum and gravity.
//  */

var Player = class Player {
  constructor(pos, speed) {
    this.pos = pos;
    this.speed = speed;
  }

  get type() {
    return "player";
  }

  static create(pos) {
    return new Player(pos.plus(new Vec(0, -0.5)), new Vec(0, 0));
  }
};

Player.prototype.size = new Vec(0.8, 1.5);

// //NOTE: The size property is the same for all instances
// //of Player, so we store it on the prototype rather
// //than on the instances themselves

// /**
//  * Create a lava class that  looks at the character
//  * that the Level constructor passes and creates the
//  * appropriate lava actor.
//  */

var Lava = class Lava {
  constructor(pos, speed, reset) {
    this.pos = pos;
    this.speed = speed;
    this.reset = reset;
  }
  get type() {
    return "lava";
  }

  static create(pos, ch) {
    if (ch == "=") {
      return new Lava(pos, new Vec(2, 0));
    } else if (ch == "|") {
      return new Lava(pos, new Vec(0, 2));
    } else if (ch == "v") {
      return new Lava(pos, new Vec(0, 3), pos);
    }
  }
};

Lava.prototype.size = new Vec(1, 1);

// /**
//  * create a coin class taking 3 params.
//  * pos, basePos, and the wobble
//  * wobble is slitly bouncing back and forth
//  */

var Coin = class Coin {
  constructor(pos, basePos, wobble) {
    this.pos = pos;
    this.basePos = basePos;
    this.wobble = wobble;
  }

  get type() {
    return "coin";
  }

  static create(pos) {
    let basePos = pos.plus(new Vec(0.2, 0.1));
    return new Coin(basePos, basePos, Math.random() * Math.PI * 2);
  }
};

Coin.prototype.size = new Vec(0.6, 0.6);

// //To avoid a situation where all coins move up and down
// //synchronously, the starting phase of each coin is randomized
// //We multiply the value returned by Math.random by that number
// //to give the coin a random starting position on the wave

// /**
//  * define the levelChars object that maps
//  * plan characters to either background grid types or actor classes.
//  */
var levelChars = {
  ".": "empty",
  "#": "wall",
  "+": "lava",
  "@": Player,
  o: Coin,
  "|": Lava,
  v: Lava,
  "=": Lava,
};

// //create a level instance
// var instancelevel = new Level(simpleLevelPlan);
// var simpleLevel = new Level(simpleLevelPlan);
// console.log(`${instancelevel.width} by ${instancelevel.height}`);
// console.log(`${simpleLevel.width} by ${simpleLevel.height}`);
// //22 by 9

// /**
//  *
//  * @param {*} name
//  * @param {*} attrs
//  * @param  {...any} children
//  * create an element and give it some attributes and child nodes:
//  */
function elt(name, attrs, ...children) {
  let dom = document.createElement(name);

  for (let att of Object.keys(attrs)) {
    dom.setAttribute(att, attrs[att]);
  }

  for (let child of children) {
    dom.appendChild(child);
  }
  console.log(dom);
  return dom;
}

// /**
//  * A display is created by giving it a parent element
//  *  to which it should append itself and a level object.
//  */

var DOMDisplay = class DOMDisplay {
  constructor(parent, level) {
    this.dom = elt("div", { class: "game" }, drawGrid(level));
    this.actorLayer = null;
    parent.appendChild(this.dom);
  }
  clear() {
    this.dom.remove();
  }
};

// //The scale constant gives the number of pixels that a
// //single unit takes up on the screen
const scale = 20;
function drawGrid(level) {
  return elt(
    "table",
    {
      class: "background",
      style: `width: ${level.width * scale}px`,
    },
    ...level.rows.map((row) =>
      elt(
        "tr",
        { style: `height: ${scale}px` },
        ...row.map((type) => elt("td", { class: type }))
      )
    )
  );
}

// /**
//  *  the background is drawn as a <table> element.
//  *  This nicely corresponds to the structure of the rows property
//  * of the level—each row of the grid is turned into a
//  *  table row (<tr> element). The strings in the grid are used as
//  * class names for the table cell (<td>) elements. The spread
//  * operator is used to pass arrays of child nodes to elt as separate
//  *  arguments
//  */

// /**
//  * draw each actor by creating a DOM element for it and setting that
//  *  element’s position and size based on the actor’s properties.
//  * The values have to be multiplied by scale to go from game units
//  *  to pixels.
//  */
function drawActors(actors) {
  return elt(
    "div",
    {},
    ...actors.map((actor) => {
      let rect = elt("div", { class: `actor ${actor.type}` });
      rect.style.width = `${actor.size.x * scale}px`;
      rect.style.height = `${actor.size.y * scale}px`;
      rect.style.left = `${actor.pos.x * scale}px`;
      rect.style.top = `${actor.pos.y * scale}px`;
      return rect;
    })
  );
}

// /**
//  *Use syncState method to make the display show a given  state.
//  * we first remove the old actor graphics, if any, and then
//  * redraw the actors in their new positions.
//  * It may be tempting to try to reuse the DOM elements for actors,
//  *  but to make that work, we would need a lot of additional bookkeeping
//  * to associate actors with DOM elements and to make sure we remove
//  *  elements when their actors vanish.
//  */
// //////

DOMDisplay.prototype.syncState = function (state) {
  if (this.actorLayer) this.actorLayer.remove();
  this.actorLayer = drawActors(state.actors);
  this.dom.appendChild(this.actorLayer);
  this.dom.className = `game ${state.status}`;
  this.scrollPlayerIntoView(state);
};

// // /**
// //  * In the scrollPlayerIntoView method, we find the player’s
// //  * position and update the wrapping element’s scroll position.
// //  * We change the scroll position by manipulating that element’s
// //  *  scrollLeft and scrollTop properties when the player is too close
// //  * to the edge
// //  */

DOMDisplay.prototype.scrollPlayerIntoView = function (state) {
  let width = this.dom.clientWidth;
  let height = this.dom.clientHeight;
  let margin = width / 3;

  //the viewport
  let left = this.dom.scrollLeft;
  let right = left + width;
  let top = this.dom.scrollTop;
  let bottom = top + height;

  let player = state.player;
  let center = player.pos.plus(player.size.times(0.5)).times(scale);

  if (center.x < left + margin) {
    this.dom.scrollLeft = center.x - margin;
  } else if (center.x > right - margin) {
    this.dom.scrollLeft = center.x + margin - width;
  }
  if (center.y < top + margin) {
    this.dom.scrollTop = center.y - margin;
  } else if (center.y > bottom - margin) {
    this.dom.scrollTop = center.y + margin - height;
  }
};

// // Note: To find the actor’s center, we add its position
// //(its top - left corner) and half its size.That is
// //the center in level coordinates, but we need it in pixel coordinates,
// //so we then multiply the resulting vector by our display scale.

// /**
//  *a method to tell us whether a rectangle
//   (specified by a position and a size) touches a grid element of
//   the given type.
//  */

Level.prototype.touches = function (pos, size, type) {
  let xStart = Math.floor(pos.x);
  let xEnd = Math.ceil(pos.x + size.x);
  let yStart = Math.floor(pos.y);
  let yEnd = Math.ceil(pos.y + size.y);
  for (let y = yStart; y < yEnd; y++) {
    for (let x = xStart; x < xEnd; x++) {
      let isOutside = x < 0 || x > this.width || y < 0 || y > this.height;
      let here = isOutside ? "wall" : this.rows[y][x];
      if (here == type) return true;
    }
  }
  return false;
};

// /**
//  * The state update method uses touches to figure out
//  *  whether the player is touching lava.
//  */

State.prototype.update = function (time, keys) {
  let actors = this.actors.map((actor) => actor.update(time, this, keys));
  let newState = new State(this.level, actors, this.status);
  if (newState.status != "playing") return newState;
  let player = newState.player;
  if (this.level.touches(player.pos, player.size, "lava")) {
    return new State(this.level, actors, "lost");
  }

  for (let actor of actors) {
    if (actor != player && overlap(actor, player)) {
      newState = actor.collide(newState);
    }
  }
  return newState;
};

function overlap(actor1, actor2) {
  return (
    actor1.pos.x + actor1.size.x > actor2.pos.x &&
    actor1.pos.x < actor2.pos.x + actor2.size.x &&
    actor1.pos.y + actor1.size.y > actor2.pos.y &&
    actor1.pos.y < actor2.pos.y + actor2.size.y
  );
}

// /**
//  * If any actor does overlap, its collide method gets a chance
//  * to update the state. Touching a lava actor sets the game status
//  * to "lost". Coins vanish when you touch them and set the status
//  *  to "won" when they are the last coin of the level.
//  */

Lava.prototype.collide = function (state) {
  return new State(state.level, state.actors, "lost");
};

Coin.prototype.collide = function (state) {
  let filtered = state.actors.filter((a) => a != this);
  let status = state.status;
  if (!filtered.some((a) => a.type == "coin")) status = "won";
  return new State(state.level, filtered, status);
};

// /**
//  * Actor objects’ update methods
//  * take as arguments the time step, the state object,
//  *  and a keys object. The one for the Lava actor type ignores
//  * the keys object.
//  */

Lava.prototype.update = function (time, state) {
  let newPos = this.pos.plus(this.speed.times(time));
  if (!state.level.touches(newPos, this.size, "wall")) {
    return new Lava(newPos, this.speed, this.reset);
  } else if (this.reset) {
    return new Lava(this.reset, this.speed, this.reset);
  } else {
    return new Lava(this.pos, this.speed.times(-1));
  }
};

var wobbleSpeed = 8,
  wobbleDist = 0.07;
Coin.prototype.update = function (time) {
  let wobble = this.wobble + time * wobbleSpeed;
  let wobblePos = Math.sin(wobble) * wobbleDist;
  return new Coin(
    this.basePos.plus(new Vec(0, wobblePos)),
    this.basePos,
    wobble
  );
};

//var wobbleSpeed = 8,
//   wobbleDist = 0.07;

// Coin.prototype.update = function (time) {
//   let wobble = this.wobble + time * wobbleSpeed;
//   let wobblePos = Math.sin(wobble) * wobbleDist;
//   return new Coin(
//     this.basePos.plus(new Vec(0, wobblePos)),
//     this.basePos,
//     wobble
//   );
// };/

// /**
//  * The horizontal motion is computed based on the state of the
//  * left and right arrow keys. When there’s no wall blocking the
//  * new position created by this motion, it is used. Otherwise, the
//  * old position is kept.

// Vertical motion works in a similar way but has to simulate jumping
// and gravity. The player’s vertical speed (ySpeed) is first accelerated
// to account for gravity.
//  */

var playerXSpeed = 7;
var gravity = 30;
var jumpSpeed = 17;

Player.prototype.update = function (time, state, keys) {
  let xSpeed = 0;
  if (keys.ArrowLeft) xSpeed -= playerXSpeed;
  if (keys.ArrowRight) xSpeed += playerXSpeed;
  let pos = this.pos;
  let movedX = pos.plus(new Vec(xSpeed * time, 0));
  if (!state.level.touches(movedX, this.size, "wall")) {
    pos = movedX;
  }

  let ySpeed = this.speed.y + time * gravity;
  let movedY = pos.plus(new Vec(0, ySpeed * time));
  if (!state.level.touches(movedY, this.size, "wall")) {
    pos = movedY;
  } else if (keys.ArrowUp && ySpeed > 0) {
    ySpeed = -jumpSpeed;
  } else {
    ySpeed = 0;
  }
  return new Player(pos, new Vec(xSpeed, ySpeed));
};

// /**
//  * when given an array of key names, return an object that
//  * tracks the current position of those keys. It registers event
//  * handlers for "keydown" and "keyup" events and, when the key code
//  * in the event is present in the set of codes that it is tracking,
//  * updates the objec
//  *
//  */
// // set up a key handler that stores the current state of the left,
// //right, and up arrow keys

function trackKeys(keys) {
  let down = Object.create(null);
  function track(event) {
    if (keys.includes(event.key)) {
      down[event.key] = event.type == "keydown";
      //preventDefault for those keys so that they don’t end up
      //scrolling the page.
      event.preventDefault();
    }
  }
  window.addEventListener("keydown", track);
  window.addEventListener("keyup", track);
  return down;
}

// //NOTE: The same handler function is used for both event types.
// //It looks at the event object’s type property to determine whether
// //the key state should be updated to true("keydown") or false("keyup").

const arrowKeys = trackKeys(["ArrowLeft", "ArrowRight", "ArrowUp"]);

// //runAnimation function
function runAnimation(frameFunc) {
  let lastTime = null;
  function frame(time) {
    if (lastTime != null) {
      let timeStep = Math.min(time - lastTime, 100) / 1000;
      if (frameFunc(timeStep) === false) return;
    }
    lastTime = time;
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

// /**
//  * The runLevel function takes a Level object and a display
//  * constructor and returns a promise. It displays the level
//  * (in document.body) and lets the user play through it
//  * */
function runLevel(level, Display) {
  let display = new Display(document.body, level);
  let state = State.start(level);
  let ending = 1;
  return new Promise((resolve) => {
    runAnimation((time) => {
      state = state.update(time, arrowKeys);
      display.syncState(state);
      if (state.status === "playing") {
        return true;
      } else if (ending > 0) {
        ending -= time;
        return true;
      } else {
        display.clear();
        resolve(state.status);
        return false;
      }
    });
  });
}

// /**
//  * When a level is completed, we move on to the next level.
//  * This can be expressed by the following function, which takes
//  * an array of level plans (strings) and a display constructor:
//  */

async function runGame(plans, Display) {
  for (let level = 0; level < plans.length; ) {
    let status = await runLevel(new Level(plans[level]), Display);
    if (status === "won") level++;
  }
  console.log("you won");
}
