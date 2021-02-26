import * as THREE from '/build/three.module.js'
import { OrbitControls } from '/jsm/controls/OrbitControls'
import { DragControls } from '/jsm/controls/DragControls'
import { TransformControls } from '/jsm/controls/TransformControls'
import Stats from '/jsm/libs/stats.module'

const scene: THREE.Scene = new THREE.Scene()
const axesHelper = new THREE.AxesHelper(5)
scene.add(axesHelper)

const camera: THREE.PerspectiveCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)

const renderer: THREE.WebGLRenderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

renderer.domElement.ondragstart = function (event) { event.preventDefault(); return false; };

const geometry: THREE.BoxGeometry = new THREE.BoxGeometry()
const material: THREE.MeshNormalMaterial = new THREE.MeshNormalMaterial({ transparent: true })

const cube: THREE.Mesh = new THREE.Mesh(geometry, material)
scene.add(cube)

const orbitControls = new OrbitControls(camera, renderer.domElement)

const dragControls = new DragControls([cube], camera, renderer.domElement)
dragControls.addEventListener("hoveron", function () {
    orbitControls.enabled = false;
});
dragControls.addEventListener("hoveroff", function () {
    orbitControls.enabled = true;
});
dragControls.addEventListener('dragstart', function (event) {
    event.object.material.opacity = 0.33
    orbitControls.enabled = false;
})
dragControls.addEventListener('dragend', function (event) {
    event.object.material.opacity = 1
    orbitControls.enabled = true
})

const transformControls = new TransformControls(camera, renderer.domElement);
transformControls.attach(cube);
transformControls.setMode("rotate")
scene.add(transformControls);

transformControls.addEventListener('dragging-changed', function (event) {
    orbitControls.enabled = !event.value
    dragControls.enabled = !event.value
})

transformControls.addEventListener("mouseDown", ()=>{
    orbitControls.enabled = false
})
transformControls.addEventListener("mouseUp", ()=>{
    orbitControls.enabled = true
})

const backGroundTexture = new THREE.CubeTextureLoader().load(["img/px_eso0932a.jpg", "img/nx_eso0932a.jpg", "img/py_eso0932a.jpg", "img/ny_eso0932a.jpg", "img/pz_eso0932a.jpg", "img/nz_eso0932a.jpg"]);
scene.background = backGroundTexture;

window.addEventListener('keydown', function (event) {
    switch (event.key) {
        case "g":
            transformControls.setMode("translate")
            break
        case "r":
            transformControls.setMode("rotate")
            break
        case "s":
            transformControls.setMode("scale")
            break
    }
})

camera.position.z = 2

window.addEventListener('resize', onWindowResize, false)
function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
    render()
}

const stats = Stats()
document.body.appendChild(stats.dom)

var animate = function () {
    requestAnimationFrame(animate)

    render()

    stats.update()
    orbitControls.update()
};

function render() {
    renderer.render(scene, camera)
}

animate(); 