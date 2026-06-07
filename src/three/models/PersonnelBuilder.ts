import * as THREE from 'three'
import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js'
import type { Personnel, UserRole, Position3D } from '@/types'

const roleColors: Record<UserRole, number> = {
  window: 0x2196f3,
  chief: 0x9c27b0,
  leader: 0xffc107
}

const alertColor = 0xff0000

export class PersonnelBuilder {
  private static personnelMap: Map<string, THREE.Group> = new Map()
  private static alertState: Map<string, { active: boolean; material: THREE.MeshStandardMaterial; originalColor: number }> = new Map()
  private static clock: THREE.Clock = new THREE.Clock()

  public static createPersonnel(personnel: Personnel): THREE.Group {
    const group = new THREE.Group()
    group.position.set(personnel.location.x, personnel.location.y, personnel.location.z)
    group.userData = { personnelId: personnel.id, type: 'personnel', role: personnel.role }

    const body = this.createBody(personnel.role)
    group.add(body)

    const head = this.createHead()
    group.add(head)

    const nameLabel = this.createNameLabel(personnel.name, personnel.role)
    group.add(nameLabel)

    this.personnelMap.set(personnel.id, group)

    const bodyMesh = body.children.find(child => 
      child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial
    ) as THREE.Mesh | undefined

    if (bodyMesh) {
      this.alertState.set(personnel.id, {
        active: false,
        material: bodyMesh.material as THREE.MeshStandardMaterial,
        originalColor: roleColors[personnel.role]
      })
    }

    if (personnel.alertActive) {
      this.setAlertState(personnel.id, true)
    }

    return group
  }

  public static createAllPersonnel(personnelList: Personnel[]): THREE.Group[] {
    return personnelList.map(personnel => this.createPersonnel(personnel))
  }

  public static updatePersonnelPosition(personnelId: string, position: Position3D): void {
    const group = this.personnelMap.get(personnelId)
    if (group) {
      group.position.set(position.x, position.y, position.z)
    }
  }

  public static setAlertState(personnelId: string, isAlert: boolean): void {
    const alertInfo = this.alertState.get(personnelId)
    if (!alertInfo) return

    alertInfo.active = isAlert
    if (!isAlert) {
      alertInfo.material.color.setHex(alertInfo.originalColor)
      alertInfo.material.emissive.setHex(0x000000)
    }
  }

  public static updateAnimation(delta: number): void {
    this.alertState.forEach((alertInfo, personnelId) => {
      if (alertInfo.active) {
        const time = this.clock.getElapsedTime()
        const flash = Math.sin(time * 8) * 0.5 + 0.5
        const color = new THREE.Color().lerpColors(
          new THREE.Color(alertInfo.originalColor),
          new THREE.Color(alertColor),
          flash
        )
        alertInfo.material.color.copy(color)
        alertInfo.material.emissive.setHex(flash > 0.5 ? alertColor : 0x000000)
        alertInfo.material.emissiveIntensity = flash * 0.5
      }
    })
  }

  public static getPersonnelGroup(personnelId: string): THREE.Group | undefined {
    return this.personnelMap.get(personnelId)
  }

  public static dispose(): void {
    this.personnelMap.clear()
    this.alertState.clear()
  }

  private static createBody(role: UserRole): THREE.Group {
    const bodyGroup = new THREE.Group()

    const bodyGeometry = new THREE.CapsuleGeometry(0.25, 0.8, 4, 8)
    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: roleColors[role],
      roughness: 0.5,
      metalness: 0.1
    })
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial)
    body.position.y = 0.9
    body.castShadow = true
    body.userData = { type: 'body' }
    bodyGroup.add(body)

    const armGeometry = new THREE.CapsuleGeometry(0.08, 0.4, 4, 8)
    const armMaterial = new THREE.MeshStandardMaterial({
      color: roleColors[role],
      roughness: 0.5,
      metalness: 0.1
    })

    const leftArm = new THREE.Mesh(armGeometry, armMaterial)
    leftArm.position.set(-0.35, 1, 0)
    leftArm.rotation.z = Math.PI / 12
    leftArm.castShadow = true
    bodyGroup.add(leftArm)

    const rightArm = new THREE.Mesh(armGeometry, armMaterial)
    rightArm.position.set(0.35, 1, 0)
    rightArm.rotation.z = -Math.PI / 12
    rightArm.castShadow = true
    bodyGroup.add(rightArm)

    const legGeometry = new THREE.CapsuleGeometry(0.1, 0.5, 4, 8)
    const legMaterial = new THREE.MeshStandardMaterial({
      color: 0x2c3e50,
      roughness: 0.6,
      metalness: 0.1
    })

    const leftLeg = new THREE.Mesh(legGeometry, legMaterial)
    leftLeg.position.set(-0.12, 0.25, 0)
    leftLeg.castShadow = true
    bodyGroup.add(leftLeg)

    const rightLeg = new THREE.Mesh(legGeometry, legMaterial)
    rightLeg.position.set(0.12, 0.25, 0)
    rightLeg.castShadow = true
    bodyGroup.add(rightLeg)

    return bodyGroup
  }

  private static createHead(): THREE.Group {
    const headGroup = new THREE.Group()

    const headGeometry = new THREE.SphereGeometry(0.22, 16, 16)
    const headMaterial = new THREE.MeshStandardMaterial({
      color: 0xffdbac,
      roughness: 0.8,
      metalness: 0.05
    })
    const head = new THREE.Mesh(headGeometry, headMaterial)
    head.position.y = 1.7
    head.castShadow = true
    headGroup.add(head)

    const eyeGeometry = new THREE.SphereGeometry(0.03, 8, 8)
    const eyeMaterial = new THREE.MeshBasicMaterial({
      color: 0x000000
    })

    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial)
    leftEye.position.set(-0.08, 1.72, 0.18)
    headGroup.add(leftEye)

    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial)
    rightEye.position.set(0.08, 1.72, 0.18)
    headGroup.add(rightEye)

    return headGroup
  }

  private static createNameLabel(name: string, role: UserRole): CSS2DObject {
    const labelDiv = document.createElement('div')
    const colorHex = '#' + roleColors[role].toString(16).padStart(6, '0')
    
    labelDiv.style.cssText = `
      color: white;
      font-size: 12px;
      font-weight: bold;
      text-align: center;
      background: rgba(0, 0, 0, 0.6);
      padding: 3px 10px;
      border-radius: 10px;
      pointer-events: none;
      border: 1px solid ${colorHex};
      white-space: nowrap;
      box-shadow: 0 0 8px ${colorHex}80;
    `
    labelDiv.textContent = name

    const label = new CSS2DObject(labelDiv)
    label.position.set(0, 2.1, 0)
    label.userData = { type: 'nameLabel' }

    return label
  }
}
