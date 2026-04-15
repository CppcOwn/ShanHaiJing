import React, { useState } from 'react';
import './index.css';

interface ScenicSpot {
  id: string;
  name: string;
  location: string;
  type: string;
  description: string;
  rating: number;
  ticket_info: string;
  image_url: string;
}

const Search: React.FC = () => {
  const [searchText, setSearchText] = useState<string>('');
  const [searchResults, setSearchResults] = useState<ScenicSpot[]>([]);

  const allScenicSpots: ScenicSpot[] = [
    {
      id: '1',
      name: '大堡礁',
      location: '澳大利亚',
      type: '自然奇观',
      description: '世界最大的珊瑚礁系统',
      rating: 4.8,
      ticket_info: '门票: ¥1200',
      image_url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Great%20Barrier%20Reef%20aerial%20view%20with%20colorful%20coral%20reefs%20and%20clear%20blue%20water&image_size=landscape_16_9'
    },
    {
      id: '2',
      name: '大峡谷',
      location: '美国',
      type: '自然奇观',
      description: '美国亚利桑那州的壮观峡谷',
      rating: 4.9,
      ticket_info: '门票: ¥800',
      image_url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Grand%20Canyon%20aerial%20view%20with%20red%20rock%20formations%20and%20vast%20landscape&image_size=landscape_16_9'
    },
    {
      id: '3',
      name: '埃菲尔铁塔',
      location: '法国',
      type: '人文景观',
      description: '法国巴黎的标志性建筑',
      rating: 4.7,
      ticket_info: '门票: ¥600',
      image_url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Eiffel%20Tower%20in%20Paris%20with%20city%20skyline%20at%20sunset&image_size=landscape_16_9'
    },
    {
      id: '4',
      name: '长城',
      location: '中国',
      type: '人文景观',
      description: '中国古代伟大的防御工程',
      rating: 4.9,
      ticket_info: '门票: ¥100',
      image_url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Great%20Wall%20of%20China%20winding%20through%20mountainous%20landscape&image_size=landscape_16_9'
    },
    {
      id: '5',
      name: '金字塔',
      location: '埃及',
      type: '人文景观',
      description: '埃及古代法老的陵墓',
      rating: 4.8,
      ticket_info: '门票: ¥900',
      image_url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Pyramids%20of%20Giza%20with%20Sphinx%20in%20Egyptian%20desert&image_size=landscape_16_9'
    }
  ];

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setSearchText(text);
    
    // 简单的搜索逻辑
    if (text.trim() === '') {
      setSearchResults([]);
      return;
    }
    
    const results = allScenicSpots.filter(spot => 
      spot.name.includes(text) || 
      spot.location.includes(text) || 
      spot.type.includes(text) || 
      spot.description.includes(text)
    );
    
    setSearchResults(results);
  };

  const navigateTo = (page: string) => {
    // 在实际应用中，这里会使用路由导航
    console.log(`导航到: ${page}`);
  };

  return (
    <div className="search-container">
      {/* 搜索栏 */}
      <div className="search-bar">
        <input
          className="search-input"
          placeholder="搜索自然奇观、地点或类型"
          value={searchText}
          onChange={handleSearch}
        />
      </div>

      {/* 搜索结果 */}
      <div className="search-results">
        {searchResults.length > 0 ? (
          searchResults.map((item) => (
            <div key={item.id} className="search-result-item" onClick={() => navigateTo(`/detail?id=${item.id}`)}>
              <img src={item.image_url} className="result-image" alt={item.name} />
              <div className="result-info">
                <h3 className="result-title">{item.name}</h3>
                <p className="result-subtitle">{item.type} · {item.location}</p>
                <p className="result-description">{item.description}</p>
                <div className="result-footer">
                  <span className="result-rating">⭐ {item.rating}</span>
                  <span className="result-ticket">{item.ticket_info}</span>
                </div>
              </div>
            </div>
          ))
        ) : searchText.trim() !== '' ? (
          <div className="no-results">
            <p>未找到相关结果</p>
          </div>
        ) : (
          <div className="search-hints">
            <h3 className="hint-title">热门搜索</h3>
            <div className="hint-tags">
              <span className="hint-tag" onClick={() => setSearchText('大堡礁')}>大堡礁</span>
              <span className="hint-tag" onClick={() => setSearchText('长城')}>长城</span>
              <span className="hint-tag" onClick={() => setSearchText('金字塔')}>金字塔</span>
              <span className="hint-tag" onClick={() => setSearchText('大峡谷')}>大峡谷</span>
              <span className="hint-tag" onClick={() => setSearchText('埃菲尔铁塔')}>埃菲尔铁塔</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;