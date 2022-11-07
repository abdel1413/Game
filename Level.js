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
        let type = LevelChar[ch];
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
