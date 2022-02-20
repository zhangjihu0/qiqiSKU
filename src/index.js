import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { ConfigProvider } from "antd";
import "antd/dist/antd.min.css";
import zhCN from "antd/lib/locale/zh_CN";

ReactDOM.render(
  <ConfigProvider locale={zhCN}>
    <App />
  </ConfigProvider>,
  document.getElementById('root')
);
