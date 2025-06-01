# DropSentinel Release Guide

This guide explains how to create releases for DropSentinel using the automated release system.

## 🚀 Release Methods

### Method 1: Using the Release Script (Recommended)

The easiest way to create a release:

```bash
# Create a standard release
npm run release 1.0.0

# Create a prerelease
npm run release 1.1.0-beta.1 --prerelease

# Create and push immediately
npm run release 1.0.1 --push
```

### Method 2: Manual RELEASE.md File

Create or update the `RELEASE.md` file with release information:

```markdown
# Release 1.0.0

Release description and changelog...
```

Then commit and push:

```bash
git add RELEASE.md
git commit -m "Release 1.0.0"
git push origin main
```

### Method 3: Version Bump in package.json

Update the version in `package.json`:

```json
{
  "version": "1.0.0"
}
```

Commit and push the change:

```bash
git add package.json
git commit -m "Bump version to 1.0.0"
git push origin main
```

### Method 4: Manual Workflow Trigger

Use GitHub's workflow dispatch feature:

1. Go to **Actions** → **Smart Release System**
2. Click **Run workflow**
3. Enter version and release type
4. Click **Run workflow**

### Method 5: Git Tags

Create and push a Git tag:

```bash
git tag v1.0.0
git push origin v1.0.0
```

## 🔄 Release Workflow

When a release is triggered, the system:

1. **Detects** the release trigger (RELEASE.md, version bump, tag, etc.)
2. **Creates** a Git tag (if not already exists)
3. **Triggers** the release build workflow
4. **Builds** packages for all platforms (Windows, macOS, Linux)
5. **Creates** a GitHub release with all artifacts
6. **Publishes** packages to GitHub Packages

## 📦 Release Types

### Standard Release
- **Trigger**: Version without pre-release identifiers
- **Example**: `1.0.0`, `2.1.3`
- **GitHub**: Published as a full release

### Prerelease
- **Trigger**: Version with pre-release identifiers or explicit flag
- **Example**: `1.0.0-beta.1`, `2.0.0-rc.1`
- **GitHub**: Published as a prerelease

### Draft Release
- **Trigger**: Manual workflow with draft option
- **GitHub**: Created as draft (not published)

## 🛠️ Build Artifacts

Each release includes packages for all platforms:

### Windows
- `DropSentinel-Setup-1.0.0.exe` (NSIS Installer)
- `DropSentinel-1.0.0.msi` (MSI Package)
- `DropSentinel-1.0.0-win.zip` (Portable)

### macOS
- `DropSentinel-1.0.0.dmg` (DMG Disk Image)
- `DropSentinel-1.0.0.pkg` (PKG Installer)
- `DropSentinel-1.0.0-mac.zip` (ZIP Archive)

### Linux
- `DropSentinel-1.0.0.AppImage` (AppImage)
- `dropsentinel_1.0.0_amd64.deb` (DEB Package)
- `dropsentinel-1.0.0.x86_64.rpm` (RPM Package)
- `DropSentinel-1.0.0.tar.gz` (TAR.GZ Archive)

## 🔐 Security Features

All packages include:
- **Checksums**: SHA-256 integrity verification
- **Code Signing**: When certificates are available
- **Hardened Runtime**: macOS security features
- **Proper Permissions**: Correct file permissions and entitlements

## 📋 Pre-Release Checklist

Before creating a release:

- [ ] All tests pass locally
- [ ] Documentation is up to date
- [ ] Version number follows semantic versioning
- [ ] Changelog is complete
- [ ] No critical bugs in issue tracker
- [ ] Build system works on all platforms

## 🚀 Creating DropSentinel 1.0.0

To create the first official release:

```bash
# Method 1: Using the release script
npm run release 1.0.0 --push

# Method 2: Manual (already done - RELEASE.md exists)
git add RELEASE.md
git commit -m "Release 1.0.0"
git push origin main
```

The release workflow will:
1. Detect the RELEASE.md file
2. Extract version 1.0.0
3. Create tag v1.0.0
4. Build all packages
5. Create GitHub release
6. Publish artifacts

## 📊 Monitoring Releases

Track release progress:

1. **GitHub Actions**: Monitor workflow runs
2. **Releases Page**: Check published releases
3. **Packages**: View published packages
4. **Download Stats**: Monitor download metrics

## 🔧 Troubleshooting

### Release Not Triggered
- Check if RELEASE.md has correct format
- Verify version bump in package.json
- Ensure commits are pushed to main branch

### Build Failures
- Check GitHub Actions logs
- Verify all dependencies are available
- Test builds locally first

### Missing Artifacts
- Check if all platform builds completed
- Verify artifact upload steps
- Look for build errors in logs

## 📚 Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Semantic Versioning](https://semver.org/)
- [Electron Builder](https://www.electron.build/)
- [Code Signing Guide](BUILD.md#code-signing)

---

For questions or issues with releases, please check the [GitHub Issues](https://github.com/JSB2010/DropSentinel/issues) page.
