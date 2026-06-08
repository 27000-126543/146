import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer.js'

export class SceneManager {
  public scene: THREE.Scene
  public camera: THREE.PerspectiveCamera
  public renderer: THREE.WebGLRenderer
  public labelRenderer: CSS2DRenderer
  public controls: OrbitControls
  public clock: THREE.Clock
  public container: HTMLElement
  public raycaster: THREE.Raycaster
  public mouse: THREE.Vector2
  public windowObjects: THREE.Object3D[] = []
  public personnelObjects: THREE.Object3D[] = []

  private animationFrameId: number | null = null
  private onAnimationFrame: ((delta: number) => void) | null = null

  constructor(container: HTMLElement) {
    this.container = container
    this.clock = new THREE.Clock()
    this.raycaster = new THREE.Raycaster()
    this.mouse = new THREE.Vector2()

    this.scene = new THREE.Scene()
    this.scene.background = new THREE.Color(0x0a1628)
    this.scene.fog = new THREE.Fog(0x0a1628, 30, 60)

    const width = container.clientWidth
    const height = container.clientHeight

    this.camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000)
    this.camera.position.set(0, 25, 20)
    this.camera.lookAt(0, 0, 0)

    this.renderer = new THREE.WebGLRenderer({ antialias: true })
    this.renderer.setSize(width, height)
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping
    this.renderer.toneMappingExposure = 1.2

    this.labelRenderer = new CSS2DRenderer()
    this.labelRenderer.setSize(width, height)
    this.labelRenderer.domElement.style.position = 'absolute'
    this.labelRenderer.domElement.style.top = '0'
    this.labelRenderer.domElement.style.left = '0'
    this.labelRenderer.domElement.style.pointerEvents = 'none'

    container.appendChild(this.labelRenderer.domElement)
    container.appendChild(this.renderer.domElement)

    this.controls = new OrbitControls(this.camera, this.renderer.domElement)
    this.controls.enableDamping = true
    this.controls.dampingFactor = 0.05
    this.controls.maxPolarAngle = Math.PI / 2.1
    this.controls.minDistance = 10
    this.controls.maxDistance = 50
    this.controls.target.set(0, 0, 0)

    this.setupLights()
    this.setupEventListeners()
  }

  private setupLights() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4)
    this.scene.add(ambientLight)

    const mainLight = new THREE.DirectionalLight(0xffffff, 0.8)
    mainLight.position.set(10, 20, 10)
    mainLight.castShadow = true
    mainLight.shadow.mapSize.width = 2048
    mainLight.shadow.mapSize.height = 2048
    mainLight.shadow.camera.near = 0.5
    mainLight.shadow.camera.far = 50
    mainLight.shadow.camera.left = -20
    mainLight.shadow.camera.right = 20
    mainLight.shadow.camera.top = 20
    mainLight.shadow.camera.bottom = -20
    this.scene.add(mainLight)

    const fillLight = new THREE.DirectionalLight(0x88aaff, 0.3)
    fillLight.position.set(-10, 15, -10)
    this.scene.add(fillLight)

    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        const pointLight = new THREE.PointLight(0xffffff, 0.5, 20)
        pointLight.position.set(i * 8, 6, j * 8)
        pointLight.castShadow = false
        this.scene.add(pointLight)
      }
    }
  }

  private setupEventListeners() {
    window.addEventListener('resize', this.handleResize.bind(this))
  }

  private handleResize() {
    const width = this.container.clientWidth
    const height = this.container.clientHeight
    this.camera.aspect = width / height
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(width, height)
    this.labelRenderer.setSize(width, height)
  }

  public setAnimationCallback(callback: (delta: number) => void) {
    this.onAnimationFrame = callback
  }

  public startAnimation() {
    const animate = () => {
      this.animationFrameId = requestAnimationFrame(animate)
      const delta = this.clock.getDelta()
      this.controls.update()
      if (this.onAnimationFrame) {
        this.onAnimationFrame(delta)
      }
      this.renderer.render(this.scene, this.camera)
      this.labelRenderer.render(this.scene, this.camera)
    }
    animate()
  }

  public stopAnimation() {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId)
      this.animationFrameId = null
    }
  }

  public getIntersectedObject(event: MouseEvent): THREE.Intersection | null {
    const rect = this.renderer.domElement.getBoundingClientRect()
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
    this.raycaster.setFromCamera(this.mouse, this.camera)
    const intersects = this.raycaster.intersectObjects([...this.windowObjects, ...this.personnelObjects], true)
    return intersects.length > 0 ? intersects[0] : null
  }

  public focusOnObject(position: THREE.Vector3) {
    const target = position.clone()
    this.controls.target.copy(target)
    const offset = new THREE.Vector3(0, 8, 8)
    this.camera.position.copy(target).add(offset)
  }

  public dispose() {
    this.stopAnimation()
    window.removeEventListener('resize', this.handleResize.bind(this))
    this.renderer.dispose()
    this.container.removeChild(this.renderer.domElement)
    this.container.removeChild(this.labelRenderer.domElement)
  }
}
