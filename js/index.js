window.onload = () => {
  const data = {
    slices: 18,
    zoom: 217,
    baseRotation1: 61,
    rotationSpeed1: -8,
    baseRotation2: -148,
    rotationSpeed2: -8,
    rotationCenterX: 21,
    rotationCenterY: 66,
    mirrorSlices: !0,
    pinch: !1,
    hasMouseInteraction: !0,
    image: "https://static.cargo.site/assets/backdrop/default_1024.jpg",
    mirrorImageX: !0,
    mirrorImageY: !0,
    hasMotionInteraction: !0,
    image_size: 1024,
    width: 1500,
    height: 1500,
  };
  const obj = new KaleidoscopeWebGL("kaleidoscope", data, "load-success", data);
  obj.start();
};

let cookie;
function preload() {
  cookie = loadImage("../assets/cookie.jpg");
}

let list = [];
function setup() {
  createCanvas(windowWidth, windowHeight).parent("fiexd");
  for (let index = 0; index < 2; index++) {
    list.push(new Cookie());
  }
}

function draw() {
  background("#ffffff");
  for (let item of list) {
    item.update();
    item.draw();
  }
}

class Cookie {
  constructor() {
    this.pos = createVector(int(width / 2), int(height / 2));
    this.v = p5.Vector.random2D().mult(2);
  }

  update() {
    this.pos.add(this.v);
    if (this.pos.y > height - 172 / 2) {
      this.v.y *= -1;
    }
    if (this.pos.y <= 172 / 2) {
      this.v.y *= -1;
    }
    if (this.pos.x > width - 172 / 2) {
      this.v.x *= -1;
    }
    if (this.pos.x <= 172 / 2) {
      this.v.x *= -1;
    }

    console.log(`x: ${this.pos.x}, y: ${this.pos.y}`);
  }

  draw() {
    imageMode(CENTER);
    image(cookie, this.pos.x, this.pos.y, 174, 174);
  }
}
