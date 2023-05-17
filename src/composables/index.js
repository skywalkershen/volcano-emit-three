import * as THREE from 'three';
import { onMounted } from 'vue';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls'
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const scene = new THREE.Scene(),
    camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 100 ),
    clock = new THREE.Clock(),
    gltfLoader = new GLTFLoader();

let controls,
    renderer;

loadModel();    
export function init (containerRef) {
    onMounted(() => {
        renderer = new THREE.WebGLRenderer({
            canvas: containerRef.value,
            antialias: true
        })
        renderer.setPixelRatio( window.devicePixelRatio );
        renderer.setSize( window.innerWidth, window.innerHeight );
        renderer.shadowMap.enabled = true;

        const pmremGenerator = new THREE.PMREMGenerator( renderer );
        scene.background = new THREE.Color( 0xf0f0f0 );
        scene.environment = pmremGenerator.fromScene( new RoomEnvironment(), 0.04 ).texture;

        camera.position.set( -10, 5, 0 );
        controls = new OrbitControls( camera, renderer.domElement );
        controls.enablePan = true;
        controls.enableZoom = true;


        animate();
    })
}

function loadModel () {
    gltfLoader.load( '/volcano.glb', async function ( gltf ) {
        scene.add( gltf.scene );
    } );
}

function animate() {

    requestAnimationFrame( animate );


    const mixerUpdateDelta = clock.getDelta();

    controls.update();
    renderer.render( scene, camera );

}
