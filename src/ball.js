const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.x = 1;
camera.position.y = 2;
camera.position.z = 3;

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
const orange_linesR = [];
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

  const oCircle3 = drawLineOnSurface("orange", (index) => {
    const theta = index * 2 * Math.PI;
    const z = Math.sqrt(5 / 9);
    return [x_position, Math.sin(theta) * z, Math.cos(theta) * z];
  });
  if (val) {
    orange_linesR.push(oLine1, oLine2, oCircle3);
  } else {
    orange_linesL.push(oLine1, oLine2, oCircle3);
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
}
{
  const enableSideL = document.getElementById("enableSideL");
  enableSideL.addEventListener("input", () => {
    for (let j = 0; j < orange_linesL.length; j++) {
      orange_linesL[j].visible = enableSideL.checked;
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
}
const infoDiv = document.getElementById("info");
function render() {
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(render);

  const position = camera.position;
  infoDiv.innerHTML = `Camera Position:<br>X: ${position.x.toFixed(2)}<br>Y: ${position.y.toFixed(2)}<br>Z: ${position.z.toFixed(2)}`;
}

render();

window.addEventListener("resize", () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});
