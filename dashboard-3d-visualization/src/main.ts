import './style.css'
import * as THREE from 'three'

// 定义自然奇观点位类型
interface WonderPoint {
  name: string
  position: [number, number, number]
  description: string
  visitors: number
}

// 创建场景
const scene = new THREE.Scene()
scene.background = new THREE.Color(0x000000)

// 创建相机
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
camera.position.z = 5

// 创建渲染器
const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

// 创建地球
const earthGeometry = new THREE.SphereGeometry(2, 64, 64)
const earthMaterial = new THREE.MeshPhongMaterial({
  color: 0x336699,
  specular: 0x111111,
  shininess: 10
})
const earth = new THREE.Mesh(earthGeometry, earthMaterial)
scene.add(earth)

// 添加光照
const ambientLight = new THREE.AmbientLight(0x404040)
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
directionalLight.position.set(5, 3, 5)
scene.add(directionalLight)

// 自然奇观观测点位数据
let wonderPoints: WonderPoint[] = [
  { name: '大堡礁', position: [153.5, -18.28, 0], description: '世界最大的珊瑚礁系统', visitors: 2000000 },
  { name: '大峡谷', position: [-112.1, 36.1, 0], description: '美国亚利桑那州的壮观峡谷', visitors: 5000000 },
  { name: '埃菲尔铁塔', position: [2.35, 48.85, 0], description: '法国巴黎的标志性建筑', visitors: 7000000 },
  { name: '长城', position: [116.4, 40.4, 0], description: '中国古代伟大的防御工程', visitors: 10000000 },
  { name: '金字塔', position: [31.23, 29.97, 0], description: '埃及古代法老的陵墓', visitors: 4000000 }
]

// 创建立标点
const markers: THREE.Mesh[] = []
const pulses: THREE.Mesh[] = []
let selectedPoint: WonderPoint | null = null

// 创建信息面板
const infoPanel = document.createElement('div')
infoPanel.id = 'info-panel'
infoPanel.innerHTML = `
  <h2>自然奇观</h2>
  <p>点击标记点查看详情</p>
`
document.body.appendChild(infoPanel)

// 创建控制按钮
const controls = document.createElement('div')
controls.id = 'controls'
controls.innerHTML = `
  <button id="refresh">刷新数据</button>
  <button id="zoom-in">放大</button>
  <button id="zoom-out">缩小</button>
  <button id="reset">重置视角</button>
`
document.body.appendChild(controls)

// 添加控制按钮事件监听
document.getElementById('refresh')?.addEventListener('click', refreshData)
document.getElementById('zoom-in')?.addEventListener('click', () => {
  camera.position.z -= 0.5
})
document.getElementById('zoom-out')?.addEventListener('click', () => {
  camera.position.z += 0.5
})
document.getElementById('reset')?.addEventListener('click', () => {
  camera.position.set(0, 0, 5)
  camera.lookAt(0, 0, 0)
})

// 创建立标点和脉冲效果
function createMarkers() {
  // 清除现有标记
  markers.forEach(marker => scene.remove(marker))
  pulses.forEach(pulse => scene.remove(pulse))
  markers.length = 0
  pulses.length = 0
  
  // 创建新标记
  wonderPoints.forEach((point) => {
    // 计算球面坐标
    const phi = (90 - point.position[1]) * Math.PI / 180
    const theta = (point.position[0] + 180) * Math.PI / 180
    
    const x = 2 * Math.sin(phi) * Math.cos(theta)
    const y = 2 * Math.cos(phi)
    const z = 2 * Math.sin(phi) * Math.sin(theta)
    
    // 创建标记点
    const markerGeometry = new THREE.SphereGeometry(0.05, 16, 16)
    const markerMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 })
    const marker = new THREE.Mesh(markerGeometry, markerMaterial)
    marker.position.set(x, y, z)
    scene.add(marker)
    markers.push(marker)
    
    // 添加点击事件
    marker.userData = { point: point }
    
    // 创建脉冲效果
    const pulseGeometry = new THREE.SphereGeometry(0.1, 16, 16)
    const pulseMaterial = new THREE.MeshBasicMaterial({
      color: 0xff0000,
      transparent: true,
      opacity: 0.5
    })
    const pulse = new THREE.Mesh(pulseGeometry, pulseMaterial)
    pulse.position.set(x, y, z)
    scene.add(pulse)
    pulses.push(pulse)
    
    // 动画脉冲
    function animatePulse() {
      requestAnimationFrame(animatePulse)
      pulse.scale.x *= 1.02
      pulse.scale.y *= 1.02
      pulse.scale.z *= 1.02
      pulse.material.opacity *= 0.95
      
      if (pulse.material.opacity < 0.01) {
        pulse.scale.set(1, 1, 1)
        pulse.material.opacity = 0.5
      }
    }
    animatePulse()
  })
}

// 数据拉取和更新逻辑
function refreshData() {
  console.log('刷新数据...')
  
  // 模拟数据拉取
  setTimeout(() => {
    // 随机更新访问量数据
    wonderPoints = wonderPoints.map(point => ({
      ...point,
      visitors: point.visitors + Math.floor(Math.random() * 100000)
    }))
    
    // 重新创建标记
    createMarkers()
    
    // 更新信息面板
    if (selectedPoint) {
      updateInfoPanel(selectedPoint)
    }
    
    console.log('数据刷新完成')
  }, 1000)
}

// 更新信息面板
function updateInfoPanel(point: WonderPoint) {
  infoPanel.innerHTML = `
    <h2>${point.name}</h2>
    <p>描述: ${point.description}</p>
    <p>访问量: ${point.visitors.toLocaleString()}</p>
    <p>位置: ${point.position[0].toFixed(2)}, ${point.position[1].toFixed(2)}</p>
  `
}

// 射线检测，用于点击标记点
const raycaster = new THREE.Raycaster()
const mouse = new THREE.Vector2()

window.addEventListener('click', (event) => {
  // 计算鼠标在屏幕上的位置
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1
  
  // 发射射线
  raycaster.setFromCamera(mouse, camera)
  
  // 检测射线与标记点的交点
  const intersects = raycaster.intersectObjects(markers)
  
  if (intersects.length > 0) {
    // 获取点击的标记点
    const clickedMarker = intersects[0].object as THREE.Mesh
    selectedPoint = clickedMarker.userData.point
    
    // 更新信息面板
    if (selectedPoint) {
      updateInfoPanel(selectedPoint)
    }
    
    // 动画相机到标记点位置
    const targetPosition = clickedMarker.position.clone()
    targetPosition.multiplyScalar(1.5) // 保持一定距离
    
    function animateCamera() {
      const done = camera.position.lerp(targetPosition, 0.05).distanceTo(targetPosition) < 0.1
      camera.lookAt(clickedMarker.position)
      if (!done) {
        requestAnimationFrame(animateCamera)
      }
    }
    animateCamera()
  }
})

// 初始化标记
createMarkers()

// 动画循环
function animate() {
  requestAnimationFrame(animate)
  
  // 旋转地球
  earth.rotation.y += 0.001
  
  renderer.render(scene, camera)
}
animate()

// 响应窗口大小变化
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
})
