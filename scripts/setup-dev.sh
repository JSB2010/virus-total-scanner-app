#!/bin/bash

# Sentinel Guard Development Setup Script
# This script sets up the development environment for Sentinel Guard

set -e

echo "🛡️  Setting up Sentinel Guard Development Environment..."

# Detect platform
PLATFORM="unknown"
case "$(uname -s)" in
    Darwin*)    PLATFORM="macOS";;
    Linux*)     PLATFORM="Linux";;
    CYGWIN*)    PLATFORM="Windows (Cygwin)";;
    MINGW*)     PLATFORM="Windows (MinGW)";;
    MSYS*)      PLATFORM="Windows (MSYS)";;
esac

echo "🖥️  Detected platform: $PLATFORM"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Check if Node.js is installed
echo -e "${YELLOW}Checking Node.js installation...${NC}"
if command -v node >/dev/null 2>&1; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✅ Node.js is installed: $NODE_VERSION${NC}"

    # Check if version is >= 18
    NODE_MAJOR_VERSION=$(echo $NODE_VERSION | sed 's/v//' | cut -d. -f1)
    if [ "$NODE_MAJOR_VERSION" -lt 18 ]; then
        echo -e "${RED}❌ Node.js version $NODE_VERSION is too old. Please install Node.js 18 or higher.${NC}"
        exit 1
    fi
else
    echo -e "${RED}❌ Node.js is not installed.${NC}"
    case $PLATFORM in
        "macOS")
            echo -e "${CYAN}   Install via Homebrew: brew install node${NC}"
            echo -e "${CYAN}   Or download from: https://nodejs.org/${NC}"
            ;;
        "Linux")
            echo -e "${CYAN}   Install via package manager:${NC}"
            echo -e "${CYAN}   Ubuntu/Debian: sudo apt update && sudo apt install nodejs npm${NC}"
            echo -e "${CYAN}   CentOS/RHEL: sudo yum install nodejs npm${NC}"
            echo -e "${CYAN}   Arch: sudo pacman -S nodejs npm${NC}"
            echo -e "${CYAN}   Or download from: https://nodejs.org/${NC}"
            ;;
        *)
            echo -e "${CYAN}   Download from: https://nodejs.org/${NC}"
            ;;
    esac
    exit 1
fi

# Check if Git is installed
echo -e "${YELLOW}Checking Git installation...${NC}"
if command -v git >/dev/null 2>&1; then
    GIT_VERSION=$(git --version)
    echo -e "${GREEN}✅ Git is installed: $GIT_VERSION${NC}"
else
    echo -e "${RED}❌ Git is not installed.${NC}"
    case $PLATFORM in
        "macOS")
            echo -e "${CYAN}   Install via Xcode Command Line Tools: xcode-select --install${NC}"
            echo -e "${CYAN}   Or via Homebrew: brew install git${NC}"
            ;;
        "Linux")
            echo -e "${CYAN}   Install via package manager:${NC}"
            echo -e "${CYAN}   Ubuntu/Debian: sudo apt install git${NC}"
            echo -e "${CYAN}   CentOS/RHEL: sudo yum install git${NC}"
            echo -e "${CYAN}   Arch: sudo pacman -S git${NC}"
            ;;
        *)
            echo -e "${CYAN}   Download from: https://git-scm.com/${NC}"
            ;;
    esac
    exit 1
fi

# Install dependencies
echo -e "${YELLOW}Installing dependencies...${NC}"
if npm install; then
    echo -e "${GREEN}✅ Dependencies installed successfully${NC}"
else
    echo -e "${RED}❌ Failed to install dependencies${NC}"
    exit 1
fi

# Create .env.local from .env.example if it doesn't exist
if [ ! -f ".env.local" ]; then
    echo -e "${YELLOW}Creating .env.local file...${NC}"
    cp .env.example .env.local
    echo -e "${GREEN}✅ .env.local created from .env.example${NC}"
    echo -e "${YELLOW}⚠️  Please edit .env.local and add your VirusTotal API key${NC}"
else
    echo -e "${GREEN}✅ .env.local already exists${NC}"
fi

# Create necessary directories
echo -e "${YELLOW}Creating necessary directories...${NC}"
DIRECTORIES=("public/assets" "build" "dist" "src/types")
for dir in "${DIRECTORIES[@]}"; do
    if [ ! -d "$dir" ]; then
        mkdir -p "$dir"
        echo -e "${GREEN}✅ Created directory: $dir${NC}"
    else
        echo -e "${GREEN}✅ Directory already exists: $dir${NC}"
    fi
done

# Platform-specific setup information
echo -e "${YELLOW}Platform-specific setup...${NC}"
case $PLATFORM in
    "macOS")
        echo -e "${BLUE}🍎 macOS Configuration:${NC}"
        echo -e "${CYAN}   • Downloads monitoring: ~/Downloads${NC}"
        echo -e "${CYAN}   • Quarantine storage: ~/Library/Application Support/DropSentinel/${NC}"
        echo -e "${CYAN}   • App will request necessary permissions on first run${NC}"
        ;;
    "Linux")
        echo -e "${BLUE}🐧 Linux Configuration:${NC}"
        echo -e "${CYAN}   • Downloads monitoring: ~/Downloads${NC}"
        echo -e "${CYAN}   • Quarantine storage: ~/.local/share/DropSentinel/${NC}"
        echo -e "${CYAN}   • Ensure your user has access to Downloads folder${NC}"
        ;;
    *)
        echo -e "${BLUE}🖥️  Cross-platform Configuration:${NC}"
        echo -e "${CYAN}   • Downloads monitoring: ~/Downloads${NC}"
        echo -e "${CYAN}   • Quarantine storage: Platform-specific location${NC}"
        ;;
esac

# Check if VirusTotal API key is configured
echo -e "${YELLOW}Checking VirusTotal API key configuration...${NC}"
if grep -q "VIRUSTOTAL_API_KEY=your_virustotal_api_key_here" .env.local 2>/dev/null || ! grep -q "VIRUSTOTAL_API_KEY=[[:alnum:]]" .env.local 2>/dev/null; then
    echo -e "${YELLOW}⚠️  VirusTotal API key not configured. Please:${NC}"
    echo -e "${CYAN}   1. Go to https://www.virustotal.com/gui/join-us${NC}"
    echo -e "${CYAN}   2. Create a free account and get your API key${NC}"
    echo -e "${CYAN}   3. Edit .env.local and replace 'your_virustotal_api_key_here' with your actual API key${NC}"
else
    echo -e "${GREEN}✅ VirusTotal API key appears to be configured${NC}"
fi

echo ""
echo -e "${GREEN}🎉 Cross-platform setup complete! You can now:${NC}"
echo -e "${CYAN}   • Run 'npm run dev' to start the Next.js development server${NC}"
echo -e "${CYAN}   • Run 'npm run electron-dev' to start the Electron app in development mode${NC}"
echo -e "${CYAN}   • Run 'npm run build' to build for production${NC}"
echo -e "${CYAN}   • Run 'npm run electron-pack' to package the app for $PLATFORM${NC}"
echo -e "${CYAN}   • Run 'npm run lint' to check code quality${NC}"
echo ""
echo -e "${BLUE}📚 For more information, check the README.md file${NC}"
echo -e "${BLUE}🔧 Platform: $PLATFORM${NC}"
