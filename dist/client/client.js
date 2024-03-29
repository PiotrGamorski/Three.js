import * as THREE from '/build/three.module.js';
import { OrbitControls } from '/jsm/controls/OrbitControls';
import { DragControls } from '/jsm/controls/DragControls';
import { FBXLoader } from '/jsm/loaders/FBXLoader';
import { GLTFLoader } from '/jsm/loaders/GLTFLoader';
import Stats from '/jsm/libs/stats.module';
import { GUI } from '/jsm/libs/dat.gui.module';
import { TWEEN } from '/jsm/libs/tween.module.min';
const scene = new THREE.Scene();
const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);
var light1 = new THREE.PointLight();
light1.position.set(2.5, 2.5, 2.5);
light1.castShadow = true;
scene.add(light1);
var light2 = new THREE.SpotLight();
light2.position.set(-2.5, 5, 2.5);
light2.angle = Math.PI / 8;
light2.penumbra = 0.5;
light2.castShadow = true;
light2.shadow.mapSize.width = 1024;
light2.shadow.mapSize.height = 1024;
light2.shadow.camera.near = 0.5;
light2.shadow.camera.far = 20;
scene.add(light2);
const raycaster = new THREE.Raycaster();
let intersects;
const objectsToRaycast = new Array();
let intersectedObject;
const targetQuaternion = new THREE.Quaternion();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0.8, 1.4, 1.0);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);
const orbitControls = new OrbitControls(camera, renderer.domElement);
orbitControls.screenSpacePanning = true;
orbitControls.target.set(0, 1, 0);
const sceneMeshes = new Array();
let boxHelper;
const dragControls = new DragControls(sceneMeshes, camera, renderer.domElement);
//const kachujinObj = new Kachujin();
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
plane.name = "plane";
scene.add(plane);
objectsToRaycast.push(plane);
const fbxLoader = new FBXLoader();
let mixers = [];
let animationActions = [];
let vanguardModelReady = false;
let vanguardActiveAction;
let vanguardLastAction;
let vanguardMixerIndex;
let vanguardModel;
let vanguardDragBox;
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
    scene.add(object);
    vanguardModel = object;
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
let kachujinModel;
let kachujinModelReady = false;
let kachujinMixerIndex;
let kachujinActiveAction;
let kachujinLastAction;
fbxLoader.load('models/kachujin_g_rosales.fbx', (object) => {
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
    object.scale.set(.009, .009, .009);
    object.position.set(1.5, 0, 0.5);
    object.rotateY(-Math.PI / 5);
    mixers.push({ name: 'kachujinMixer', mixer: new THREE.AnimationMixer(object) });
    kachujinMixerIndex = mixers.findIndex((x) => x.name === 'kachujinMixer');
    scene.add(object);
    kachujinModel = object;
    fbxLoader.load('models/kachujin@idle.fbx', (object) => {
        let animationAction = mixers[kachujinMixerIndex].mixer.clipAction(object.animations[0]);
        animationActions.push({ name: 'kachujin@idle', action: animationAction });
        kachujinActiveAction = animationAction;
        kachujinActiveAction.play();
    });
    fbxLoader.load('models/kachujin@walk.fbx', (object) => {
        object.animations[0].tracks.shift();
        let animationAction = mixers[kachujinMixerIndex].mixer.clipAction(object.animations[0]);
        animationActions.push({ name: 'kachujin@walk', action: animationAction });
    });
    kachujinModelReady = true;
});
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
const cubeGeometry = new THREE.BoxGeometry(.2, .2, .2);
const cubeMaterial = new THREE.MeshNormalMaterial();
let wasDoubleClicked = false;
window.addEventListener('resize', onWindowResize, false);
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    render();
}
renderer.domElement.addEventListener('dblclick', onDoubleClick, false);
function onDoubleClick(event) {
    wasDoubleClicked = true;
    const mouseCoordinatesNormalized = {
        x: (event.clientX / window.innerWidth) * 2 - 1,
        y: -(event.clientY / window.innerHeight) * 2 + 1,
    };
    raycaster.setFromCamera(mouseCoordinatesNormalized, camera);
    intersects = raycaster.intersectObjects(objectsToRaycast, false);
    if (intersects.length > 0) {
        intersectedObject = intersects[0].object;
        console.log(intersectedObject);
        if (intersectedObject.name !== "plane") {
            let normalVector = new THREE.Vector3();
            normalVector.copy(intersects[0].face.normal);
            normalVector.transformDirection(intersectedObject.matrixWorld);
            const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
            cube.lookAt(normalVector);
            cube.rotateX(Math.PI / 2);
            cube.position.copy(intersects[0].point);
            cube.position.addScaledVector(normalVector, .1);
            cube.castShadow = true;
            scene.add(cube);
        }
        const desiredPoint = intersects[0].point;
        if (intersectedObject.name === "plane") {
            const kachujinModelPosition = kachujinModel.position;
            const distance = kachujinModelPosition.distanceTo(desiredPoint);
            const rotationMatrix = new THREE.Matrix4();
            rotationMatrix.lookAt(desiredPoint, kachujinModelPosition, kachujinModel.up);
            targetQuaternion.setFromRotationMatrix(rotationMatrix);
            const index = animationActions.findIndex((x) => x.name === 'kachujin@walk');
            const walkAction = animationActions[index].action;
            setKachujinAction(walkAction);
            TWEEN.removeAll();
            new TWEEN.Tween(kachujinModelPosition)
                .to({ x: desiredPoint.x, y: desiredPoint.y, z: desiredPoint.z }, 2000 / 2.6 * distance)
                .onUpdate(() => {
                orbitControls.target.set(kachujinModel.position.x, kachujinModel.position.y + 1, kachujinModel.position.z);
                light2.target = kachujinModel;
            })
                .onComplete(() => {
                setKachujinAction(kachujinLastAction);
            })
                .start();
        }
        else {
            TWEEN.removeAll();
            new TWEEN.Tween(orbitControls.target)
                .to({ x: desiredPoint.x, y: desiredPoint.y, z: desiredPoint.z }, 1000)
                .easing(TWEEN.Easing.Cubic.InOut)
                .start();
        }
    }
    else {
        intersectedObject = null;
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
const setKachujinAction = (actionToExecute) => {
    if (actionToExecute !== kachujinActiveAction) {
        kachujinLastAction = kachujinActiveAction;
        kachujinActiveAction = actionToExecute;
        kachujinLastAction.fadeOut(.5);
        kachujinActiveAction.reset();
        kachujinActiveAction.fadeIn(.5);
        kachujinActiveAction.play();
    }
};
const gui = new GUI();
const animationsFolder = gui.addFolder("Animations");
const vanguardFolder = animationsFolder.addFolder("Vanguard");
const swatguyFolder = animationsFolder.addFolder("Swat");
animationsFolder.open();
const vanguardClock = new THREE.Clock();
const swatguyClock = new THREE.Clock();
const kachujinClock = new THREE.Clock();
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
    const delta = kachujinClock.getDelta();
    if (kachujinModelReady) {
        mixers[kachujinMixerIndex].mixer.update(delta);
        if (wasDoubleClicked && !kachujinModel.quaternion.equals(targetQuaternion)) {
            kachujinModel.quaternion.rotateTowards(targetQuaternion, delta * 10);
        }
    }
    render();
    TWEEN.update();
    stats.update();
};
function render() {
    renderer.render(scene, camera);
}
animate();
