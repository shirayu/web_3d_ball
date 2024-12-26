const scene = new THREE.Scene();

const default_fov = 40;
const default_near = 0.7;
const camera = new THREE.PerspectiveCamera(default_fov, window.innerWidth / window.innerHeight, default_near, 1000);
camera.position.x = 1.0;
camera.position.y = 2.0;
camera.position.z = 3.0;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const geometry = new THREE.SphereGeometry(1, 32, 32);
const material = new THREE.MeshBasicMaterial({
  color: 0xffffff,
  transparent: true,
  wireframe: false,
  opacity: 0.8,
});
const sphere = new THREE.Mesh(geometry, material);
scene.add(sphere);

const numSegments = 100;

function drawLineOnSurface(color, positionFunc) {
  const lineMaterial = new THREE.LineBasicMaterial({ color: color });
  const equatorGeometry = new THREE.BufferGeometry();
  const equatorVertices = [];
  for (let i = 0; i <= numSegments; i++) {
    const index = i / numSegments;
    equatorVertices.push(...positionFunc(index));
  }
  equatorGeometry.setAttribute("position", new THREE.Float32BufferAttribute(equatorVertices, 3));
  const myline = new THREE.LineLoop(equatorGeometry, lineMaterial);
  scene.add(myline);
  return myline;
}

function drawSurroundingLines(color, x_position, yz_position) {
  const LineMaterial = new THREE.LineBasicMaterial({ color: color });
  const lines_sr = [];
  for (let j = 0; j < 4; j++) {
    const ks = [1, 1, 1, 1];
    ks[j] = -1;
    if (j === 2 || j === 3) {
      ks[0] = -1;
      ks[1] = -1;
    }
    const oLineGeometry_sr = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(x_position, ks[0] * yz_position, ks[1] * yz_position),
      new THREE.Vector3(x_position, ks[2] * yz_position, ks[3] * yz_position),
    ]);
    const oLine_sr = new THREE.Line(oLineGeometry_sr, LineMaterial);
    oLine_sr.visible = false;
    scene.add(oLine_sr);
    lines_sr.push(oLine_sr);
  }
  return lines_sr;
}

drawLineOnSurface("red", (index) => {
  const theta = index * 2 * Math.PI;
  return [Math.cos(theta), 0, Math.sin(theta)];
});

drawLineOnSurface("green", (index) => {
  const theta = index * 2 * Math.PI;
  return [Math.cos(theta), Math.sin(theta), 0];
});

drawLineOnSurface("blue", (index) => {
  const theta = index * 2 * Math.PI;
  return [0, Math.sin(theta), Math.cos(theta)];
});
const lines_sr_blue = drawSurroundingLines("blue", 0, 1);

const yellowlineMaterial = new THREE.LineBasicMaterial({ color: "yellow" });
const xLineGeometry = new THREE.BufferGeometry().setFromPoints([
  new THREE.Vector3(-1.5, 0, 0),
  new THREE.Vector3(1.5, 0, 0),
]);
const xLine = new THREE.Line(xLineGeometry, yellowlineMaterial);
scene.add(xLine);

const yLineGeometry = new THREE.BufferGeometry().setFromPoints([
  new THREE.Vector3(0, -1.5, 0),
  new THREE.Vector3(0, 1.5, 0),
]);
const yLine = new THREE.Line(yLineGeometry, yellowlineMaterial);
scene.add(yLine);

const orange_linesL = [];
let orange_linesL_sr = [];
const orange_linesR = [];
let orange_linesR_sr = [];
function draw_organe_lines(val) {
  let x_position = 2 / 3;
  if (!val) {
    x_position = -x_position;
  }
  const orangeLineMaterial = new THREE.LineBasicMaterial({ color: "orange" });
  const z = Math.sqrt(5 / 9);
  const oLineGeometry = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(x_position, 0, z),
    new THREE.Vector3(x_position, 0, -z),
  ]);
  const oLine1 = new THREE.Line(oLineGeometry, orangeLineMaterial);
  scene.add(oLine1);
  const oLineGeometry2 = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(x_position, z, 0),
    new THREE.Vector3(x_position, -z, 0),
  ]);
  const oLine2 = new THREE.Line(oLineGeometry2, orangeLineMaterial);
  scene.add(oLine2);

  const lines_sr = drawSurroundingLines("orange", x_position, z);

  const oCircle3 = drawLineOnSurface("orange", (index) => {
    const theta = index * 2 * Math.PI;
    const z = Math.sqrt(5 / 9);
    return [x_position, Math.sin(theta) * z, Math.cos(theta) * z];
  });
  if (val) {
    orange_linesR.push(oLine1, oLine2, oCircle3);
    orange_linesR_sr = lines_sr.slice();
  } else {
    orange_linesL.push(oLine1, oLine2, oCircle3);
    orange_linesL_sr = lines_sr.slice();
  }
}
draw_organe_lines(true);
draw_organe_lines(false);

