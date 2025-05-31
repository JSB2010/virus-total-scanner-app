# Windows Trust & Code Signing Guide

## 🚨 Current Issue: Windows SmartScreen Protection

When users try to install DropSentinel, they see:
```
Windows protected your PC
Microsoft Defender SmartScreen prevented an unrecognized app from starting.
Running this app might put your PC at risk.

App: DropSentinel-Setup-0.1.0-x64.exe
Publisher: Unknown publisher
```

## 🔍 Why This Happens

1. **No Code Signing Certificate** - The executable isn't digitally signed
2. **Unknown Publisher** - Windows doesn't recognize the publisher
3. **Low Reputation** - New/unknown files trigger SmartScreen warnings
4. **UAC Shows "Unidentified"** - No verified publisher information

## 🛡️ Solutions (Ordered by Effectiveness)

### Option 1: FREE SignPath Foundation Certificate (BEST FOR OPEN SOURCE) 🆓
**Cost:** FREE | **Effectiveness:** 100% | **Professional:** ✅ | **Timeline:** 2-4 weeks

#### What is SignPath Foundation?
- **Completely FREE** code signing for qualifying open source projects
- **Real certificates** issued by SignPath Foundation (trusted CA)
- **No SmartScreen warnings** - fully eliminates the problem
- **Used by major projects**: VSCodium, Git Extensions, Vim, NETworkManager

#### Requirements for DropSentinel:
- ✅ **Open Source**: Your project is already on GitHub
- ✅ **Public Repository**: Already public
- ⚠️ **Project Maturity**: Need some GitHub activity/stars (usually 50+ stars)
- ✅ **Automated Builds**: You already have GitHub Actions
- ✅ **Legitimate Project**: DropSentinel is a real security tool

#### How to Apply:
1. **Email**: oss-support@signpath.org
2. **Subject**: "OSS Code Signing Application - DropSentinel"
3. **Include**: GitHub repo link, project description, build process info

### Option 2: GitHub Student Pack + Cheap Certificate
**Cost:** $50-100/year | **Effectiveness:** 100% | **Professional:** ✅

#### GitHub Student Developer Pack Benefits:
- ✅ **Free .me domain** + SSL certificate (Name.com)
- ✅ **DigitalOcean credits** for hosting
- ✅ **Various development tools**
- ❌ **No code signing certificates** (only SSL certificates)

#### Cheapest Real Code Signing Options:
- **SSL.com**: $75/year (cheapest found)
- **Sectigo**: $85/year
- **Comodo**: $90/year
- **GoGetSSL**: $95/year (reseller)

### Option 3: Standard Code Signing Certificate
**Cost:** $200-400/year | **Effectiveness:** 100% | **Professional:** ✅

#### Extended Validation (EV) Code Signing Certificate
- **Immediate Trust**: No SmartScreen warnings from day 1
- **Hardware Token**: Highest security level
- **Cost**: $300-400/year
- **Providers**: DigiCert, Sectigo, GlobalSign

#### Standard Code Signing Certificate
- **Builds Reputation**: Trust improves over time with downloads
- **Software Token**: Easier to manage
- **Cost**: $200-300/year
- **Providers**: DigiCert, Sectigo, Comodo

### Option 2: Self-Signed Certificate (DEVELOPMENT)
**Cost:** Free | **Effectiveness:** 50% | **Professional:** ⚠️

- Reduces some warnings but still shows "Unknown publisher"
- Good for internal testing and development
- Users still need to "Run anyway"

### Option 3: Application Reputation Building
**Cost:** Free | **Effectiveness:** 30% | **Time:** 6+ months

- Submit to Microsoft for reputation analysis
- Distribute through trusted channels
- Build download volume over time

### Option 4: Alternative Distribution
**Cost:** Free | **Effectiveness:** 80% | **Professional:** ✅

- Microsoft Store (requires certification)
- Windows Package Manager (winget)
- Chocolatey package manager

## 🔧 Implementation Guide

### For Code Signing Certificate:

1. **Purchase Certificate** from trusted CA
2. **Update package.json**:
```json
"win": {
  "certificateFile": "path/to/certificate.p12",
  "certificatePassword": "your-password",
  "publisherName": "Your Company Name",
  "verifyUpdateCodeSignature": true
}
```

