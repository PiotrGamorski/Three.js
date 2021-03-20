import * as THREE from '/build/three.module.js'
import Kachujin from 'Kachujin.js'

class RaycastManager {
    camera: THREE.PerspectiveCamera;

    raycaster: THREE.Raycaster = new THREE.Raycaster();
    objectsToRaycast: THREE.Mesh[] = [];
    intersectedObject: THREE.Object3D | null;
    intersects: THREE.Intersection[];
    kachujin: Kachujin;

    constructor(camera: THREE.PerspectiveCamera, kachujin: Kachujin){
        this.camera = camera;
        this.kachujin = kachujin;
        this.objectsToRaycast = kachujin.meshToRaycast;
    }

    onRaycastAction = (event: MouseEvent) => {
        const mouseCoordinatesNormalized = {
            x: (event.clientX / window.innerWidth) * 2 - 1,
            y: -(event.clientY / window.innerHeight) * 2 + 1,
        };
        this.raycaster.setFromCamera(mouseCoordinatesNormalized, this.camera);
        this.intersects = this.raycaster.intersectObjects(this.objectsToRaycast, false);

        if(this.intersects.length > 0){
            this.intersectedObject = this.intersects[0].object;

            switch(this.intersectedObject.name){
                case 'plane':
                    this.kachujin.actionOnPlaneDoubleClicked(this.intersects[0].point);
                    break;
            }
        } else {
            this.intersectedObject = null;
        }
    }
}

export default RaycastManager;