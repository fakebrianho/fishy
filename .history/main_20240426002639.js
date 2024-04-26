import './style.css'
import * as THREE from 'three'
import { addBoilerPlateMesh, addStandardMesh } from './addMeshes'
import { addLight } from './addLights'
import Model from './Model'
import Clickable from './Clickable'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import gsap from 'gsap'
import { ThreeMFLoader } from 'three/examples/jsm/Addons.js'

const scene = new THREE.Scene()
const renderer = new THREE.WebGLRenderer({ antialias: true })
const camera = new THREE.PerspectiveCamera(
	75,
	window.innerWidth / window.innerHeight,
	0.1,
	100
)
camera.position.set(0, 0, 5)

//Raycast
const pointer = new THREE.Vector2()
const raycaster = new THREE.Raycaster()

//Current Active
let activeScene = { name: null, light: null }

//Globals
const meshes = {}
const lights = {}
const mixers = []
const clock = new THREE.Clock()
const controls = new OrbitControls(camera, renderer.domElement)
const interactables = []
const defaultPosition = new THREE.Vector3(0, 0, 5)

init()
function init() {
	renderer.setSize(window.innerWidth, window.innerHeight)
	document.body.appendChild(renderer.domElement)

	//meshes
	meshes.default = addBoilerPlateMesh()
	meshes.standard = addStandardMesh()

	//lights
	lights.defaultLight = addLight()

	//scene operations
	scene.add(meshes.default)
	scene.add(meshes.standard)
	scene.add(lights.defaultLight)

	addInteraction()
	raycast()
	models()
	resize()
	animate()
}

function models() {
	const akMag = new Model({
		name: 'mag',
		scene: scene,
		meshes: meshes,
		url: 'AKmag.glb',
		replace: false,
		scale: new THREE.Vector3(0.1, 0.1, 0.1),
		mixers: mixers,
		animationState: true,
		//positions: new THREE.pvector.Vectors(-0.2, -1, 0)
	})
	akMag.init()
}

function raycast() {
	window.addEventListener('click', (event) => {
		pointer.x = (event.clientX / window.innerWidth) * 2 - 1
		pointer.y = -(event.clientY / window.innerHeight) * 2 + 1
		raycaster.setFromCamera(pointer, camera)
		console.log(interactables)

		const intersects = raycaster.intersectObjects(interactables, true)
		for (let i = 0; i < intersects.length; i++) {
			const object = intersects[0].object.parent
			if (object.userData.name === activeScene.name) {
				deactivate(object.userData.name, object)
			} else {
				activate(object.userData.name, object)
				activeScene.name = object.userData.name
				activeScene.light = object
			}
		}
	})
}

function reveal(name) {
	if (name == 'top') {
		gsap.to('.top', {
			opacity: 1,
			duration: 3,
		})
	}
}

function resize() {
	window.addEventListener('resize', () => {
		renderer.setSize(window.innerWidth, window.innerHeight)
		camera.aspect = window.innerWidth / window.innerHeight
		camera.updateProjectionMatrix()
	})
}

function animate() {
	requestAnimationFrame(animate)
	const delta = clock.getDelta()

	meshes.default.rotation.x += 0.01
	meshes.default.rotation.z += 0.01

	meshes.standard.rotation.x += 0.01
	meshes.standard.rotation.z += 0.01

	// meshes.default.scale.x += 0.01
	for (const mixer of mixers) {
		mixer.update(delta)
	}

	renderer.render(scene, camera)
}

function deactivate(modalName, light) {
	light.intensity = 0
	light.activate = false
	moveTarget({ x: 0, y: 0, z: 0 })
	moveCamera(defaultPosition, undefined)
}

function activate(modalName, light) {
	light.intensity = 1
	light.activate = true
	moveTarget({ ...light.position })
	moveCamera(light.userData.lookAt, modalName)
}

function moveTarget({ x, y, z }) {
	gsap.to(controls.target, {
		x: x,
		y: y - 1.0,
		z: z,
		duration: 2,
		ease: 'power3.inOut',
		onUpdate: () => {
			controls.update()
		},
	})
}

function moveCamera(position, targetName) {
	if (targetName === undefined) {
		gsap.to(camera.position, {
			x: position.x,
			y: position.y,
			z: position.z,
			duration: 2,
			ease: 'power3.inOut',
		})
	}
	gsap.to(camera.position, {
		x: position.x,
		y: position.y,
		z: position.z,
		duration: 2,
		ease: 'power3.inOut',
	})
}

function addInteraction() {
	const tagLatches = new Clickable({
		intensity: 0,
		scene: scene,
		lights: lights,
		name: 'tagLatches',
		position: new THREE.Vector3(1.108, 1.443, -0.916),
		lookPosition: new THREE.Vector3(2.354, 1.927, -1.717),
		container: interactables,
	})
	tagLatches.init()

	const tagTop = new Clickable({
		intensity: 0,
		scene: scene,
		lights: lights,
		name: 'tagTop',
		position: new THREE.Vector3(0.379, 2.218, -0.163),
		lookPosition: new THREE.Vector3(1.747, 3.573, 0.688),
		lookRotation: new THREE.Vector3(-62.16, 58.25, 36.02),
		container: interactables,
	})
	tagTop.init()
}
