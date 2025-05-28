# Contributing to DropSentinel

Thank you for your interest in contributing to DropSentinel! We welcome contributions from the community and are grateful for any help you can provide.

## 🤝 Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## 🚀 How to Contribute

### Reporting Bugs

Before creating bug reports, please check the existing issues to avoid duplicates. When creating a bug report, please include:

- **Clear description** of the issue
- **Steps to reproduce** the behavior
- **Expected behavior** vs actual behavior
- **Screenshots** if applicable
- **Environment details** (OS, Node.js version, etc.)
- **Additional context** that might be helpful

### Suggesting Enhancements

Enhancement suggestions are welcome! Please provide:

- **Clear description** of the enhancement
- **Use case** and motivation
- **Possible implementation** approach
- **Alternative solutions** considered

### Pull Requests

1. **Fork** the repository
2. **Create** a feature branch from `main`
3. **Make** your changes
4. **Test** your changes thoroughly
5. **Commit** with clear, descriptive messages
6. **Push** to your fork
7. **Submit** a pull request

#### Pull Request Guidelines

- Follow the existing code style and conventions
- Include tests for new functionality
- Update documentation as needed
- Ensure all tests pass
- Keep commits focused and atomic
- Write clear commit messages

## 🛠️ Development Setup

### Prerequisites

- Node.js (v18 or higher)
- npm, yarn, or pnpm
- Git

### Local Development

1. **Clone your fork**
   ```bash
   git clone https://github.com/JSB2010/virus-total-scanner-app.git
   cd virus-total-scanner-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment**
   ```bash
   cp .env.example .env.local
   # Add your VirusTotal API key
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Run Electron app**
   ```bash
   npm run electron-dev
   ```

### Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Code Style

We use ESLint and Prettier for code formatting. Please ensure your code follows our style guidelines:

```bash
# Check linting
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format
```

## 📝 Commit Convention

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

- `feat:` New features
- `fix:` Bug fixes
- `docs:` Documentation changes
- `style:` Code style changes (formatting, etc.)
- `refactor:` Code refactoring
- `test:` Adding or updating tests
- `chore:` Maintenance tasks

Examples:
```
feat: add real-time file monitoring
fix: resolve scan progress dialog issue
docs: update installation instructions
```

## 🏗️ Project Structure

```
dropsentinel/
├── src/                    # Source code
│   ├── components/         # React components
│   ├── hooks/             # Custom hooks
│   ├── services/          # Business logic
│   └── utils/             # Utility functions
├── public/                # Static assets
├── docs/                  # Documentation
├── .github/               # GitHub templates and workflows
└── tests/                 # Test files
```

## 🔍 Areas for Contribution

We especially welcome contributions in these areas:

- **Security enhancements** and vulnerability fixes
- **Performance optimizations**
- **UI/UX improvements**
- **Cross-platform compatibility**
- **Documentation improvements**
- **Test coverage expansion**
- **Accessibility improvements**
- **Internationalization (i18n)**

## 📋 Issue Labels

- `bug` - Something isn't working
- `enhancement` - New feature or request
- `documentation` - Improvements or additions to documentation
- `good first issue` - Good for newcomers
- `help wanted` - Extra attention is needed
- `security` - Security-related issues
- `performance` - Performance improvements

## 🎯 Getting Help

If you need help with contributing:

- Check existing [Issues](https://github.com/JSB2010/virus-total-scanner-app/issues)
- Start a [Discussion](https://github.com/JSB2010/virus-total-scanner-app/discussions)
- Reach out to maintainers

## 📄 License

By contributing to DropSentinel, you agree that your contributions will be licensed under the MIT License.

## 🙏 Recognition

Contributors will be recognized in our README and release notes. We appreciate all forms of contribution, from code to documentation to bug reports!

---

Thank you for contributing to DropSentinel! 🛡️
