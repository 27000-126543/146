import * as THREE from 'three'
import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js'
import type { WindowInfo, BusinessType } from '@/types'

const businessColors: Record<BusinessType, number> = {
  tax: 0x1e88e5,
  social: 0x43a047,
  industry: 0xfb8c00
}

export class WindowBuilder {
  public static createWindow(windowInfo: WindowInfo): THREE.Group {
    const windowGroup = new THREE.Group()
    windowGroup.position.set(windowInfo.position.x, windowInfo.position.y, windowInfo.position.z)
    windowGroup.userData = { windowId: windowInfo.id, type: 'window' }

    const counter = this.createCounter(windowInfo.businessType)
    windowGroup.add(counter)

    const display = this.createDisplay(windowInfo)
    windowGroup.add(display)

    const seat = this.createSeat()
    windowGroup.add(seat)

    const colorIndicator = this.createColorIndicator(windowInfo.businessType)
    windowGroup.add(colorIndicator)

    return windowGroup
  }

  public static createAllWindows(windows: WindowInfo[]): THREE.Group[] {
    return windows.map(window => this.createWindow(window))
  }

  private static createCounter(businessType: BusinessType): THREE.Mesh {
    const geometry = new THREE.BoxGeometry(4, 1.1, 1.2)
    const material = new THREE.MeshStandardMaterial({
      color: 0x3d2817,
      roughness: 0.7,
      metalness: 0.1
    })
    const counter = new THREE.Mesh(geometry, material)
    counter.position.y = 0.55
    counter.castShadow = true
    counter.receiveShadow = true
    counter.userData = { type: 'counter' }

    const edgeGeometry = new THREE.EdgesGeometry(geometry)
    const edgeMaterial = new THREE.LineBasicMaterial({ color: businessColors[businessType] })
    const edges = new THREE.LineSegments(edgeGeometry, edgeMaterial)
    edges.position.y = 0.55
    counter.add(edges)

    return counter
  }

  private static createDisplay(windowInfo: WindowInfo): THREE.Group {
    const displayGroup = new THREE.Group()
    displayGroup.position.y = 2.2

    const frameGeometry = new THREE.BoxGeometry(3.2, 1, 0.1)
    const frameMaterial = new THREE.MeshStandardMaterial({
      color: 0x1a1a2e,
      roughness: 0.3,
      metalness: 0.8
    })
    const frame = new THREE.Mesh(frameGeometry, frameMaterial)
    frame.castShadow = true
    displayGroup.add(frame)

    const screenGeometry = new THREE.PlaneGeometry(3, 0.8)
    const screenMaterial = new THREE.MeshBasicMaterial({
      color: businessColors[windowInfo.businessType],
      transparent: true,
      opacity: 0.9
    })
    const screen = new THREE.Mesh(screenGeometry, screenMaterial)
    screen.position.z = 0.06
    displayGroup.add(screen)

    const labelDiv = document.createElement('div')
    labelDiv.style.cssText = `
      color: white;
      font-size: 14px;
      font-weight: bold;
      text-align: center;
      background: rgba(0, 0, 0, 0);
      padding: 4px 8px;
      border-radius: 4px;
      pointer-events: none;
      text-shadow: 0 0 8px ${'#' + businessColors[windowInfo.businessType].toString(16).padStart(6, '0')};
    `
    labelDiv.innerHTML = `
      <div style="font-size: 16px; margin-bottom: 4px;">${windowInfo.businessName}</div>
      <div style="font-size: 20px;">当前叫号: ${windowInfo.currentNumber}</div>
    `
    const label = new CSS2DObject(labelDiv)
    label.position.set(0, 0, 0.1)
    displayGroup.add(label)

    const glowGeometry = new THREE.PlaneGeometry(3.4, 1.1)
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: businessColors[windowInfo.businessType],
      transparent: true,
      opacity: 0.2,
      side: THREE.DoubleSide
    })
    const glow = new THREE.Mesh(glowGeometry, glowMaterial)
    glow.position.z = -0.02
    displayGroup.add(glow)

    return displayGroup
  }

  private static createSeat(): THREE.Group {
    const seatGroup = new THREE.Group()
    seatGroup.position.z = 1.5

    const seatGeometry = new THREE.BoxGeometry(0.6, 0.1, 0.6)
    const seatMaterial = new THREE.MeshStandardMaterial({
      color: 0x2d3748,
      roughness: 0.6,
      metalness: 0.2
    })
    const seat = new THREE.Mesh(seatGeometry, seatMaterial)
    seat.position.y = 0.5
    seat.castShadow = true
    seatGroup.add(seat)

    const backGeometry = new THREE.BoxGeometry(0.6, 0.5, 0.1)
    const backMaterial = new THREE.MeshStandardMaterial({
      color: 0x2d3748,
      roughness: 0.6,
      metalness: 0.2
    })
    const back = new THREE.Mesh(backGeometry, backMaterial)
    back.position.set(0, 0.8, -0.25)
    back.castShadow = true
    seatGroup.add(back)

    for (let i = 0; i < 4; i++) {
      const legGeometry = new THREE.CylinderGeometry(0.03, 0.03, 0.5)
      const legMaterial = new THREE.MeshStandardMaterial({
        color: 0x4a5568,
        roughness: 0.4,
        metalness: 0.6
      })
      const leg = new THREE.Mesh(legGeometry, legMaterial)
      leg.position.set(
        (i % 2 === 0 ? -1 : 1) * 0.25,
        0.25,
        (i < 2 ? -1 : 1) * 0.25
      )
      leg.castShadow = true
      seatGroup.add(leg)
    }

    return seatGroup
  }

  private static createColorIndicator(businessType: BusinessType): THREE.Mesh {
    const geometry = new THREE.CylinderGeometry(0.15, 0.15, 0.05, 16)
    const material = new THREE.MeshBasicMaterial({
      color: businessColors[businessType]
    })
    const indicator = new THREE.Mesh(geometry, material)
    indicator.position.set(0, 1.2, 0)
    indicator.rotation.x = Math.PI / 2
    return indicator
  }

  public static updateWindowDisplay(windowGroup: THREE.Group, windowInfo: Partial<WindowInfo>): void {
    const screen = windowGroup.children.find(child => 
      child.children.some(c => c.type === 'CSS2DObject')
    )
    if (!screen) return

    const label = screen.children.find(c => c.type === 'CSS2DObject') as CSS2DObject
    if (label && label.element) {
      const div = label.element as HTMLDivElement
      if (windowInfo.businessName) {
        const nameDiv = div.querySelector('div:first-child')
        if (nameDiv) nameDiv.textContent = windowInfo.businessName
      }
      if (windowInfo.currentNumber) {
        const numberDiv = div.querySelector('div:last-child')
        if (numberDiv) numberDiv.textContent = `当前叫号: ${windowInfo.currentNumber}`
      }
    }
  }
}
