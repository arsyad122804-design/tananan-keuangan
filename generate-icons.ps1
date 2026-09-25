Add-Type -AssemblyName System.Drawing

function Generate-Icon([int]$size, [string]$outputPath) {
    $bmp = New-Object System.Drawing.Bitmap $size, $size
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    
    # Background
    $bgBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.ColorTranslator]::FromHtml('#0F172A'))
    $g.FillRectangle($bgBrush, 0, 0, $size, $size)
    
    # Scale factors
    $scale = $size / 512.0
    
    # Draw rounded rect or background glow
    $emeraldBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.ColorTranslator]::FromHtml('#10B981'))
    $blueBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.ColorTranslator]::FromHtml('#3B82F6'))
    
    $penWidth = [float](32.0 * $scale)
    $pen = New-Object System.Drawing.Pen ([System.Drawing.ColorTranslator]::FromHtml('#10B981')), $penWidth
    $pen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
    $pen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
    $pen.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round
    
    $pt1 = New-Object System.Drawing.PointF ([float](128 * $scale)), ([float](352 * $scale))
    $pt2 = New-Object System.Drawing.PointF ([float](224 * $scale)), ([float](256 * $scale))
    $pt3 = New-Object System.Drawing.PointF ([float](288 * $scale)), ([float](320 * $scale))
    $pt4 = New-Object System.Drawing.PointF ([float](384 * $scale)), ([float](192 * $scale))
    
    $pts = [System.Drawing.PointF[]]@($pt1, $pt2, $pt3, $pt4)
    $g.DrawLines($pen, $pts)
    
    $arr1 = New-Object System.Drawing.PointF ([float](304 * $scale)), ([float](192 * $scale))
    $arr2 = New-Object System.Drawing.PointF ([float](384 * $scale)), ([float](192 * $scale))
    $arr3 = New-Object System.Drawing.PointF ([float](384 * $scale)), ([float](272 * $scale))
    $arrPts = [System.Drawing.PointF[]]@($arr1, $arr2, $arr3)
    $g.DrawLines($pen, $arrPts)
    
    # Dots
    $rBlue = 16.0 * $scale
    $g.FillEllipse($blueBrush, [float](224 * $scale - $rBlue), [float](256 * $scale - $rBlue), [float]($rBlue * 2), [float]($rBlue * 2))
    $g.FillEllipse($blueBrush, [float](288 * $scale - $rBlue), [float](320 * $scale - $rBlue), [float]($rBlue * 2), [float]($rBlue * 2))
    
    $rGreen = 20.0 * $scale
    $g.FillEllipse($emeraldBrush, [float](384 * $scale - $rGreen), [float](192 * $scale - $rGreen), [float]($rGreen * 2), [float]($rGreen * 2))
    
    $bmp.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $bmp.Dispose()
    Write-Host "Created $outputPath ($size x $size)"
}

Generate-Icon 512 "public/icon-512.png"
Generate-Icon 192 "public/icon-192.png"
Generate-Icon 180 "public/apple-touch-icon.png"
Generate-Icon 32 "public/favicon-32x32.png"
