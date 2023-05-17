import * as THREE from 'three'
import { points, LavaTubePath } from './LavaTubeGeometry'
const stepEasingMax = 40;
export const flowParams = {
    height:0,
    step: 1,
    stepEasing: 0,
    lavaTubeMesh: undefined,
    flowStarted: false,
    path: undefined
}
export function initLavaTube () {
    if (!flowParams.lavaTubeMesh) {
        flowParams.path = new LavaTubePath(points.slice(0, 2));
        let geometry = new THREE.TubeGeometry(flowParams.path, 256, 0.2, 32);
        flowParams.lavaTubeMesh = new THREE.Mesh(geometry, new THREE.LineBasicMaterial( { color: 0xff0000 } ))
    }
    return flowParams.lavaTubeMesh;
}
export function flow () {
    
    if (flowParams.step === 2 && flowParams.stepEasing === 0) console.debug('Crater summit arrived')
    updateLavaTubeMesh();
}

function updateLavaTubeMesh () {
    if (!flowParams.flowStarted) return;
    let path = flowParams.path;
    if (path.points.length >= (points.length - 2) * stepEasingMax + 2) return;
    if (flowParams.step > points.length - 1) return flowParams.flowStarted = false;
    let increment = [
        (flowParams.stepEasing / stepEasingMax) * (points[flowParams.step + 1][0] - path.points[path.points.length - 1].x),
        (flowParams.stepEasing / stepEasingMax) * (points[flowParams.step + 1][1] - path.points[path.points.length - 1].y),
        (flowParams.stepEasing / stepEasingMax) * (points[flowParams.step + 1][2] - path.points[path.points.length - 1].z)
        ],
        ptNext = [
            path.points[path.points.length - 1].x + increment[0],
            path.points[path.points.length - 1].y + increment[1],
            path.points[path.points.length - 1].z + increment[2]
        ];
    flowParams.height = ptNext[1];
    path.points.push(new THREE.Vector3(...ptNext));
    flowParams.path = new THREE.CatmullRomCurve3(path.points);
    let newGeometry = new THREE.TubeGeometry(flowParams.path, 256, 0.2, 32);
    flowParams.lavaTubeMesh.geometry = newGeometry;
    // flowParams.lavaTubeMesh = new THREE.Mesh(
    //     new THREE.TubeGeometry(flowParams.path),
    //     flowParams.lavaTubeMesh.material
    // )
    flowParams.stepEasing += 1;
    if (flowParams.stepEasing >= stepEasingMax) {
        flowParams.stepEasing = 0;
        flowParams.step += 1;
    }
}

window.flowParams = flowParams;