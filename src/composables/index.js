import * as THREE from 'three';
import { onMounted } from 'vue';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls'
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as lavaShader from './lavaShader';

const scene = new THREE.Scene(),
    camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 100 ),
    clock = new THREE.Clock(),
    gltfLoader = new GLTFLoader(),
    textureLoader = new THREE.TextureLoader();

let controls,
    renderer,
    lavaUniforms;

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
        let model = gltf.scene;
        scene.add( gltf.scene );
        let lavaBody = model.getObjectByName('Sphere008_Wall_Paint_0'),
            lavaTube = model.getObjectByName('LavaTube');
        loadAndApplyLavaSurfaceShader([lavaBody, lavaTube]);

        window.devModel = gltf.scene
    } );
}
async function loadAndApplyLavaSurfaceShader (meshes=[]) {
    lavaUniforms = {
        'fogDensity': { value: 0.45 },
        'fogColor': { value: new THREE.Vector3( 0, 0, 0 ) },
        'time': { value: 1.0 },
        'uvScale': { value: new THREE.Vector2( 3.0, 1.0 ) },
        'texture1': { value: textureLoader.load( 'noise_file.png' ) },
        'texture2': { value: textureLoader.load( 'lava_file.jpg' ) }

    };
    lavaUniforms[ 'texture1' ].value.wrapS = lavaUniforms[ 'texture1' ].value.wrapT = THREE.RepeatWrapping;
    lavaUniforms[ 'texture2' ].value.wrapS = lavaUniforms[ 'texture2' ].value.wrapT = THREE.RepeatWrapping;

    const material = new THREE.ShaderMaterial( {

        uniforms: lavaUniforms,
        vertexShader: lavaShader.vert,
        fragmentShader: lavaShader.frag

    } );

    meshes.forEach(mesh => {
        mesh.material = material;
    })
    window.devlavaUniforms = lavaUniforms;
}

function animate() {

    requestAnimationFrame( animate );

    const dt = clock.getDelta();
    const delta = 5 * dt;

	if (lavaUniforms) lavaUniforms[ 'time' ].value += 0.2 * delta;
    

    controls.update();
    renderer.render( scene, camera );

}

