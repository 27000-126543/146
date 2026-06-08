<template>
  <div ref="containerRef" class="w-full h-full relative">
    <div v-if="!isSceneReady" class="absolute inset-0 flex items-center justify-center bg-[#0a1628] z-50">
      <div class="text-center">
        <div class="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p class="text-cyan-400 text-lg">正在加载3D政务大厅场景...</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import * as THREE from 'three'
import { SceneManager } from '@/three/core/SceneManager'
import { HallBuilder } from '@/three/models/HallBuilder'
import { WindowBuilder } from '@/three/models/WindowBuilder'
import { PersonnelBuilder } from '@/three/models/PersonnelBuilder'
import { AnimationManager, type BlinkAnimation } from '@/three/animations/AnimationManager'
import { useWindowStore } from '@/store/window'
import { useHallStore } from '@/store/hall'
import type { WindowInfo, GuideLine, MaterialFlow, EvacuationPath, Position3D } from '@/types'

const containerRef = ref<HTMLDivElement | null>(null)
const isSceneReady = ref(false)

const windowStore = useWindowStore()
const hallStore = useHallStore()

let sceneManager: SceneManager | null = null
let animationManager: AnimationManager | null = null
let hallBuilder: HallBuilder | null = null

const createdGuideLines = new Set<string>()
const createdMaterialFlows = new Set<string>()
const createdEvacuationPaths = new Set<string>()
const createdBlinkAnimations = new Map<string, BlinkAnimation>()
const personnelBodyMeshes = new Map<string, THREE.Mesh>()

const roleColors: Record<string, number> = {
  window: 0x2196f3,
  chief: 0x9c27b0,
  leader: 0xffc107
}

const initScene = () => {
  if (!containerRef.value) return

  try {
    sceneManager = new SceneManager(containerRef.value)
    animationManager = new AnimationManager(sceneManager.scene)

    hallBuilder = new HallBuilder()
    const hallGroup = hallBuilder.build()
    sceneManager.scene.add(hallGroup)

    const windowGroups = WindowBuilder.createAllWindows(windowStore.windows)
    windowGroups.forEach(windowGroup => {
      sceneManager!.scene.add(windowGroup)
      sceneManager!.windowObjects.push(windowGroup)
    })

    const personnelGroups = PersonnelBuilder.createAllPersonnel(hallStore.personnel)
    personnelGroups.forEach(personnelGroup => {
      sceneManager!.scene.add(personnelGroup)
      sceneManager!.personnelObjects.push(personnelGroup)
      
      const bodyMesh = findBodyMesh(personnelGroup)
      if (bodyMesh) {
        personnelBodyMeshes.set(personnelGroup.userData.personnelId, bodyMesh)
      }
    })

    setupClickHandler()
    setupHoverHandler()

    sceneManager.setAnimationCallback(handleAnimationFrame)
    sceneManager.startAnimation()

    hallStore.startFanParticles()
    animationManager.createFanParticles()

    setTimeout(() => {
      isSceneReady.value = true
    }, 500)
  } catch (error) {
    console.error('Failed to initialize 3D scene:', error)
  }
}

const findBodyMesh = (group: THREE.Object3D): THREE.Mesh | undefined => {
  let found: THREE.Mesh | undefined
  
  group.traverse((child) => {
    if (child instanceof THREE.Mesh && child.userData.type === 'body') {
      found = child
    }
  })
  
  return found
}

const setupClickHandler = () => {
  if (!sceneManager || !sceneManager.renderer) return

  sceneManager.renderer.domElement.addEventListener('click', handleClick)
}

const setupHoverHandler = () => {
  if (!sceneManager || !sceneManager.renderer) return

  sceneManager.renderer.domElement.addEventListener('mousemove', handleMouseMove)
}

const handleMouseMove = (event: MouseEvent) => {
  if (!sceneManager) return

  const intersection = getIntersection(event)
  if (intersection) {
    sceneManager.renderer.domElement.style.cursor = 'pointer'
  } else {
    sceneManager.renderer.domElement.style.cursor = 'grab'
  }
}

const getIntersection = (event: MouseEvent): THREE.Intersection | null => {
  if (!sceneManager) return null

  const rect = sceneManager.renderer.domElement.getBoundingClientRect()
  const mouse = new THREE.Vector2(
    ((event.clientX - rect.left) / rect.width) * 2 - 1,
    -((event.clientY - rect.top) / rect.height) * 2 + 1
  )
  sceneManager.raycaster.setFromCamera(mouse, sceneManager.camera)

  const allObjects = [
    ...sceneManager.windowObjects,
    ...sceneManager.personnelObjects
  ]

  const intersects = sceneManager.raycaster.intersectObjects(allObjects, true)
  
  if (intersects.length > 0) {
    let target = intersects[0].object
    const validTypes = ['window', 'personnel']
    while (target.parent && !validTypes.includes(target.userData.type)) {
      target = target.parent
    }
    if (validTypes.includes(target.userData.type)) {
      return { ...intersects[0], object: target }
    }
  }
  
  return null
}

const handleClick = (event: MouseEvent) => {
  if (!sceneManager) return

  const intersection = getIntersection(event)
  
  if (!intersection) {
    windowStore.selectWindow(null)
    return
  }

  const targetObject = intersection.object

  if (targetObject.userData.type === 'window') {
    const windowId = targetObject.userData.windowId
    const windowInfo = windowStore.getWindowById(windowId)
    if (windowInfo) {
      windowStore.selectWindow(windowInfo)
      const focusPos = new THREE.Vector3(
        targetObject.position.x,
        targetObject.position.y + 2,
        targetObject.position.z + 5
      )
      sceneManager.focusOnObject(focusPos)
    }
  }
}

