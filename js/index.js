// //Concept Kaleidoscope
// //reference Kadenze, p5.js library

// var s = 100; // the length of triangle side
// var num = 12; // the number of particles in each triangle
// var minimal = 60; //The minimal length of two particles to link together
// var speed = 0.05; // rotate speed
// var X = new Array(num);
// var Y = new Array(num);
// var VX = new Array(num);
// var VY = new Array(num);
// var r = new Array(num);
// var g = new Array(num);
// var b = new Array(num);
// var colorChange = false;
// // var amplitude;
// var text = {
//   Side: 10,
//   Line: 10,
//   Music: false,
// };

// Controller = function () {
//   //Super Massive thanks to Harrison for helping me figure out how to use google dat.gui!!!
//   this.Side = 100;
//   this.Line = 60;
//   this.Music = false;
// };

// function setup() {
//   createCanvas(windowWidth, windowHeight).parent("bg");
//   // amplitude = new p5.Amplitude();

//   // var gui = new dat.GUI();
//   // text = new Controller();
//   // gui.add(text, "Line", 30, 120);
//   // gui.add(text, "Side", 60, 200);
//   // gui.add(text, "Music").onChange(play);

//   strokeWeight(0.5);

//   //set up The first position , spped, color of particles

//   for (var i = 0; i < num; i++) {
//     X[i] = random(0, s * 2);
//     Y[i] = random(0, s * Math.sqrt(3)); //border of particles is a triangle

//     VX[i] = random(-speed, speed);
//     VY[i] = random(-speed, speed);

//     r[i] = random(255);
//     g[i] = random(255);
//     b[i] = random(255);
//   }
// }

// function draw() {
//   var level = 1;
//   background(0, 50); //enable the whole picture to have a phantom effect

//   // console.log(level);
//   minimal = text.Line;
//   s = text.Side;

//   var l0 = map(mouseX, 0, width, 100, 200);
//   var l1 = map(mouseY, 0, height, 100, 200);

//   translate(width / 2, height / 2);

//   for (var i = 0; i < 6; i++) {
//     push();
//     rotate((i * TWO_PI) / 6);
//     translate(0, l0);
//     push();
//     rotate(level * 5);
//     particles(s, num);

//     if (level * 100 > 1.8) {
//       colorChange = !colorChange;
//       particles(s, num * level * 100);
//     }
//     pop();

//     for (var j = 0; j < 6; j++) {
//       push();
//       rotate((j * TWO_PI) / 6);
//       translate(0, l1);
//       push();
//       rotate(level * 5);
//       particles(s, num);
//       if (level * 100 > 1.8) {
//         colorChange = !colorChange;
//         particles(s, num * level * 100);
//       }
//       pop();
//       pop();
//     }
//     pop();
//   }
// }

// function deviceShaken() {
//   colorChange = !colorChange;
// } //because the concept is a kaleidoscope, so enable color to be changed when device been shaken

// function mouseClicked() {
//   colorChange = !colorChange;
// }

// //reference https://www.openprocessing.org/sketch/465249
// //link dots to dots by Masaki Yamabe

// function particles(s, num) {
//   for (var i = 0; i < num; i++) {
//     //particles will not go beyond the left side
//     if (X[i] < Y[i] / Math.sqrt(3)) {
//       VX[i] = VX[i] * -1;
//       VY[i] = VY[i] * -1;
//       X[i] = Y[i] / Math.sqrt(3);
//     }
//     //particles will not go beyong the right side
//     if (X[i] > -Y[i] / Math.sqrt(3) + s * 2) {
//       VX[i] = VX[i] * -1;
//       VY[i] = VY[i] * -1;
//       X[i] = -Y[i] / Math.sqrt(3) + s * 2;
//     }
//     //particles will not go beyond the height of triangle
//     if (Y[i] > s * Math.sqrt(3)) {
//       VY[i] = VY[i] * -1;
//       Y[i] = s * Math.sqrt(3) - 10;
//     }
//     //particles will not go beyond the bottom of triangle
//     if (Y[i] < 0) {
//       VY[i] = VY[i] * -1;
//       Y[i] = 0;
//     }
//     // change the direction when particles hit the border.
//     X[i] = X[i] + VX[i];
//     Y[i] = Y[i] + VY[i];

//     //color all the particles.
//     colorMode(RGB);
//     fill(r[i], g[i], b[i]);
//     ellipse(X[i], Y[i], 3, 3);

//     //calculate the distance between each particle
//     for (var n = 0; n < num; n++) {
//       var d = dist(X[n], Y[n], X[i], Y[i]);

//       //stroke the distance of those particles who close to each other
//       if (d < minimal) {
//         colorMode(HSB);
//         if (colorChange === true) {
//           stroke((1 - d / minimal) * 330, 70, 100); //change the color according to the distance
//         } else {
//           stroke((d / minimal) * 330, 70, 100);
//         }
//         strokeWeight(0.5);
//         line(X[n], Y[n], X[i], Y[i]);
//       }
//     }
//   }
// }
