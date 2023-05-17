import * as THREE from 'three'
import { points, LavaTubePath } from './LavaTubeGeometry'
const stepEasingMax = 40;
export const emitParams = {
    height:0,
    step: 1,
    stepEasing: 0,
    lavaTubeMesh: undefined,
    emitStarted: false,
    path: undefined
}
export function initLavaTube () {
    if (!emitParams.lavaTubeMesh) {
        emitParams.path = new LavaTubePath(points.slice(0, 2));
        let geometry = new THREE.TubeGeometry(emitParams.path, 256, 0.2, 32);
        emitParams.lavaTubeMesh = new THREE.Mesh(geometry, new THREE.LineBasicMaterial( { color: 0xff0000 } ))
    }
    return emitParams.lavaTubeMesh;
}
export function emit () {
    
    if (emitParams.step === 2 && emitParams.stepEasing === 0) console.debug('Crater summit arrived')
    updateLavaTubeMesh();
}

function updateLavaTubeMesh () {
    if (!emitParams.emitStarted) return;
    let path = emitParams.path;
    if (path.points.length >= (points.length - 2) * stepEasingMax + 2) return;
    if (emitParams.step > points.length - 1) return emitParams.emitStarted = false;
    let increment = [
        (emitParams.stepEasing / stepEasingMax) * (points[emitParams.step + 1][0] - path.points[path.points.length - 1].x),
        (emitParams.stepEasing / stepEasingMax) * (points[emitParams.step + 1][1] - path.points[path.points.length - 1].y),
        (emitParams.stepEasing / stepEasingMax) * (points[emitParams.step + 1][2] - path.points[path.points.length - 1].z)
        ],
        ptNext = [
            path.points[path.points.length - 1].x + increment[0],
            path.points[path.points.length - 1].y + increment[1],
            path.points[path.points.length - 1].z + increment[2]
        ];
    emitParams.height = ptNext[1];
    path.points.push(new THREE.Vector3(...ptNext));
    emitParams.path = new THREE.CatmullRomCurve3(path.points);
    let newGeometry = new THREE.TubeGeometry(emitParams.path, 256, 0.2, 32);
    emitParams.lavaTubeMesh.geometry = newGeometry;
    // emitParams.lavaTubeMesh = new THREE.Mesh(
    //     new THREE.TubeGeometry(emitParams.path),
    //     emitParams.lavaTubeMesh.material
    // )
    emitParams.stepEasing += 1;
    if (emitParams.stepEasing >= stepEasingMax) {
        emitParams.stepEasing = 0;
        emitParams.step += 1;
    }
}

window.emitParams = emitParams;