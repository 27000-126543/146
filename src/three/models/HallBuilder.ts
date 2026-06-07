import * as THREE from 'three'

export class HallBuilder {
  public group: THREE.Group
  private hallWidth: number = 30
  private hallDepth: number = 30
  private wallHeight: number = 6

  constructor() {
    this.group = new THREE.Group()
    this.group.name = 'GovernmentHall'
  }

  public build(): THREE.Group {
    this.createFloor()
    this.createWalls()
    this.createCeiling()
    this.createAreas()
    this.createInfoDesk()
    this.createRestArea()
    this.createBackOffice()
    this.createMonitorRoom()
    return this.group
  }

  public createFloor(): void {
    const canvas = document.createElement('canvas')
    canvas.width = 512
    canvas.height = 512
    const ctx = canvas.getContext('2d')!

    const gradient = ctx.createLinearGradient(0, 0, 512, 512)
    gradient.addColorStop(0, '#e8e8e8')
    gradient.addColorStop(0.3, '#d0d0d0')
    gradient.addColorStop(0.6, '#e0e0e0')
    gradient.addColorStop(1, '#c8c8c8')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 512, 512)

    ctx.strokeStyle = 'rgba(180, 180, 180, 0.6)'
    ctx.lineWidth = 2
    for (let i = 0; i < 30; i++) {
      ctx.beginPath()
      ctx.moveTo(Math.random() * 512, Math.random() * 512)
      ctx.bezierCurveTo(
        Math.random() * 512, Math.random() * 512,
        Math.random() * 512, Math.random() * 512,
        Math.random() * 512, Math.random() * 512
      )
      ctx.stroke()
    }

    for (let i = 0; i < 50; i++) {
      ctx.fillStyle = `rgba(${150 + Math.random() * 50}, ${150 + Math.random() * 50}, ${150 + Math.random() * 50}, ${0.1 + Math.random() * 0.2})`
      ctx.beginPath()
      ctx.arc(Math.random() * 512, Math.random() * 512, 2 + Math.random() * 8, 0, Math.PI * 2)
      ctx.fill()
    }

    const marbleTexture = new THREE.CanvasTexture(canvas)
    marbleTexture.wrapS = THREE.RepeatWrapping
    marbleTexture.wrapT = THREE.RepeatWrapping
    marbleTexture.repeat.set(3, 3)

    const floorGeometry = new THREE.PlaneGeometry(this.hallWidth, this.hallDepth)
    const floorMaterial = new THREE.MeshStandardMaterial({
      map: marbleTexture,
      roughness: 0.3,
      metalness: 0.1
    })