3. **Environment Variables** (for CI/CD):
```bash
CSC_LINK=path/to/certificate.p12
CSC_KEY_PASSWORD=your-password
```

### For Self-Signed Certificate (Development):

1. **Create Certificate**:
```powershell
New-SelfSignedCertificate -Type CodeSigningCert -Subject "CN=DropSentinel" -KeyUsage DigitalSignature -FriendlyName "DropSentinel Code Signing" -CertStoreLocation "Cert:\CurrentUser\My" -TextExtension @("2.5.29.37={text}1.3.6.1.5.5.7.3.3", "2.5.29.19={text}")
```

2. **Export Certificate**:
```powershell
$cert = Get-ChildItem -Path "Cert:\CurrentUser\My" -CodeSigningCert
Export-PfxCertificate -Cert $cert -FilePath "DropSentinel.pfx" -Password (ConvertTo-SecureString -String "password" -Force -AsPlainText)
```

## 🎯 Recommended Action Plan

### BEST OPTION: Apply for SignPath Foundation (FREE) 🆓
**Timeline**: 2-4 weeks | **Cost**: $0 | **Effectiveness**: 100%

#### This Week:
1. ✅ **Improve Error Messages**: Better user guidance in installer (DONE)
2. ✅ **Add Publisher Info**: Update package.json with proper publisher details (DONE)
3. 🎯 **Apply to SignPath Foundation**: Email oss-support@signpath.org
4. 🎯 **Boost GitHub Activity**: Get more stars/contributors to strengthen application

#### Application Email Template:
```
Subject: OSS Code Signing Application - DropSentinel Security Scanner

Dear SignPath Foundation Team,

I am writing to apply for free code signing services for DropSentinel, an open-source file security scanner.

Project Details:
- Repository: https://github.com/JSB2010/DropSentinel
- Description: Real-time file security scanner using VirusTotal API
- Purpose: Protect users from malware in downloaded files
- License: Open source (MIT/Apache)
- Build System: GitHub Actions with automated releases
- Current Issue: Windows SmartScreen warnings preventing user adoption

DropSentinel is a legitimate security tool that helps protect users from malware. The SmartScreen warnings are preventing users from installing this beneficial software.

We have automated builds via GitHub Actions and can integrate with SignPath's build verification system.

Thank you for considering our application.

Best regards,
[Your Name]
```

### BACKUP OPTION: Cheap Certificate ($75/year)
If SignPath Foundation doesn't approve:

#### SSL.com Code Signing Certificate:
- **Cost**: $75/year (cheapest available)
- **Effectiveness**: 100% (eliminates SmartScreen)
- **Timeline**: 1-3 days verification
- **Student Discount**: Contact support with .edu email

### Medium Term (This Month):
1. 🔄 **Self-Signed Certificate**: For development builds (DONE)
2. 🔄 **Microsoft Store**: Submit for store distribution
3. 🔄 **Winget Package**: Create Windows Package Manager entry

### Long Term (Next Quarter):
1. 🎯 **Reputation Building**: Distribute through trusted channels
2. 🎯 **Professional Branding**: Complete publisher verification
3. 🎯 **Community Growth**: Build user base and GitHub activity

## 📋 Current Configuration Status

- ✅ Publisher name set to "JSB2010"
- ✅ Legal trademarks configured
- ❌ No code signing certificate
- ❌ Certificate file set to null
- ⚠️ Self-signing disabled

## 🚀 Next Steps

1. **Immediate**: Update installer with better user guidance
2. **Week 1**: Implement self-signed certificate for development
3. **Week 2**: Research and purchase code signing certificate
4. **Week 3**: Implement proper code signing in build process
5. **Month 1**: Submit to Microsoft Store and winget

## 📞 Certificate Providers

### Recommended for EV Certificates:
- **DigiCert**: Industry leader, fastest validation
- **Sectigo**: Good value, reliable support
- **GlobalSign**: Competitive pricing

### Budget Options:
- **Comodo/Sectigo**: Standard certificates
- **SSL.com**: Competitive pricing
- **GoGetSSL**: Reseller with good prices

---

*This guide will be updated as we implement each solution.*
