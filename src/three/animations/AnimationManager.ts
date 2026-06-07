import * as THREE from 'three'
import * as TWEEN from '@tweenjs/tween.js'
import type { Position3D } from '../../types'

abstract class BaseAnimation {
  public abstract update(delta: number): void
  public abstract dispose(): void
}

export class GuideLineAnimation extends BaseAnimation {
  private mesh: THREE.Mesh | null = null
  private material: THREE.MeshBasicMaterial | null = null
  private curve: THREE.CatmullRomCurve3 | null = null
  private texture: THREE.CanvasTexture | null = null
  private startTime: number = 0
  private duration: number = 15000
  private disposed: boolean = false

  constructor(scene: THREE.Scene, start: Position3D, end: Position3D) {
    super()
    this.startTime = Date.now()
    this.createGuideLine(scene, start, end)
  }

  private createGuideLine(scene: THREE.Scene, start: Position3D, end: Position3D) {
    const startVec = new THREE.Vector3(start.x, start.y, start.z)
    const endVec = new THREE.Vector3(end.x, end.y, end.z)
    const midVec = new THREE.Vector3().addVectors(startVec, endVec).multiplyScalar(0.5)
    midVec.y += 2

    const points = [startVec, midVec, endVec]
    this.curve = new THREE.CatmullRomCurve3(points)

    const tubeGeometry = new THREE.TubeGeometry(this.curve, 64, 0.05, 8, false)

    const canvas = document.createElement('canvas')
    canvas.width = 256
    canvas.height = 32
    const ctx = canvas.getContext('2d')!
    const gradient = ctx.createLinearGradient(0, 0, 256, 0)
    gradient.addColorStop(0, 'rgba(0, 255, 255, 0.1)')
    gradient.addColorStop(0.5, 'rgba(0, 255, 255, 1)')
    gradient.addColorStop(1, 'rgba(0, 255, 255, 0.1)')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 256, 32)

    this.texture = new THREE.CanvasTexture(canvas)
    this.texture.wrapS = THREE.RepeatWrapping
    this.texture.wrapT = THREE.RepeatWrapping
    this.texture.repeat.set(3, 1)

    this.material = new THREE.MeshBasicMaterial({
      map: this.texture,
      color: 0x00ffff,
      transparent: true,
      opacity: 0.9,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    })

    this.mesh = new THREE.Mesh(tubeGeometry, this.material)
    scene.add(this.mesh)
  }

  public update(delta: number): void {
    if (this.disposed || !this.texture || !this.material) return

    this.texture.offset.x -= delta * 2

    const elapsed = Date.now() - this.startTime
    if (elapsed > this.duration) {
      const fadeProgress = Math.min((elapsed - this.duration) / 1000, 1)
      this.material.opacity = 0.9 * (1 - fadeProgress)
      if (fadeProgress >= 1) {
        this.dispose()
      }
    }
  }

  public dispose(): void {
    if (this.disposed) return
    this.disposed = true

    if (this.mesh && this.mesh.parent) {
      this.mesh.parent.remove(this.mesh)
    }
    if (this.mesh) {
      this.mesh.geometry.dispose()
      this.mesh = null
    }
    if (this.material) {
      this.material.dispose()
      this.material = null
    }
    if (this.texture) {
      this.texture.dispose()
      this.texture = null
    }
    this.curve = null
  }
}

export class MaterialFlowAnimation extends BaseAnimation {
  private group: THREE.Group | null = null
  private fileMesh: THREE.Mesh | null = null
  private pathMesh: THREE.Mesh | null = null
  private curve: THREE.CatmullRomCurve3 | null = null
  private progress: number = 0
  private speed: number = 0.3
  private texture: THREE.CanvasTexture | null = null
  private disposed: boolean = false

  constructor(scene: THREE.Scene, materialName: string, from: Position3D, to: Position3D) {
    super()
    this.createMaterialFlow(scene, from, to)
  }

  private createMaterialFlow(scene: THREE.Scene, from: Position3D, to: Position3D) {
    this.group = new THREE.Group()

    const fromVec = new THREE.Vector3(from.x, from.y, from.z)
    const toVec = new THREE.Vector3(to.x, to.y, to.z)
    const midVec = new THREE.Vector3().addVectors(fromVec, toVec).multiplyScalar(0.5)
    midVec.y += 3

    const points = [fromVec, midVec, toVec]
    this.curve = new THREE.CatmullRomCurve3(points)

    const tubeGeometry = new THREE.TubeGeometry(this.curve, 64, 0.03, 6, false)

    const canvas = document.createElement('canvas')
    canvas.width = 256
    canvas.height = 16
    const ctx = canvas.getContext('2d')!
    const gradient = ctx.createLinearGradient(0, 0, 256, 0)
    gradient.addColorStop(0, 'rgba(255, 220, 0, 0.2)')
    gradient.addColorStop(0.5, 'rgba(255, 220, 0, 1)')
    gradient.addColorStop(1, 'rgba(255, 220, 0, 0.2)')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 256, 16)

