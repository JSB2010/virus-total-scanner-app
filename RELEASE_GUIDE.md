# DropSentinel Release Guide

This guide explains how to create releases for DropSentinel using the automated release system.

## 🚀 Release Methods

### Method 1: Git Tags (Recommended)

The simplest and most reliable way to create a release:

```bash
# Create and push a new tag for the latest commit
git tag v1.0.1
git push origin v1.0.1

# Or create a tag for a specific commit
git tag v1.0.1 <commit-hash>
git push origin v1.0.1
```

This will automatically:
1. Trigger the release workflow
2. Build all platform packages
3. Create a GitHub release with auto-generated notes
4. Upload all artifacts

### Method 2: Custom Release Notes

To add custom release notes, create a `RELEASE.md` file before tagging:

```markdown
# Release 1.0.1

## 🚀 New Features
- Added new virus detection engine
- Improved scanning performance

## 🐛 Bug Fixes
- Fixed memory leak in background monitoring
- Resolved UI freezing issues

## 🔧 Improvements
- Enhanced error handling
- Updated dependencies
```

Then create the tag:

```bash
git add RELEASE.md
git commit -m "Add release notes for v1.0.1"
git tag v1.0.1
git push origin main
git push origin v1.0.1
```

### Method 3: Update Version First (Optional)

If you want to update the version in package.json before releasing:

```bash
# Update version in package.json
npm version 1.0.1 --no-git-tag-version

# Commit the version change
git add package.json
git commit -m "Bump version to 1.0.1"

# Create and push the tag
git tag v1.0.1
git push origin main
git push origin v1.0.1
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

### Windows (x64)
- `DropSentinel-Setup-1.0.0-x64.exe` (NSIS Installer) - ~82 MB
- `DropSentinel-Setup-1.0.0-x64.msi` (MSI Package) - ~92 MB
- `DropSentinel-Portable-1.0.0-x64.exe` (Portable) - ~82 MB
- `DropSentinel-Setup-1.0.0-x64.zip` (ZIP Archive) - ~113 MB

### macOS (Universal: Intel + Apple Silicon)
- `DropSentinel-1.0.0-universal.dmg` (DMG Disk Image) - ~90 MB
- `DropSentinel-1.0.0-universal.pkg` (PKG Installer) - ~90 MB
- `DropSentinel-1.0.0-arm64-mac.zip` (ZIP Archive) - ~97 MB

### Linux (x64)
- `DropSentinel-1.0.0-x86_64.AppImage` (AppImage) - ~86 MB
- `DropSentinel-1.0.0-x64.tar.gz` (TAR.GZ Archive) - ~106 MB
- `DropSentinel-1.0.0-x64.deb` (DEB Package) - ~85 MB
- `DropSentinel-1.0.0-x64.rpm` (RPM Package) - ~85 MB

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
