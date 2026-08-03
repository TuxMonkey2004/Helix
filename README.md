<p align="center">
  <img src="https://img.shields.io/badge/version-0.1.0-blue" alt="version">
  <img src="https://img.shields.io/badge/license-MIT-green" alt="license">
  <img src="https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey" alt="platform">
</p>

# Helix

> 🧬 A beautiful, Apple-inspired Git repository manager built with Electron.

Helix makes Git visual. Browse commit history, manage branches, stage and commit changes, and sync with remotes — all through a clean, native-feeling interface with light &amp; dark themes.

<p align="center">
  <img src="https://raw.githubusercontent.com/TuxMonkey2004/Helix/main/.github/screenshot.png" alt="Helix Screenshot" width="800" style="border-radius: 12px; box-shadow: 0 8px 30px rgba(0,0,0,0.12);" />
</p>

---

## ✨ Features

- **📜 Visual Commit History** — Browse commits with graph, author, date, and message at a glance
- **🌿 Branch Management** — Create, switch, and track branches with upstream status
- **📝 Smart Staging** — Stage / unstage individual files, view diffs, and craft clean commits
- **🔄 Remote Sync** — Fetch, pull, and push with a single click
- **🌐 i18n** — Full Chinese &amp; English interface, toggle instantly
- **🎨 Themes** — Light &amp; dark mode, auto-follows system preference
- **🪟 Frameless Window** — Custom title bar with native-feeling controls
- **⚡ Zero Dependencies** — Vanilla JavaScript renderer, no React/Vue/Angular

## 📥 Download

Prebuilt binaries are available on the [Releases](https://github.com/TuxMonkey2004/Helix/releases) page.

| Platform | Package |
|----------|---------|
| 🪟 Windows | `Helix-Setup-x.x.x.exe` (installer) or `Helix-x.x.x.exe` (portable) |
| 🍎 macOS | `Helix-x.x.x.dmg` (Intel) or `Helix-x.x.x-arm64.dmg` (Apple Silicon) |
| 🐧 Linux | `Helix-x.x.x.AppImage` or `Helix_x.x.x_amd64.deb` |

> Requires **Git** to be installed on your system.

## 🚀 Quick Start

### Run from source

```bash
git clone https://github.com/TuxMonkey2004/Helix.git
cd Helix
npm install
npm start
```

### Build installers

```bash
# Platform-specific
npm run build:win      # Windows (.exe)
npm run build:mac      # macOS (.dmg)
npm run build:linux    # Linux (.AppImage, .deb)

# All platforms
npm run build:all
```

## 🧱 Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Electron 43 |
| Renderer | Vanilla JS + CSS Custom Properties |
| Typography | SF Pro / MiSans font stack |
| Design | Apple Human Interface Guidelines |
| Build | electron-builder |

## 📁 Project Structure

```
Helix/
├── main.js              # Electron main process — Git IPC, window management
├── preload.js           # Secure context bridge (contextIsolation)
├── package.json
├── .github/
│   └── workflows/
│       └── build.yml    # CI/CD — cross-platform build & release
└── src/
    ├── index.html       # Application layout
    ├── styles.css       # Apple-inspired design system
    ├── i18n.js          # zh-CN / en translations
    └── renderer.js      # UI logic, commit graph, diff viewer
```

## 🧪 Development

```bash
# Start with DevTools open
npm run dev

# Lint (coming soon)
# npm run lint

# Test (coming soon)
# npm test
```

## 🤝 Contributing

Contributions are welcome! Here's how:

1. Fork the repository
2. Create a feature branch (`git checkout -b feat/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feat/amazing-feature`)
5. Open a Pull Request

Please keep the code style consistent — no framework dependencies in the renderer.

## 📄 License

MIT © [Helix](https://github.com/TuxMonkey2004/Helix)

---

<p align="center">
  <sub>Built with ❤️ for developers who appreciate good design.</sub>
</p>
