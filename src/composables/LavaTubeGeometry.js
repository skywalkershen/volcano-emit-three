import * as THREE from 'three'
export const points = [
    [0, 1, 0],
    [0, 2, 0],
    [0, 3.87, 0],
    [1, 2.22, 1.45],
    [2.5, 1.1, 1.4],
    [2.6, 0, 1.4]
]

export class LavaTubePath extends THREE.CatmullRomCurve3 {
    constructor (pts, ...configs) {
        super(pts.map(pos => new THREE.Vector3(...pos)), ...configs);
    }
}
export class LavatubeGeometry extends THREE.TubeGeometry {
    constructor(positions, ...configs) {
        let pots = positions.map(pos => new THREE.Vector3(...pos)),
            path = new THREE.CatmullRomCurve3(pots)
        super(path, ...configs)
    }
}
