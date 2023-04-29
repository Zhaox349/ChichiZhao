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
  const obj = new KaleidoscopeWebGL(
    "kaleidoscope",
    data,
    "load-success",
    data
  );
  obj.start();
};
