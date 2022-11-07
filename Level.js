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

class Vec {
  constructor(y, x) {
    this.x = x;
    this.y = y;
  }

  plus(other) {
    return new Vec(this.x + other.x, this.y + other.y);
  }
  times(factor) {
    return new Vec(this.x * factor, this.y * factor);
  }
}
