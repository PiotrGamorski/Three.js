import * as THREE from '/build/three.module.js'
import { OrbitControls } from '/jsm/controls/OrbitControls'
import { OBJLoader } from '/jsm/loaders/OBJLoader'
import { MTLLoader } from '/jsm/loaders/MTLLoader'
import { GLTFLoader} from '/jsm/loaders/GLTFLoader'
import { DRACOLoader } from '/jsm/loaders/DRACOLoader'
import Stats from '/jsm/libs/stats.module'

const scene: THREE.Scene = new THREE.Scene()
const axesHelper = new THREE.AxesHelper(5)
scene.add(axesHelper)

var light = new THREE.SpotLight();
light.position.set(5,5,5)
light.castShadow = true
scene.add(light);

const camera: THREE.PerspectiveCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
camera.position.z = 3

const renderer: THREE.WebGLRenderer = new THREE.WebGLRenderer()
renderer.physicallyCorrectLights = true
renderer.shadowMap.enabled = true
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

const controls = new OrbitControls(camera, renderer.domElement)

var dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('/js/libs/draco/');
dracoLoader.setDecoderConfig({ type: 'js' });

const material: THREE.MeshBasicMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true })

const mtlLoader: MTLLoader =  new MTLLoader();
mtlLoader.load('models/monkey.mtl',
    (materials) => {
        materials.preload();

        const objLoader: OBJLoader = new OBJLoader();
        objLoader.setMaterials(materials);
        objLoader.load(
            'models/monkey.obj',
            (object) => {
                object.traverse((child) => {
                    if((<THREE.Mesh>child).isMesh){
                        let mesh = <THREE.Mesh>child
                        mesh.receiveShadow = true
                        mesh.castShadow = true
                    }
                })
                object.position.x = -3
                scene.add(object);
            },
            (xhr) => {
                console.log((xhr.loaded / xhr.total * 100) + '% loaded');
            },
            (error) =>{
                console.log(error);
            }
        );
    },
    (xhr) => {
        console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
    },
    (error) => {
        console.log(error);
    }
)
let model: THREE.Group = new THREE.Group();
const gltfLoader = new GLTFLoader();
gltfLoader.load(
    'models/monkey.glb',
    async function (gltf) {
        gltf.scene.traverse((child) =>{
            if((<THREE.Mesh>child).isMesh) {
                let mesh = <THREE.Mesh>child
                mesh.receiveShadow = true
                mesh.castShadow = true
            }
            if((<THREE.Light>child).isLight){
                let light = <THREE.Light>child
                light.castShadow = true
                light.shadow.bias = -0.003
                light.shadow.mapSize.width = 2048
                light.shadow.mapSize.height = 2048
            }
        })
        gltf.scene.position.x = 3
        model = await gltf.scene
        scene.add(gltf.scene)
    },
    (xhr) => {
        console.log((xhr.loaded/xhr.total) * 100 + '% loaded')
    },
    (error)=>{
        console.log(error)
    }
)

const loader: GLTFLoader = new GLTFLoader()
loader.setDRACOLoader(dracoLoader)
loader.load('models/monkey_compressed.glb',
function (gltf) {
    gltf.scene.traverse((child)=>{
        if((<THREE.Mesh>child).isMesh){
            let mesh = <THREE.Mesh>child
            mesh.castShadow = true
            mesh.receiveShadow = true
        }
        if((<THREE.Light>child).isLight){
            let light = <THREE.Light>child
            light.castShadow = true
            light.shadow.bias = -0.003
            light.shadow.mapSize.width = 2048
            light.shadow.mapSize.height = 2048
        }
    })
    scene.add(gltf.scene)
},
(xhr) => {
    console.log((xhr.loaded/xhr.total) * 100 + '% loaded')
},
(error) => {
    console.log(error)
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