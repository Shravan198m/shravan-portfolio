$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path $PSScriptRoot -Parent
$ffmpegPath = Join-Path $projectRoot 'tools/ffmpeg/ffmpeg-9.0.2-essentials_build/bin/ffmpeg.exe'
$renderPath = Join-Path $projectRoot 'tmp/intro-flight/frames/frame-%04d.png'
1..720 | ForEach-Object {
    $framePath = Join-Path $projectRoot ('tmp/intro-flight/frames/frame-{0:0000}.png' -f $_)
    if (!(Test-Path -LiteralPath $framePath)) { throw ('Render is incomplete: missing frame {0}' -f $_) }
}
$outputPath = Join-Path $projectRoot 'assets/intro-flight.mp4'
$scorePath = Join-Path $projectRoot 'assets/audio/intro-score.m4a'
$arguments = @('-y', '-framerate', '24', '-i', $renderPath, '-i', $scorePath)
1..6 | ForEach-Object { $arguments += @('-i', (Join-Path $projectRoot ('assets/audio/voice-{0:00}.m4a' -f $_))) }
$filters = @('[1:a]volume=0.24,afade=t=in:d=0.6,afade=t=out:st=28.5:d=1.5[score]')
$delays = @(2000,7000,12000,18000,23000,27000)
0..5 | ForEach-Object { $inputIndex = $_ + 2; $filters += ('[{0}:a]volume=0.95,adelay={1}:all=1[v{2}]' -f $inputIndex,$delays[$_],$_) }
$filters += '[score][v0][v1][v2][v3][v4][v5]amix=inputs=7:normalize=0,loudnorm=I=-16:TP=-1.5:LRA=11[a]'
$arguments += @('-filter_complex', ($filters -join ';'), '-map','0:v','-map','[a]', '-vf','hqdn3d=1.2:1.2:2:2', '-c:v','libx264','-preset','slow','-crf','21','-pix_fmt','yuv420p','-c:a','aac','-ar','48000','-b:a','160k','-t','30','-movflags','+faststart',$outputPath)
& $ffmpegPath @arguments
if ($LASTEXITCODE -ne 0) { throw 'Encoding failed' }
& $ffmpegPath -y -i $outputPath -frames:v 1 -q:v 3 (Join-Path $projectRoot 'assets/intro-flight-poster.jpg')
if ($LASTEXITCODE -ne 0) { throw 'Poster export failed' }
