// let matrix = [];
// let sizeX = 64,
//     sizeY = 64;

// for (let i = 0; i < sizeX; i++) {
//     matrix.push([]);
//     for (var j = 0; j < sizeY; j++) {
//         // var height = Math.cos(i / sizeX * Math.PI * 5) * Math.cos(j / sizeY * Math.PI * 5) * 2 + 2;
//         let height = 0
//         if (i === 0 || i === sizeX - 1 || j === 0 || j === sizeY - 1)
//             height = 1;
//         matrix[i].push(height);
//     }
// }

// var hfShape = new CANNON.Heightfield(matrix, {
//     elementSize: 100 / sizeX,

// });
// hfBody.position.set(-sizeX * hfShape.elementSize / 2, -4, sizeY * hfShape.elementSize / 2);



// let reduceForwardFunc = () => {
//     forwardMain -= 0.01
//     joystickCallback(forwardMain, turnMain)

//     if (forwardMain <= 0) {
//         forwardMain = 0
//         joystickCallback(forwardMain, turnMain)

//         clearInterval(reduceForward)
//     }

// }

// let incForwardFunc = () => {
//     forwardMain += 0.01
//     joystickCallback(forwardMain, turnMain)
//     console.log("inc")
//     if (forwardMain >= 0) {
//         forwardMain = 0
//         joystickCallback(forwardMain, turnMain)
//         clearInterval(incForward)

//     }

// }





// class Game {
// constructor () {
//     // if (!Detector.webgl) Detector.addGetWebGLMessage();

//     this.container;
//     this.camera;
//     this.scene;
//     this.renderer;
//     this.fixedTimeStep = 1.0 / 60.0;

//     this.container = document.createElement('div');
//     this.container.style.height = '100%';
//     document.body.appendChild(this.container);

//     const game = this;

//     this.js = { forward: 0, turn: 0 };
//     this.clock = new THREE.Clock();

//     this.init();

//     window.onError = function (error) {
//         console.error(JSON.stringify(error));
//     }

//     this.maxSteerVal = 0.5;
//     this.maxForce = 500;
//     this.brakeForce = 20;
// }

// init() {
//     this.camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 1, 2000);
//     this.camera.position.set(10, 15, 10);

//     this.scene = new THREE.Scene();
//     this.scene.background = new THREE.Color(0xa0a0a0);

//     this.renderer = new THREE.WebGLRenderer({ antialias: true });
//     this.renderer.setPixelRatio(window.devicePixelRatio);
//     this.renderer.setSize(window.innerWidth, window.innerHeight);
//     this.renderer.shadowMap.enabled = true;
//     this.container.appendChild(this.renderer.domElement);

//     this.helper = new CannonHelper(this.scene);
//     this.helper.addLights(this.renderer);

//     window.addEventListener('resize', function () { game.onWindowResize(); }, false);

//     // new THREE.OrbitControls(this.camera, this.renderer.domElement)

//     // stats
//     // if (this.debug) {
//     //     this.stats = new Stats();
//     //     this.container.appendChild(this.stats.dom);
//     // }






//     if (window.innerWidth < 800) {
//         this.joystick = new JoyStick({
//             game: this,
//             onMove: this.joystickCallback
//         });
//     }
//     else {
//         document.addEventListener('keydown', this.handler);
//         document.onkeyup = this.handler;
//     }


//     this.initPhysics();
// }



// initPhysics() {
//     this.physics = {};
//     this.prevForward = 0
//     this.prevTurn = 0
//     this.world = new CANNON.World();

//     this.world.broadphase = new CANNON.SAPBroadphase(this.world);
//     this.world.gravity.set(0, -20, 0);
//     this.world.defaultContactMaterial.friction = 0;

//     const groundMaterial = new CANNON.Material("groundMaterial");
//     const wheelMaterial = new CANNON.Material("wheelMaterial");
//     const wheelGroundContactMaterial = new CANNON.ContactMaterial(wheelMaterial, groundMaterial, {
//         friction: 0.3,
//         restitution: 0,
//         contactEquationStiffness: 1000
//     });

//     // We must add the contact materials to the this.world
//     this.world.addContactMaterial(wheelGroundContactMaterial);

//     let shape = new CANNON.Plane()
//     let groundBody = new CANNON.Body({ mass: 0 });
//     groundBody.addShape(shape);
//     groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
//     this.world.add(groundBody);
//     this.helper.addVisual(groundBody, 'landscape', false, false, new THREE.MeshBasicMaterial({ vertexColors: THREE.VertexColors }));
//     this.addcar()
//     this.animate();
// }

// addcar() {
//     let game = this
//     const chassisMaterial = new CANNON.Material("groundMaterial");
//     const chassisShape = new CANNON.Box(new CANNON.Vec3(1, 0.5, 2), new CANNON.Vec3(1, 0.5, 2));
//     const chassisBody = new CANNON.Body({ mass: 150, material: chassisMaterial });
//     chassisBody.addShape(chassisShape);
//     chassisBody.position.set(0, 4, 0);
//     this.helper.addVisual(chassisBody, 'car');


