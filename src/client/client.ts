import * as THREE from '/build/three.module.js'
import { OrbitControls } from '/jsm/controls/OrbitControls'
import Stats from '/jsm/libs/stats.module'
import { GUI } from '/jsm/libs/dat.gui.module'

const scene: THREE.Scene = new THREE.Scene()
//scene.background = new THREE.Color(0xff0000)

const axesHelper = new THREE.AxesHelper(5)
scene.add(axesHelper)

const light = new THREE.PointLight(0xffffff, 2);
light.position.set(0, 5, 10);
scene.add(light);

const camera: THREE.PerspectiveCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)

const renderer: THREE.WebGLRenderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

const controls = new OrbitControls(camera, renderer.domElement)
controls.addEventListener('change', () => console.log("Controls Change")) //this line is unnecessary if you are already re-rendering within the animation loop 
controls.addEventListener('start', () => console.log("Controls Start Event"))
controls.addEventListener('end', () => console.log("Controls End Event"))
controls.screenSpacePanning = true //so that panning up and down doesn't zoom in/out
controls.enableKeys = true
controls.keys = {
 LEFT: 37,
 UP: 38,
 RIGHT: 39,
 BOTTOM: 40
}
controls.mouseButtons = {
        LEFT: THREE.MOUSE.ROTATE,
        MIDDLE: THREE.MOUSE.DOLLY,
        RIGHT: THREE.MOUSE.PAN
    }
//controls.addEventListener('change', render)

const planeGeometry: THREE.PlaneGeometry = new THREE.PlaneGeometry(3.6, 1.8, 360, 180)
const material: THREE.MeshPhongMaterial = new THREE.MeshPhongMaterial()

const texture = new THREE.TextureLoader().load("img/worldColour.5400x2700.jpg")
material.map = texture

const displacementMap = new THREE.TextureLoader().load("img/gebco_bathy.5400x2700_8bit.jpg")
material.displacementMap = displacementMap

const plane: THREE.Mesh = new THREE.Mesh(planeGeometry, material)
scene.add(plane)

camera.position.z = 3

window.addEventListener('resize', onWindowResize, false)
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
    render()
}

const stats = Stats()
document.body.appendChild(stats.dom)

var options = {
    side: {
        "FrontSide": THREE.FrontSide,
        "BackSide": THREE.BackSide,
        "DoubleSide": THREE.DoubleSide,
    }
}
const gui = new GUI()

const materialFolder = gui.addFolder('THREE.Material')
materialFolder.add(material, 'transparent')
materialFolder.add(material, 'opacity', 0, 1, 0.01)
materialFolder.add(material, 'depthTest')
materialFolder.add(material, 'depthWrite')
materialFolder.add(material, 'alphaTest', 0, 1, 0.01).onChange(() => updateMaterial())
materialFolder.add(material, 'visible')
materialFolder.add(material, 'side', options.side).onChange(() => updateMaterial())
//materialFolder.open()

var data = {
    color: material.color.getHex(),
    emissive: material.emissive.getHex(),
    specular: material.specular.getHex()
};

var meshPhongMaterialFolder = gui.addFolder('THREE.meshPhongMaterialFolder');

meshPhongMaterialFolder.addColor(data, 'color').onChange(() => { material.color.setHex(Number(data.color.toString().replace('#', '0x'))) })
meshPhongMaterialFolder.addColor(data, 'emissive').onChange(() => { material.emissive.setHex(Number(data.emissive.toString().replace('#', '0x'))) })
meshPhongMaterialFolder.addColor(data, 'specular').onChange(() => { material.specular.setHex(Number(data.specular.toString().replace('#', '0x'))) });
meshPhongMaterialFolder.add(material, 'shininess', 0, 1024);
meshPhongMaterialFolder.add(material, 'wireframe')
meshPhongMaterialFolder.add(material, 'flatShading').onChange(() => updateMaterial())
meshPhongMaterialFolder.add(material, 'reflectivity', 0, 1)
meshPhongMaterialFolder.add(material, 'refractionRatio', 0, 1)
meshPhongMaterialFolder.add(material, 'displacementScale', 0, 1, 0.01)
meshPhongMaterialFolder.add(material, 'displacementBias', -1, 1, 0.01)
meshPhongMaterialFolder.open()

var planeData = {
    width: 3.6,
    height: 1.8,
    widthSegments: 1,
    heightSegments: 1
};
const planePropertiesFolder = gui.addFolder("PlaneGeometry")
planePropertiesFolder.add(planeData, 'width', 1, 30).onChange(regeneratePlaneGeometry)
planePropertiesFolder.add(planeData, 'height', 1, 30).onChange(regeneratePlaneGeometry)
planePropertiesFolder.add(planeData, 'widthSegments', 1, 360).onChange(regeneratePlaneGeometry)
planePropertiesFolder.add(planeData, 'heightSegments', 1, 180).onChange(regeneratePlaneGeometry)
planePropertiesFolder.open()

function regeneratePlaneGeometry() {
    let newGeometry = new THREE.PlaneGeometry(
        planeData.width, planeData.height, planeData.widthSegments, planeData.heightSegments
    )
    plane.geometry.dispose()
    plane.geometry = newGeometry
}


function updateMaterial() {
    material.side = Number(material.side)
    material.needsUpdate = true
}

var animate = function () {
    requestAnimationFrame(animate)

    controls.update()
    render()
    stats.update()
};

function render() {
    renderer.render(scene, camera)
}
animate();