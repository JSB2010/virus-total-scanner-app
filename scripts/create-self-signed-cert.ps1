# DropSentinel Self-Signed Certificate Generator
# This script creates a self-signed code signing certificate for development builds

param(
    [string]$CertName = "DropSentinel Security",
    [string]$OutputPath = "build/certificates",
    [string]$Password = "DropSentinel2024!"
)

Write-Host "🔐 DropSentinel Certificate Generator" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan

# Check if running as administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")

if (-not $isAdmin) {
    Write-Host "⚠️  Warning: Not running as administrator" -ForegroundColor Yellow
    Write-Host "   Some operations may require elevated privileges" -ForegroundColor Yellow
    Write-Host ""
}

# Create output directory
if (-not (Test-Path $OutputPath)) {
    New-Item -ItemType Directory -Path $OutputPath -Force | Out-Null
    Write-Host "📁 Created certificate directory: $OutputPath" -ForegroundColor Green
}

try {
    Write-Host "🔨 Creating self-signed code signing certificate..." -ForegroundColor Yellow
    
    # Create the certificate
    $cert = New-SelfSignedCertificate `
        -Type CodeSigningCert `
        -Subject "CN=$CertName" `
        -KeyUsage DigitalSignature `
        -FriendlyName "$CertName Code Signing Certificate" `
        -CertStoreLocation "Cert:\CurrentUser\My" `
        -TextExtension @("2.5.29.37={text}1.3.6.1.5.5.7.3.3", "2.5.29.19={text}") `
        -KeyLength 2048 `
        -KeyAlgorithm RSA `
        -HashAlgorithm SHA256 `
        -NotAfter (Get-Date).AddYears(2)
    
    Write-Host "✅ Certificate created successfully" -ForegroundColor Green
    Write-Host "   Thumbprint: $($cert.Thumbprint)" -ForegroundColor Gray
    
    # Export to PFX file
    $pfxPath = Join-Path $OutputPath "DropSentinel-CodeSigning.pfx"
    $securePassword = ConvertTo-SecureString -String $Password -Force -AsPlainText
    
    Export-PfxCertificate -Cert $cert -FilePath $pfxPath -Password $securePassword | Out-Null
    Write-Host "💾 Certificate exported to: $pfxPath" -ForegroundColor Green
    
    # Export public key for verification
    $cerPath = Join-Path $OutputPath "DropSentinel-CodeSigning.cer"
    Export-Certificate -Cert $cert -FilePath $cerPath | Out-Null
    Write-Host "🔑 Public key exported to: $cerPath" -ForegroundColor Green
    
    # Create environment file for electron-builder
    $envPath = Join-Path $OutputPath "signing.env"
    @"
# DropSentinel Code Signing Environment Variables
# Source this file before building: . ./build/certificates/signing.env

CSC_LINK=$pfxPath
CSC_KEY_PASSWORD=$Password
WIN_CSC_LINK=$pfxPath
WIN_CSC_KEY_PASSWORD=$Password
"@ | Out-File -FilePath $envPath -Encoding UTF8
    
    Write-Host "⚙️  Environment file created: $envPath" -ForegroundColor Green
    
    # Update package.json with certificate info
    Write-Host ""
    Write-Host "📝 To use this certificate, update your package.json:" -ForegroundColor Cyan
    Write-Host "   'certificateFile': '$pfxPath'," -ForegroundColor Gray
    Write-Host "   'certificatePassword': '$Password'," -ForegroundColor Gray
    Write-Host "   'signAndEditExecutable': true," -ForegroundColor Gray
    
    Write-Host ""
    Write-Host "🚀 Or set environment variables:" -ForegroundColor Cyan
    Write-Host "   CSC_LINK=$pfxPath" -ForegroundColor Gray
    Write-Host "   CSC_KEY_PASSWORD=$Password" -ForegroundColor Gray
    
    Write-Host ""
    Write-Host "⚠️  IMPORTANT NOTES:" -ForegroundColor Yellow
    Write-Host "   • This is a SELF-SIGNED certificate for development only" -ForegroundColor Yellow
    Write-Host "   • Windows will still show 'Unknown publisher' warnings" -ForegroundColor Yellow
    Write-Host "   • For production, purchase a proper code signing certificate" -ForegroundColor Yellow
    Write-Host "   • Keep the password secure and don't commit certificates to git" -ForegroundColor Yellow
    
    Write-Host ""
    Write-Host "✅ Certificate generation completed successfully!" -ForegroundColor Green
    
} catch {
    Write-Host "❌ Error creating certificate: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Optional: Install certificate to Trusted Root (requires admin)
if ($isAdmin) {
    $install = Read-Host "Install certificate to Trusted Root Certification Authorities? (y/N)"
    if ($install -eq "y" -or $install -eq "Y") {
        try {
            Import-Certificate -FilePath $cerPath -CertStoreLocation "Cert:\LocalMachine\Root" | Out-Null
            Write-Host "✅ Certificate installed to Trusted Root" -ForegroundColor Green
            Write-Host "   This reduces some Windows warnings" -ForegroundColor Gray
        } catch {
            Write-Host "⚠️  Failed to install to Trusted Root: $($_.Exception.Message)" -ForegroundColor Yellow
        }
    }
} else {
    Write-Host ""
    Write-Host "💡 To reduce warnings further, run as administrator and install to Trusted Root" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "🎯 Next steps:" -ForegroundColor Cyan
Write-Host "   1. Update package.json with certificate settings" -ForegroundColor White
Write-Host "   2. Run: npm run dist:win" -ForegroundColor White
Write-Host "   3. Test the signed installer" -ForegroundColor White
Write-Host "   4. Consider purchasing a proper code signing certificate" -ForegroundColor White
