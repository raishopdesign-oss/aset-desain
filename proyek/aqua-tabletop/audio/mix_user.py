"""Mix the user's VO (vo_user/vo_track.wav, already on the film clock) over the foley (out/sfx.wav): no music.
The foley dips 40 % under the voice; the voice sits at about −20.5 dBFS RMS. Writes out/mix_user.wav (float); loudness is set at mux."""
import numpy as np, soundfile as sf, subprocess
SR = 48000; DUR = 169.0; N = int(DUR * SR)
v, _ = sf.read('vo_user/vo_track.wav')
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', 'out/sfx.wav', '-ar', '48000', 'out/sfx48.wav'], check=True); f, _ = sf.read('out/sfx48.wav')
f = np.pad(f, ((0, max(0, N - len(f))), (0, 0)))[:N]; v = np.pad(v, (0, max(0, N - len(v))))[:N]
act = (np.abs(v) > 1e-3).astype(float); k = int(.25 * SR); cs = np.concatenate([[0], np.cumsum(act)]); i = np.arange(N); act = ((cs[np.clip(i + k // 2, 0, N)] - cs[np.clip(i - k // 2, 0, N)]) / k).clip(0, 1)   # moving average via cumsum
v *= 10 ** (-20.5 / 20) / np.sqrt(np.mean(v[np.abs(v) > 1e-3] ** 2))
sf.write('out/mix_user.wav', (f * (1 - .4 * act)[:, None] + v[:, None]).astype(np.float32), SR); print('mix ok')