    this.texture = new THREE.CanvasTexture(canvas)
    this.texture.wrapS = THREE.RepeatWrapping
    this.texture.wrapT = THREE.RepeatWrapping
    this.texture.repeat.set(5, 1)

    const pathMaterial = new THREE.MeshBasicMaterial({
      map: this.texture,
      color: 0xffdd00,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    })

    this.pathMesh = new THREE.Mesh(tubeGeometry, pathMaterial)
    this.group.add(this.pathMesh)

    const fileGeometry = new THREE.BoxGeometry(0.4, 0.5, 0.1)
    const paperCanvas = document.createElement('canvas')
    paperCanvas.width = 128
    paperCanvas.height = 160
    const paperCtx = paperCanvas.getContext('2d')!
    paperCtx.fillStyle = '#ffffff'
    paperCtx.fillRect(0, 0, 128, 160)
    paperCtx.strokeStyle = '#cccccc'
    paperCtx.lineWidth = 2
    paperCtx.strokeRect(5, 5, 118, 150)
    for (let i = 0; i < 5; i++) {
      paperCtx.fillStyle = '#666666'
      paperCtx.fillRect(15, 25 + i * 28, 98, 3)
    }

    const paperTexture = new THREE.CanvasTexture(paperCanvas)
    const fileMaterial = new THREE.MeshStandardMaterial({
      map: paperTexture,
      color: 0xffffff,
      roughness: 0.8,
      metalness: 0.1,
    })

    this.fileMesh = new THREE.Mesh(fileGeometry, fileMaterial)
    this.group.add(this.fileMesh)

    scene.add(this.group)
  }

  public update(delta: number): void {
    if (this.disposed || !this.curve || !this.fileMesh || !this.texture) return

    this.progress += delta * this.speed
    if (this.progress >= 1) {
      this.progress = 0
    }

    const position = this.curve.getPointAt(this.progress)
    this.fileMesh.position.copy(position)

    const tangent = this.curve.getTangentAt(this.progress)
    this.fileMesh.lookAt(position.clone().add(tangent))
    this.fileMesh.rotateX(Math.PI / 2)

    this.texture.offset.x -= delta * 3
  }

  public dispose(): void {
    if (this.disposed) return
    this.disposed = true

    if (this.group && this.group.parent) {
      this.group.parent.remove(this.group)
    }
    if (this.fileMesh) {
      this.fileMesh.geometry.dispose()
      if (Array.isArray(this.fileMesh.material)) {
        this.fileMesh.material.forEach(m => m.dispose())
      } else {
        this.fileMesh.material.dispose()
      }
      this.fileMesh = null
    }
    if (this.pathMesh) {
      this.pathMesh.geometry.dispose()
      if (Array.isArray(this.pathMesh.material)) {
        this.pathMesh.material.forEach(m => m.dispose())
      } else {
        this.pathMesh.material.dispose()
      }
      this.pathMesh = null
    }
    if (this.texture) {
      this.texture.dispose()
      this.texture = null
    }
    this.curve = null
    this.group = null
  }
}

export class EvacuationPathAnimation extends BaseAnimation {
  private group: THREE.Group | null = null
  private arrows: THREE.Mesh[] = []
  private curve: THREE.CatmullRomCurve3 | null = null
  private type: 'evacuation' | 'supply'
  private progress: number = 0
  private speed: number = 0.5
  private arrowCount: number = 15
  private disposed: boolean = false

  constructor(scene: THREE.Scene, points: Position3D[], type: 'evacuation' | 'supply') {
    super()
    this.type = type
    this.createEvacuationPath(scene, points)
  }

  private createEvacuationPath(scene: THREE.Scene, points: Position3D[]) {
    this.group = new THREE.Group()

    const curvePoints = points.map(p => new THREE.Vector3(p.x, p.y + 0.1, p.z))
    this.curve = new THREE.CatmullRomCurve3(curvePoints)

    const lineGeometry = new THREE.BufferGeometry().setFromPoints(
      this.curve.getPoints(100)
    )
    const lineColor = this.type === 'evacuation' ? 0x00ff00 : 0x0088ff
    const lineMaterial = new THREE.LineBasicMaterial({
      color: lineColor,
      transparent: true,
      opacity: 0.3,
    })
    const line = new THREE.Line(lineGeometry, lineMaterial)
    this.group.add(line)

    const arrowShape = new THREE.Shape()
    arrowShape.moveTo(0, 0)
    arrowShape.lineTo(0.2, 0.3)
    arrowShape.lineTo(0.1, 0.3)
    arrowShape.lineTo(0.1, 0.6)
    arrowShape.lineTo(-0.1, 0.6)
    arrowShape.lineTo(-0.1, 0.3)
    arrowShape.lineTo(-0.2, 0.3)
    arrowShape.lineTo(0, 0)

    const extrudeSettings = { depth: 0.1, bevelEnabled: false }
    const arrowGeometry = new THREE.ExtrudeGeometry(arrowShape, extrudeSettings)
    arrowGeometry.center()
    arrowGeometry.rotateX(-Math.PI / 2)

    const arrowMaterial = new THREE.MeshBasicMaterial({
      color: lineColor,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
    })

    for (let i = 0; i < this.arrowCount; i++) {
      const arrow = new THREE.Mesh(arrowGeometry.clone(), arrowMaterial.clone())
      this.arrows.push(arrow)
      this.group.add(arrow)
    }

    scene.add(this.group)
  }

