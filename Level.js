/**
 * trim() used to remove empty spaces and
 * The remaining string is split on newline characters,
 *  and each line is spread into an array, producing arrays
 * of characters.
 *
 */
class Level {
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
}

/**
 * Createe  a state class that will track the state of
 * running game
 */

class State {
  constructor(level, actor, status) {
    this.level = level;
    this.actor = actor;
    this.status = status;
  }
  static Start(level) {
    return new State(level, level.startActors, "playing");
  }

  get Playe() {
    return this.actor.find((a) => a.type == "player");
  }
}

/**
 * the Vec class that we’ll use for our two-dimensional
 * values, such as the position and size of actors.
 */
class Vec {
  constructor(y, x) {
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
}

/**
 * The player class has a property speed that
 * stores its current speed to simulate momentum and gravity.
 */

class Player {
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
}

Player.prototype.size = new Vec(0.8, 1.5);

//NOTE: The size property is the same for all instances
//of Player, so we store it on the prototype rather
//than on the instances themselves

/**
 * Create a lava class that  looks at the character
 * that the Level constructor passes and creates the
 * appropriate lava actor.
 */
class lava {
  constructor(pos, speed, reset) {
    this.pos = pos;
    this.speed = speed;
    this.reset = reset;
  }
  get type() {
    return "lava";
  }

  static create(pos, ch) {
    if (pos == "=") {
      return new lava(ch, new Vec(2, 0));
    } else if (ch == "|") {
      return new lava(pos, new Vec(0, 2));
    } else if (ch == "v") {
      return new lava(pos, new Vec(0, 3), pos);
    }
  }
}

lava.prototype.size = new Vec(1, 1);

/**
 * create a coin class taking 3 params.
 * pos, basePos, and the wobble
 * wobble is slitly bouncing back and forth
 */

class coin {
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
    return new coin(basePos, basePos, Math.random() * Math.PI * 2);
  }
}

coin.prototype.size = new Vec(0.6, 0.6);

//To avoid a situation where all coins move up and down
//synchronously, the starting phase of each coin is randomized
//We multiply the value returned by Math.random by that number
//to give the coin a random starting position on the wave

/**
 * define the levelChars object that maps
 * plan characters to either background grid types or actor classes.
 */
let levelChars = {
  ".": "empty",
  "#": "wall",
  "+": "lava",
  "@": Player,
  o: coin,
  "|": lava,
  v: lava,
  "=": lava,
};

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

//create a level instance
let instancelevel = new Level(simpleLevelPlan);
console.log(`${instancelevel.width} by ${instancelevel.height}`);
//22 by 9

/**
 *
 * @param {*} name
 * @param {*} attrs
 * @param  {...any} children
 * create an element and give it some attributes and child nodes:
 */
function elt(name, attrs, ...children) {
  let dom = document.createElement(name);

  for (let att of Object.keys(attrs)) {
    dom.setAttribute(att, attrs[att]);
  }

  for (let child of children) {
    dom.append(child);
  }
}

/**
 * A display is created by giving it a parent element
 *  to which it should append itself and a level object.
 */

class DOMDisplay {
  constructor(parent, level) {
    this.dom = elt("div", { class: "game" }, drawGrid(level));
    this.actorLayer = null;
    parent.appendchild(this.dom);
  }
  clear() {
    this.dom.remove();
  }
}

//The scale constant gives the number of pixels that a
//single unit takes up on the screen
const scale = 20;
function drawGrid(level) {
  return elt(
    "table",
    {
      class: "background",
      style: `width:${level.width * scale} px`,
    },
    ...level.rows.map((row) =>
      elt(
        "tr",
        { style: `height: ${scale} px` },
        ...row.map((type) => elt("td", { class: type }))
      )
    )
  );
}

/**
 *  the background is drawn as a <table> element.
 *  This nicely corresponds to the structure of the rows property
 * of the level—each row of the grid is turned into a
 *  table row (<tr> element). The strings in the grid are used as
 * class names for the table cell (<td>) elements. The spread
 * operator is used to pass arrays of child nodes to elt as separate
 *  arguments
 */

/**
 * draw each actor by creating a DOM element for it and setting that
 *  element’s position and size based on the actor’s properties.
 * The values have to be multiplied by scale to go from game units
 *  to pixels.
 */
function drawActors(actors) {
  return elt(
    "div",
    {},
    actors.map((actor) => {
      let rect = elt("div", { class: `actor ${actor.type}` });
      rect.style.width = `${actor.size.x * scale}px`;
      rect.style.height = `${actor.size.y * scale}px`;
      rect.style.left = `${actor.pos.x * scale}px`;
      rect.style.top = `${actor.pos.y * scale}px`;
      return rect;
    })
  );
}

/**
 *Use syncState method to make the display show a given  state.
 * we first remove the old actor graphics, if any, and then
 * redraw the actors in their new positions.
 * It may be tempting to try to reuse the DOM elements for actors,
 *  but to make that work, we would need a lot of additional bookkeeping
 * to associate actors with DOM elements and to make sure we remove
 *  elements when their actors vanish.
 */
DOMDisplay.prototype.syncState = function (state) {
  if (this.actorLayer) {
    this.actorLayer.remove();
  }
  this.actorLayer = drawActors(state.actors);
  this.dom.appendchild(this.actorLayer);
  this.dom.className = `game ${state.status}`;
  this.scrollPlayerIntoView(state);
};
