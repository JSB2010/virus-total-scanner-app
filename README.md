# 🛡️ Sentinel Guard

**Advanced file security scanner with real-time protection**

[![CI](https://github.com/JSB2010/virus-total-scanner-app/actions/workflows/ci.yml/badge.svg)](https://github.com/JSB2010/virus-total-scanner-app/actions/workflows/ci.yml)
[![CodeQL](https://github.com/JSB2010/virus-total-scanner-app/actions/workflows/codeql.yml/badge.svg)](https://github.com/JSB2010/virus-total-scanner-app/actions/workflows/codeql.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-000000?logo=next.js&logoColor=white)](https://nextjs.org/)
[![Electron](https://img.shields.io/badge/Electron-191970?logo=electron&logoColor=white)](https://www.electronjs.org/)
[![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)](https://reactjs.org/)

## 🌟 Features

- **🔍 Real-time File Scanning** - Automatic detection and scanning of new files
- **🛡️ VirusTotal Integration** - Leverage the power of VirusTotal's comprehensive threat database
- **📁 Background Monitoring** - Continuous monitoring of Downloads folder and custom locations
- **🎯 Smart Detection** - Advanced threat classification and detailed analysis
- **🗂️ Quarantine Management** - Safe isolation and management of detected threats
- **📊 Detailed Analytics** - Comprehensive scan history and threat analytics
- **🌙 Modern UI/UX** - Ultra-modern, responsive design with dark/light mode support
- **⚡ High Performance** - Built with Next.js and optimized for speed
- **🔔 System Notifications** - Native system notifications for scan results
- **⚙️ Customizable Settings** - Flexible configuration options for all user needs

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v18 or higher)
- **npm**, **yarn**, or **pnpm**
- **VirusTotal API Key** (free registration at [VirusTotal](https://www.virustotal.com/))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/JSB2010/sentinel-guard.git
   cd sentinel-guard
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Add your VirusTotal API key to `.env.local`:
   ```
   VIRUSTOTAL_API_KEY=your_api_key_here
   ```

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

5. **Launch the Electron app**
   ```bash
   npm run electron-dev
   # or
   yarn electron-dev
   # or
   pnpm electron-dev
   ```

## 📦 Download Pre-built Packages

Pre-built packages for Windows and macOS are automatically generated for every commit to the main branch. You can download them from the [GitHub Actions artifacts](https://github.com/JSB2010/virus-total-scanner-app/actions/workflows/build-packages.yml) without waiting for a formal release.

1. Go to the [Build Packages workflow](https://github.com/JSB2010/virus-total-scanner-app/actions/workflows/build-packages.yml)
2. Click on the latest successful run
3. Download the artifact for your platform:
   - `windows-latest-build` for Windows
   - `macos-latest-build` for macOS

## 🏗️ Building for Production

### Web Application
```bash
npm run build
npm start
```

### Desktop Application
```bash
npm run electron-pack
```

The built application will be available in the `dist_electron/` directory.

## 🛠️ Technology Stack

- **Frontend Framework**: [Next.js 15](https://nextjs.org/) with [React 19](https://reactjs.org/)
- **Desktop Framework**: [Electron](https://www.electronjs.org/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with [Tailwind Animate](https://github.com/jamiebuilds/tailwindcss-animate)
- **UI Components**: [Radix UI](https://www.radix-ui.com/) primitives
- **State Management**: React Hooks & Context
- **File Monitoring**: [Chokidar](https://github.com/paulmillr/chokidar)
- **Charts**: [Recharts](https://recharts.org/)
- **Notifications**: [Sonner](https://sonner.emilkowal.ski/)
- **Build Tool**: [Turbopack](https://turbo.build/pack) (enabled)

## 📖 Usage

### Initial Setup
1. Launch the application
2. Complete the welcome setup by entering your VirusTotal API key
3. Configure your preferred scan locations and settings

### Scanning Files
- **Automatic Scanning**: Files are automatically detected and scanned when added to monitored folders
- **Manual Scanning**: Drag and drop files or use the manual scan dialog
- **Bulk Scanning**: Select multiple files or entire directories for scanning

### Managing Results
- View detailed scan results with threat classifications
- Access comprehensive scan history
- Manage quarantined files safely
- Export scan reports for analysis

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Setup
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and commit: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔒 Security

For security concerns, please see our [Security Policy](SECURITY.md).

## 📞 Support

- 📧 **Email**: support@sentinelguard.dev
- 🐛 **Issues**: [GitHub Issues](https://github.com/JSB2010/sentinel-guard/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/JSB2010/sentinel-guard/discussions)

## 🙏 Acknowledgments

- [VirusTotal](https://www.virustotal.com/) for their comprehensive threat intelligence API
- [Radix UI](https://www.radix-ui.com/) for accessible UI primitives
- [Lucide](https://lucide.dev/) for beautiful icons
- The open-source community for amazing tools and libraries

---

<div align="center">
  <strong>Built with ❤️ for digital security</strong>
</div>
