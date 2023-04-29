class KaleidoscopeWebGL {
  constructor(id, t, i, n) {
    this.inited = !1;
    this.image_url = "";
    this.image_load_queue = [];
    this.has_dimensions = !1;
    this.init(id, t, n);

    this.baseRotation1 = 0;
    this.baseRotation2 = 0;
    this.rotationSpeed1 = 0.001;
    this.rotationSpeed2 = -0.001;
    this.rotationCenterX = 0.5;
    this.rotationCenterY = 0.5;
  }

  init(id, t, i) {
    this.defaults = i;
    this.parameters = {
      start_time: new Date().getTime(),
      time: 0,
      screenWidth: 0,
      screenHeight: 0,
      resolution: 1,
    };
    this.vertex_shader = [
      "attribute vec3 position;",
      "void main() {",
      "\tgl_Position = vec4( position, 1.0 );",
      "}",
    ].join("\n");
    this.fragment_shader = [
      "#if GL_FRAGMENT_PRECISION_HIGH == 1",
      "\tprecision highp int;",
      "\tprecision highp float;",
      "#endif",
      "uniform sampler2D uSampler;",
      "uniform float time;",
      "uniform float baseRotation1;",
      "uniform float rotationSpeed1;",
      "uniform float baseRotation2;",
      "uniform float rotationSpeed2;",
      "uniform float sliceAngle;",
      "uniform float mirrorSlices;",
      "uniform vec2 zoom;",
      "uniform vec2 resolution;",
      "uniform vec2 aspect;",
      "uniform vec2 center;",
      "uniform vec2 mouseOffset;",
      "uniform bool pinch;",
      "void main( void ) {",
      "\tvec2 position = -aspect.xy + 2.0 * gl_FragCoord.xy / resolution.xy * aspect.xy;",
      "\tfloat radius = length(position);",
      "\tfloat angle = atan(position.y,position.x)+baseRotation1;",
      "\tfloat slice = mod((angle+time*rotationSpeed1), (sliceAngle*2.0));",
      "\tif (mirrorSlices * slice>sliceAngle)",
      "\t{",
      "\t\tslice = (2.0*sliceAngle-slice);",
      "\t}",
      "\tif(pinch)",
      "\t{",
      "\t\tfloat rot2 = baseRotation2 + time*rotationSpeed2;",
      "\t\trot2 = atan(position.y,position.x)+baseRotation2 + time*rotationSpeed2;",
      "\t\tgl_FragColor = texture2D(uSampler, ( center + length( center ) * vec2( cos(rot2), sin(rot2)) +  mouseOffset +  vec2( cos(slice), sin(slice)) * radius) * zoom );",
      "\t} else {",
      "\t\tfloat rot2 = baseRotation2 + time*rotationSpeed2;",
      "\t\tvec2 rot = vec2(sin(rot2),cos(rot2));",
      "\t\tvec2 pos = vec2( cos(slice), sin(slice)) * radius + center ;",
      "\t\tgl_FragColor = texture2D(uSampler, (vec2(pos.x * rot.y + pos.y * rot.x,pos.y * rot.y - pos.x * rot.x)) * zoom  +  mouseOffset, -1.0);",
      "\t}",
      "}",
    ].join("\n");
    this.canvas = document.getElementById(id);
    this.canvas.width = this.parentWidth =
      this.canvas.parentNode.offsetWidth + 2;
    this.canvas.height = this.parentHeight =
      this.canvas.parentNode.offsetHeight + 2;
    try {
      let n = (this.gl_ctx = this.canvas.getContext("experimental-webgl"));
      if (!n) throw alert("WebGL not supported");
      ("cannot create webgl context");
      this.buffer = n.createBuffer();
      n.bindBuffer(n.ARRAY_BUFFER, this.buffer);
      n.bufferData(
        n.ARRAY_BUFFER,
        new Float32Array([-1, -1, 1, -1, -1, 1, 1, -1, 1, 1, -1, 1]),
        n.STATIC_DRAW
      );
    } catch (e) {}
    this.currentProgram = this.createProgram(
      this.vertex_shader,
      this.fragment_shader
    );
    this.fringePadding = 0.6;
    this.canvasMousePos = {
      x: 0,
      y: 0,
    };
    this.canvasMousePrev = {
      x: -1,
      y: -1,
    };
    this.size = 0;
    this.sliceWidth = 0;
    this.renderRequestID = null;
    this.alphaAvg = [];
    this.alphaSum = 0;
    this.betaAvg = [];
    this.betaSum = 0;
    this.gammaAvg = [];
    this.gammaSum = 0;
    let o = this;
    this.mouseMove = function (e) {
      if (o.hasMouseInteraction) {
        let t = (o.canvas.getBoundingClientRect(), o.zoom / 5),
          i = e.clientX,
          n = e.clientY,
          r = 0.35 * t + (1 - t);
        (o.canvasMousePos.x = r * i * r), (o.canvasMousePos.y = r * n * r);
      }
    }.bind(this);
    this.touchMove = function (e) {
      if (o.hasMouseInteraction) {
        let t = o.canvas.getBoundingClientRect();
        (o.canvasMousePos.x = e.targetTouches[0].pageX - t.left),
          (o.canvasMousePos.y = e.targetTouches[0].pageY - t.top);
      }
    }.bind(this);
    window.addEventListener("mousemove", this.mouseMove, !1);
    window.addEventListener("touchmove", this.touchMove, !1);
    this.updateSettings(t);
    t.image && this.loadImage(t.image);
  }

  updateSettings(e) {
    let final_value;
    let value;
    for (let name in e) {
      value = final_value = e[name];
      "zoom" === name
        ? (final_value = value / 100)
        : "baseRotation1" === name
        ? (final_value = (value / 180) * Math.PI)
        : "rotationSpeed1" === name
        ? (final_value = value / 1e4)
        : "baseRotation2" === name
        ? (final_value = (value / 180) * Math.PI)
        : "rotationSpeed2" === name
        ? (final_value = value / 1e4)
        : "rotationCenterX" === name
        ? (final_value = value / 100)
        : "rotationCenterY" === name
        ? (final_value = value / 100)
        : (final_value = value);
      this[name] = final_value;
    }
    this.rotation1 = 0;
    this.rotation2 = 0;
  }

  loadImage(e) {
    let t = this;
    let i = {
      h: 576,
      retina: false,
      square: false,
      t: "webgl",
      // url: "assets/bg.png",
      url: "assets/bg2.jpg",
      w: 1024,
      webgl: true,
    };
    this.image_url = i ? i.url : this.defaults.image;
    this.image_width = i ? i.w : this.defaults.width;
    this.image_height = i ? i.h : this.defaults.height;
    // $(this.canvas)
    //   .closest("[data-backdrop]")
    //   .find(".loading_animation")
    //   .removeClass("hidden");
    this.currentImage = new Image();
    this.currentImage.crossOrigin = "";
    this.image_load_queue.push({
      url: this.image_url,
      width: this.image_width,
      height: this.image_height,
    });
    this.currentImage.onload = function () {
      if (!t.destroyed) {
        // $(t.canvas)
        //   .closest("[data-backdrop]")
        //   .find(".loading_animation")
        //   .addClass("hidden");
        let e = t.image_load_queue.pop();
        e &&
          e.url.split("?")[0] == t.image_url.split("?")[0] &&
          0 != t.currentImage.width &&
          (e.width && e.height
            ? (t.has_dimensions = !0)
            : (t.has_dimensions = !1),
          t.updateTexture(),
          (t.image_load_queue = []));
      }
    };
    t.currentImage.src = this.image_url;
  }

  updateTexture() {
    let e = this,
      t = this.gl_ctx;
    if (
      ((this.kTexture = t.createTexture()),
      t.bindTexture(t.TEXTURE_2D, this.kTexture),
      (this.textureRatio = 1),
      !this.isPowerOfTwo(this.currentImage.width) ||
        !this.isPowerOfTwo(this.currentImage.height))
    ) {
      let i = document.createElement("canvas");
      i.width = this.nextHighestPowerOfTwo(this.currentImage.width);
      i.height = this.nextHighestPowerOfTwo(this.currentImage.height);
      i.getContext("2d").drawImage(
        this.currentImage,
        0,
        0,
        this.currentImage.width,
        this.currentImage.height,
        0,
        0,
        i.width,
        i.height
      );
      this.textureRatio = this.currentImage.height / this.currentImage.width;
      this.currentImage = i;
    }
    this.has_dimensions &&
      (this.textureRatio = this.image_height / this.image_width);
    t.texImage2D(
      t.TEXTURE_2D,
      0,
      t.RGBA,
      t.RGBA,
      t.UNSIGNED_BYTE,
      this.currentImage
    );
    t.texParameteri(t.TEXTURE_2D, t.TEXTURE_MAG_FILTER, t.LINEAR);
    t.texParameteri(
      t.TEXTURE_2D,
      t.TEXTURE_MIN_FILTER,
      this.mirrorSlices ? t.LINEAR_MIPMAP_NEAREST : t.LINEAR
    );
    t.texParameteri(
      t.TEXTURE_2D,
      t.TEXTURE_WRAP_S,
      this.mirrorImageX ? t.MIRRORED_REPEAT : t.REPEAT
    );
    t.texParameteri(
      t.TEXTURE_2D,
      t.TEXTURE_WRAP_T,
      this.mirrorImageY ? t.MIRRORED_REPEAT : t.REPEAT
    );
    t.generateMipmap(t.TEXTURE_2D);
    t.bindTexture(t.TEXTURE_2D, null);
    e.inited = !0;
  }

  isPowerOfTwo(e) {
    return 0 == (e & (e - 1));
  }

  nextHighestPowerOfTwo(e) {
    --e;
    for (let t = 1; t < 32; t <<= 1) e |= e >> t;
    return e + 1;
  }

  setImage(e) {
    this.currentImage = e;
    let t = this;
    this.currentImage.onload = function () {
      t.destroyed || t.updateTexture();
    };
    this.currentImage.complete && this.updateTexture();
  }

  setSliceCount = function (e) {
    this.slices = (2 * e) | 0;
    this.slices < 4 && (this.slices = 4);
  };

  setZoom(e) {
    this.zoom = e;
    this.zoom <= 1e-6 && (this.zoom = 1e-6);
    this.zoom > 10 && (this.zoom = 10);
  }

  setImageMirroring(e, t) {
    this.mirrorImageX = e;
    this.mirrorImageY = t;
    let i = this.gl_ctx;
    i.texParameteri(
      i.TEXTURE_2D,
      i.TEXTURE_WRAP_S,
      this.mirrorImageX ? i.MIRRORED_REPEAT : i.REPEAT
    );
    i.texParameteri(
      i.TEXTURE_2D,
      i.TEXTURE_WRAP_T,
      this.mirrorImageY ? i.MIRRORED_REPEAT : i.REPEAT
    );
  }

  setMirrorSlices(e) {
    this.mirrorSlices = e;
    let t = this.gl_ctx;
    t.bindTexture(t.TEXTURE_2D, this.kTexture);
    t.texParameteri(
      t.TEXTURE_2D,
      t.TEXTURE_MIN_FILTER,
      e ? t.LINEAR_MIPMAP_NEAREST : t.LINEAR
    );
    t.bindTexture(t.TEXTURE_2D, null);
  }

  stop() {
    this.renderRequestID &&
      ((
        window.cancelAnimationFrame ||
        window.mozCancelAnimationFrame ||
        window.webkitCancelAnimationFrame ||
        window.oCancelAnimationFrame
      )(this.renderRequestID),
      (this.renderRequestID = null));
  }

  isActive() {
    return null != this.renderRequestID;
  }

  start() {
    null == this.renderRequestID && this.render();
  }

  createProgram(e, t) {
    let i = this.gl_ctx;
    let n = i.createProgram();
    let o = this.createShader(e, i.VERTEX_SHADER);
    let r = this.createShader(
      "#ifdef GL_ES\nprecision mediump float;\n#endif\n\n" + t,
      i.FRAGMENT_SHADER
    );
    return null == o || null == r
      ? null
      : (i.attachShader(n, o),
        i.attachShader(n, r),
        i.deleteShader(o),
        i.deleteShader(r),
        i.linkProgram(n),
        i.getProgramParameter(n, i.LINK_STATUS)
          ? n
          : (alert(
              "ERROR:\nVALIDATE_STATUS: " +
                i.getProgramParameter(n, i.VALIDATE_STATUS) +
                "\nERROR: " +
                i.getError() +
                "\n\n- Vertex Shader -\n" +
                e +
                "\n\n- Fragment Shader -\n" +
                t
            ),
            null));
  }

  createShader(e, t) {
    let i = this.gl_ctx;
    let n = i.createShader(t);
    return (
      i.shaderSource(n, e),
      i.compileShader(n),
      i.getShaderParameter(n, i.COMPILE_STATUS)
        ? n
        : (alert(
            (t == i.VERTEX_SHADER ? "VERTEX" : "FRAGMENT") +
              " SHADER:\n" +
              i.getShaderInfoLog(n)
          ),
          null)
    );
  }

  getCurrentSettings() {
    return {
      inited: this.inited,
      slices: this.slices / 2,
      baseRotation1: this.baseRotation1,
      baseRotation2: this.baseRotation2,
      rotationSpeed1: this.rotationSpeed1,
      rotationSpeed2: this.rotationSpeed2,
      rotationCenterX: this.rotationCenterX,
      rotationCenterY: this.rotationCenterY,
      zoom: this.zoom,
      mirrorSlices: this.mirrorSlices,
      mirrorImageX: this.mirrorImageX,
      mirrorImageY: this.mirrorImageY,
      pinch: this.pinch,
      hasMouseInteraction: this.hasMouseInteraction,
      hasMotionInteraction: this.hasMotionInteraction,
      image_width: this.image_width,
      image_height: this.image_height,
    };
  }

  toString() {
    return "KaleidoscopeWebGL";
  }

  update() {
    let i = this;
    return (
      window.requestAnimationFrame ||
      window.mozRequestAnimationFrame ||
      window.webkitRequestAnimationFrame ||
      window.oRequestAnimationFrame
    )(i.render.bind(this));
  }

  render() {
    let e = this;
    if (!this.currentImage) return void (this.renderRequestID = this.update());
    if (this.currentProgram) {
      let t = this.currentProgram,
        i = this.gl_ctx,
        n = this.parameters,
        o = this.canvas,
        r = $(this.canvas).closest(".backdrop").get(0),
        a = r.offsetWidth,
        s = r.offsetHeight,
        u = window.devicePixelRatio;
      -1 == e.canvasMousePrev.x
        ? ((e.canvasMousePrev.x = e.canvasMousePos.x),
          (e.canvasMousePrev.y = e.canvasMousePos.y))
        : ((e.canvasMousePrev.x =
            0.2 * e.canvasMousePos.x + 0.8 * e.canvasMousePrev.x),
          (e.canvasMousePrev.y =
            0.2 * e.canvasMousePos.y + 0.8 * e.canvasMousePrev.y)),
        (n.screenWidth == a && n.screenHeight == s && n.resolution == u) ||
          ((n.screenWidth = a),
          (n.screenHeight = s),
          (n.resolution = u),
          (n.screenWidth = o.width = a),
          (n.screenHeight = o.height = s),
          (n.aspectX = a / s),
          (n.aspectY = 1),
          i.viewport(0, 0, a, s)),
        i.clear(i.COLOR_BUFFER_BIT | i.DEPTH_BUFFER_BIT),
        i.useProgram(t),
        (n.time = new Date().getTime() - n.start_time),
        i.uniform1f(i.getUniformLocation(t, "time"), n.time / 1e3),
        i.uniform1f(
          i.getUniformLocation(t, "sliceAngle"),
          (2 * Math.PI) / this.slices
        ),
        i.uniform1f(
          i.getUniformLocation(t, "baseRotation1"),
          this.baseRotation1 + this.rotation1
        ),
        i.uniform1f(
          i.getUniformLocation(t, "rotationSpeed1"),
          50 * this.rotationSpeed1
        ),
        i.uniform1f(
          i.getUniformLocation(t, "baseRotation2"),
          this.baseRotation2 + this.rotation2
        ),
        i.uniform1f(
          i.getUniformLocation(t, "rotationSpeed2"),
          50 * this.rotationSpeed2
        ),
        i.uniform2f(
          i.getUniformLocation(t, "zoom"),
          (1.5 / this.zoom) * this.textureRatio,
          1.5 / this.zoom
        ),
        i.uniform1f(
          i.getUniformLocation(t, "mirrorSlices"),
          this.mirrorSlices ? 1 : 0
        ),
        i.uniform2f(
          i.getUniformLocation(t, "center"),
          this.rotationCenterX,
          this.rotationCenterY
        ),
        i.uniform2f(
          i.getUniformLocation(t, "mouseOffset"),
          0.005 * this.canvasMousePrev.x,
          0.005 * this.canvasMousePrev.y
        ),
        i.uniform2f(
          i.getUniformLocation(t, "resolution"),
          n.screenWidth,
          n.screenHeight
        ),
        i.uniform2f(i.getUniformLocation(t, "aspect"), n.aspectX, n.aspectY),
        i.uniform1f(i.getUniformLocation(t, "pinch"), this.pinch),
        i.bindTexture(i.TEXTURE_2D, this.kTexture),
        i.uniform1i(i.getUniformLocation(t, "uSampler"), 0),
        i.bindBuffer(i.ARRAY_BUFFER, this.buffer),
        i.vertexAttribPointer(this.vertex_position, 2, i.FLOAT, !1, 0, 0),
        i.enableVertexAttribArray(this.vertex_position),
        i.drawArrays(i.TRIANGLES, 0, 6),
        i.disableVertexAttribArray(this.vertex_position),
        (this.renderRequestID = this.update());
    }
  }

  destroy() {
    window.removeEventListener("mousemove", this.mouseMove);
    window.removeEventListener("touchmove", this.touchMove);
    this.inited = !1;
    this.image_load_queue = [];
    this.gl_ctx = null;
    this.currentProgram = null;
    this.parameters = null;
    this.canvas = null;
    this.parameters = null;
    this.vertex_shader = null;
    this.fragment_shader = null;
    this.destroyed = !0;
  }
}