  public update(delta: number): void {
    if (this.disposed || !this.curve) return

    this.progress += delta * this.speed
    if (this.progress >= 1) {
      this.progress = 0
    }

    this.arrows.forEach((arrow, index) => {
      const offset = index / this.arrowCount
      let t = (this.progress + offset) % 1

      const position = this.curve!.getPointAt(t)
      arrow.position.copy(position)

      const tangent = this.curve!.getTangentAt(t)
      arrow.lookAt(position.clone().add(tangent))

      const material = arrow.material as THREE.MeshBasicMaterial
      const distanceFromHead = Math.abs(t - this.progress)
      const fadeStart = 0.3
      if (distanceFromHead < fadeStart) {
        material.opacity = 0.9 * (distanceFromHead / fadeStart)
      } else {
        material.opacity = 0.9
      }
    })
  }

  public dispose(): void {
    if (this.disposed) return
    this.disposed = true

    if (this.group && this.group.parent) {
      this.group.parent.remove(this.group)
    }
    this.arrows.forEach(arrow => {
      arrow.geometry.dispose()
      if (Array.isArray(arrow.material)) {
        arrow.material.forEach(m => m.dispose())
      } else {
        arrow.material.dispose()
      }
    })
    this.arrows = []
    this.curve = null
    this.group = null
  }
}

export class FanParticleSystem extends BaseAnimation {
  private group: THREE.Group | null = null
  private particles: THREE.Mesh[] = []
  private velocities: THREE.Vector3[] = []
  private particleCount: number = 50
  private disposed: boolean = false

  constructor(scene: THREE.Scene) {
    super()
    this.createFanParticles(scene)
  }

  private createFanParticles(scene: THREE.Scene) {
    this.group = new THREE.Group()

    const particleGeometry = new THREE.SphereGeometry(0.1, 8, 8)
    const particleMaterial = new THREE.MeshBasicMaterial({
      color: 0x88ccff,
      transparent: true,
      opacity: 0.4,
      blending: THREE.AdditiveBlending,
    })

    for (let i = 0; i < this.particleCount; i++) {
      const particle = new THREE.Mesh(particleGeometry.clone(), particleMaterial.clone())
      particle.position.set(
        (Math.random() - 0.5) * 10,
        Math.random() * 5,
        (Math.random() - 0.5) * 10
      )
      this.particles.push(particle)
      this.velocities.push(new THREE.Vector3(
        (Math.random() - 0.5) * 0.5,
        Math.random() * 2 + 1,
        (Math.random() - 0.5) * 0.5
      ))
      this.group.add(particle)
    }

    scene.add(this.group)
  }

  public updateParticles(positions: Position3D[]): void {
    if (this.disposed) return

    positions.forEach((pos, index) => {
      if (index < this.particles.length) {
        this.particles[index].position.set(pos.x, pos.y, pos.z)
      }
    })
  }

  public update(delta: number): void {
    if (this.disposed) return

    this.particles.forEach((particle, index) => {
      const velocity = this.velocities[index]
      particle.position.add(velocity.clone().multiplyScalar(delta))

      if (particle.position.y > 8) {
        particle.position.y = 0
        particle.position.x = (Math.random() - 0.5) * 10
        particle.position.z = (Math.random() - 0.5) * 10
      }

      const material = particle.material as THREE.MeshBasicMaterial
      material.opacity = 0.2 + Math.sin(Date.now() * 0.002 + index) * 0.2
    })
  }

  public dispose(): void {
    if (this.disposed) return
    this.disposed = true

    if (this.group && this.group.parent) {
      this.group.parent.remove(this.group)
    }
    this.particles.forEach(particle => {
      particle.geometry.dispose()
      if (Array.isArray(particle.material)) {
        particle.material.forEach(m => m.dispose())
      } else {
        particle.material.dispose()
      }
    })
    this.particles = []
    this.velocities = []
    this.group = null
  }
}

