import * as THREE from '/build/three.module.js'
import { OrbitControls } from '/jsm/controls/OrbitControls'
import { FBXLoader } from '/jsm/loaders/FBXLoader'
import Stats from '/jsm/libs/stats.module'
import { GUI } from '/jsm/libs/dat.gui.module'
 
const scene: THREE.Scene = new THREE.Scene()
const axesHelper = new THREE.AxesHelper(5)
scene.add(axesHelper)

var light = new THREE.PointLight();
light.position.set(2.5, 7.5, 15)
scene.add(light);

const camera: THREE.PerspectiveCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
camera.position.set(0.8, 1.4, 1.0)

const renderer: THREE.WebGLRenderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

const controls = new OrbitControls(camera, renderer.domElement)
controls.screenSpacePanning = true
controls.target.set(0, 1, 0)

let mixer: THREE.AnimationMixer
let model: THREE.Object3D
let modelReady: boolean = false
let animationActions: THREE.AnimationAction[] = []
let activeAction: THREE.AnimationAction
let lastAction: THREE.AnimationAction
const fbxLoader: FBXLoader = new FBXLoader();

fbxLoader.load(
    'models/vanguard_t_choonyung.fbx',
     (object) => {
        object.traverse(function (child) {
            if ((child as THREE.Mesh).isMesh) {
                if ((<THREE.Mesh>child).material) {
                    ((<THREE.Mesh>child).material as THREE.MeshBasicMaterial).transparent = false
                }
            }
        })
        object.scale.set(.01, .01, .01)
        mixer = new THREE.AnimationMixer(object)
        let animationAction: THREE.AnimationAction = mixer.clipAction(object.animations[0])
        animationActions.push(animationAction)
        animationsFolder.add(vanguardAnimations, 'default')
        activeAction = animationActions[0]

        scene.add(object);
        
        fbxLoader.load(
            'models/vanguard@samba.fbx',
            (object) => {
                console.log("loaded samba")
                let animationAction: THREE.AnimationAction = mixer.clipAction(object.animations[0])
                animationActions.push(animationAction)
                animationsFolder.add(vanguardAnimations, 'samba')
            }, 
            null,
            (error) =>{
                console.log(error)
            }
        )

        fbxLoader.load(
            'models/vanguard@bellydance.fbx',
            (object) => {
                console.log("loaded bellydance")
                let animationAction: THREE.AnimationAction = mixer.clipAction(object.animations[0])
                animationActions.push(animationAction)
                animationsFolder.add(vanguardAnimations, 'bellydance')
            }, 
            null,
            (error) =>{
                console.log(error)
            }
        )

        fbxLoader.load(
            'models/vanguard@goofyrunning.fbx',
            (object) => {
                console.log("loaded goofyrunning")
                object.animations[0].tracks.shift()
                let animationAction = mixer.clipAction(object.animations[0])
                animationActions.push(animationAction)
                animationsFolder.add(vanguardAnimations, 'goofyrunning')
                console.dir(animationAction)
            }, 
            null,
            (error) =>{
                console.log(error)
            }
        )

        modelReady = true
    },
    (xhr) => {
        console.log(Math.ceil((xhr.loaded / xhr.total * 100) ) + '% loaded')
    },
    (error) => {
        console.log(error);
    }
)

window.addEventListener('resize', onWindowResize, false)
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
    render()
}

const stats = Stats()
document.body.appendChild(stats.dom)

var vanguardAnimations = {
    default: function () {
        setAction(animationActions[0])
    },
    samba: function () {
        setAction(animationActions[1])
    },
    bellydance: function () {
        setAction(animationActions[2])
    },
    goofyrunning: function () {
        setAction(animationActions[3])
    },
}

const setAction = (actionToExecute: THREE.AnimationAction) => {
    if(actionToExecute != activeAction) {
        lastAction = activeAction
        activeAction = actionToExecute
        lastAction.stop()
        activeAction.reset()
        activeAction.play()
    }
}

const gui = new GUI()
const animationsFolder = gui.addFolder("Animations")
animationsFolder.open()

const clock: THREE.Clock = new THREE.Clock()

var animate = function () {
    requestAnimationFrame(animate)

    controls.update()
    if(modelReady) mixer.update(clock.getDelta())
    render()
    stats.update()
};

function render() {
    renderer.render(scene, camera)
}
animate();