import { Component } from 'react';
import { View, Text, Image, ScrollView } from '@tarojs/components';
import './detail.css';

interface ScenicSpot {
  id: string;
  name: string;
  location: string;
  type: string;
  description: string;
  rating: number;
  ticket_info: string;
  image_url: string;
  coordinates?: {
    longitude: number;
    latitude: number;
  };
  details?: string;
  best_time?: string;
  transportation?: string;
}

class Detail extends Component {
  state = {
    scenicSpot: {
      id: '1',
      name: '大堡礁',
      location: '澳大利亚',
      type: '自然奇观',
      description: '世界最大的珊瑚礁系统',
      rating: 4.8,
      ticket_info: '门票: ¥1200',
      image_url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Great%20Barrier%20Reef%20aerial%20view%20with%20colorful%20coral%20reefs%20and%20clear%20blue%20water&image_size=landscape_16_9',
      coordinates: { longitude: 153.5, latitude: -18.28 },
      details: '大堡礁是世界最大最长的珊瑚礁群，位于南半球，它纵贯于澳洲的东北沿海，北从托雷斯海峡，南到南回归线以南，绵延伸展共有2011公里，最宽处161公里。有2900个大小珊瑚礁岛，自然景观非常特殊。',
      best_time: '5-11月，此时气候温暖，降水较少，适合潜水和观赏珊瑚。',
      transportation: '从凯恩斯或汉密尔顿岛出发，乘坐游船或直升机前往。'
    },
    loading: false,
    error: ''
  };

  componentDidMount() {
    // 这里可以根据路由参数获取景点ID，然后从API获取详情
    // 目前使用模拟数据
  }

  render() {
    const { scenicSpot, loading, error } = this.state;

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
      <ScrollView className="detail-container">
        {/* 顶部图片 */}
        <Image src={scenicSpot.image_url} className="detail-image" mode="aspectFill" />

        {/* 基本信息 */}
        <View className="detail-section">
          <Text className="detail-title">{scenicSpot.name}</Text>
          <View className="detail-meta">
            <Text className="detail-type">{scenicSpot.type}</Text>
            <Text className="detail-location">{scenicSpot.location}</Text>
            <Text className="detail-rating">⭐ {scenicSpot.rating}</Text>
          </View>
          <Text className="detail-description">{scenicSpot.description}</Text>
        </View>

        {/* 详细信息 */}
        {scenicSpot.details && (
          <View className="detail-section">
            <Text className="detail-section-title">景点详情</Text>
            <Text className="detail-content">{scenicSpot.details}</Text>
          </View>
        )}

        {/* 最佳游览时间 */}
        {scenicSpot.best_time && (
          <View className="detail-section">
            <Text className="detail-section-title">最佳游览时间</Text>
            <Text className="detail-content">{scenicSpot.best_time}</Text>
          </View>
        )}

        {/* 交通信息 */}
        {scenicSpot.transportation && (
          <View className="detail-section">
            <Text className="detail-section-title">交通信息</Text>
            <Text className="detail-content">{scenicSpot.transportation}</Text>
          </View>
        )}

        {/* 门票信息 */}
        <View className="detail-section">
          <Text className="detail-section-title">门票信息</Text>
          <Text className="detail-content">{scenicSpot.ticket_info}</Text>
        </View>

        {/* 位置信息 */}
        {scenicSpot.coordinates && (
          <View className="detail-section">
            <Text className="detail-section-title">位置信息</Text>
            <Text className="detail-content">
              经度: {scenicSpot.coordinates.longitude.toFixed(2)}
            </Text>
            <Text className="detail-content">
              纬度: {scenicSpot.coordinates.latitude.toFixed(2)}
            </Text>
          </View>
        )}
      </ScrollView>
    );
  }
}

export default Detail;