//     const options = {
//         radius: 0.5,
//         directionLocal: new CANNON.Vec3(0, -1, 0),
//         suspensionStiffness: 30,
//         suspensionRestLength: 0.3,
//         frictionSlip: 5,
//         dampingRelaxation: 2.3,
//         dampingCompression: 4.4,
//         maxSuspensionForce: 100000,
//         rollInfluence: 0.01,
//         axleLocal: new CANNON.Vec3(-1, 0, 0),
//         chassisConnectionPointLocal: new CANNON.Vec3(1, 1, 0),
//         maxSuspensionTravel: 0.3,
//         customSlidingRotationalSpeed: -30,
//         useCustomSlidingRotationalSpeed: true
//     };

//     // Create the vehicle
//     const vehicle = new CANNON.RaycastVehicle({
//         chassisBody: chassisBody,
//         indexRightAxis: 0,
//         indexUpAxis: 1,
//         indeForwardAxis: 2
//     });

//     options.chassisConnectionPointLocal.set(1, 0, -1);
//     vehicle.addWheel(options);

//     options.chassisConnectionPointLocal.set(-1, 0, -1);
//     vehicle.addWheel(options);

//     options.chassisConnectionPointLocal.set(1, 0, 1);
//     vehicle.addWheel(options);

//     options.chassisConnectionPointLocal.set(-1, 0, 1);
//     vehicle.addWheel(options);

//     vehicle.addToWorld(this.world);
//     const wheelMaterial = new CANNON.Material("wheelMaterial");

//     const wheelBodies = [];
//     vehicle.wheelInfos.forEach(function (wheel) {
//         const cylinderShape = new CANNON.Cylinder(wheel.radius, wheel.radius, wheel.radius / 2, 20);
//         const wheelBody = new CANNON.Body({ mass: 1, material: wheelMaterial });
//         const q = new CANNON.Quaternion();
//         q.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), Math.PI / 2);
//         wheelBody.addShape(cylinderShape, new CANNON.Vec3(), q);
//         wheelBodies.push(wheelBody);
//         game.helper.addVisual(wheelBody, 'wheel');
//     });


//     // Update wheels
//     this.world.addEventListener('postStep', function () {
//         let index = 0;
//         game.vehicle.wheelInfos.forEach(function (wheel) {
//             game.vehicle.updateWheelTransform(index);
//             const t = wheel.worldTransform;
//             wheelBodies[index].threemesh.position.copy(t.position);
//             wheelBodies[index].threemesh.quaternion.copy(t.quaternion);
//             index++;
//         });
//     });

//     this.vehicle = vehicle;

//     this.followCam = new THREE.Object3D();
//     this.followCam.position.copy(this.camera.position);
//     this.scene.add(this.followCam);
//     this.followCam.parent = chassisBody.threemesh;
//     this.helper.shadowTarget = chassisBody.threemesh;
// }


// handler(event) {
//     let up = (event.type == 'keyup');

//     if (!up && event.type !== 'keydown') {
//         return;
//     }

//     switch (event.keyCode) {

//         case 38: // forward
//             game.prevForward = up ? 0 : game.prevForward >= 1 ? 1 : game.prevForward + 1
//             break;

//         case 40: // backward
//             game.prevForward = up ? 0 : game.prevForward <= -1 ? -1 : game.prevForward - 1
//             break;

//         case 39: // right
//             game.prevTurn = up ? 0 : 1
//             break;

//         case 37: // left
//             game.prevTurn = up ? 0 : -1
//             break;
//     }
//     game.joystickCallback(game.prevForward, game.prevTurn)
// }

// joystickCallback(forward, turn) {
//     this.js.forward = forward;
//     this.js.turn = -turn;
// }

// updateDrive(forward = this.js.forward, turn = this.js.turn) {

//     const force = this.maxForce * forward;
//     const steer = this.maxSteerVal * turn;

//     if (forward != 0) {
//         this.vehicle.setBrake(0, 0);
//         this.vehicle.setBrake(0, 1);
//         this.vehicle.setBrake(0, 2);
//         this.vehicle.setBrake(0, 3);

//         this.vehicle.applyEngineForce(force, 2);
//         this.vehicle.applyEngineForce(force, 3);
//     } else {
//         this.vehicle.setBrake(this.brakeForce, 0);
//         this.vehicle.setBrake(this.brakeForce, 1);
//         this.vehicle.setBrake(this.brakeForce, 2);
//         this.vehicle.setBrake(this.brakeForce, 3);
//     }

//     this.vehicle.setSteeringValue(steer, 0);
//     this.vehicle.setSteeringValue(steer, 1);
// }



// updateCamera() {
//     this.camera.position.lerp(this.followCam.getWorldPosition(new THREE.Vector3()), 0.05);
//     this.camera.lookAt(this.vehicle.chassisBody.threemesh.position);
//     if (this.helper.sun != undefined) {
//         this.helper.sun.position.copy(this.camera.position);
//         this.helper.sun.position.y += 10;
//     }
// }

// animate() {
//     const game = this;

//     requestAnimationFrame(function () { game.animate(); });

//     const now = Date.now();
//     if (this.lastTime === undefined) this.lastTime = now;
//     const dt = (Date.now() - this.lastTime) / 1000.0;
//     this.FPSFactor = dt;
//     this.lastTime = now;

//     this.world.step(this.fixedTimeStep, dt);
//     this.helper.updateBodies(this.world);

//     this.updateDrive();
//     this.updateCamera();

//     this.renderer.render(this.scene, this.camera);

//     if (this.stats != undefined) this.stats.update();

// }
// }


// document.addEventListener("DOMContentLoaded", function () {
//     const game = new Game();
//     window.game = game;//For debugging only
// });