import { Component } from 'react';
import { View, Text } from '@tarojs/components';
import * as THREE from 'three';
import './map.css';

interface ScenicSpot {
  id: string;
  name: string;
  coordinates: {
    longitude: number;
    latitude: number;
  };
}

class Map extends Component {
  private container: HTMLElement | null = null;
  private scene: THREE.Scene | null = null;
  private camera: THREE.PerspectiveCamera | null = null;
  private renderer: THREE.WebGLRenderer | null = null;
  private earth: THREE.Mesh | null = null;
  private markers: THREE.Mesh[] = [];
  private pulses: THREE.Mesh[] = [];
  private selectedPoint: any = null;
  private mapType: 'globe' | 'china' = 'globe';

  state = {
    scenicSpots: [
      {
        id: '1',
        name: '大堡礁',
        coordinates: { longitude: 153.5, latitude: -18.28 }
      },
      {
        id: '2',
        name: '大峡谷',
        coordinates: { longitude: -112.1, latitude: 36.1 }
      },
      {
        id: '3',
        name: '埃菲尔铁塔',
        coordinates: { longitude: 2.35, latitude: 48.85 }
      },
      {
        id: '4',
        name: '长城',
        coordinates: { longitude: 116.4, latitude: 40.4 }
      },
      {
        id: '5',
        name: '金字塔',
        coordinates: { longitude: 31.23, latitude: 29.97 }
      }
    ],
    loading: true
  };

  componentDidMount() {
    this.initThree();
    this.createMarkers();
    this.animate();
    this.setState({ loading: false });
  }

  componentWillUnmount() {
    // 清理Three.js资源
    if (this.renderer) {
      this.renderer.dispose();
    }
  }

  initThree() {
    // 获取容器
    this.container = document.getElementById('mapCanvas');
    if (!this.container) return;

    // 创建场景
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x000000);

    // 创建相机
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    this.camera.position.z = 5;

    // 创建渲染器
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(width, height);
    this.container.appendChild(this.renderer.domElement);

    // 创建地球
    const earthGeometry = new THREE.SphereGeometry(2, 64, 64);
    const earthMaterial = new THREE.MeshPhongMaterial({
      color: 0x336699,
      specular: 0x111111,
      shininess: 10
    });
    this.earth = new THREE.Mesh(earthGeometry, earthMaterial);
    this.scene.add(this.earth);

    // 添加光照
    const ambientLight = new THREE.AmbientLight(0x404040);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 3, 5);
    this.scene.add(directionalLight);

    // 响应窗口大小变化
    window.addEventListener('resize', this.handleResize);
  }

  handleResize = () => {
    if (!this.container || !this.camera || !this.renderer) return;

    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };

  createMarkers() {
    if (!this.scene) return;

    // 清除现有标记
    this.markers.forEach(marker => this.scene?.remove(marker));
    this.pulses.forEach(pulse => this.scene?.remove(pulse));
    this.markers.length = 0;
    this.pulses.length = 0;

    // 创建新标记
    this.state.scenicSpots.forEach((point) => {
      // 计算球面坐标
      const phi = (90 - point.coordinates.latitude) * Math.PI / 180;
      const theta = (point.coordinates.longitude + 180) * Math.PI / 180;

      const x = 2 * Math.sin(phi) * Math.cos(theta);
      const y = 2 * Math.cos(phi);
      const z = 2 * Math.sin(phi) * Math.sin(theta);

      // 创建标记点
      const markerGeometry = new THREE.SphereGeometry(0.05, 16, 16);
      const markerMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
      const marker = new THREE.Mesh(markerGeometry, markerMaterial);
      marker.position.set(x, y, z);
      this.scene?.add(marker);
      this.markers.push(marker);

      // 添加点击事件
      marker.userData = { point: point };

      // 创建脉冲效果
      const pulseGeometry = new THREE.SphereGeometry(0.1, 16, 16);
      const pulseMaterial = new THREE.MeshBasicMaterial({
        color: 0xff0000,
        transparent: true,
        opacity: 0.5
      });
      const pulse = new THREE.Mesh(pulseGeometry, pulseMaterial);
      pulse.position.set(x, y, z);
      this.scene?.add(pulse);
      this.pulses.push(pulse);

      // 动画脉冲
      this.animatePulse(pulse);
    });
  }

  animatePulse(pulse: THREE.Mesh) {
    const animate = () => {
      requestAnimationFrame(animate);
      pulse.scale.x *= 1.02;
      pulse.scale.y *= 1.02;
      pulse.scale.z *= 1.02;
      pulse.material.opacity *= 0.95;

      if (pulse.material.opacity < 0.01) {
        pulse.scale.set(1, 1, 1);
        pulse.material.opacity = 0.5;
      }
    };
    animate();
  }

  animate = () => {
    requestAnimationFrame(this.animate);

    // 旋转地球
    if (this.earth) {
      this.earth.rotation.y += 0.001;
    }

    // 渲染场景
    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  };

  switchMapType = () => {
    this.mapType = this.mapType === 'globe' ? 'china' : 'globe';
    // 这里可以根据mapType切换不同的地图模式
    console.log('切换地图类型:', this.mapType);
  };

  zoomIn = () => {
    if (this.camera) {
      this.camera.position.z -= 0.5;
    }
  };

  zoomOut = () => {
    if (this.camera) {
      this.camera.position.z += 0.5;
    }
  };

  resetMap = () => {
    if (this.camera) {
      this.camera.position.set(0, 0, 5);
      this.camera.lookAt(0, 0, 0);
    }
  };

  showScenicSpotDetail = (e: any) => {
    const id = e.currentTarget.dataset.id;
    const spot = this.state.scenicSpots.find(s => s.id === id);
    if (spot) {
      console.log('显示景点详情:', spot);
      // 这里可以跳转到详情页或显示弹窗
    }
  };

  render() {
    const { scenicSpots, loading } = this.state;

    return (
      <View className="map-container">
        {/* 3D地球仪/中国地图容器 */}
        <View id="mapCanvas" className="map-canvas"></View>

        {/* 地图控制栏 */}
        <View className="map-control">
          <View className="map-control-btn" onClick={this.switchMapType}>
            <Text>{this.mapType === 'globe' ? '🌎' : '🗺️'}</Text>
          </View>
          <View className="map-control-btn" onClick={this.zoomIn}>
            <Text>🔍+</Text>
          </View>
          <View className="map-control-btn" onClick={this.zoomOut}>
            <Text>🔍-</Text>
          </View>
          <View className="map-control-btn" onClick={this.resetMap}>
            <Text>🔄</Text>
          </View>
        </View>

        {/* 自然奇观标记 */}
        {scenicSpots.map((item) => (
          <View
            key={item.id}
            className="map-marker"
            style={{
              left: `${(item.coordinates.longitude + 180) / 360 * 100}%`,
              top: `${(90 - item.coordinates.latitude) / 180 * 100}%`
            }}
          >
            <View className="map-marker-icon" data-id={item.id} onClick={this.showScenicSpotDetail}>
              <Text>📍</Text>
            </View>
            <View className="map-marker-label">{item.name}</View>
          </View>
        ))}

        {/* 加载中 */}
        {loading && (
          <View className="loading">
            <Text>地图加载中...</Text>
          </View>
        )}
      </View>
    );
  }
}

export default Map;