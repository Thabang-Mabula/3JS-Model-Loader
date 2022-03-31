/**
 * File used for definting the Model Class (for modelling the properties and functionality of
 * the 3D Object on the screen) and the VISTAS enum (which provides a convenient way for specifying
 * all standard vistas in one place)
 *
 */

import { Vector3 } from './three.module.js'
/**
 * Enum storing the different rotation angles (a.k.a. vistas)
 * for the model.
 *
 * The angles are entered in euclidean degrees, for convenience.
 * The model class will automatically convert the degrees to radians.
 */
const VISTAS = {
  FRONTAL: new Vector3(0, 0, 0),
  TRANSERA: new Vector3(90, 90, 0),
  IZQUIERO: new Vector3(90, 90, 90),
  DERECHA: new Vector3(180, 180, 180),
  ARRIBA: new Vector3(0, 0, 180),
  ABAJO: new Vector3(90, 180, 0),
  ISOMETRICA: new Vector3(30, 30, 0)
}

/**
 * Class for modelling properties and methods for a loaded .glb or .gltf model
 */
class Model {
  /**
       * Default constructor
       */
  constructor () {
    this._object = new THREE.Object3D()
    this._vista = VISTAS.FRONTAL
    this._modo = {
      sombreado: true,
      alambre: false,
      transperante: false,
      bordes: false
    }
    /**
         * Keeps track of the previous modo of the object
         * This is used in the updateModo() function to prevent
         * multple re-rendering of the current modo
         */
    this._modoOldState = {
      sombreado: true,
      alambre: false,
      transperante: false,
      bordes: false
    }

    this._viewChange = false
  }

  /**
     * Assign a loaded 3D object (THREE.Object3D) to the class
     * @param {THREE.Object3D} obj An Object3D object
     */
  set object (obj) {
    this._object = obj
  }

  /**
     * Return the loaded 3D object (THREE.Object3D) that the class controls
     * @returns {THREE.Object3D} The loaded 3D object (THREE.Object3D) that the class controls
     */
  get object () {
    return this._object
  }

  /**
     * Sets the rotation/vista of the model
     * @param {THREE.Vector3} orientation A 3D vetor specifying the desired rotation fo the model
     */
  set vista (orientation) {
    this._vista = orientation
    this._viewChange = true
  }

  /**
     * Class helper function for converting euclideans degrees into radians
     * @param {number} degrees Euclidean degrees to be converted into radians
     */
  _degreesToRadians (degrees) {
    let radians = degrees * (Math.PI / 180)
    return radians
  }

  /**
     * Class helper function for setting the rotation of the object to a
     * specified direction
     */
  _updateRotation (camera) {
    // Ensure that rotation is only changed if a new vista has been specified
    if (this._viewChange) {
      let defaultDir = new Vector3(0, 0, 0)
      let pos = new Vector3()
      pos.addVectors(defaultDir, this._object.position)
      this._object.lookAt(camera.position)

      let worldAxisX = new Vector3(1, 0, 0)
      this._object.rotateOnAxis(worldAxisX, this._vista.x)
      let worldAxisY = new Vector3(0, 1, 0)
      this._object.rotateOnAxis(worldAxisY, this._vista.y)
      let worldAxisZ = new Vector3(0, 0, 1)
      this._object.rotateOnAxis(worldAxisZ, this._vista.z)

      this._viewChange = false
    }
  }

  /**
     * Setter specifying whether the alambre modo should be activated or not
     * @param {boolean} Boolean specifying whether alambre modo should be activated.
     * 'true' indicates that it should be activated, 'false' indicates that it should
     * be deactivated
     */
  set alambre (boolean) {
    this._modo.alambre = boolean
  }

  /**
     * Return a boolean value inidcating whether the alambre modo is currently activated
     * @returns {bool} A boolean value inidcating whether the alambre modo is currently activated
     */
  get alambre () {
    return this._modo.alambre
  }

  /**
     * Setter specifying whether the transparente modo should be activated or not
     * @param {boolean} Boolean specifying whether transparente modo should be activated.
     * 'true' indicates that it should be activated, 'false' indicates that it should
     * be deactivated
     */
  set transparente (boolean) {
    this._modo.transperante = boolean
  }

  /**
     * Return a boolean value inidcating whether the transparente modo is currently activated
     * @returns {bool} A boolean value inidcating whether the transparente modo is currently activated
     */
  get transparente () {
    return this._modo.transperante
  }

  /**
     * Setter specifying whether the sombreado modo should be activated or not
     * @param {boolean} Boolean specifying whether sombreado modo should be activated.
     * 'true' indicates that it should be activated, 'false' indicates that it should
     * be deactivated
     */
  set sombreado (boolean) {
    this._modo.sombreado = boolean
  }

  /**
     * Return a boolean value inidcating whether the sombreado modo is currently activated
     * @returns {bool} A boolean value inidcating whether the sombreado modo is currently activated
     */
  get sombreado () {
    return this._modo.sombreado
  }

  /**
     * Class helper function for updating the loaded Object3D to be presented in the desired
     * modo
     * @param {THREE.Scene} scene The current animation scene
     */
  _updateModo (scene) {
    if (this._modo.alambre !== this._modoOldState.alambre) {
      if (this._modo.alambre) {
        this._object.traverse(function (child) {
          if (child.isMesh) {
            // Setup our wireframe
            const wireframeGeometry = new THREE.WireframeGeometry(child.geometry)
            const wireframeMaterial = new THREE.LineBasicMaterial({ color: 0xEFEFEF })
            const wireframe = new THREE.LineSegments(wireframeGeometry, wireframeMaterial)

            wireframe.name = 'wireframe'
            child.add(wireframe)
          }
        })
      } else {
        this._object.traverse(function (child) {
          if (child.isMesh) {
            child.remove(child.getObjectByName('wireframe'))
          }
        })
      }
      this._modoOldState.alambre = this._modo.alambre
    }

    /**
             *  Check if the transparency state has changed in order to ensure
             * that the model material isn't updated uneccesarily every time
             * the update function is called.
             * Also, Sombreado must be true for the transparency to be changed
             */

    if (this._modo.transperante !== this._modoOldState.transperante && this._modo.sombreado) {
      if (this._modo.transperante) {
        this._object.traverse(function (child) {
          if (child.isMesh) {
            child.material.transparent = true
            child.material.opacity = 0.4
          }
        })
      } else {
        this._object.traverse(function (child) {
          if (child.isMesh) {
            child.material.transparent = false
            child.material.opacity = 0
          }
        })
      }
      this._modoOldState.transperante = this._modo.transperante
    }

    if (this._modo.sombreado !== this._modoOldState.sombreado) {
      console.log('sombreado function called!')
      if (!(this._modo.sombreado)) {
        this._object.traverse(function (child) {
          if (child.isMesh) {
            child.material.transparent = true
            child.material.opacity = 0
          }
        })
        // Disabling transparency
        this._modoOldState.transperante = false
      } else {
        this._object.traverse(function (child) {
          if (child.isMesh) {
            child.material.transparent = false
            child.material.opacity = 1
          }
        })
      }
      this._modoOldState.sombreado = this._modo.sombreado
    }
  }

  /**
     * Updates the model to appear in the current desired modo and vista.
     * This function is to be called during the animation loop.
     * @param {THREE.Scene} scene The current animation scene
     */
  updateModel (scene, camera) {
    this._updateRotation(camera)
    this._updateModo(scene)
  }
}

export { Model, VISTAS }
