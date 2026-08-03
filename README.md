<p align="center">
  <img src="https://img.shields.io/badge/version-0.1.0-blue" alt="version">
  <img src="https://img.shields.io/badge/license-MIT-green" alt="license">
  <img src="https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey" alt="platform">
</p>

# Helix

> 🧬 一款 Apple 设计风格的 Git 仓库可视化管理工具，基于 Electron 构建。

让 Git 操作变得可见：浏览提交历史、管理分支、暂存提交变更、同步远程仓库 —— 一切尽在清爽原生的界面中，支持浅色 / 深色双主题。

<p align="center">
  <img src="https://raw.githubusercontent.com/TuxMonkey2004/Helix/main/.github/screenshot.png" alt="Helix 截图" width="800" style="border-radius: 12px; box-shadow: 0 8px 30px rgba(0,0,0,0.12);" />
</p>

---

## ✨ 特性

- **📜 可视化提交历史** — 图形化展示 commit 图、作者、日期和信息
- **🌿 分支管理** — 创建、切换分支，查看上游跟踪状态
- **📝 智能暂存** — 按文件 Stage / Unstage，查看差异，撰写干净的提交
- **🔄 远程同步** — 一键 Fetch / Pull / Push
- **🌐 双语界面** — 中文 / English 完整翻译，一键切换
- **🎨 双主题** — 浅色 / 深色模式，自动跟随系统偏好
- **🪟 无边框窗口** — 自定义标题栏，原生般的窗口控制
- **⚡ 零框架依赖** — 渲染进程纯 Vanilla JS，无 React/Vue/Angular

## 📥 下载

预编译安装包请前往 [Releases](https://github.com/TuxMonkey2004/Helix/releases) 页面下载。

| 平台 | 安装包 |
|------|--------|
| 🪟 Windows | `Helix-Setup-x.x.x.exe`（安装版）或 `Helix-x.x.x.exe`（便携版） |
| 🍎 macOS | `Helix-x.x.x.dmg`（Intel）或 `Helix-x.x.x-arm64.dmg`（Apple Silicon） |
| 🐧 Linux | `Helix-x.x.x.AppImage` 或 `Helix_x.x.x_amd64.deb` |

> 需要系统已安装 **Git**。

## 🚀 快速开始

### 从源码运行

```bash
git clone https://github.com/TuxMonkey2004/Helix.git
cd Helix
npm install
npm start
```

### 构建安装包

```bash
# 按平台构建
npm run build:win      # Windows (.exe)
npm run build:mac      # macOS (.dmg)
npm run build:linux    # Linux (.AppImage, .deb)

# 全平台构建
npm run build:all
```

## 🧱 技术栈

| 层级 | 技术 |
|------|------|
| 框架 | Electron 43 |
| 渲染 | Vanilla JS + CSS 自定义属性 |
| 字体 | SF Pro / MiSans 字体体系 |
| 设计 | Apple Human Interface Guidelines |
| 构建 | electron-builder |

## 📁 项目结构

```
Helix/
├── main.js              # Electron 主进程 — Git IPC、窗口管理
├── preload.js           # 安全上下文桥接（contextIsolation）
├── package.json
├── .github/
│   └── workflows/
│       └── build.yml    # CI/CD — 跨平台构建与发布
└── src/
    ├── index.html       # 界面布局
    ├── styles.css       # Apple 风格设计系统
    ├── i18n.js          # 中 / 英 翻译
    └── renderer.js      # UI 逻辑、提交图、差异查看
```

## 🧪 开发

```bash
# 带 DevTools 启动
npm run dev

# 代码检查（即将推出）
# npm run lint

# 测试（即将推出）
# npm test
```

## 🤝 参与贡献

欢迎贡献代码！基本流程：

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feat/amazing-feature`)
3. 提交更改 (`git commit -m '添加了某某功能'`)
4. 推送到分支 (`git push origin feat/amazing-feature`)
5. 发起 Pull Request

请保持代码风格一致 —— 渲染层不使用框架依赖。

## 📄 许可证

MIT © [Helix](https://github.com/TuxMonkey2004/Helix)

---

<p align="center">
  <sub>用 ❤️ 为注重设计的开发者而构建</sub>
</p>
