import * as THREE from '/build/three.module.js';
class Kachujin {
    constructor(scene, fbxLoader, mixerObj) {
        this.modelReady = false;
        this.path = 'models/';
        this.scene = scene;
        this.fbxLoader = fbxLoader;
        this.mixerObj = mixerObj;
    }
    loadModel() {
        this.fbxLoader.load(this.path + 'kachujin_g_rosales.fbx', (object) => {
            object.traverse((child) => {
                if (child.isMesh) {
                    let mesh = child;
                    mesh.castShadow = true;
                    mesh.receiveShadow = true;
                    mesh.material.transparent = false;
                }
                if (child.isLight) {
                    let light = child;
                }
            });
            object.scale.set(.009, .009, .009);
            object.position.set(1.5, 0, 0.5);
            object.rotateY(-Math.PI / 5);
            this.mixerObj.mixers.push({ name: 'kachujinMixer', mixer: new THREE.AnimationMixer(object) });
            this.scene.add(object);
            this.model = object;
        });
    }
}
export default Kachujin;