const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = false;
controls.dampingFactor = 0.05;
controls.enableZoom = true;
controls.enableRotate = true;
controls.enablePan = true;

{
  const opacityRange = document.getElementById("opacityRange");
  const opacityValueIndicator = document.getElementById("opacityValueIndicator");
  opacityRange.value = material.opacity;
  opacityValueIndicator.innerText = material.opacity.toFixed(1);
  opacityRange.addEventListener("input", (event) => {
    const value = Number.parseFloat(event.target.value);
    material.opacity = value;
    opacityValueIndicator.innerText = value.toFixed(1);
  });
}

{
  const enableCross = document.getElementById("enableCross");
  enableCross.addEventListener("input", () => {
    xLine.visible = enableCross.checked;
    yLine.visible = enableCross.checked;
  });

  const enableCross_sr = document.getElementById("enableCross_sr");
  enableCross_sr.addEventListener("input", () => {
    console.log(enableCross_sr.checked);
    for (let j = 0; j < lines_sr_blue.length; j++) {
      lines_sr_blue[j].visible = enableCross_sr.checked;
    }
  });
}
{
  const enableSideL = document.getElementById("enableSideL");
  enableSideL.addEventListener("input", () => {
    for (let j = 0; j < orange_linesL.length; j++) {
      orange_linesL[j].visible = enableSideL.checked;
    }
  });
  const enableSideL_sr = document.getElementById("enableSideL_sr");
  enableSideL_sr.addEventListener("input", () => {
    for (let j = 0; j < orange_linesL_sr.length; j++) {
      orange_linesL_sr[j].visible = enableSideL_sr.checked;
    }
  });
}
{
  const enableSideR = document.getElementById("enableSideR");
  enableSideR.addEventListener("input", () => {
    for (let j = 0; j < orange_linesR.length; j++) {
      orange_linesR[j].visible = enableSideR.checked;
    }
  });
  const enableSideR_sr = document.getElementById("enableSideR_sr");
  enableSideR_sr.addEventListener("input", () => {
    for (let j = 0; j < orange_linesR_sr.length; j++) {
      orange_linesR_sr[j].visible = enableSideR_sr.checked;
    }
  });
}

{
  const camera_x = document.getElementById("camera_x");
  const camera_y = document.getElementById("camera_y");
  const camera_z = document.getElementById("camera_z");

  camera_x.addEventListener("input", () => {
    camera.position.x = Number.parseFloat(camera_x.value);
  });
  camera_y.addEventListener("input", () => {
    camera.position.y = Number.parseFloat(camera_y.value);
  });
  camera_z.addEventListener("input", () => {
    camera.position.z = Number.parseFloat(camera_z.value);
  });
  camera_fov.addEventListener("input", () => {
    camera.fov = Number.parseInt(camera_fov.value);
    camera.updateProjectionMatrix();
  });
  camera_near.addEventListener("input", () => {
    camera.near = Number.parseFloat(camera_near.value);
    camera.updateProjectionMatrix();
  });
  camera_far.addEventListener("input", () => {
    camera.far = Number.parseInt(camera_far.value);
    camera.updateProjectionMatrix();
  });

  function render() {
    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(render);

    camera_x.value = camera.position.x.toFixed(2);
    camera_y.value = camera.position.y.toFixed(2);
    camera_z.value = camera.position.z.toFixed(2);
    camera_fov.value = camera.fov;
    camera_near.value = camera.near.toFixed(1);
    camera_far.value = camera.far;
  }
}

render();

window.addEventListener("resize", () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});
