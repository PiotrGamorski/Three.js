import * as THREE from '/build/three.module.js'

type MixerType = {
    name: string
    mixer: THREE.AnimationMixer
}

type AnimationActionType = {
    name: string
    action: THREE.AnimationAction
}

class Mixer {
    mixers: MixerType[] = [];
    animationActions: AnimationActionType[] = []
}

export default Mixer;