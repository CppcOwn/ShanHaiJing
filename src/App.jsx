import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';

function App() {
  const containerRef = useRef(null);
  const [selectedWonder, setSelectedWonder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // 自然奇观数据
  const wonders = [
    { id: 1, name: '云海', location: '黄山', lat: 30.1333, lng: 118.1667, description: '黄山云海是黄山四绝之一，以其变幻莫测的云海景观著称。最佳观测季节为春秋两季，最佳时间为清晨。', color: 0xff6b6b, intensity: 1.0 },
    { id: 2, name: '日出', location: '泰山', lat: 36.2667, lng: 117.1500, description: '泰山日出是中国著名的自然奇观，象征着光明和希望。最佳观测季节为春秋两季，最佳时间为日出前后。', color: 0xffd93d, intensity: 1.2 },
    { id: 3, name: '星空', location: '茶卡盐湖', lat: 36.9044, lng: 99.0286, description: '茶卡盐湖的星空倒影被誉为"天空之镜"，是摄影爱好者的天堂。最佳观测季节为夏季，最佳时间为夜晚。', color: 0x48dbfb, intensity: 0.8 },
    { id: 4, name: '江潮', location: '钱塘江', lat: 30.2741, lng: 120.1551, description: '钱塘江大潮是世界三大涌潮之一，以其壮观的潮水著称。最佳观测季节为农历八月十八前后，最佳时间为潮水到来前。', color: 0x1289a7, intensity: 1.1 },
    { id: 5, name: '日照金山', location: '梅里雪山', lat: 28.4744, lng: 98.8789, description: '梅里雪山的日照金山景观是摄影爱好者追逐的目标。最佳观测季节为冬季，最佳时间为日出前后。', color: 0xff6348, intensity: 1.3 },
    { id: 6, name: '极光', location: '漠河', lat: 53.4833, lng: 122.3333, description: '漠河是中国观测极光的最佳地点之一。最佳观测季节为冬季，最佳时间为夜晚。', color: 0x9b59b6, intensity: 1.2 },
    { id: 7, name: '彩虹', location: '香格里拉', lat: 27.8667, lng: 99.7167, description: '香格里拉的彩虹景观非常美丽。最佳观测季节为雨季，最佳时间为雨后初晴。', color: 0xff6b6b, intensity: 0.9 },
    { id: 8, name: '雾凇', location: '吉林', lat: 43.8167, lng: 125.3167, description: '吉林雾凇是中国四大自然奇观之一。最佳观测季节为冬季，最佳时间为清晨。', color: 0xdff9fb, intensity: 0.7 },
    { id: 9, name: '海市蜃楼', location: '蓬莱', lat: 37.8000, lng: 120.7500, description: '蓬莱是中国著名的海市蜃楼观测地点。最佳观测季节为夏季，最佳时间为上午或下午。', color: 0xfeca57, intensity: 0.8 },
    { id: 10, name: '瀑布', location: '黄果树', lat: 25.9917, lng: 105.6750, description: '黄果树瀑布是中国最大的瀑布之一。最佳观测季节为雨季，最佳时间为上午或下午。', color: 0x1dd1a1, intensity: 1.0 }
  ];

  useEffect(() => {
    if (!containerRef.current) return;
    
    // 初始化 Three.js 场景
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x0a192f, 1); // 深色背景，符合艺术美学
    containerRef.current.appendChild(renderer.domElement);

    // 添加点光源
    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    // 添加环境光
    const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
    scene.add(ambientLight);

    // 生成中国地图点云
    const points = [];
    const geometry = new THREE.BufferGeometry();
    
    // 生成中国地图轮廓点云
    for (let i = 0; i < 1000; i++) {
      // 生成中国地图范围内的随机点
      const lng = 73 + Math.random() * (135 - 73);
      const lat = 18 + Math.random() * (54 - 18);
      
      // 转换为 3D 坐标
      const x = ((lng - 104) / 31) * 10; // 中心化
      const y = ((lat - 36) / 18) * 10; // 中心化
      const z = (Math.random() - 0.5) * 0.5; // 轻微高度变化
      
      points.push(x, y, z);
    }
    
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));
    
    // 为每个点添加颜色
    const colors = [];
    for (let i = 0; i < points.length / 3; i++) {
      const color = new THREE.Color(0x1e3a8a); // 深蓝色点云
      colors.push(color.r, color.g, color.b);
    }
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    
    const material = new THREE.PointsMaterial({
      size: 0.05,
      vertexColors: true,
      transparent: true,
      opacity: 0.6
    });
    
    const pointCloud = new THREE.Points(geometry, material);
    scene.add(pointCloud);

    // 添加自然奇观标记点
    const wonderObjects = [];
    
    wonders.forEach(wonder => {
      // 转换经纬度为 3D 坐标
      const x = ((wonder.lng - 104) / 31) * 10;
      const y = ((wonder.lat - 36) / 18) * 10;
      const z = 0.1;
      
      // 创建核心球体
      const coreGeometry = new THREE.SphereGeometry(0.2 * wonder.intensity, 16, 16);
      const coreMaterial = new THREE.MeshBasicMaterial({ color: wonder.color, transparent: true, opacity: 0.8 });
      const core = new THREE.Mesh(coreGeometry, coreMaterial);
      core.position.set(x, y, z);
      scene.add(core);
      
      // 创建光晕效果
      const glowGeometry = new THREE.SphereGeometry(0.5 * wonder.intensity, 16, 16);
      const glowMaterial = new THREE.MeshBasicMaterial({ color: wonder.color, transparent: true, opacity: 0.3 });
      const glow = new THREE.Mesh(glowGeometry, glowMaterial);
      glow.position.set(x, y, z);
      scene.add(glow);
      
      // 保存对象
      wonderObjects.push({
        wonder,
        core,
        glow,
        position: new THREE.Vector3(x, y, z)
      });
    });

    // 设置相机位置
    camera.position.set(0, 0, 15);
    camera.lookAt(0, 0, 0);

    // 动画参数
    let time = 0;
    
    // 动画循环
    let animationId;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      time += 0.01;
      
      // 点云旋转
      pointCloud.rotation.y += 0.001;
      
      // 自然奇观标记点动画
      wonderObjects.forEach((obj, index) => {
        // 轻微上下浮动
        obj.core.position.z = 0.1 + Math.sin(time + index) * 0.05;
        obj.glow.position.z = 0.1 + Math.sin(time + index) * 0.05;
        
        // 光晕呼吸效果
        const scale = 1 + Math.sin(time * 2 + index) * 0.1;
        obj.glow.scale.set(scale, scale, scale);
      });
      
      renderer.render(scene, camera);
    };

    // 响应窗口大小变化
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);
    
    // 点击交互
    const handleClick = (event) => {
      // 计算点击位置
      const mouse = new THREE.Vector2();
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
      
      // 创建射线
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, camera);
      
      // 检测与标记点的碰撞
      wonderObjects.forEach(obj => {
        const distance = raycaster.ray.distanceToPoint(obj.position);
        if (distance < 0.3) {
          setSelectedWonder(obj.wonder);
        }
      });
    };

    window.addEventListener('click', handleClick);

    // 开始动画
    animate();
    
    // 模拟加载完成
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    // 清理
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('click', handleClick);
      
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
      
      // 清理 Three.js 资源
      scene.clear();
      renderer.dispose();
      if (containerRef.current && containerRef.current.contains(renderer.domElement)) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      {/* 加载动画 */}
      {isLoading && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: '#0a192f',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              border: '3px solid #1e3a8a',
              borderTop: '3px solid #60a5fa',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
            <p style={{
              color: '#60a5fa',
              marginTop: '20px',
              fontSize: '18px',
              fontFamily: 'Arial, sans-serif'
            }}>加载中... 正在生成点云奇观地图</p>
          </div>
        </div>
      )}
      
      {/* 3D点云地图 */}
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
      
      {/* 侧边栏 */}
      <div style={{
        position: 'absolute',
        right: 0,
        top: 0,
        width: '350px',
        height: '100%',
        backgroundColor: 'rgba(10, 25, 47, 0.8)',
        backdropFilter: 'blur(10px)',
        padding: '30px',
        overflowY: 'auto',
        color: 'white',
        boxShadow: '-5px 0 20px rgba(0,0,0,0.3)'
      }}>
        <h1 style={{ 
          color: '#60a5fa', 
          marginBottom: '30px', 
          borderBottom: '2px solid #1e3a8a', 
          paddingBottom: '15px',
          fontFamily: 'Arial, sans-serif'
        }}>中国自然奇观</h1>
        
        <div style={{ marginBottom: '30px' }}>
          <h2 style={{ color: '#93c5fd', marginBottom: '10px' }}>💫 点云奇观地图</h2>
          <p style={{ color: '#a5b4fc', lineHeight: '1.6' }}> 
            探索中国十大自然奇观，点击地图上的发光标记点查看详情。
            每个奇观都有独特的视觉效果和详细信息。
          </p>
        </div>
        
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {wonders.map(wonder => (
            <li 
              key={wonder.id} 
              style={{
                padding: '15px',
                marginBottom: '12px',
                backgroundColor: selectedWonder?.id === wonder.id ? 'rgba(30, 68, 154, 0.5)' : 'rgba(30, 41, 59, 0.5)',
                cursor: 'pointer',
                borderRadius: '8px',
                border: selectedWonder?.id === wonder.id ? '2px solid #60a5fa' : '2px solid transparent',
                transition: 'all 0.3s ease',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
              }} 
              onClick={() => setSelectedWonder(wonder)}
            >
              <h3 style={{ margin: '0 0 8px 0', color: '#f0f9ff' }}>{wonder.name}</h3>
              <p style={{ margin: '0 0 5px 0', color: '#a5b4fc', fontSize: '14px' }}>📍 {wonder.location}</p>
              {selectedWonder?.id === wonder.id && (
                <p style={{ 
                  marginTop: '10px', 
                  color: '#cbd5e1', 
                  fontSize: '13px', 
                  lineHeight: '1.6',
                  backgroundColor: 'rgba(15, 23, 42, 0.5)',
                  padding: '10px',
                  borderRadius: '5px'
                }}>{wonder.description}</p>
              )}
            </li>
          ))}
        </ul>
        
        {/* 底部说明 */}
        <div style={{
          marginTop: '30px',
          padding: '20px',
          backgroundColor: 'rgba(15, 23, 42, 0.5)',
          borderRadius: '10px',
          border: '1px solid #1e3a8a'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#60a5fa' }}>🎨 艺术美学设计</h3>
          <ul style={{ margin: 0, paddingLeft: '20px', color: '#a5b4fc' }}>
            <li>点云效果：模拟星空分布</li>
            <li>动态光晕：增强视觉冲击力</li>
            <li>深色背景：突出奇观效果</li>
            <li>渐变色彩：符合艺术美学</li>
          </ul>
        </div>
      </div>
      
      {/* 顶部信息栏 */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: 'calc(100% - 350px)',
        height: '80px',
        backgroundColor: 'rgba(10, 25, 47, 0.6)',
        backdropFilter: 'blur(10px)',
        padding: '0 30px',
        display: 'flex',
        alignItems: 'center',
        boxShadow: '0 2px 20px rgba(0,0,0,0.3)'
      }}>
        <h2 style={{ 
          margin: 0, 
          color: '#60a5fa',
          fontFamily: 'Arial, sans-serif',
          fontSize: '24px'
        }}>中国自然奇观点云地图</h2>
        <p style={{ 
          margin: '0 0 0 20px', 
          color: '#a5b4fc',
          fontSize: '14px'
        }}>点击地图上的发光标记点查看详情</p>
      </div>
    </div>
  );
}

export default App;