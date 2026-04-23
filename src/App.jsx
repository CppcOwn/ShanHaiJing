import React, { useState } from 'react';

function App() {
  const [selectedWonder, setSelectedWonder] = useState(null);
  
  // 自然奇观数据
  const wonders = [
    { id: 1, name: '云海', location: '黄山', lat: 30.1333, lng: 118.1667, description: '黄山云海是黄山四绝之一，以其变幻莫测的云海景观著称。最佳观测季节为春秋两季，最佳时间为清晨。' },
    { id: 2, name: '日出', location: '泰山', lat: 36.2667, lng: 117.1500, description: '泰山日出是中国著名的自然奇观，象征着光明和希望。最佳观测季节为春秋两季，最佳时间为日出前后。' },
    { id: 3, name: '星空', location: '茶卡盐湖', lat: 36.9044, lng: 99.0286, description: '茶卡盐湖的星空倒影被誉为"天空之镜"，是摄影爱好者的天堂。最佳观测季节为夏季，最佳时间为夜晚。' },
    { id: 4, name: '江潮', location: '钱塘江', lat: 30.2741, lng: 120.1551, description: '钱塘江大潮是世界三大涌潮之一，以其壮观的潮水著称。最佳观测季节为农历八月十八前后，最佳时间为潮水到来前。' },
    { id: 5, name: '日照金山', location: '梅里雪山', lat: 28.4744, lng: 98.8789, description: '梅里雪山的日照金山景观是摄影爱好者追逐的目标。最佳观测季节为冬季，最佳时间为日出前后。' },
    { id: 6, name: '极光', location: '漠河', lat: 53.4833, lng: 122.3333, description: '漠河是中国观测极光的最佳地点之一。最佳观测季节为冬季，最佳时间为夜晚。' },
    { id: 7, name: '彩虹', location: '香格里拉', lat: 27.8667, lng: 99.7167, description: '香格里拉的彩虹景观非常美丽。最佳观测季节为雨季，最佳时间为雨后初晴。' },
    { id: 8, name: '雾凇', location: '吉林', lat: 43.8167, lng: 125.3167, description: '吉林雾凇是中国四大自然奇观之一。最佳观测季节为冬季，最佳时间为清晨。' },
    { id: 9, name: '海市蜃楼', location: '蓬莱', lat: 37.8000, lng: 120.7500, description: '蓬莱是中国著名的海市蜃楼观测地点。最佳观测季节为夏季，最佳时间为上午或下午。' },
    { id: 10, name: '瀑布', location: '黄果树', lat: 25.9917, lng: 105.6750, description: '黄果树瀑布是中国最大的瀑布之一。最佳观测季节为雨季，最佳时间为上午或下午。' }
  ];

  // 将经纬度转换为SVG坐标
  const convertToSvgCoords = (lat, lng) => {
    // 中国地图范围：经度73-135，纬度18-54
    const x = ((lng - 73) / (135 - 73)) * 800 + 100;
    const y = ((54 - lat) / (54 - 18)) * 600 + 50;
    return { x, y };
  };

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', backgroundColor: '#f0f8ff' }}>
      {/* 侧边栏 */}
      <div style={{
        width: '350px',
        height: '100%',
        backgroundColor: 'white',
        padding: '20px',
        overflowY: 'auto',
        boxShadow: '2px 0 10px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{ color: '#1e90ff', marginBottom: '20px', borderBottom: '2px solid #1e90ff', paddingBottom: '10px' }}>中国自然奇观</h1>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {wonders.map(wonder => (
            <li 
              key={wonder.id} 
              style={{
                padding: '15px',
                marginBottom: '12px',
                backgroundColor: selectedWonder?.id === wonder.id ? '#e6f3ff' : '#f8f9fa',
                cursor: 'pointer',
                borderRadius: '8px',
                border: selectedWonder?.id === wonder.id ? '2px solid #1e90ff' : '2px solid transparent',
                transition: 'all 0.3s ease',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }} 
              onClick={() => setSelectedWonder(wonder)}
            >
              <h3 style={{ margin: '0 0 8px 0', color: '#333' }}>{wonder.name}</h3>
              <p style={{ margin: '0 0 5px 0', color: '#666', fontSize: '14px' }}>📍 {wonder.location}</p>
              {selectedWonder?.id === wonder.id && (
                <p style={{ marginTop: '10px', color: '#444', fontSize: '13px', lineHeight: '1.6' }}>{wonder.description}</p>
              )}
            </li>
          ))}
        </ul>
      </div>
      
      {/* 地图区域 */}
      <div style={{ flex: 1, padding: '20px', display: 'flex', flexDirection: 'column' }}>
        {/* 顶部信息栏 */}
        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '10px',
          marginBottom: '20px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ margin: '0 0 10px 0', color: '#1e90ff' }}>中国自然奇观文旅地球仪</h2>
          <p style={{ margin: 0, color: '#666' }}>点击地图上的标记点，查看详细信息</p>
        </div>
        
        {/* SVG地图 */}
        <div style={{
          flex: 1,
          backgroundColor: 'white',
          borderRadius: '10px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          overflow: 'hidden'
        }}>
          <svg width="1000" height="700" viewBox="0 0 1000 700">
            {/* 背景 */}
            <rect width="1000" height="700" fill="#f0f8ff" />
            
            {/* 中国地图轮廓（简化版） */}
            <path
              d="M 150 100 
                 L 200 80 L 250 70 L 300 60 L 350 50 L 400 60 L 450 70 L 500 80 L 550 70 
                 L 600 60 L 650 70 L 700 90 L 750 100 L 800 120 L 850 150 L 880 200 
                 L 890 250 L 880 300 L 850 350 L 800 400 L 750 450 L 700 480 L 650 500 
                 L 600 520 L 550 530 L 500 520 L 450 500 L 400 480 L 350 450 L 300 400 
                 L 250 350 L 200 300 L 180 250 L 170 200 L 160 150 L 150 100 Z"
              fill="#d6e9f8"
              stroke="#1e90ff"
              strokeWidth="2"
            />
            
            {/* 省份边界线（简化） */}
            <line x1="300" y1="80" x2="500" y2="300" stroke="#9fc5e8" strokeWidth="1" strokeDasharray="5,5" />
            <line x1="500" y1="300" x2="700" y2="450" stroke="#9fc5e8" strokeWidth="1" strokeDasharray="5,5" />
            <line x1="200" y1="200" x2="400" y2="400" stroke="#9fc5e8" strokeWidth="1" strokeDasharray="5,5" />
            
            {/* 自然奇观标记点 */}
            {wonders.map(wonder => {
              const coords = convertToSvgCoords(wonder.lat, wonder.lng);
              const isSelected = selectedWonder?.id === wonder.id;
              
              return (
                <g key={wonder.id} onClick={() => setSelectedWonder(wonder)} style={{ cursor: 'pointer' }}>
                  {/* 外圈动画效果 */}
                  <circle
                    cx={coords.x}
                    cy={coords.y}
                    r={isSelected ? "20" : "10"}
                    fill="none"
                    stroke={isSelected ? "#ff6b6b" : "#ff4757"}
                    strokeWidth={isSelected ? "3" : "2"}
                    opacity={isSelected ? "0.8" : "0.6"}
                  />
                  {/* 中心点 */}
                  <circle
                    cx={coords.x}
                    cy={coords.y}
                    r={isSelected ? "12" : "8"}
                    fill={isSelected ? "#ff4757" : "#ff6b6b"}
                    stroke="white"
                    strokeWidth="2"
                  />
                  {/* 标记点标签 */}
                  <text
                    x={coords.x + 15}
                    y={coords.y + 5}
                    fill="#333"
                    fontSize="12"
                    fontWeight="bold"
                    fontFamily="Arial, sans-serif"
                  >
                    {wonder.name}
                  </text>
                </g>
              );
            })}
            
            {/* 地图标题 */}
            <text x="500" y="30" textAnchor="middle" fill="#1e90ff" fontSize="24" fontWeight="bold" fontFamily="Arial, sans-serif">
              中国自然奇观分布
            </text>
            
            {/* 比例尺 */}
            <rect x="750" y="600" width="100" height="20" fill="none" stroke="#666" strokeWidth="1" />
            <text x="800" y="635" textAnchor="middle" fill="#666" fontSize="10" fontFamily="Arial, sans-serif">
              0-1000km
            </text>
          </svg>
        </div>
        
        {/* 底部说明 */}
        <div style={{
          marginTop: '20px',
          backgroundColor: 'white',
          padding: '15px',
          borderRadius: '10px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#1e90ff' }}>💡 使用说明</h3>
          <ul style={{ margin: 0, paddingLeft: '20px', color: '#666' }}>
            <li>点击左侧列表或地图上的标记点查看自然奇观详情</li>
            <li>地图上红色圆点代表自然奇观观测点</li>
            <li>点击的标记点会高亮显示</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default App;