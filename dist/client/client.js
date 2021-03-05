import * as THREE from '/build/three.module.js';
import { OrbitControls } from '/jsm/controls/OrbitControls';
import { DragControls } from '/jsm/controls/DragControls';
import { FBXLoader } from '/jsm/loaders/FBXLoader';
import { GLTFLoader } from '/jsm/loaders/GLTFLoader';
import Stats from '/jsm/libs/stats.module';
import { GUI } from '/jsm/libs/dat.gui.module';
const scene = new THREE.Scene();
const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);
var light1 = new THREE.PointLight();
light1.position.set(2.5, 2.5, 2.5);
light1.castShadow = true;
scene.add(light1);
var light2 = new THREE.PointLight();
light2.position.set(-2.5, 2.5, 2.5);
light2.castShadow = true;
scene.add(light2);
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0.8, 1.4, 1.0);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);
const orbitControls = new OrbitControls(camera, renderer.domElement);
orbitControls.screenSpacePanning = true;
orbitControls.target.set(0, 1, 0);
const sceneMeshes = new Array();
let boxHelper;
const dragControls = new DragControls(sceneMeshes, camera, renderer.domElement);
dragControls.addEventListener('hoveron', () => {
    boxHelper.visible = true;
    orbitControls.enabled = false;
});
dragControls.addEventListener('hoveroff', () => {
    boxHelper.visible = false;
    orbitControls.enabled = true;
});
dragControls.addEventListener('dragstart', () => {
    boxHelper.visible = true;
    orbitControls.enabled = false;
});
dragControls.addEventListener('dragend', () => {
    boxHelper.visible = false;
    orbitControls.enabled = true;
});
const textures = new Array();
const loader = new THREE.CubeTextureLoader();
textures[0] = loader.load([
    'img/px_eso0932a.jpg',
    'img/nx_eso0932a.jpg',
    'img/py_eso0932a.jpg',
    'img/ny_eso0932a.jpg',
    'img/pz_eso0932a.jpg',
    'img/nz_eso0932a.jpg',
]);
scene.background = textures[0];
const planeGeometry = new THREE.PlaneGeometry(25, 25);
textures[1] = new THREE.TextureLoader().load('img/grid.png');
const plane = new THREE.Mesh(planeGeometry, new THREE.MeshPhongMaterial({ map: textures[1] }));
plane.rotateX(-Math.PI / 2);
plane.receiveShadow = true;
scene.add(plane);
let mixers = [];
let vanguardModelReady = false;
let animationActions = [];
let vanguardActiveAction;
let vanguardLastAction;
let vanguardMixerIndex;
let vanguardModel;
let vanguardDragBox;
const fbxLoader = new FBXLoader();
fbxLoader.load('models/vanguard_t_choonyung.fbx', (object) => {
    object.traverse(function (child) {
        if (child.isMesh) {
            let mesh = child;
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            mesh.frustumCulled = false;
            mesh.material.transparent = false;
            objectsToRaycast.push(mesh);
        }
    });
    object.scale.set(.01, .01, .01);
    mixers.push({ name: "vanguardMixer", mixer: new THREE.AnimationMixer(object) });
    vanguardMixerIndex = mixers.findIndex((x) => x.name === "vanguardMixer");
    let animationAction = mixers[vanguardMixerIndex].mixer.clipAction(object.animations[0]);
    animationActions.push({ name: "default", action: animationAction });
    vanguardFolder.add(vanguardAnimations, 'default');
    vanguardActiveAction = animationActions[0].action;
    vanguardModel = object;
    object.remove;
    scene.add(vanguardModel);
    vanguardDragBox = new THREE.Mesh(new THREE.BoxGeometry(0.5, 1.8, .5), new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 }));
    vanguardDragBox.geometry.translate(0, 0.9, 0);
    sceneMeshes.push(vanguardDragBox);
    boxHelper = new THREE.BoxHelper(vanguardDragBox, 0xffff00);
    boxHelper.visible = false;
    scene.add(vanguardDragBox);
    scene.add(boxHelper);
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
const raycaster = new THREE.Raycaster();
const objectsToRaycast = [];
const gltfLoader = new GLTFLoader();
let swatModelReady = false;
let swatLastAction;
let swatActiveAction;
let swatguyMixerIndex;
gltfLoader.load('models/swatguy.glb', (gltf) => {
    gltf.scene.traverse((child) => {
        if (child.isMesh) {
            let mesh = child;
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            mesh.material.transparent = false;
            objectsToRaycast.push(mesh);
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
    //objectsToRaycast.push(gltf.scene)
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
const lineMaterial = new THREE.LineBasicMaterial({ color: 0xff0000 });
const points = [];
points.push(new THREE.Vector3(0, 0, 0));
points.push(new THREE.Vector3(0, 0, 0.25));
const lineGeometry = new THREE.BufferGeometry();
lineGeometry.setFromPoints(points);
const line = new THREE.Mesh(lineGeometry, lineMaterial);
scene.add(line);
window.addEventListener('resize', onWindowResize, false);
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    render();
}
renderer.domElement.addEventListener('mousemove', onMouseMove, false);
function onMouseMove(event) {
    const mouseCoordinatesNormalized = {
        x: (event.clientX / window.innerWidth) * 2 - 1,
        y: -(event.clientY / window.innerHeight) * 2 + 1,
    };
    raycaster.setFromCamera(mouseCoordinatesNormalized, camera);
    const intersects = raycaster.intersectObjects(objectsToRaycast, false);
    if (intersects.length > 0) {
        console.log(intersects[0]);
        line.position.set(0, 0, 0);
        line.lookAt(intersects[0].face.normal);
        line.position.copy(intersects[0].point);
    }
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
    orbitControls.update();
    if (vanguardModelReady) {
        mixers[vanguardMixerIndex].mixer.update(vanguardClock.getDelta());
        vanguardModel.position.copy(vanguardDragBox.position);
        boxHelper.update();
    }
    if (swatModelReady)
        mixers[swatguyMixerIndex].mixer.update(swatguyClock.getDelta());
    render();
    stats.update();
};
function render() {
    renderer.render(scene, camera);
}
animate();
