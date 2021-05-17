import * as THREE from '../node_modules/three/build/three.module.js';

import Stats from '../node_modules/three/examples/jsm/libs/stats.module.js'
import { GUI } from '../node_modules/three/examples/jsm/libs/dat.gui.module.js';
import { OrbitControls } from '../node_modules/three/examples/jsm/controls/OrbitControls.js';


import { GLTFLoader } from '../node_modules/three/examples/jsm/loaders/GLTFLoader.js';

import { JoyStick } from './joystick.module.js'


let container, stats, clock, gui, mixer, actions, activeAction, previousAction;
let camera, scene, renderer, model, face;
let joystick, followCam, forward = 0, turn = 0, activeActionName, speed

const api = { state: 'Idle' };


// let joystickCallback = (f, t) => {
//     forward = f
//     turn = t
// }

// let moveModel = () => {
//     if (Math.abs(forward) >= 0.7) {
//         if (activeActionName != 'Running') {
//             fadeToAction('Running', 0.1)
//         }
//         speed = 3
//         model.rotation.y = ((1 * -turn))

//     }
//     else if (Math.abs(forward) > 0.1) {
//         if (activeActionName != 'Running') {
//             fadeToAction('Running', 0.1)
//         }
//         speed = 2
//         model.rotation.y = ((1 * -turn))


//     }

//     else {
//         if (activeActionName == 'Running') {
//             gsap.to(model.position, { duration: 1, z: model.position.z, ease: 'linear' })
//             fadeToAction('Idle', 0.1)
//         }
//     }
//     if (turn != 0)
//         gsap.to(model.position, { duration: 1, z: model.position.z + forward * (speed), x: model.position.x + (forward * speed * turn > 0 ? -1 : 1), ease: 'linear' })
// }





function init() {

    container = document.createElement('div');
    document.body.appendChild(container);

    camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 1, 2000)
    camera.position.set(0, 10, -20);

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xe0e0e0);

    clock = new THREE.Clock();

    // lights

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444);
    hemiLight.position.set(0, 20, 0);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xffffff);
    dirLight.position.set(0, 20, 10);
    scene.add(dirLight);

    // ground

    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2000, 2000), new THREE.MeshPhongMaterial({ color: 0x999999, depthWrite: false }));
    mesh.rotation.x = - Math.PI / 2;
    scene.add(mesh);

    const grid = new THREE.GridHelper(200, 40, 0x000000, 0x000000);
    grid.material.opacity = 0.2;
    grid.material.transparent = true;
    scene.add(grid);

    // model

    const loader = new GLTFLoader();
    loader.load('../assets/RobotExpressive.glb', function (gltf) {

        model = gltf.scene;
        scene.add(model);

        model.add(camera)

        createGUI(model, gltf.animations);

    }, undefined, function (e) {

        console.error(e);

    });

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.outputEncoding = THREE.sRGBEncoding;
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.target.set(0, 1, 0);

    window.addEventListener('resize', onWindowResize);

    // stats
    stats = new Stats();
    container.appendChild(stats.dom);

    // joystick = new JoyStick({
    //     onMove: joystickCallback
    // });

}



function createGUI(model, animations) {

    const states = ['Idle', 'Walking', 'Running', 'Dance', 'Death', 'Sitting', 'Standing'];
    const emotes = ['Jump', 'Yes', 'No', 'Wave', 'Punch', 'ThumbsUp'];

    gui = new GUI();

    mixer = new THREE.AnimationMixer(model);

    actions = {};

    for (let i = 0; i < animations.length; i++) {

        const clip = animations[i];
        const action = mixer.clipAction(clip);
        actions[clip.name] = action;

        if (emotes.indexOf(clip.name) >= 0 || states.indexOf(clip.name) >= 4) {

            action.clampWhenFinished = true;
            action.loop = THREE.LoopOnce;

        }

    }

    // states

    // const statesFolder = gui.addFolder('States');

    // const clipCtrl = statesFolder.add(api, 'state').options(states);

    // clipCtrl.onChange(function () {

    //     fadeToAction(api.state, 0.5);

    // });

    // statesFolder.open();

    // // emotes

    // const emoteFolder = gui.addFolder('Emotes');

    // function createEmoteCallback(name) {

    //     api[name] = function () {

    //         fadeToAction(name, 0.2);

    //         mixer.addEventListener('finished', restoreState);

    //     };

    //     emoteFolder.add(api, name);

    // }

    function restoreState() {

        mixer.removeEventListener('finished', restoreState);

        fadeToAction(api.state, 0.2);

    }

    // for (let i = 0; i < emotes.length; i++) {

    //     createEmoteCallback(emotes[i]);

    // }

    // emoteFolder.open();

    // // expressions

    // face = model.getObjectByName('Head_4');

    // const expressions = Object.keys(face.morphTargetDictionary);
    // const expressionFolder = gui.addFolder('Expressions');

    // for (let i = 0; i < expressions.length; i++) {

    //     expressionFolder.add(face.morphTargetInfluences, i, 0, 1, 0.01).name(expressions[i]);

    // }

    activeAction = actions['Idle'];
    activeAction.play();

    // expressionFolder.open();

}

let keys = {
    65: false,//a
    83: false,//s
    82: false,//r
    87: false,//w
    32: false,//space
    16: false,//shift
};

document.body.addEventListener('keydown', function (e) {

    const key = e.keyCode
    if (keys[key] !== undefined)
        keys[key] = true;

});
document.body.addEventListener('keyup', function (e) {

    const key = e.keyCode
    if (keys[key] !== undefined)
        keys[key] = false;

});





function fadeToAction(name, duration, jump) {

    previousAction = activeAction;
    activeAction = actions[name];
    activeActionName = name;



    if (previousAction !== activeAction) {

        previousAction.fadeOut(duration);

    }

    activeAction
        .reset()
        .setEffectiveTimeScale(1)
        .setEffectiveWeight(1)
        .fadeIn(duration)
        .play();

}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

}
let velocity = 0
let moveModel = () => {
    speed = 0.0;

    if (keys[87]) {
        speed = 0.4;
        if (activeActionName != 'Running') {
            fadeToAction('Running', 0.1)
        }
    }
    else if (keys[82]) {
        speed = -0.4;
        if (activeActionName == 'Running') {
            fadeToAction('Idle', 0.1)
        }
    }
    else {
        if (activeActionName == 'Running') {
            fadeToAction('Idle', 0.1)
        }
    }

    velocity += (speed - velocity);
    model.translateZ(velocity);

    if (keys[65])
        model.rotateY(0.02);
    else if (keys[83])
        model.rotateY(-0.02);


    if (keys[32]) {
        gsap.to(model.position, { duration: 0.3, y: 1, ease: 'linear', delay: 0.2, onComplete: () => {gsap.to(model.position, { duration: 0.3, y: 0, ease: 'linear'})}})
        if(activeActionName === 'Running')  fadeToAction('Jump', 0, false)
        
    }

}

let updateCamera = () => {
    // camera.position.lerp(followCam.getWorldPosition(new THREE.Vector3()), 0.1);
    // camera.position.copy(followCam.getWorldPosition(new THREE.Vector3()));

    // camera.position.set(model.position.x, model.position.y + 15, model.position.z - 15)
    camera.lookAt(model.position);

}

function animate() {

    const dt = clock.getDelta();

    if (mixer) mixer.update(dt);

    if (model) {
        updateCamera()
        moveModel()
    }


    requestAnimationFrame(animate);

    renderer.render(scene, camera);

    stats.update();

}




init();
animate();
