import * as THREE from "three";
import { Reflector } from "three/examples/jsm/Addons.js";
import { Easing, Tween, update as updateTween } from "tween";

const images = [
  "creation-of-adam.jpg",
  "earring.jpg",
  "garden.jpg",
  "kiss.jpg",
  "mona-lisa.jpeg",
  "starry-night.jpg",
  "sunrise.jpg",
  "the-last-upper.jpg",
];

const titles = [
  "The Creation of Adam",
  "Girl with a Pearl Earring",
  "The Artist's Garden at Giverny",
  "The Kiss",
  "Mona Lisa",
  "The Starry Night",
  "Impression, Sunrise",
  "The Last Supper",
];

const artists = [
  "Michelangelo",
  "Johannes Vermeer",
  "Claude Monet",
  "Gustav Klimt",
  "Leonardo da Vinci",
  "Vincent van Gogh",
  "Claude Monet",
  "Leonardo da Vinci",
];

const textureLoader = new THREE.TextureLoader();

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setAnimationLoop(animate);
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const rootNode = new THREE.Object3D();
scene.add(rootNode);

const leftArrowTexture = textureLoader.load("left-arrow.png");
const rightArrowTexture = textureLoader.load("right-arrow.png");

let count = 6;
for (let i = 0; i < count; i++) {
  const texture = textureLoader.load(images[i]);
  texture.colorSpace = THREE.SRGBColorSpace;

  const baseNode = new THREE.Object3D();
  baseNode.rotation.y = i * ((2 * Math.PI) / count);
  rootNode.add(baseNode);

  const border = new THREE.Mesh(
    new THREE.BoxGeometry(3.2, 2.2, 0.09),
    new THREE.MeshStandardMaterial({ color: 0x202020 })
  );
  border.name = `Border__${i}`;
  border.position.z = -4;
  baseNode.add(border);

  const artwork = new THREE.Mesh(
    new THREE.BoxGeometry(3, 2, 0.1),
    new THREE.MeshStandardMaterial({ map: texture })
  );
  artwork.name = `Art__${i}`;
  artwork.position.z = -4;
  baseNode.add(artwork);

  const leftArrow = new THREE.Mesh(
    new THREE.BoxGeometry(0.3, 0.3, 0.01),
    new THREE.MeshStandardMaterial({ map: leftArrowTexture, transparent: true })
  );
  leftArrow.name = `LeftArrow`;
  leftArrow.userData = i === count - 1 ? 0 : i + 1;
  leftArrow.position.set(-1.8, 0, -4);
  baseNode.add(leftArrow);

  const rightArrow = new THREE.Mesh(
    new THREE.BoxGeometry(0.3, 0.3, 0.01),
    new THREE.MeshStandardMaterial({
      map: rightArrowTexture,
      transparent: true,
    })
  );
  rightArrow.name = `RightArrow`;
  rightArrow.userData = i === 0 ? count - 1 : i - 1;
  rightArrow.position.set(1.8, 0, -4);
  baseNode.add(rightArrow);
}

const spotlight = new THREE.SpotLight(0xffffff, 100.0, 10.0, 0.65, 1);
spotlight.position.set(0, 5, 0);
spotlight.target.position.set(0, 0.5, -5);
scene.add(spotlight);
scene.add(spotlight.target);

const mirror = new Reflector(new THREE.CircleGeometry(10), {
  textureWidth: window.innerWidth,
  textureHeight: window.innerHeight,
  color: 0x303030,
});
mirror.position.y = -1.1;
mirror.rotateX(-Math.PI / 2);
scene.add(mirror);

function rotateGallery(direction, newIndex) {
  const deltaY = direction * ((2 * Math.PI) / count);
  new Tween(rootNode.rotation)
    .to({ y: rootNode.rotation.y + deltaY })
    .easing(Easing.Quadratic.InOut)
    .start()
    .onStart(() => {
      document.getElementById("title").style.opacity = 0;
      document.getElementById("artist").style.opacity = 0;
    })
    .onComplete(() => {
      document.getElementById("title").innerText = titles[newIndex];
      document.getElementById("artist").innerText = artists[newIndex];
      document.getElementById("title").style.opacity = 1;
      document.getElementById("artist").style.opacity = 1;
    });
}

function animate() {
  updateTween();
  renderer.render(scene, camera);
}

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.updateProjectionMatrix();
  mirror.getRenderTarget().setSize(window.innerWidth, window.innerHeight);
});

