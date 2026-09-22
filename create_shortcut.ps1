$desktop = [Environment]::GetFolderPath("Desktop")
$shortcutPath = Join-Path $desktop "Tatanan Uang.lnk"
$wscript = New-Object -ComObject WScript.Shell
$shortcut = $wscript.CreateShortcut($shortcutPath)
$shortcut.TargetPath = "http://localhost:3000"
$shortcut.Description = "Buka Aplikasi Tatanan Uang - Financial & Saham"
$shortcut.Save()
Write-Host "Shortcut Tatanan Uang berhasil dibuat di Desktop Windows: $shortcutPath"
