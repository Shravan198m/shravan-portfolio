# Intro audio inspection and preparation

Source: user-supplied 20261104-1411-38.8049630.mp4 screen recording. Original file unchanged.

The recording contains H.264 video (25.57 seconds) and AAC stereo audio at 48 kHz. Audio decodes to approximately 23.77 seconds. Source mean level -22.0 dBFS and peak -12.9 dBFS. Signal inspection found no opening silence at -50 dBFS lasting 0.4 seconds or longer. This is signal/codec validation; no perceptual listening tool was available to classify speech/music content by ear.

`assets/audio/intro-score.m4a` preserves original audio beginning, playback speed and pitch. It uses +4 dB gain, an 80 ms entrance fade, a fade from 21.5 to 23.75 seconds and silence padding to a 30-second file. AAC-LC, stereo, 48 kHz. Below -50 dBFS after approximately 21.59 seconds, leaving the final scene for rain/SFX and spoken closing lines.

Six narration assets were rendered with the locally installed Microsoft David speech voice. This is synthesized narration, not a recorded human performance. Files use AAC-LC mono, 44.1 kHz. The second phrase was accelerated 1.2x to fit its five-second slot. Other phrases preserve generated rate. Timings and exact captions are in `assets/audio/narration.json`; all six fit their allotted intervals and final narration ends before 30 seconds.

WAV narration masters retained alongside M4A web assets. No external service received the recording or narration.
