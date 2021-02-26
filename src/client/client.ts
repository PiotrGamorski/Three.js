import * as THREE from '/build/three.module.js'
import { TransformControls } from '/jsm/controls/TransformControls'
import Stats from '/jsm/libs/stats.module'

const scene: THREE.Scene = new THREE.Scene()
const axesHelper = new THREE.AxesHelper(5)
scene.add(axesHelper)

const camera: THREE.PerspectiveCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)

const renderer: THREE.WebGLRenderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

renderer.domElement.ondragstart = function (event) { event.preventDefault(); return false; }

const geometry: THREE.BoxGeometry = new THREE.BoxGeometry()
const material: THREE.MeshNormalMaterial = new THREE.MeshNormalMaterial()

const cube: THREE.Mesh = new THREE.Mesh(geometry, material)
scene.add(cube)

const controls = new TransformControls(camera, renderer.domElement)
controls.attach(cube);
scene.add(controls);

window.addEventListener('keydown', function (event) {
    switch (event.key) {
        case "g":
            controls.setMode("translate")
            break
        case "r":
            controls.setMode("rotate")
            break
        case "s":
            controls.setMode("scale")
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
};

function render() {
    renderer.render(scene, camera)
}

animate(); 