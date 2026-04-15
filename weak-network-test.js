// 弱网环境测试脚本
// 用于模拟不同网络条件下的应用行为

const fs = require('fs');
const path = require('path');

// 网络条件配置
const networkConditions = [
  {
    name: '正常网络',
    latency: 50, // 延迟（毫秒）
    downloadSpeed: 10000, // 下载速度（KB/s）
    uploadSpeed: 5000, // 上传速度（KB/s）
  },
  {
    name: '弱网环境',
    latency: 500,
    downloadSpeed: 1000,
    uploadSpeed: 500,
  },
  {
    name: '极弱网环境',
    latency: 1000,
    downloadSpeed: 200,
    uploadSpeed: 100,
  },
  {
    name: '断网环境',
    latency: 0,
    downloadSpeed: 0,
    uploadSpeed: 0,
  },
];

// 测试用例
const testCases = [
  {
    name: '首页数据加载',
    url: '/api/scenic-spots',
    method: 'GET',
  },
  {
    name: '天气数据加载',
    url: '/api/weather',
    method: 'GET',
  },
  {
    name: '景点详情加载',
    url: '/api/scenic-spots/1',
    method: 'GET',
  },
];

// 模拟网络请求
function simulateNetworkRequest(testCase, networkCondition) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const { latency, downloadSpeed } = networkCondition;
    
    // 模拟延迟
    setTimeout(() => {
      // 模拟数据大小（假设平均响应大小为 10KB）
      const dataSize = 10 * 1024; // 10KB
      const downloadTime = (dataSize / downloadSpeed) * 1000; // 毫秒
      
      // 模拟下载时间
      setTimeout(() => {
        const endTime = Date.now();
        const totalTime = endTime - startTime;
        
        resolve({
          testCase: testCase.name,
          networkCondition: networkCondition.name,
          latency,
          downloadSpeed,
          totalTime,
          success: networkCondition.downloadSpeed > 0,
        });
      }, downloadTime);
    }, latency);
  });
}

// 运行测试
async function runTests() {
  console.log('开始弱网环境测试...');
  console.log('='.repeat(80));
  
  const results = [];
  
  for (const networkCondition of networkConditions) {
    console.log(`\n测试网络条件: ${networkCondition.name}`);
    console.log('-'.repeat(80));
    
    for (const testCase of testCases) {
      const result = await simulateNetworkRequest(testCase, networkCondition);
      results.push(result);
      
      console.log(`${testCase.name}: ${result.success ? '成功' : '失败'} (${result.totalTime.toFixed(2)}ms)`);
      console.log(`  延迟: ${result.latency}ms, 下载速度: ${result.downloadSpeed}KB/s`);
    }
  }
  
  console.log('\n' + '='.repeat(80));
  console.log('测试完成！');
  
  // 生成测试报告
  generateReport(results);
}

// 生成测试报告
function generateReport(results) {
  const report = {
    timestamp: new Date().toISOString(),
    networkConditions,
    testCases,
    results,
  };
  
  const reportPath = path.join(__dirname, 'weak-network-test-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  console.log(`\n测试报告已生成: ${reportPath}`);
  
  // 分析测试结果
  analyzeResults(results);
}

// 分析测试结果
function analyzeResults(results) {
  console.log('\n测试结果分析:');
  console.log('-'.repeat(80));
  
  // 按网络条件分组分析
  const groupedResults = networkConditions.map(condition => {
    const conditionResults = results.filter(r => r.networkCondition === condition.name);
    const successCount = conditionResults.filter(r => r.success).length;
    const totalCount = conditionResults.length;
    const successRate = (successCount / totalCount) * 100;
    
    return {
      networkCondition: condition.name,
      successRate,
      averageTime: conditionResults
        .filter(r => r.success)
        .reduce((sum, r) => sum + r.totalTime, 0) / successCount || 0,
    };
  });
  
  groupedResults.forEach(result => {
    console.log(`${result.networkCondition}: 成功率 ${result.successRate.toFixed(1)}%, 平均响应时间 ${result.averageTime.toFixed(2)}ms`);
  });
  
  // 检查是否需要优化
  const weakNetworkResult = groupedResults.find(r => r.networkCondition === '弱网环境');
  if (weakNetworkResult && weakNetworkResult.averageTime > 3000) {
    console.log('\n⚠️  警告: 弱网环境下响应时间过长，建议优化数据加载策略');
  }
  
  const offlineResult = groupedResults.find(r => r.networkCondition === '断网环境');
  if (offlineResult && offlineResult.successRate === 0) {
    console.log('⚠️  警告: 断网环境下无法加载数据，建议添加离线缓存策略');
  }
}

// 运行测试
runTests().catch(console.error);