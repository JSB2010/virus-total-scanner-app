; DropSentinel Custom NSIS Installer Include
; This file contains custom macros and functions for the installer

!include "MUI2.nsh"
!include "FileFunc.nsh"

; Custom page for SmartScreen guidance
!define MUI_PAGE_CUSTOMFUNCTION_PRE SmartScreenGuidancePre
!insertmacro MUI_PAGE_INSTFILES

; Custom function to show SmartScreen guidance
Function SmartScreenGuidancePre
  ; Check if this is the first time running the installer
  ReadRegStr $0 HKCU "Software\DropSentinel" "InstallerRun"
  StrCmp $0 "1" SkipGuidance
  
  ; Show guidance message
  MessageBox MB_ICONINFORMATION|MB_OK \
    "Windows SmartScreen Protection Notice$\r$\n$\r$\n\
    If you saw a 'Windows protected your PC' warning:$\r$\n\
    1. Click 'More info'$\r$\n\
    2. Click 'Run anyway'$\r$\n$\r$\n\
    This warning appears because DropSentinel is not yet code-signed.$\r$\n\
    The software is safe and open-source.$\r$\n$\r$\n\
    We are working on obtaining a code signing certificate to eliminate this warning."
  
  ; Mark that guidance has been shown
  WriteRegStr HKCU "Software\DropSentinel" "InstallerRun" "1"
  
  SkipGuidance:
FunctionEnd

; Custom uninstaller function
Function un.onInit
  MessageBox MB_ICONQUESTION|MB_YESNO|MB_DEFBUTTON2 \
    "Are you sure you want to completely remove DropSentinel and all of its components?" \
    IDYES +2
  Abort
FunctionEnd

; Custom finish page text
!define MUI_FINISHPAGE_TITLE "DropSentinel Installation Complete"
!define MUI_FINISHPAGE_TEXT "DropSentinel has been successfully installed.$\r$\n$\r$\nThe application will start automatically and begin monitoring your Downloads folder for security threats.$\r$\n$\r$\nYou can access DropSentinel from the system tray or Start menu."

; Add custom registry entries for better Windows integration
Function .onInstSuccess
  ; Register application for Windows Security Center (if applicable)
  WriteRegStr HKLM "SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\DropSentinel" "DisplayName" "DropSentinel"
  WriteRegStr HKLM "SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\DropSentinel" "Publisher" "DropSentinel Security"
  WriteRegStr HKLM "SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\DropSentinel" "DisplayVersion" "${VERSION}"
  WriteRegStr HKLM "SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\DropSentinel" "URLInfoAbout" "https://github.com/JSB2010/virus-total-scanner-app"
  WriteRegStr HKLM "SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\DropSentinel" "HelpLink" "https://github.com/JSB2010/virus-total-scanner-app/issues"
  
  ; Add to Windows Defender exclusions (user will be prompted)
  ExecWait 'powershell.exe -Command "Add-MpPreference -ExclusionPath \"$INSTDIR\" -Force"' $0
FunctionEnd
