# 终末地科研工作台 React 复刻版

这是基于原终末地 Electron 项目 `renderer` 界面改编的 React/Vite 版本，保留了原项目的工业风视觉体系、字体、纹理、侧边栏、页面布局、抽屉、弹窗和图表区域。

## 技术栈

- React 18
- Vite 5
- 原项目 `theme.css` / `pet-floating.css`
- 原项目静态资源与本地 ECharts vendor 文件
- `react-overrides.css` 用于补齐 React 静态复刻中少量缺失的树节点、抽屉状态等样式

## 启动

```bash
npm install
npm run dev
```

默认地址：

```text
http://127.0.0.1:5174
```

生产构建：

```bash
npm run build
```