const handleAnimationFrame = (delta: number) => {
  if (!animationManager || !sceneManager) return

  windowStore.simulateQueueUpdate()
  hallStore.simulateEnvironment()
  hallStore.movePersonnelRandomly()
  hallStore.updateFanParticles()

  updatePersonnelPositions()
  updatePersonnelAnimations(delta)
  updateWindowDisplays()
  updateFanParticles()

  animationManager.update(delta)
}

const updatePersonnelPositions = () => {
  hallStore.personnel.forEach(personnel => {
    PersonnelBuilder.updatePersonnelPosition(personnel.id, personnel.location)
  })
}

const updatePersonnelAnimations = (delta: number) => {
  PersonnelBuilder.updateAnimation(delta)

  hallStore.personnel.forEach(personnel => {
    const bodyMesh = personnelBodyMeshes.get(personnel.id)
    if (!bodyMesh) return

    if (personnel.alertActive) {
      if (!createdBlinkAnimations.has(personnel.id)) {
        const blinkAnim = animationManager!.createBlinkAnimation(
          bodyMesh,
          roleColors[personnel.role] || 0x2196f3,
          0xff0000
        )
        blinkAnim.start()
        createdBlinkAnimations.set(personnel.id, blinkAnim)
        PersonnelBuilder.setAlertState(personnel.id, true)
      }
    } else {
      const blinkAnim = createdBlinkAnimations.get(personnel.id)
      if (blinkAnim) {
        blinkAnim.stop()
        createdBlinkAnimations.delete(personnel.id)
        PersonnelBuilder.setAlertState(personnel.id, false)
      }
    }
  })
}

const updateWindowDisplays = () => {
  if (!sceneManager) return

  windowStore.windows.forEach(windowInfo => {
    const windowGroup = sceneManager!.windowObjects.find(
      obj => obj.userData.windowId === windowInfo.id
    ) as THREE.Group | undefined
    if (windowGroup) {
      WindowBuilder.updateWindowDisplay(windowGroup, {
        currentNumber: windowInfo.currentNumber,
        businessName: windowInfo.businessName
      })
    }
  })
}

const updateFanParticles = () => {
  if (!animationManager || !hallStore.fanParticles.active) return

  const positions: Position3D[] = []
  const posArray = hallStore.fanParticles.positions
  for (let i = 0; i < posArray.length; i += 3) {
    positions.push({
      x: posArray[i],
      y: posArray[i + 1],
      z: posArray[i + 2]
    })
  }

  animationManager.updateFanParticles(positions)
}

const handleGuideLinesChange = (guideLines: GuideLine[]) => {
  if (!animationManager) return

  guideLines.forEach(guideLine => {
    if (guideLine.active && !createdGuideLines.has(guideLine.id)) {
      animationManager!.createGuideLine(guideLine.start, guideLine.end)
      createdGuideLines.add(guideLine.id)
    }
  })

  createdGuideLines.forEach(id => {
    const guideLine = guideLines.find(g => g.id === id)
    if (!guideLine || !guideLine.active) {
      createdGuideLines.delete(id)
    }
  })
}

const handleMaterialFlowsChange = (materialFlows: MaterialFlow[]) => {
  if (!animationManager) return

  materialFlows.forEach(flow => {
    if (flow.active && !createdMaterialFlows.has(flow.id)) {
      animationManager!.createMaterialFlow(flow.materialName, flow.from, flow.to)
      createdMaterialFlows.add(flow.id)
    }
  })

  createdMaterialFlows.forEach(id => {
    const flow = materialFlows.find(f => f.id === id)
    if (!flow || !flow.active) {
      createdMaterialFlows.delete(id)
    }
  })
}

const handleEvacuationPathsChange = (evacuationPaths: EvacuationPath[]) => {
  if (!animationManager) return

  evacuationPaths.forEach(path => {
    if (path.active && !createdEvacuationPaths.has(path.id)) {
      animationManager!.createEvacuationPath(path.points, path.type)
      createdEvacuationPaths.add(path.id)
    }
  })

  createdEvacuationPaths.forEach(id => {
    const path = evacuationPaths.find(p => p.id === id)
    if (!path || !path.active) {
      createdEvacuationPaths.delete(id)
    }
  })
}

const handleFanParticlesChange = (fanParticles: { positions: number[]; active: boolean }) => {
  if (!animationManager) return

  if (fanParticles.active && !animationManager.hasFanParticles()) {
    animationManager.createFanParticles()
  }
}

watch(() => windowStore.guideLines, handleGuideLinesChange, { deep: true })
watch(() => hallStore.materialFlows, handleMaterialFlowsChange, { deep: true })
watch(() => hallStore.evacuationPaths, handleEvacuationPathsChange, { deep: true })
watch(() => hallStore.fanParticles, handleFanParticlesChange, { deep: true })

onMounted(() => {
  initScene()
})

onUnmounted(() => {
  if (sceneManager && sceneManager.renderer) {
    sceneManager.renderer.domElement.removeEventListener('click', handleClick)
    sceneManager.renderer.domElement.removeEventListener('mousemove', handleMouseMove)
  }

  createdBlinkAnimations.forEach(anim => {
    anim.dispose()
  })
  createdBlinkAnimations.clear()
  personnelBodyMeshes.clear()

  if (animationManager) {
    animationManager.dispose()
    animationManager = null
  }

  PersonnelBuilder.dispose()

  if (sceneManager) {
    sceneManager.dispose()
    sceneManager = null
  }

  hallBuilder = null

  createdGuideLines.clear()
  createdMaterialFlows.clear()
  createdEvacuationPaths.clear()
})
</script>
