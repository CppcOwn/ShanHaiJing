import { Component } from 'react';
import { PropsWithChildren } from 'react';
import './app.css';

class App extends Component<PropsWithChildren<any>> {
  componentDidMount() {
    // 应用初始化逻辑
  }

  componentDidShow() {
    // 应用显示时的逻辑
  }

  componentDidHide() {
    // 应用隐藏时的逻辑
  }

  render() {
    return this.props.children;
  }
}

export default App;