export class BlinkAnimation extends BaseAnimation {
  private mesh: THREE.Mesh
  private normalColor: THREE.Color
  private alertColor: THREE.Color
  private tween: TWEEN.Tween<{ progress: number }> | null = null
  private isActive: boolean = false
  private disposed: boolean = false
  private currentProgress: { progress: number } = { progress: 0 }

  constructor(mesh: THREE.Mesh, normalColor: number, alertColor: number) {
    super()
    this.mesh = mesh
    this.normalColor = new THREE.Color(normalColor)
    this.alertColor = new THREE.Color(alertColor)
  }

  public start(): void {
    if (this.isActive || this.disposed) return
    this.isActive = true

    this.tween = new TWEEN.Tween(this.currentProgress)
      .to({ progress: 1 }, 500)
      .easing(TWEEN.Easing.Sinusoidal.InOut)
      .yoyo(true)
      .repeat(Infinity)
      .onUpdate(() => {
        this.updateColor()
      })
      .start()
  }

  public stop(): void {
    this.isActive = false
    if (this.tween) {
      this.tween.stop()
      this.tween = null
    }
    this.currentProgress.progress = 0
    this.updateColor()
  }

  private updateColor(): void {
    if (this.disposed || !this.mesh.material) return

    const color = new THREE.Color().lerpColors(
      this.normalColor,
      this.alertColor,
      this.currentProgress.progress
    )

    const materials = Array.isArray(this.mesh.material) 
      ? this.mesh.material 
      : [this.mesh.material]

    materials.forEach(mat => {
      if ('color' in mat) {
        (mat as THREE.MeshStandardMaterial).color.copy(color)
      }
      if ('emissive' in mat) {
        (mat as THREE.MeshStandardMaterial).emissive.copy(color)
        ;(mat as THREE.MeshStandardMaterial).emissiveIntensity = this.currentProgress.progress * 2
      }
    })
  }

  public update(delta: number): void {
    if (this.disposed) return
    TWEEN.update()
  }

  public dispose(): void {
    if (this.disposed) return
    this.disposed = true

    this.stop()
    this.mesh = null as any
    this.tween = null
  }
}

export class AnimationManager {
  private scene: THREE.Scene
  private animations: BaseAnimation[] = []
  private guideLines: GuideLineAnimation[] = []
  private materialFlows: MaterialFlowAnimation[] = []
  private evacuationPaths: EvacuationPathAnimation[] = []
  private fanParticles: FanParticleSystem | null = null
  private blinkAnimations: BlinkAnimation[] = []

  constructor(scene: THREE.Scene) {
    this.scene = scene
  }

  public createGuideLine(start: Position3D, end: Position3D): GuideLineAnimation {
    const animation = new GuideLineAnimation(this.scene, start, end)
    this.guideLines.push(animation)
    this.animations.push(animation)
    return animation
  }

  public createMaterialFlow(
    materialName: string,
    from: Position3D,
    to: Position3D
  ): MaterialFlowAnimation {
    const animation = new MaterialFlowAnimation(this.scene, materialName, from, to)
    this.materialFlows.push(animation)
    this.animations.push(animation)
    return animation
  }

  public createEvacuationPath(
    points: Position3D[],
    type: 'evacuation' | 'supply'
  ): EvacuationPathAnimation {
    const animation = new EvacuationPathAnimation(this.scene, points, type)
    this.evacuationPaths.push(animation)
    this.animations.push(animation)
    return animation
  }

  public createFanParticles(): FanParticleSystem {
    if (this.fanParticles) {
      return this.fanParticles
    }
    const animation = new FanParticleSystem(this.scene)
    this.fanParticles = animation
    this.animations.push(animation)
    return animation
  }

  public createBlinkAnimation(
    mesh: THREE.Mesh,
    normalColor: number,
    alertColor: number
  ): BlinkAnimation {
    const animation = new BlinkAnimation(mesh, normalColor, alertColor)
    this.blinkAnimations.push(animation)
    this.animations.push(animation)
    return animation
  }

  public update(delta: number): void {
    TWEEN.update()
    
    this.animations = this.animations.filter(anim => {
      anim.update(delta)
      return true
    })

    this.guideLines = this.guideLines.filter(anim => {
      const isDisposed = (anim as any).disposed
      return !isDisposed
    })
  }

  public updateFanParticles(positions: Position3D[]): void {
    if (this.fanParticles) {
      this.fanParticles.updateParticles(positions)
    }
  }

  public hasFanParticles(): boolean {
    return this.fanParticles !== null
  }

  public dispose(): void {
    this.animations.forEach(anim => anim.dispose())
    this.animations = []
    this.guideLines = []
    this.materialFlows = []
    this.evacuationPaths = []
    this.fanParticles = null
    this.blinkAnimations = []
  }
}
