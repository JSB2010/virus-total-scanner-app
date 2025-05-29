; DropSentinel NSIS Installer Script
; Custom installer with SmartScreen guidance and better Windows integration

!include "MUI2.nsh"
!include "FileFunc.nsh"
!include "LogicLib.nsh"

; Installer attributes
Name "DropSentinel"
OutFile "DropSentinel-Setup.exe"
InstallDir "$LOCALAPPDATA\DropSentinel"
InstallDirRegKey HKCU "Software\DropSentinel" "InstallDir"
RequestExecutionLevel user

; Modern UI Configuration
!define MUI_ABORTWARNING
!define MUI_ICON "public\assets\app-icon.ico"
!define MUI_UNICON "public\assets\app-icon.ico"

; Welcome page with SmartScreen guidance
!define MUI_WELCOMEPAGE_TITLE "Welcome to DropSentinel Setup"
!define MUI_WELCOMEPAGE_TEXT "This wizard will guide you through the installation of DropSentinel.$\r$\n$\r$\n\
IMPORTANT: If you saw a Windows SmartScreen warning:$\r$\n\
• Click 'More info' then 'Run anyway'$\r$\n\
• This warning appears because we don't yet have a code signing certificate$\r$\n\
• DropSentinel is safe, open-source software$\r$\n$\r$\n\
Click Next to continue."

!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_LICENSE "LICENSE"
!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_INSTFILES

; Custom finish page
!define MUI_FINISHPAGE_RUN "$INSTDIR\DropSentinel.exe"
!define MUI_FINISHPAGE_RUN_TEXT "Start DropSentinel now"
!define MUI_FINISHPAGE_LINK "Visit our GitHub repository"
!define MUI_FINISHPAGE_LINK_LOCATION "https://github.com/JSB2010/virus-total-scanner-app"
!insertmacro MUI_PAGE_FINISH

; Uninstaller pages
!insertmacro MUI_UNPAGE_CONFIRM
!insertmacro MUI_UNPAGE_INSTFILES

; Languages
!insertmacro MUI_LANGUAGE "English"

; Version Information
VIProductVersion "0.1.0.0"
VIAddVersionKey "ProductName" "DropSentinel"
VIAddVersionKey "CompanyName" "DropSentinel Security"
VIAddVersionKey "FileDescription" "DropSentinel Security Scanner"
VIAddVersionKey "FileVersion" "0.1.0"
VIAddVersionKey "ProductVersion" "0.1.0"
VIAddVersionKey "LegalCopyright" "© 2024 DropSentinel Security"
VIAddVersionKey "OriginalFilename" "DropSentinel-Setup.exe"

; Installer sections
Section "DropSentinel" SecMain
  SetOutPath "$INSTDIR"
  
  ; Install files (this will be populated by electron-builder)
  File /r "${BUILD_RESOURCES_DIR}\*"
  
  ; Create shortcuts
  CreateDirectory "$SMPROGRAMS\DropSentinel"
  CreateShortcut "$SMPROGRAMS\DropSentinel\DropSentinel.lnk" "$INSTDIR\DropSentinel.exe"
  CreateShortcut "$SMPROGRAMS\DropSentinel\Uninstall.lnk" "$INSTDIR\Uninstall.exe"
  CreateShortcut "$DESKTOP\DropSentinel.lnk" "$INSTDIR\DropSentinel.exe"
  
  ; Registry entries
  WriteRegStr HKCU "Software\DropSentinel" "InstallDir" "$INSTDIR"
  WriteRegStr HKCU "Software\DropSentinel" "Version" "0.1.0"
  
  ; Uninstaller
  WriteUninstaller "$INSTDIR\Uninstall.exe"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\DropSentinel" "DisplayName" "DropSentinel"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\DropSentinel" "UninstallString" "$INSTDIR\Uninstall.exe"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\DropSentinel" "Publisher" "DropSentinel Security"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\DropSentinel" "DisplayVersion" "0.1.0"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\DropSentinel" "URLInfoAbout" "https://github.com/JSB2010/virus-total-scanner-app"
  
SectionEnd

; Uninstaller section
Section "Uninstall"
  ; Remove files
  RMDir /r "$INSTDIR"
  
  ; Remove shortcuts
  Delete "$SMPROGRAMS\DropSentinel\DropSentinel.lnk"
  Delete "$SMPROGRAMS\DropSentinel\Uninstall.lnk"
  RMDir "$SMPROGRAMS\DropSentinel"
  Delete "$DESKTOP\DropSentinel.lnk"
  
  ; Remove registry entries
  DeleteRegKey HKCU "Software\DropSentinel"
  DeleteRegKey HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\DropSentinel"
SectionEnd

; Functions
Function .onInit
  ; Check if already installed
  ReadRegStr $R0 HKCU "Software\DropSentinel" "InstallDir"
  StrCmp $R0 "" done
  
  MessageBox MB_OKCANCEL|MB_ICONEXCLAMATION \
    "DropSentinel is already installed. $\n$\nClick OK to upgrade or Cancel to quit." \
    IDOK done
  Abort
  
  done:
FunctionEnd
