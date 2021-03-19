import * as THREE from '/build/three.module.js'
import { FBXLoader } from '/jsm/loaders/FBXLoader'
import Mixer from './Mixer.js'

class Kachujin {
    model: THREE.Object3D;
    modelReady: boolean = false;
    modelActiveAction: THREE.AnimationAction;
    modelLastAction: THREE.AnimationAction;
    path: string = 'models/';

    scene: THREE.Scene;
    fbxLoader: FBXLoader;
    mixerObj: Mixer;

    constructor (scene: THREE.Scene, fbxLoader: FBXLoader, mixerObj: Mixer) {
        this.scene = scene;
        this.fbxLoader = fbxLoader;
        this.mixerObj = mixerObj;
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
                    }
                    if((child as THREE.Light).isLight) {
                        let light = <THREE.Mesh>child;
                    }
                })
                object.scale.set(.009, .009, .009);
                object.position.set(1.5, 0, 0.5);
                object.rotateY(-Math.PI /5);
                this.mixerObj.mixers.push({name: 'kachujinMixer', mixer: new THREE.AnimationMixer(object)});
                this.scene.add(object);
                this.model = object;
            }
        )
    }
}

export default Kachujin;