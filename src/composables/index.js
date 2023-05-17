import * as THREE from 'three';
import { onMounted } from 'vue';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls'
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as lavaShader from './lavaShader';
import { flowParams, flow, initLavaTube } from './flow';

const scene = new THREE.Scene(),
    camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 100 ),
    clock = new THREE.Clock(),
    gltfLoader = new GLTFLoader(),
    textureLoader = new THREE.TextureLoader(),
    surfaceHeightMax = 3.8;

window.devCamera = camera;

let controls,
    renderer,
    lavaUniforms,
    lavaSurfaceUniforms,
    count = 0,
    surfaceGeometry,
    lavaMaterial,
    lavaSurface;
createLavaMaterial();
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
        window.devControls = controls;
        camera.position.set(-6.128432520654207, 3.039912832619679, 10.32804205569547);

        animate();
    })
}

function loadModel () {
    gltfLoader.load( '/volcano.glb', async function ( gltf ) {
        let model = gltf.scene;
        scene.add( gltf.scene );
        let lavaBody = model.getObjectByName('Sphere008_Wall_Paint_0'),
            lavaTubeOrig = model.getObjectByName('LavaTube'),
            lavaTube = initLavaTube();
        lavaSurface = model.getObjectByName('LavaSurface');
        
        lavaBody.material = lavaMaterial;
        lavaTubeOrig.material = lavaMaterial;
        lavaTube.material = lavaMaterial;
        lavaSurface.material = lavaMaterial;
        lavaTubeOrig.parent.add(lavaTube);
        lavaTube.position.set(-1.527, 0.0008, 1.1215);
        // loadAndApplyLavaSurfaceShader(lavaSurface);

        window.lavaSurface = lavaSurface;
        window.devModel = gltf.scene
    } );
}
async function loadAndApplyLavaSurfaceShader (mesh) {
    lavaSurfaceUniforms = {
        u_pointsize: { value: 2.0 },
        // wave 1
        u_noise_freq_1: { value: 3.0 },
        u_noise_amp_1: { value: 0.2 },
        u_spd_modifier_1: { value: 1.0 },
        // wave 2
        u_noise_freq_2: { value: 2.0 },
        u_noise_amp_2: { value: 0.3 },
        u_spd_modifier_2: { value: 0.8 },
        texture1: { value: textureLoader.load( 'noise_file.png' ) },
        texture2: { value: textureLoader.load( 'lava_file.jpg' ) }
    };
    lavaSurfaceUniforms[ 'texture1' ].value.wrapS = lavaSurfaceUniforms[ 'texture1' ].value.wrapT = THREE.RepeatWrapping;
    lavaSurfaceUniforms[ 'texture2' ].value.wrapS = lavaSurfaceUniforms[ 'texture2' ].value.wrapT = THREE.RepeatWrapping;

    const material = new THREE.ShaderMaterial( {

        uniforms: lavaSurfaceUniforms,
        vertexShader: lavaShader.vertSurface,
        fragmentShader: lavaShader.frag

    } );

    mesh.material = material;

    window.devlavaSurfaceUniforms = lavaSurfaceUniforms;
}
async function createLavaMaterial () {
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

    lavaMaterial = new THREE.ShaderMaterial( {

        uniforms: lavaUniforms,
        vertexShader: lavaShader.vert,
        fragmentShader: lavaShader.frag

    } );
}

function createLavaTube (positions=[]) {

}

function updateLavaSurfaceHeight () {
    if (!lavaSurface) return;
    if (lavaSurface.position.y >= flowParams.height) return;
    lavaSurface.position.y = flowParams.height;
}

function animate() {

    requestAnimationFrame( animate );

    const dt = clock.getDelta();
    const delta = 5 * dt;

	if (lavaUniforms) lavaUniforms[ 'time' ].value += 0.2 * delta;
    
    surfaceGeometry?.vertices?.forEach?.((vert, i) => {
        let z = +vert.z;
        vert.z = Math.sin(( i + count * 0.00002)) * (vert._myZ - (vert._myZ* 0.6))
        surfaceGeometry.verticesNeedUpdate = true;
  
        count += 0.1
    })

    flow();
    updateLavaSurfaceHeight();
    
    controls.update();
    renderer.render( scene, camera );

}