window.addEventListener("click", (ev) => {
  const raycaster = new THREE.Raycaster();

  const mouseNDC = new THREE.Vector2(
    (ev.clientX / window.innerWidth) * 2 - 1,
    -(ev.clientY / window.innerHeight) * 2 + 1
  );

  raycaster.setFromCamera(mouseNDC, camera);

  const intersections = raycaster.intersectObject(rootNode, true);
  if (intersections.length > 0) {
    const obj = intersections[0].object;
    const newIndex = obj.userData;
    if (obj.name === "LeftArrow") {
      rotateGallery(-1, newIndex);
    }
    if (obj.name === "RightArrow") {
      rotateGallery(1, newIndex);
    }
  }
});

document.getElementById("title").innerText = titles[0];
document.getElementById("artist").innerText = artists[0];

const listener = new THREE.AudioListener();
camera.add(listener);
const sound = new THREE.Audio(listener);

const audioContext = listener.context;
document.addEventListener("click", () => {
  if (audioContext.state === "suspended") {
    audioContext.resume();
  }
});
const audioLoader = new THREE.AudioLoader();
audioLoader.load("./sounds/Chillpeach.mp3", function (buffer) {
  sound.setBuffer(buffer);
  // sound.autoplay = true;
  // sound.hasPlaybackControl = true;
  sound.setLoop(true);
  window.addEventListener("click", function () {
    sound.play();
  });
});

let isMuted = false;
const volumeButton = document.getElementById("volume-button");
const volumeIcon = document.getElementById("volume-icon");
volumeButton.addEventListener("click", () => {
  if (isMuted) {
    sound.setVolume(0.5); // Set desired volume
    // sound.play();
    volumeIcon.src = "Volume-on.png"; // Change icon to "On"
    volumeIcon.alt = "Volume On";
    isMuted = false;
  } else {
    sound.setVolume(0); // Set desired volume
    // sound.stop();
    volumeIcon.src = "Volume-off.png"; // Change icon to "On"
    volumeIcon.alt = "Volume Off";
    isMuted = true;
  }
});

// Function to adjust artwork and borders for specific mobile dimensions
function adjustForMobile() {
  const isMobile = window.innerWidth <= 480 || window.outerWidth <= 980; // Target 375x678 screens
  const artworkSize = isMobile
    ? { width: 2.1, height: 1.4, position: { z: -6 } }
    : { width: 3, height: 2, position: { z: -4 } }; // Mobile vs. default
  const borderSize = isMobile
    ? { width: 2.3, height: 1.6, position: { z: -6 } }
    : { width: 3.2, height: 2.2, position: { z: -4 } }; // Mobile vs. default
  const arrowSize = isMobile
    ? { width: 0.3, height: 0.3, position: { z: -6 } }
    : { width: 0.3, height: 0.3, position: { z: -4 } }; // Mobile vs. default
  const titleSize = isMobile ? { fontSize: "4em" } : { fontSize: "6em" }; // Mobile vs. default
  const artistSize = isMobile
    ? { fontSize: 3, top: "2.9em" }
    : { fontSize: "3em", top: "3em" }; // Mobile vs. default
  // Iterate through all base nodes (children of rootNode)
  rootNode.children.forEach((baseNode) => {
    baseNode.children.forEach((child) => {
      if (child.name.startsWith("Border__")) {
        // Recreate and assign new border geometry
        child.geometry.dispose(); // Dispose of the old geometry
        child.geometry = new THREE.BoxGeometry(
          borderSize.width,
          borderSize.height,
          0.09
        );
        child.position.z = borderSize.position.z;
      }
      if (child.name.startsWith("Art__")) {
        // Recreate and assign new artwork geometry
        child.geometry.dispose(); // Dispose of the old geometry
        child.geometry = new THREE.BoxGeometry(
          artworkSize.width,
          artworkSize.height,
          0.1
        );

        child.position.z = artworkSize.position.z;
      }

      if (
        child.name.startsWith("LeftArrow") ||
        child.name.startsWith("RightArrow")
      ) {
        // Recreate and assign new artwork geometry
        child.geometry.dispose(); // Dispose of the old geometry
        child.geometry = new THREE.BoxGeometry(
          arrowSize.width,
          arrowSize.height,
          0.01
        );
        child.position.z = arrowSize.position.z;
      }

      document.getElementById("title").style.fontSize = titleSize.fontSize;
      document.getElementById("artist").style.top = artistSize.top;
      document.getElementById("artist").style.fontSize = artistSize.fontSize;    });
  });
}

// Add event listener for window resize
window.addEventListener("resize", adjustForMobile);

// Initial call to set the correct size
adjustForMobile();
