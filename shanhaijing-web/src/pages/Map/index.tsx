import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import './index.css';

interface ScenicSpot {
  id: string;
  name: string;
  coordinates: {
    longitude: number;
    latitude: number;
  };
}

const Map: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const earthRef = useRef<THREE.Mesh | null>(null);
  const markersRef = useRef<THREE.Mesh[]>([]);
  const pulsesRef = useRef<THREE.Mesh[]>([]);
  const [mapType, setMapType] = useState<'globe' | 'china'>('globe');
  const [loading, setLoading] = useState(true);

  const scenicSpots: ScenicSpot[] = [
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
  ];

  useEffect(() => {
    initThree();
    createMarkers();
    animate();
    setLoading(false);

    return () => {
      // 清理Three.js资源
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
    };
  }, []);

  const initThree = () => {
    if (!containerRef.current) return;

    // 创建场景
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    sceneRef.current = scene;

    // 创建相机
    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 5;
    cameraRef.current = camera;

    // 创建渲染器
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 创建地球
    const earthGeometry = new THREE.SphereGeometry(2, 64, 64);
    const earthMaterial = new THREE.MeshPhongMaterial({
      color: 0x336699,
      specular: 0x111111,
      shininess: 10
    });
    const earth = new THREE.Mesh(earthGeometry, earthMaterial);
    scene.add(earth);
    earthRef.current = earth;

    // 添加光照
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 3, 5);
    scene.add(directionalLight);

    // 响应窗口大小变化
    const handleResize = () => {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current) return;

      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;

      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);
  };

  const createMarkers = () => {
    if (!sceneRef.current) return;

    // 清除现有标记
    markersRef.current.forEach(marker => sceneRef.current?.remove(marker));
    pulsesRef.current.forEach(pulse => sceneRef.current?.remove(pulse));
    markersRef.current = [];
    pulsesRef.current = [];

    // 创建新标记
    scenicSpots.forEach((point) => {
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
      sceneRef.current?.add(marker);
      markersRef.current.push(marker);

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
      sceneRef.current?.add(pulse);
      pulsesRef.current.push(pulse);

      // 动画脉冲
      animatePulse(pulse);
    });
  };

  const animatePulse = (pulse: THREE.Mesh) => {
    const animate = () => {
      requestAnimationFrame(animate);
      pulse.scale.x *= 1.02;
      pulse.scale.y *= 1.02;
      pulse.scale.z *= 1.02;
      if (Array.isArray(pulse.material)) {
        pulse.material.forEach(material => {
          if ('opacity' in material) {
            material.opacity *= 0.95;
          }
        });
      } else if ('opacity' in pulse.material) {
        pulse.material.opacity *= 0.95;
      }

      if (Array.isArray(pulse.material)) {
        pulse.material.forEach(material => {
          if ('opacity' in material && material.opacity < 0.01) {
            pulse.scale.set(1, 1, 1);
            material.opacity = 0.5;
          }
        });
      } else if ('opacity' in pulse.material && pulse.material.opacity < 0.01) {
        pulse.scale.set(1, 1, 1);
        pulse.material.opacity = 0.5;
      }
    };
    animate();
  };

  const animate = () => {
    requestAnimationFrame(animate);

    // 旋转地球
    if (earthRef.current) {
      earthRef.current.rotation.y += 0.001;
    }

    // 渲染场景
    if (rendererRef.current && sceneRef.current && cameraRef.current) {
      rendererRef.current.render(sceneRef.current, cameraRef.current);
    }
  };

  const switchMapType = () => {
    setMapType(prev => prev === 'globe' ? 'china' : 'globe');
    // 这里可以根据mapType切换不同的地图模式
    console.log('切换地图类型:', mapType);
  };

  const zoomIn = () => {
    if (cameraRef.current) {
      cameraRef.current.position.z -= 0.5;
    }
  };

  const zoomOut = () => {
    if (cameraRef.current) {
      cameraRef.current.position.z += 0.5;
    }
  };

  const resetMap = () => {
    if (cameraRef.current) {
      cameraRef.current.position.set(0, 0, 5);
      cameraRef.current.lookAt(0, 0, 0);
    }
  };

  const showScenicSpotDetail = (id: string) => {
    const spot = scenicSpots.find(s => s.id === id);
    if (spot) {
      console.log('显示景点详情:', spot);
      // 这里可以跳转到详情页或显示弹窗
    }
  };

  return (
    <div className="map-container">
      {/* 3D地球仪/中国地图容器 */}
      <div ref={containerRef} id="mapCanvas" className="map-canvas"></div>

      {/* 地图控制栏 */}
      <div className="map-control">
        <button className="map-control-btn" onClick={switchMapType}>
          <span>{mapType === 'globe' ? '🌎' : '🗺️'}</span>
        </button>
        <button className="map-control-btn" onClick={zoomIn}>
          <span>🔍+</span>
        </button>
        <button className="map-control-btn" onClick={zoomOut}>
          <span>🔍-</span>
        </button>
        <button className="map-control-btn" onClick={resetMap}>
          <span>🔄</span>
        </button>
      </div>

      {/* 自然奇观标记 */}
      {scenicSpots.map((item) => (
        <div
          key={item.id}
          className="map-marker"
          style={{
            left: `${(item.coordinates.longitude + 180) / 360 * 100}%`,
            top: `${(90 - item.coordinates.latitude) / 180 * 100}%`
          }}
        >
          <button className="map-marker-icon" onClick={() => showScenicSpotDetail(item.id)}>
            <span>📍</span>
          </button>
          <div className="map-marker-label">{item.name}</div>
        </div>
      ))}

      {/* 加载中 */}
      {loading && (
        <div className="loading">
          <span>地图加载中...</span>
        </div>
      )}
    </div>
  );
};

export default Map;