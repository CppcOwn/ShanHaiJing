import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';

function App() {
  const containerRef = useRef(null);
  const [selectedWonder, setSelectedWonder] = useState(null);
  
  // 自然奇观数据
  const wonders = [
    { id: 1, name: '云海', location: '黄山', lat: 30.1333, lng: 118.1667, description: '黄山云海是黄山四绝之一，以其变幻莫测的云海景观著称。' },
    { id: 2, name: '日出', location: '泰山', lat: 36.2667, lng: 117.1500, description: '泰山日出是中国著名的自然奇观，象征着光明和希望。' },
    { id: 3, name: '星空', location: '茶卡盐湖', lat: 36.9044, lng: 99.0286, description: '茶卡盐湖的星空倒影被誉为"天空之镜"，是摄影爱好者的天堂。' },
    { id: 4, name: '江潮', location: '钱塘江', lat: 30.2741, lng: 120.1551, description: '钱塘江大潮是世界三大涌潮之一，以其壮观的潮水著称。' },
    { id: 5, name: '日照金山', location: '梅里雪山', lat: 28.4744, lng: 98.8789, description: '梅里雪山的日照金山景观是摄影爱好者追逐的目标。' }
  ];

  useEffect(() => {
    if (!containerRef.current) return;
    
    // 初始化 Three.js 场景
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    containerRef.current.appendChild(renderer.domElement);

    // 创建地球
    const geometry = new THREE.SphereGeometry(1, 32, 32);
    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load('https://threejs.org/examples/textures/land_ocean_ice_cloud_2048.jpg');
    const material = new THREE.MeshBasicMaterial({ map: texture });
    const earth = new THREE.Mesh(geometry, material);
    scene.add(earth);

    // 添加自然奇观标记
    const markers = [];
    const markerGeometries = [];
    
    wonders.forEach(wonder => {
      const markerGeometry = new THREE.SphereGeometry(0.02, 16, 16);
      const markerMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
      const marker = new THREE.Mesh(markerGeometry, markerMaterial);
      
      // 将经纬度转换为 3D 坐标
      const lat = wonder.lat * Math.PI / 180;
      const lng = wonder.lng * Math.PI / 180;
      marker.position.set(
        Math.cos(lat) * Math.cos(lng),
        Math.sin(lat),
        Math.cos(lat) * Math.sin(lng)
      );
      
      scene.add(marker);
      markers.push(marker);
      markerGeometries.push(markerGeometry);
    });

    // 设置相机位置
    camera.position.z = 2;

    // 动画循环
    let animationId;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      earth.rotation.y += 0.001;
      renderer.render(scene, camera);
    };

    animate();

    // 响应窗口大小变化
    const handleResize = () => {
      if (!camera || !renderer) return;
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    // 清理
    return () => {
      window.removeEventListener('resize', handleResize);
      
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
      
      // 清理 Three.js 资源
      markers.forEach(marker => scene.remove(marker));
      markerGeometries.forEach(geometry => geometry.dispose());
      material.dispose();
      geometry.dispose();
      texture.dispose();
      
      if (renderer) {
        renderer.dispose();
        if (containerRef.current && containerRef.current.contains(renderer.domElement)) {
          containerRef.current.removeChild(renderer.domElement);
        }
      }
    };
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
      
      {/* 侧边栏 */}
      <div style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: '300px',
        height: '100%',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        padding: '20px',
        overflowY: 'auto'
      }}>
        <h1>中国自然奇观</h1>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {wonders.map(wonder => (
            <li key={wonder.id} style={{
              padding: '10px',
              marginBottom: '10px',
              backgroundColor: selectedWonder?.id === wonder.id ? '#e0e0e0' : '#f0f0f0',
              cursor: 'pointer',
              borderRadius: '5px'
            }} onClick={() => setSelectedWonder(wonder)}>
              <h3>{wonder.name}</h3>
              <p>{wonder.location}</p>
              {selectedWonder?.id === wonder.id && (
                <p style={{ marginTop: '10px' }}>{wonder.description}</p>
              )}
            </li>
          ))}
        </ul>
      </div>
      
      {/* 顶部信息栏 */}
      <div style={{
        position: 'absolute',
        top: 0,
        right: 0,
        width: 'calc(100% - 300px)',
        height: '60px',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        padding: '10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <h2>中国自然奇观文旅地球仪</h2>
      </div>
    </div>
  );
}

export default App;