import { Component } from 'react';
import { View, Text, Input, ScrollView, Navigator, Image } from '@tarojs/components';
import './search.css';

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

class Search extends Component {
  state = {
    searchText: '',
    searchResults: [] as ScenicSpot[],
    allScenicSpots: [
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
    ],
    loading: false,
    error: ''
  };

  handleSearch = (e: any) => {
    const searchText = e.detail.value;
    this.setState({ searchText });
    
    // 简单的搜索逻辑
    if (searchText.trim() === '') {
      this.setState({ searchResults: [] });
      return;
    }
    
    const results = this.state.allScenicSpots.filter(spot => 
      spot.name.includes(searchText) || 
      spot.location.includes(searchText) || 
      spot.type.includes(searchText) || 
      spot.description.includes(searchText)
    );
    
    this.setState({ searchResults: results });
  };

  render() {
    const { searchText, searchResults, loading, error } = this.state;

    if (loading) {
      return (
        <View className="loading">
          <Text>加载中...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View className="error">
          <Text>{error}</Text>
        </View>
      );
    }

    return (
      <View className="search-container">
        {/* 搜索栏 */}
        <View className="search-bar">
          <Input
            className="search-input"
            placeholder="搜索自然奇观、地点或类型"
            value={searchText}
            onChange={this.handleSearch}
          />
        </View>

        {/* 搜索结果 */}
        <ScrollView className="search-results">
          {searchResults.length > 0 ? (
            searchResults.map((item) => (
              <Navigator key={item.id} url={`/pages/detail/detail?id=${item.id}`} className="search-result-item">
                <Image src={item.image_url} className="result-image" mode="aspectFill" />
                <View className="result-info">
                  <Text className="result-title">{item.name}</Text>
                  <Text className="result-subtitle">{item.type} · {item.location}</Text>
                  <Text className="result-description">{item.description}</Text>
                  <View className="result-footer">
                    <Text className="result-rating">⭐ {item.rating}</Text>
                    <Text className="result-ticket">{item.ticket_info}</Text>
                  </View>
                </View>
              </Navigator>
            ))
          ) : searchText.trim() !== '' ? (
            <View className="no-results">
              <Text>未找到相关结果</Text>
            </View>
          ) : (
            <View className="search-hints">
              <Text className="hint-title">热门搜索</Text>
              <View className="hint-tags">
                <View className="hint-tag">大堡礁</View>
                <View className="hint-tag">长城</View>
                <View className="hint-tag">金字塔</View>
                <View className="hint-tag">大峡谷</View>
                <View className="hint-tag">埃菲尔铁塔</View>
              </View>
            </View>
          )}
        </ScrollView>
      </View>
    );
  }
}

export default Search;