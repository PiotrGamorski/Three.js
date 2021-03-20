import * as THREE from '/build/three.module.js'
import { OrbitControls } from '/jsm/controls/OrbitControls'
import { FBXLoader } from '/jsm/loaders/FBXLoader'
import Mixer from './Mixer.js'
import { TWEEN } from '/jsm/libs/tween.module.min'

class Kachujin {
    model: THREE.Object3D;
    modelReady: boolean = false;
    modelActiveAction: THREE.AnimationAction;
    modelLastAction: THREE.AnimationAction;
    meshToRaycast: THREE.Mesh[] = [];
    targetQuaternion: THREE.Quaternion = new THREE.Quaternion();
    path: string = 'models/';

    scene: THREE.Scene;
    orbitControls: OrbitControls;
    fbxLoader: FBXLoader;
    mixer: Mixer;
    clock: THREE.Clock;

    constructor (scene: THREE.Scene, orbitControls: OrbitControls, fbxLoader: FBXLoader, mixerObj: Mixer) {
        this.scene = scene;
        this.orbitControls = orbitControls;
        this.fbxLoader = fbxLoader;
        this.mixer = mixerObj;
        this.clock = new THREE.Clock();
    }
    

    loadModel () {
        this.fbxLoader.load(
            this.path + 'kachujin_g_rosales.fbx',
            (object) => {
                object.traverse((child) => {
                    if((child as THREE.Mesh).isMesh){
                        let mesh = <THREE.Mesh>child;
                        mesh.castShadow = true;
                        mesh.receiveShadow = true;
                        (mesh.material as THREE.MeshBasicMaterial).transparent = false;
                        this.meshToRaycast.push(mesh);
                    }
                    if((child as THREE.Light).isLight) {
                        let light = <THREE.Light>child;
                        light.castShadow = true;
                        light.shadow.bias = -0.003;
                    }
                })
                object.scale.set(.009, .009, .009);
                object.position.set(1.5, 0, 0.5);
                object.rotateY(-Math.PI /5);
                object.name = 'kachujin';
                this.mixer.mixers.push({name: 'kachujinMixer', mixer: new THREE.AnimationMixer(object)});
                let kachujinMixer = this.mixer.mixers.find((x) => x.name === 'kachujinMixer').mixer;
                this.scene.add(object);
                this.model = object;

                this.fbxLoader.load(
                    this.path + 'kachujin@idle.fbx',
                    (object) => {
                        let animationAction = kachujinMixer.clipAction(object.animations[0]);
                        this.mixer.animationActions.push({name: 'kachujin@idle', action: animationAction});
                        this.modelActiveAction = animationAction;
                        this.modelActiveAction.play();
                    }
                )

                this.fbxLoader.load(
                    this.path + 'kachujin@walk.fbx',
                    (object) => {
                        object.animations[0].tracks.shift();
                        let animationAction = kachujinMixer.clipAction(object.animations[0]);
                        this.mixer.animationActions.push({name: 'kachujin@walk', action: animationAction});
                    }
                )
            }
        )
    }

    setAction = (actionToBePlayed: THREE.AnimationAction) => {
        this.modelLastAction = this.modelActiveAction;
        this.modelActiveAction = actionToBePlayed;
        this.modelLastAction.fadeOut(0.5);
        this.modelActiveAction.reset();
        this.modelActiveAction.fadeIn(0.5)
        this.modelActiveAction.play();
    }

    actionOnPlaneDoubleClicked = (desiredPoint: THREE.Vector3) => {
        const modelPosiotion: THREE.Vector3 = this.model.position;
        const distance: number = modelPosiotion.distanceTo(desiredPoint);
        const rotationMatrix: THREE.Matrix4 = new THREE.Matrix4();
        rotationMatrix.lookAt(desiredPoint, modelPosiotion, this.model.up);
        this.targetQuaternion.setFromRotationMatrix(rotationMatrix);
        const action: THREE.AnimationAction = this.mixer.animationActions.find((x) => {x.name === 'kachujin@idle'}).action;
        this.setAction(action);

        TWEEN.removeAll()
            new TWEEN.Tween(modelPosiotion)
            .to({x : desiredPoint.x, y: desiredPoint.y, z: desiredPoint.z}, 2000 / 2.6 * distance)
            .onUpdate(() => {
                this.orbitControls.target.set(
                    this.model.position.x,
                    this.model.position.y +1,
                    this.model.position.z)
            })
            .onComplete(() => {
                this.setAction(this.modelLastAction);
            })
            .start();
    }
}

export default Kachujin;