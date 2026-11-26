$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path $PSScriptRoot -Parent
$ffmpegPath = Join-Path $projectRoot 'tools/ffmpeg/ffmpeg-9.0.2-essentials_build/bin/ffmpeg.exe'
$mixPath = Join-Path $projectRoot 'tmp/intro-ending-mix.m4a'
$arguments = @('-y','-hide_banner','-loglevel','error','-i',(Join-Path $projectRoot 'assets/audio/intro-score.m4a'))
1..6 | ForEach-Object { $arguments += @('-i',(Join-Path $projectRoot ('assets/audio/voice-{0:00}.m4a' -f $_))) }
$arguments += @('-f','lavfi','-i','anoisesrc=d=30:color=pink:amplitude=0.08:r=48000:seed=23')
# The source has 8.4 seconds of silent padding. Reprise a musical passage,
# crossfading before that padding instead of stretching or looping the silence.
$filters = @('[0:a]asplit=2[opening][reprise];[opening]atrim=0:20,asetpts=PTS-STARTPTS[s0];[reprise]atrim=6:18,asetpts=PTS-STARTPTS[s1];[s0][s1]acrossfade=d=2:c1=tri:c2=tri,volume=0.24,afade=t=in:d=0.6,afade=t=out:st=29:d=1[score]')
$delays = @(2000,7000,12000,18000,23000,27000)
0..5 | ForEach-Object { $filters += ('[{0}:a]volume=0.95,adelay={1}:all=1[v{2}]' -f ($_+1),$delays[$_],$_) }
$filters += '[7:a]highpass=f=120,lowpass=f=2800,volume=0.22,afade=t=in:d=0.4,afade=t=out:st=6:d=3[rain]'
$filters += '[score][v0][v1][v2][v3][v4][v5][rain]amix=inputs=8:normalize=0,loudnorm=I=-16:TP=-1.5:LRA=11[a]'
$arguments += @('-filter_complex',($filters -join ';'),'-map','[a]','-c:a','aac','-ar','48000','-b:a','192k','-t','30',$mixPath)
& $ffmpegPath @arguments
if ($LASTEXITCODE -ne 0) { throw 'Audio mixing failed' }
foreach ($suffix in @('','-mobile')) {
    $source = Join-Path $projectRoot ("assets/intro-photographic-v3$suffix.mp4")
    $destination = Join-Path $projectRoot ("assets/intro-photographic-v3-score$suffix.mp4")
    & $ffmpegPath -y -hide_banner -loglevel error -i $source -i $mixPath -map 0:v:0 -map 1:a:0 -c copy -t 30 -movflags +faststart $destination
    if ($LASTEXITCODE -ne 0) { throw "Remux failed: $suffix" }
}
