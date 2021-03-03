import * as THREE from '/build/three.module.js';
import { OrbitControls } from '/jsm/controls/OrbitControls';
import { FBXLoader } from '/jsm/loaders/FBXLoader';
import { GLTFLoader } from '/jsm/loaders/GLTFLoader';
import Stats from '/jsm/libs/stats.module';
import { GUI } from '/jsm/libs/dat.gui.module';
const scene = new THREE.Scene();
const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);
let light = new THREE.PointLight();
light.position.set(2.5, 7.5, 15);
light.castShadow;
scene.add(light);
// const textureLoader = new THREE.CubeTextureLoader()
// const texture = textureLoader.load(['nx_eso0932a.jpg', 'px_eso0932a.jpg', 'ny_eso0932a.jpg', 'py_eso0932a.jpg', 'nz_eso0932a.jpg', 'pz_eso0932a.jpg'])
// const cubeMaterial = new THREE.MeshBasicMaterial({map: texture})
// const cubeGeometry = new THREE.BoxGeometry(20, 20, 20)
// const cube = new THREE.Mesh(cubeGeometry, cubeMaterial)
//scene.add(cube)
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0.8, 1.4, 1.0);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
const controls = new OrbitControls(camera, renderer.domElement);
controls.screenSpacePanning = true;
controls.target.set(0, 1, 0);
let mixers = [];
let vanguardModelReady = false;
let animationActions = [];
let vanguardActiveAction;
let vanguardLastAction;
let vanguardMixerIndex;
const fbxLoader = new FBXLoader();
fbxLoader.load('models/vanguard_t_choonyung.fbx', (object) => {
    object.traverse(function (child) {
        if (child.isMesh) {
            if (child.material) {
                child.material.transparent = false;
            }
        }
    });
    object.scale.set(.01, .01, .01);
    object.castShadow = true;
    object.receiveShadow = true;
    mixers.push({ name: "vanguardMixer", mixer: new THREE.AnimationMixer(object) });
    vanguardMixerIndex = mixers.findIndex((x) => x.name === "vanguardMixer");
    let animationAction = mixers[vanguardMixerIndex].mixer.clipAction(object.animations[0]);
    animationActions.push({ name: "default", action: animationAction });
    vanguardFolder.add(vanguardAnimations, 'default');
    vanguardActiveAction = animationActions[0].action;
    scene.add(object);
    fbxLoader.load('models/vanguard@samba.fbx', (object) => {
        console.log("loaded samba");
        let animationAction = mixers[vanguardMixerIndex].mixer.clipAction(object.animations[0]);
        animationActions.push({ name: "samba", action: animationAction });
        vanguardFolder.add(vanguardAnimations, 'samba');
    }, null, (error) => {
        console.log(error);
    });
    fbxLoader.load('models/vanguard@bellydance.fbx', (object) => {
        console.log("loaded bellydance");
        let animationAction = mixers[vanguardMixerIndex].mixer.clipAction(object.animations[0]);
        animationActions.push({ name: "bellydance", action: animationAction });
        vanguardFolder.add(vanguardAnimations, 'bellydance');
    }, null, (error) => {
        console.log(error);
    });
    fbxLoader.load('models/vanguard@goofyrunning.fbx', (object) => {
        console.log("loaded goofyrunning");
        object.animations[0].tracks.shift();
        let animationAction = mixers[vanguardMixerIndex].mixer.clipAction(object.animations[0]);
        animationActions.push({ name: "goofyrunning", action: animationAction });
        vanguardFolder.add(vanguardAnimations, 'goofyrunning');
    }, null, (error) => {
        console.log(error);
    });
    vanguardModelReady = true;
}, (xhr) => {
    console.log(Math.ceil((xhr.loaded / xhr.total * 100)) + '% loaded');
}, (error) => {
    console.log(error);
});
const gltfLoader = new GLTFLoader();
let swatModelReady = false;
let swatLastAction;
let swatActiveAction;
let swatguyMixerIndex;
gltfLoader.load('models/swatguy.glb', (gltf) => {
    gltf.scene.traverse((child) => {
        if (child.isMesh) {
            child.material.transparent = false;
        }
    });
    gltf.scene.position.x = -1.5;
    gltf.scene.rotateY(Math.PI / 3);
    gltf.scene.receiveShadow = true;
    gltf.scene.castShadow = true;
    mixers.push({ name: 'swatguyMixer', mixer: new THREE.AnimationMixer(gltf.scene) });
    swatguyMixerIndex = mixers.findIndex((x) => x.name === 'swatguyMixer');
    gltfLoader.load('models/swatguy@idle.glb', (gltf) => {
        console.log('loaded idle');
        let animationAction = mixers[swatguyMixerIndex].mixer.clipAction(gltf.animations[0]);
        animationActions.push({ name: 'idle', action: animationAction });
        const index = animationActions.findIndex((x) => x.name === 'idle');
        swatActiveAction = animationActions[index].action;
        swatguyFolder.add(swatguyAnimations, 'idle');
        swatActiveAction.play();
    });
    scene.add(gltf.scene);
    gltfLoader.load('models/swatguy@flair.glb', (gltf) => {
        console.log('loaded flair');
        let animationAction = mixers[swatguyMixerIndex].mixer.clipAction(gltf.animations[0]);
        animationActions.push({ name: 'flair', action: animationAction });
        swatguyFolder.add(swatguyAnimations, 'flair');
    });
    swatModelReady = true;
}, (xhr) => {
    console.log(Math.ceil((xhr.loaded / xhr.total * 100)) + '% loaded');
}, (error) => {
    console.log(error);
});
window.addEventListener('resize', onWindowResize, false);
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    render();
}
const stats = Stats();
document.body.appendChild(stats.dom);
const vanguardAnimations = {
    default: function () {
        const index = animationActions.findIndex((x) => x.name === "default");
        setVanguardAction(animationActions[index].action);
    },
    samba: function () {
        const index = animationActions.findIndex((x) => x.name === "samba");
        setVanguardAction(animationActions[index].action);
    },
    bellydance: function () {
        const index = animationActions.findIndex((x) => x.name === "bellydance");
        setVanguardAction(animationActions[index].action);
    },
    goofyrunning: function () {
        const index = animationActions.findIndex((x) => x.name === "goofyrunning");
        setVanguardAction(animationActions[index].action);
    },
};
const swatguyAnimations = {
    idle: function () {
        const index = animationActions.findIndex((x) => x.name === "idle");
        setSwatguyAction(animationActions[index].action);
    },
    flair: function () {
        const index = animationActions.findIndex((x) => x.name === 'flair');
        setSwatguyAction(animationActions[index].action);
    }
};
const setVanguardAction = (actionToExecute) => {
    if (actionToExecute != vanguardActiveAction) {
        vanguardLastAction = vanguardActiveAction;
        vanguardActiveAction = actionToExecute;
        vanguardLastAction.fadeOut(.5);
        vanguardActiveAction.reset();
        vanguardActiveAction.fadeIn(.5);
        vanguardActiveAction.play();
    }
};
const setSwatguyAction = (actionToExecute) => {
    if (actionToExecute != swatActiveAction) {
        swatLastAction = swatActiveAction;
        swatActiveAction = actionToExecute;
        swatLastAction.fadeOut(.5);
        swatActiveAction.reset();
        swatActiveAction.fadeIn(.5);
        swatActiveAction.play();
    }
};
const gui = new GUI();
const animationsFolder = gui.addFolder("Animations");
const vanguardFolder = animationsFolder.addFolder("Vanguard");
const swatguyFolder = animationsFolder.addFolder("Swat");
animationsFolder.open();
const vanguardClock = new THREE.Clock();
const swatguyClock = new THREE.Clock();
var animate = function () {
    requestAnimationFrame(animate);
    controls.update();
    if (vanguardModelReady)
        mixers[vanguardMixerIndex].mixer.update(vanguardClock.getDelta());
    if (swatModelReady)
        mixers[swatguyMixerIndex].mixer.update(swatguyClock.getDelta());
    render();
    stats.update();
};
function render() {
    renderer.render(scene, camera);
}
animate();
