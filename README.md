# Helix

> 一款 Apple 设计风格的 Git 仓库可视化管理工具，基于 Electron 构建。

## 特性

- 可视化提交历史、分支管理、工作区变更
- Stage / Unstage / Commit 工作流
- 分支创建与切换
- Fetch / Pull / Push 远程同步
- 中文 / English 双语界面，一键切换
- MiSans 中文字体优先，自动回退系统字体
- 浅色 / 深色双主题，跟随系统

## 技术栈

- **Electron** 43 — 跨平台桌面框架
- **Vanilla JS** — 零框架依赖
- **Apple Design** — 弹簧动画、半透明材质、SF Pro / MiSans 字体体系

## 运行

```bash
npm install
npm start
```

## 构建

```bash
# Windows 安装包
npm run build

# Windows 便携版
npm run build:portable
```

## 项目结构

```
Helix/
├── main.js          # Electron 主进程，Git 操作
├── preload.js       # 安全 IPC 桥接
├── package.json
└── src/
    ├── index.html   # 界面布局
    ├── styles.css   # Apple 设计系统样式
    ├── i18n.js      # 中英文翻译
    └── renderer.js  # 渲染逻辑
```
