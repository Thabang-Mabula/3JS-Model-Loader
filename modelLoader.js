import {
  PerspectiveCamera,
  WebGLRenderer,
  Scene,
  Color,
  AmbientLight,
  PointLight,
  Vector3,
  Box3
} from './three.module.js'

import { Model } from './modelClass.js'

// Global reference to the loaded model so that other functions can manipulate it
var modelObj = new Model()

/**
 * Configures user interaction and manipualtion of the view of the scene
 * @param {THREE.PerspectiveCamera} camera The main camera of the renderer
 * @param {THREE.PointLight} pointLight The main point light used to create shadow 3D effect when viewing model
 */
let enableOrbitalControls = (camera, pointLight) => {
  var controls = new THREE.OrbitControls(camera, document.querySelector('body'))
  controls.enableZoom = true
  controls.addEventListener('change', () => {
    pointLight.position.copy(camera.position)
  })

  return controls
}

/**
 * Re-adjusts the camera and render size automatically whenever the browser window size is adjusted
 * @param {THREE.PerspectiveCamera} camera The main camera of the renderer
 * @param {THREE.WebGLRenderer} renderer The main webGL renderer
 */
let enableResizeAdjust = (camera, renderer) => {
  window.addEventListener('resize', () => {
    let width = window.innerWidth
    let height = window.innerHeight
    renderer.setSize(width, height)
    camera.aspect = width / height
    camera.updateProjectionMatrix()
  })
}

/**
   * Retrieves a specified .glb or .gltf file and renders it to the screen
   * @param {string} filename The name of the file with the extension (e.g. '3DModel.glb')
   * @param {THREE.PerspectiveCamera} camera The main camera of the renderer
   */
let getModel = async (filename, camera) => {
  var loader = new THREE.GLTF2Loader()

  loader.load('./models/' + filename, gltf => {
    let model = gltf.scene
    model.scale.set(2, 2, 2)

    const box = new THREE.Box3().setFromObject(model)
    const size = box.getSize(new THREE.Vector3()).length()
    const center = box.getCenter(new THREE.Vector3())

    model.position.x += (model.position.x - center.x)
    model.position.y += (model.position.y - center.y)
    model.position.z += (model.position.z - center.z)

    camera.near = size / 100
    camera.far = size * 100
    camera.updateProjectionMatrix()

    return Promise.resolve(model)
    // return model
  }, undefined, function (error) {
    console.error(error)
  })
}

/**
 * Creates and returns a pre-configured perspective camera
 * @returns {THREE.PerspectiveCamera}
 */
let createCamera = () => {
  let camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
  camera.position.set(100, 100, 100)
  camera.lookAt(new Vector3(0, 0, 0))
  return camera
}

/**
 * Creates and returns a pre-configured webGL renderer
 * @returns {THREE.WebGLRenderer}
 */
let createRenderer = () => {
  let renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setSize(window.innerWidth, window.innerHeight)
  return renderer
}

var clock = new THREE.Clock()
/**
 * Function used to configure a webpage to display a specified 3D Model
 * @param {string} filename The name of the file with the extension (e.g. '3DModel.glb')
 */
let displayModelOnWebpage = (filename, displayDOMElement) => {
  $(document).ready(async function () {
    const scene = new Scene()

    const camera = createCamera()
    const renderer = createRenderer()
    enableResizeAdjust(camera, renderer)
    document.body.appendChild(renderer.domElement)

    // Add ambient lighting
    var ambientLight = new AmbientLight(0xffffff, 0.2)
    scene.add(ambientLight)

    // Add point light
    var pointLight = new PointLight(0xababab, 1)
    pointLight.position.set(1000, 1000, 0)
    scene.add(pointLight)

    // Add the model
    var loader = new THREE.GLTFLoader()
    var mixer = {}
    // let controls = enableOrbitalControls(camera, scene)
    let loaderPromise = new Promise((resolve, reject) => {
      loader.load('./models/' + filename, gltf => {
        let model = gltf.scene
        model.scale.set(20, 20, 20)

        const box = new THREE.Box3().setFromObject(model)
        const size = box.getSize(new THREE.Vector3()).length()
        const center = box.getCenter(new THREE.Vector3())

        model.position.x += (model.position.x - center.x)
        model.position.y += (model.position.y - center.y)
        model.position.z += (model.position.z - center.z)

        camera.near = size / 10
        camera.far = size * 10
        camera.updateProjectionMatrix()
        // controls.update()
        model.lookAt(camera.position)
        modelObj.object = model
        mixer = new THREE.AnimationMixer(model)
        scene.add(modelObj.object)
        var clip = THREE.AnimationClip.findByName(gltf.animations, 'CubeAction')
        var action = mixer.clipAction(clip)
        action.play()

        // controls.center = new THREE.Vector3(
        //   model.position.x,
        //   model.position.y,
        //   model.position.z
        // )

        //
        resolve(model)
      }, undefined, function (error) {
        console.error(error)
      })
    })

    loaderPromise.then(animate)

    function animate () {
      requestAnimationFrame(animate)
      // controls.update()
      let delta = clock.getDelta()
      mixer.update(delta)
      modelObj.updateModel(scene, camera)
      renderer.render(scene, camera)
    }
  })
}

// /**
//  * This code is merely put here as an example o how the "displayModelOnWebpage" function should be used.
//  * If this function is imported and used in another Javascript file, the line of code below must be deleted.
//  */
// displayModelOnWebpage('exported (2).glb')

/**
   * This function is exported to allow other client-side JavaScript files to import
   * the function and use it to configure the page for displaing a 3D Model (.glb or .gltf)
   */
export { displayModelOnWebpage }