    const floor = new THREE.Mesh(floorGeometry, floorMaterial)
    floor.rotation.x = -Math.PI / 2
    floor.receiveShadow = true
    floor.name = 'Floor'
    this.group.add(floor)
  }

  public createWalls(): void {
    const wallMaterial = new THREE.MeshStandardMaterial({
      color: 0xf5f5f0,
      roughness: 0.8,
      metalness: 0.05
    })

    const wallThickness = 0.3

    const backWall = new THREE.Mesh(
      new THREE.BoxGeometry(this.hallWidth, this.wallHeight, wallThickness),
      wallMaterial
    )
    backWall.position.set(0, this.wallHeight / 2, -this.hallDepth / 2)
    backWall.castShadow = true
    backWall.receiveShadow = true
    backWall.name = 'BackWall'
    this.group.add(backWall)

    const frontWallLeft = new THREE.Mesh(
      new THREE.BoxGeometry(this.hallWidth * 0.35, this.wallHeight, wallThickness),
      wallMaterial
    )
    frontWallLeft.position.set(-this.hallWidth * 0.325, this.wallHeight / 2, this.hallDepth / 2)
    frontWallLeft.castShadow = true
    frontWallLeft.receiveShadow = true
    frontWallLeft.name = 'FrontWallLeft'
    this.group.add(frontWallLeft)

    const frontWallRight = new THREE.Mesh(
      new THREE.BoxGeometry(this.hallWidth * 0.35, this.wallHeight, wallThickness),
      wallMaterial
    )
    frontWallRight.position.set(this.hallWidth * 0.325, this.wallHeight / 2, this.hallDepth / 2)
    frontWallRight.castShadow = true
    frontWallRight.receiveShadow = true
    frontWallRight.name = 'FrontWallRight'
    this.group.add(frontWallRight)

    const leftWall = new THREE.Mesh(
      new THREE.BoxGeometry(wallThickness, this.wallHeight, this.hallDepth),
      wallMaterial
    )
    leftWall.position.set(-this.hallWidth / 2, this.wallHeight / 2, 0)
    leftWall.castShadow = true
    leftWall.receiveShadow = true
    leftWall.name = 'LeftWall'
    this.group.add(leftWall)

    const rightWall = new THREE.Mesh(
      new THREE.BoxGeometry(wallThickness, this.wallHeight, this.hallDepth),
      wallMaterial
    )
    rightWall.position.set(this.hallWidth / 2, this.wallHeight / 2, 0)
    rightWall.castShadow = true
    rightWall.receiveShadow = true
    rightWall.name = 'RightWall'
    this.group.add(rightWall)
  }

  public createCeiling(): void {
    const ceilingMaterial = new THREE.MeshStandardMaterial({
      color: 0xfafafa,
      roughness: 0.9,
      metalness: 0
    })

    const ceilingGeometry = new THREE.PlaneGeometry(this.hallWidth, this.hallDepth)
    const ceiling = new THREE.Mesh(ceilingGeometry, ceilingMaterial)
    ceiling.rotation.x = Math.PI / 2
    ceiling.position.y = this.wallHeight
    ceiling.receiveShadow = true
    ceiling.name = 'Ceiling'
    this.group.add(ceiling)

    const downlightPositions = [
      [-10, 10], [0, 10], [10, 10],
      [-10, 0], [0, 0], [10, 0],
      [-10, -10], [0, -10], [10, -10]
    ]

    downlightPositions.forEach(([x, z], index) => {
      const downlightGroup = new THREE.Group()
      downlightGroup.name = `Downlight_${index}`

      const housing = new THREE.Mesh(
        new THREE.CylinderGeometry(0.3, 0.35, 0.15, 32),
        new THREE.MeshStandardMaterial({
          color: 0x333333,
          roughness: 0.5,
          metalness: 0.8
        })
      )
      housing.position.y = this.wallHeight - 0.075
      housing.castShadow = true
      downlightGroup.add(housing)

      const bulb = new THREE.Mesh(
        new THREE.CircleGeometry(0.2, 32),
        new THREE.MeshStandardMaterial({
          color: 0xffffee,
          emissive: 0xffffaa,
          emissiveIntensity: 2,
          roughness: 0.2,
          metalness: 0
        })
      )
      bulb.rotation.x = Math.PI / 2
      bulb.position.y = this.wallHeight - 0.15
      downlightGroup.add(bulb)

      const pointLight = new THREE.PointLight(0xffffcc, 0.6, 12)
      pointLight.position.set(0, this.wallHeight - 0.5, 0)
      pointLight.castShadow = true
      pointLight.shadow.mapSize.width = 512
      pointLight.shadow.mapSize.height = 512
      pointLight.shadow.camera.near = 0.5
      pointLight.shadow.camera.far = 15
      downlightGroup.add(pointLight)

      downlightGroup.position.set(x, 0, z)
      this.group.add(downlightGroup)
    })
  }

  public createAreas(): void {
    const areaConfigs = [
      { name: 'InfoDeskArea', x: 0, z: 8, width: 6, depth: 4, color: 0x4a90d9, opacity: 0.3 },
      { name: 'WindowArea', x: 0, z: -10, width: 20, depth: 6, color: 0x5cb85c, opacity: 0.25 },
      { name: 'RestArea', x: -10, z: 5, width: 8, depth: 8, color: 0xf0ad4e, opacity: 0.25 },
      { name: 'BackOfficeArea', x: 10, z: -5, width: 8, depth: 10, color: 0xd9534f, opacity: 0.25 },
      { name: 'MonitorRoomArea', x: 10, z: 10, width: 6, depth: 6, color: 0x7952b3, opacity: 0.3 }
    ]

    areaConfigs.forEach(config => {
      const areaGeometry = new THREE.PlaneGeometry(config.width, config.depth)
      const areaMaterial = new THREE.MeshStandardMaterial({
        color: config.color,
        transparent: true,
        opacity: config.opacity,
        roughness: 0.6,
        metalness: 0.1
      })

      const area = new THREE.Mesh(areaGeometry, areaMaterial)
      area.rotation.x = -Math.PI / 2
      area.position.set(config.x, 0.01, config.z)
      area.receiveShadow = true
      area.name = config.name
      this.group.add(area)

      const borderGeometry = new THREE.EdgesGeometry(new THREE.BoxGeometry(config.width, 0, config.depth))
      const borderMaterial = new THREE.LineBasicMaterial({
        color: config.color,
        transparent: true,
        opacity: 0.8
      })
      const border = new THREE.LineSegments(borderGeometry, borderMaterial)
      border.position.set(config.x, 0.02, config.z)
      border.name = `${config.name}Border`
      this.group.add(border)
    })
  }

  public createInfoDesk(): void {
    const deskGroup = new THREE.Group()
    deskGroup.name = 'InfoDesk'
    deskGroup.position.set(0, 0, 8)

    const counterMaterial = new THREE.MeshStandardMaterial({
      color: 0x2c5aa0,
      roughness: 0.4,
      metalness: 0.3
    })

    const topMaterial = new THREE.MeshStandardMaterial({
      color: 0xd4d4d4,
      roughness: 0.2,
      metalness: 0.6
    })

    const base = new THREE.Mesh(
      new THREE.BoxGeometry(5, 1.1, 1.5),
      counterMaterial
    )
    base.position.y = 0.55
    base.castShadow = true
    base.receiveShadow = true
    deskGroup.add(base)

    const top = new THREE.Mesh(
      new THREE.BoxGeometry(5.2, 0.1, 1.7),
      topMaterial
    )
    top.position.y = 1.15
    top.castShadow = true
    top.receiveShadow = true
    deskGroup.add(top)

    const logoGeometry = new THREE.BoxGeometry(1.2, 0.6, 0.05)
    const logoMaterial = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      roughness: 0.3,
      metalness: 0.8,
      emissive: 0xffd700,
      emissiveIntensity: 0.2
    })
    const logo = new THREE.Mesh(logoGeometry, logoMaterial)
    logo.position.set(0, 0.8, -0.76)
    logo.castShadow = true
    deskGroup.add(logo)

    const computer = new THREE.Mesh(
      new THREE.BoxGeometry(0.6, 0.4, 0.08),
      new THREE.MeshStandardMaterial({
        color: 0x1a1a1a,
        roughness: 0.3,
        metalness: 0.7
      })
    )
    computer.position.set(1.5, 1.35, -0.3)
    computer.castShadow = true
    computer.receiveShadow = true
    deskGroup.add(computer)

    const screen = new THREE.Mesh(
      new THREE.PlaneGeometry(0.52, 0.32),
      new THREE.MeshStandardMaterial({
        color: 0x4a90d9,
        emissive: 0x2a5090,
        emissiveIntensity: 0.5,
        roughness: 0.1,
        metalness: 0
      })
    )
    screen.position.set(1.5, 1.35, -0.255)
    deskGroup.add(screen)

    this.group.add(deskGroup)
  }

  public createRestArea(): void {
    const restGroup = new THREE.Group()
    restGroup.name = 'RestArea'
    restGroup.position.set(-10, 0, 5)

    const sofaMaterial = new THREE.MeshStandardMaterial({
      color: 0x8b4513,
      roughness: 0.8,
      metalness: 0.1
    })

    for (let i = 0; i < 3; i++) {
      const sofa = new THREE.Group()

      const base = new THREE.Mesh(
        new THREE.BoxGeometry(1.8, 0.4, 0.8),
        sofaMaterial
      )
      base.position.y = 0.2
      base.castShadow = true
      base.receiveShadow = true
      sofa.add(base)

      const back = new THREE.Mesh(
        new THREE.BoxGeometry(1.8, 0.6, 0.2),
        sofaMaterial
      )
      back.position.set(0, 0.7, -0.3)
      back.castShadow = true
      back.receiveShadow = true
      sofa.add(back)

      const cushion = new THREE.Mesh(
        new THREE.BoxGeometry(0.5, 0.15, 0.55),
        new THREE.MeshStandardMaterial({
          color: 0xd2691e,
          roughness: 0.7,
          metalness: 0.05
        })
      )
      cushion.position.set(-0.4, 0.475, 0)
      cushion.castShadow = true
      cushion.receiveShadow = true
      sofa.add(cushion)

      const cushion2 = cushion.clone()
      cushion2.position.x = 0.4
      sofa.add(cushion2)

      sofa.position.set(0, 0, -2 + i * 2.5)
      restGroup.add(sofa)
    }

    const table = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 0.05, 0.6),
      new THREE.MeshStandardMaterial({
        color: 0x2c2c2c,
        roughness: 0.3,
        metalness: 0.7
      })
    )
    table.position.set(0, 0.5, 0.5)
    table.castShadow = true
    table.receiveShadow = true
    restGroup.add(table)

    const legMaterial = new THREE.MeshStandardMaterial({
      color: 0x1a1a1a,
      roughness: 0.4,
      metalness: 0.8
    })

    const legPositions = [[-0.5, -0.25], [0.5, -0.25], [-0.5, 0.25], [0.5, 0.25]]
    legPositions.forEach(([lx, lz]) => {
      const leg = new THREE.Mesh(
        new THREE.CylinderGeometry(0.04, 0.04, 0.5, 16),
        legMaterial
      )
      leg.position.set(lx, 0.25, lz)
      leg.castShadow = true
      leg.receiveShadow = true
      table.add(leg)
    })

    const waterDispenser = new THREE.Group()

    const dispenserBody = new THREE.Mesh(
      new THREE.BoxGeometry(0.8, 1.4, 0.5),
      new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.5,
        metalness: 0.3
      })
    )
    dispenserBody.position.y = 0.7
    dispenserBody.castShadow = true
    dispenserBody.receiveShadow = true
    waterDispenser.add(dispenserBody)

    const bottle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.2, 0.25, 0.6, 16),
      new THREE.MeshStandardMaterial({
        color: 0x87ceeb,
        transparent: true,
        opacity: 0.6,
        roughness: 0.1,
        metalness: 0
      })
    )
    bottle.position.y = 1.7
    bottle.castShadow = true
    waterDispenser.add(bottle)

    const tray = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 0.05, 0.3),
      new THREE.MeshStandardMaterial({
        color: 0xcccccc,
        roughness: 0.4,
        metalness: 0.6
      })
    )
    tray.position.set(0, 0.9, 0.26)
    tray.castShadow = true
    tray.receiveShadow = true
    waterDispenser.add(tray)

    waterDispenser.position.set(-3, 0, 3)
    restGroup.add(waterDispenser)

    const plantPot = new THREE.Mesh(
      new THREE.CylinderGeometry(0.3, 0.25, 0.5, 16),
      new THREE.MeshStandardMaterial({
        color: 0x8b4513,
        roughness: 0.9,
        metalness: 0
      })
    )
    plantPot.position.set(3, 0.25, 3)
    plantPot.castShadow = true
    plantPot.receiveShadow = true
    restGroup.add(plantPot)

    const plant = new THREE.Mesh(
      new THREE.SphereGeometry(0.5, 16, 16),
      new THREE.MeshStandardMaterial({
        color: 0x228b22,
        roughness: 0.8,
        metalness: 0
      })
    )
    plant.position.set(3, 0.9, 3)
    plant.castShadow = true
    plant.receiveShadow = true
    restGroup.add(plant)

    this.group.add(restGroup)
  }

  public createBackOffice(): void {
    const officeGroup = new THREE.Group()
    officeGroup.name = 'BackOffice'
    officeGroup.position.set(10, 0, -5)

    const partitionMaterial = new THREE.MeshStandardMaterial({
      color: 0xd4d4d4,
      roughness: 0.7,
      metalness: 0.1
    })

    const glassMaterial = new THREE.MeshStandardMaterial({
      color: 0x87ceeb,
      transparent: true,
      opacity: 0.4,
      roughness: 0.1,
      metalness: 0.1
    })

    const partitionPositions = [
      { x: -4, z: 0, w: 0.15, h: 2.5, d: 10 },
      { x: 4, z: 0, w: 0.15, h: 2.5, d: 10 },
      { x: 0, z: 5, w: 8, h: 2.5, d: 0.15 },
      { x: 0, z: -5, w: 8, h: 2.5, d: 0.15 }
    ]

    partitionPositions.forEach((pos, index) => {
      const partition = new THREE.Mesh(
        new THREE.BoxGeometry(pos.w, pos.h, pos.d),
        partitionMaterial
      )
      partition.position.set(pos.x, pos.h / 2, pos.z)
      partition.castShadow = true
      partition.receiveShadow = true
      partition.name = `Partition_${index}`
      officeGroup.add(partition)
    })

    const glass = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 1.2, 1.5),
      glassMaterial
    )
    glass.position.set(-3.96, 3.1, 0)
    glass.castShadow = true
    glass.receiveShadow = true
    officeGroup.add(glass)

    const deskMaterial = new THREE.MeshStandardMaterial({
      color: 0x4a3728,
      roughness: 0.6,
      metalness: 0.1
    })

    for (let row = 0; row < 2; row++) {
      for (let col = 0; col < 2; col++) {
        const desk = new THREE.Group()

        const deskTop = new THREE.Mesh(
          new THREE.BoxGeometry(2, 0.08, 1),
          deskMaterial
        )
        deskTop.position.y = 0.75
        deskTop.castShadow = true
        deskTop.receiveShadow = true
        desk.add(deskTop)

        const deskLegMaterial = new THREE.MeshStandardMaterial({
          color: 0x2c2c2c,
          roughness: 0.4,
          metalness: 0.7
        })

        const deskLegPositions = [[-0.9, -0.4], [0.9, -0.4], [-0.9, 0.4], [0.9, 0.4]]
        deskLegPositions.forEach(([lx, lz]) => {
          const leg = new THREE.Mesh(
            new THREE.CylinderGeometry(0.04, 0.04, 0.75, 16),
            deskLegMaterial
          )
          leg.position.set(lx, 0.375, lz)
          leg.castShadow = true
          leg.receiveShadow = true
          desk.add(leg)
        })

        const monitor = new THREE.Group()

        const monitorBody = new THREE.Mesh(
          new THREE.BoxGeometry(0.7, 0.5, 0.08),
          new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            roughness: 0.3,
            metalness: 0.7
          })
        )
        monitorBody.position.y = 1.1
        monitorBody.castShadow = true
        monitorBody.receiveShadow = true
        monitor.add(monitorBody)

        const monitorScreen = new THREE.Mesh(
          new THREE.PlaneGeometry(0.62, 0.42),
          new THREE.MeshStandardMaterial({
            color: 0x4a90d9,
            emissive: 0x2a5090,
            emissiveIntensity: 0.5,
            roughness: 0.1,
            metalness: 0
          })
        )
        monitorScreen.position.set(0, 1.1, 0.045)
        monitor.add(monitorScreen)

        const monitorStand = new THREE.Mesh(
          new THREE.CylinderGeometry(0.05, 0.08, 0.25, 16),
          new THREE.MeshStandardMaterial({
            color: 0x2c2c2c,
            roughness: 0.4,
            metalness: 0.7
          })
        )
        monitorStand.position.y = 0.875
        monitorStand.castShadow = true
        monitor.add(monitorStand)

        monitor.position.set(0.3, 0, -0.35)
        desk.add(monitor)

        const chair = this.createChair()
        chair.position.set(0.3, 0, 0.5)
        desk.add(chair)

        desk.position.set(-1.5 + col * 3, 0, -2 + row * 4)
        officeGroup.add(desk)
      }
    }

    const cabinet = new THREE.Mesh(
      new THREE.BoxGeometry(3, 2, 0.5),
      new THREE.MeshStandardMaterial({
        color: 0x5a4a3a,
        roughness: 0.7,
        metalness: 0.1
      })
    )
    cabinet.position.set(0, 1, 3.7)
    cabinet.castShadow = true
    cabinet.receiveShadow = true
    officeGroup.add(cabinet)

    const handleMaterial = new THREE.MeshStandardMaterial({
      color: 0xcccccc,
      roughness: 0.3,
      metalness: 0.8
    })

    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 2; j++) {
        const handle = new THREE.Mesh(
          new THREE.BoxGeometry(0.02, 0.15, 0.05),
          handleMaterial
        )
        handle.position.set(-0.75 + i * 0.75, 0.5 + j * 0.8, 3.96)
        officeGroup.add(handle)
      }
    }

    this.group.add(officeGroup)
  }

  private createChair(): THREE.Group {
    const chair = new THREE.Group()

    const seat = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 0.1, 0.5),
      new THREE.MeshStandardMaterial({
        color: 0x1a1a1a,
        roughness: 0.6,
        metalness: 0.2
      })
    )
    seat.position.y = 0.5
    seat.castShadow = true
    seat.receiveShadow = true
    chair.add(seat)

    const backrest = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 0.6, 0.1),
      new THREE.MeshStandardMaterial({
        color: 0x1a1a1a,
        roughness: 0.6,
        metalness: 0.2
      })
    )
    backrest.position.set(0, 0.85, -0.2)
    backrest.castShadow = true
    backrest.receiveShadow = true
    chair.add(backrest)

    const legMaterial = new THREE.MeshStandardMaterial({
      color: 0x2c2c2c,
      roughness: 0.4,
      metalness: 0.7
    })

    const centerLeg = new THREE.Mesh(
      new THREE.CylinderGeometry(0.03, 0.03, 0.5, 16),
      legMaterial
    )
    centerLeg.position.y = 0.25
    centerLeg.castShadow = true
    chair.add(centerLeg)

    const base = new THREE.Mesh(
      new THREE.CylinderGeometry(0.25, 0.25, 0.05, 16),
      legMaterial
    )
    base.position.y = 0.025
    base.castShadow = true
    base.receiveShadow = true
    chair.add(base)

    return chair
  }

  public createMonitorRoom(): void {
    const monitorGroup = new THREE.Group()
    monitorGroup.name = 'MonitorRoom'
    monitorGroup.position.set(10, 0, 10)

    const wallMaterial = new THREE.MeshStandardMaterial({
      color: 0x3a3a3a,
      roughness: 0.8,
      metalness: 0.1
    })

    const glassMaterial = new THREE.MeshStandardMaterial({
      color: 0x4a90d9,
      transparent: true,
      opacity: 0.3,
      roughness: 0.1,
      metalness: 0.1
    })

    const roomPositions = [
      { x: -3, z: 0, w: 0.15, h: 3, d: 6 },
      { x: 3, z: 0, w: 0.15, h: 3, d: 6 },
      { x: 0, z: 3, w: 6, h: 3, d: 0.15 }
    ]

    roomPositions.forEach((pos, index) => {
      const wall = new THREE.Mesh(
        new THREE.BoxGeometry(pos.w, pos.h, pos.d),
        wallMaterial
      )
      wall.position.set(pos.x, pos.h / 2, pos.z)
      wall.castShadow = true
      wall.receiveShadow = true
      wall.name = `MonitorRoomWall_${index}`
      monitorGroup.add(wall)
    })

    const frontWallLeft = new THREE.Mesh(
      new THREE.BoxGeometry(1.5, 3, 0.15),
      wallMaterial
    )
    frontWallLeft.position.set(-2.25, 1.5, -3)
    frontWallLeft.castShadow = true
    frontWallLeft.receiveShadow = true
    monitorGroup.add(frontWallLeft)

    const frontWallRight = new THREE.Mesh(
      new THREE.BoxGeometry(1.5, 3, 0.15),
      wallMaterial
    )
    frontWallRight.position.set(2.25, 1.5, -3)
    frontWallRight.castShadow = true
    frontWallRight.receiveShadow = true
    monitorGroup.add(frontWallRight)

    const frontWallTop = new THREE.Mesh(
      new THREE.BoxGeometry(3, 0.8, 0.15),
      wallMaterial
    )
    frontWallTop.position.set(0, 2.6, -3)
    frontWallTop.castShadow = true
    frontWallTop.receiveShadow = true
    monitorGroup.add(frontWallTop)

    const glass = new THREE.Mesh(
      new THREE.BoxGeometry(3, 2.2, 0.08),
      glassMaterial
    )
    glass.position.set(0, 1.1, -3)
    glass.castShadow = true
    glass.receiveShadow = true
    monitorGroup.add(glass)

    const screenWall = new THREE.Mesh(
      new THREE.BoxGeometry(5.5, 3.5, 0.2),
      new THREE.MeshStandardMaterial({
        color: 0x1a1a1a,
        roughness: 0.5,
        metalness: 0.3
      })
    )
    screenWall.position.set(0, 2.25, 2.7)
    screenWall.castShadow = true
    screenWall.receiveShadow = true
    monitorGroup.add(screenWall)

    const mainScreen = new THREE.Mesh(
      new THREE.PlaneGeometry(4.5, 2.5),
      new THREE.MeshStandardMaterial({
        color: 0x0a1628,
        emissive: 0x0a1628,
        emissiveIntensity: 0.8,
        roughness: 0.1,
        metalness: 0
      })
    )
    mainScreen.position.set(0, 2.5, 2.81)
    monitorGroup.add(mainScreen)

    const displayMaterial = new THREE.MeshStandardMaterial({
      color: 0x00ff00,
      emissive: 0x00ff00,
      emissiveIntensity: 0.5,
      roughness: 0.1,
      metalness: 0
    })

    for (let i = 0; i < 4; i++) {
      const rect = new THREE.Mesh(
        new THREE.PlaneGeometry(1, 0.6),
        displayMaterial
      )
      rect.position.set(-1.75 + i * 1.2, 3.2, 2.82)
      monitorGroup.add(rect)
    }

    for (let i = 0; i < 3; i++) {
      const bar = new THREE.Mesh(
        new THREE.PlaneGeometry(2.5, 0.15),
        new THREE.MeshStandardMaterial({
          color: 0x4a90d9,
          emissive: 0x4a90d9,
          emissiveIntensity: 0.5,
          roughness: 0.1,
          metalness: 0
        })
      )
      bar.position.set(-0.8, 2.2 - i * 0.25, 2.82)
      bar.scale.x = 0.5 + Math.random() * 0.5
      monitorGroup.add(bar)
    }

    const consoleDesk = new THREE.Mesh(
      new THREE.BoxGeometry(5, 0.1, 0.8),
      new THREE.MeshStandardMaterial({
        color: 0x2c2c2c,
        roughness: 0.4,
        metalness: 0.7
      })
    )
    consoleDesk.position.set(0, 0.9, 0.5)
    consoleDesk.castShadow = true
    consoleDesk.receiveShadow = true
    monitorGroup.add(consoleDesk)

    for (let i = 0; i < 3; i++) {
      const leg = new THREE.Mesh(
        new THREE.CylinderGeometry(0.05, 0.05, 0.9, 16),
        new THREE.MeshStandardMaterial({
          color: 0x1a1a1a,
          roughness: 0.4,
          metalness: 0.7
        })
      )
      leg.position.set(-2 + i * 2, 0.45, 0.5)
      leg.castShadow = true
      leg.receiveShadow = true
      monitorGroup.add(leg)
    }

    for (let i = 0; i < 3; i++) {
      const smallMonitor = new THREE.Group()

      const monitorBody = new THREE.Mesh(
        new THREE.BoxGeometry(0.6, 0.45, 0.08),
        new THREE.MeshStandardMaterial({
          color: 0x1a1a1a,
          roughness: 0.3,
          metalness: 0.7
        })
      )
      monitorBody.position.y = 1.2
      monitorBody.castShadow = true
      monitorBody.receiveShadow = true
      smallMonitor.add(monitorBody)

      const monitorScreen = new THREE.Mesh(
        new THREE.PlaneGeometry(0.52, 0.37),
        new THREE.MeshStandardMaterial({
          color: 0x0a1628,
          emissive: 0x0a2638,
          emissiveIntensity: 0.6,
          roughness: 0.1,
          metalness: 0
        })
      )
      monitorScreen.position.set(0, 1.2, 0.045)
      smallMonitor.add(monitorScreen)

      smallMonitor.position.set(-1.5 + i * 1.5, 0, 0.3)
      monitorGroup.add(smallMonitor)
    }

    for (let i = 0; i < 3; i++) {
      const chair = this.createChair()
      chair.position.set(-1.5 + i * 1.5, 0, -0.5)
      chair.rotation.y = Math.PI
      monitorGroup.add(chair)
    }

    this.group.add(monitorGroup)
  }
}
