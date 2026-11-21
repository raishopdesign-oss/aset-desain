"""Fit the user's own VO read (vo_user/source.mp3, one take) to the picture: cut it per line (vo_user/cuts.json),
shorten pauses inside a line to 0.22 s, find the smallest even tempo (atempo, ≤1.12) at which every line can sit within
−0.35/+0.9 s of its cue with ≥0.12 s between lines, the silence 59.25–61.0 kept clear and the last line ending by 91.7.
Writes vo_user/placed.json and vo_user/vo_track.wav (48 kHz mono, film clock)."""
import json, subprocess, numpy as np, soundfile as sf
SR=48000; x,_=sf.read('vo_user/source.wav'); C=json.load(open('vo_user/cuts.json'))
hop=480
def squeeze(y):
    e=np.sqrt(np.convolve(y**2,np.ones(hop)/hop,'same')); db=20*np.log10(e+1e-9); thr=db.max()-42
    q=db<thr; out=[]; i=0; n=len(y)
    while i<n:
        if q[i]:
            j=i
            while j<n and q[j]: j+=1
            L=j-i
            if L>int(.30*SR) and i>0 and j<n:
                k=int(.22*SR); f=int(.02*SR); a=y[i:i+k//2].copy(); b=y[j-k//2:j].copy()
                a[-f:]*=np.linspace(1,0,f); b[:f]*=np.linspace(0,1,f); out+= [a,b]
            else: out.append(y[i:j])
            i=j
        else:
            j=i
            while j<n and not q[j]: j+=1
            out.append(y[i:j]); i=j
    return np.concatenate(out)
P=[]
for c in C:
    y=x[int(c['a']*SR):int(c['b']*SR)].copy(); f=int(.012*SR); y[:f]*=np.linspace(0,1,f); y[-f:]*=np.linspace(1,0,f)
    P.append(squeeze(y))
D=[len(p)/SR for p in P]
def place(r):
    s=[];end=0
    for i,c in enumerate(C):
        d=D[i]/r; st=max(c['t0']-.35,end+.12 if i else 0.3)
        if c['id']=='L15': st=max(st,61.0)
        if st-c['t0']>.9: return None
        e=st+d
        if c['id']=='L14' and e>59.2: return None
        s.append(st); end=e
    return s if end<=91.7 else None
for r in np.arange(1.0,1.121,.005):
    S=place(r)
    if S: break
print('tempo',round(r,3),'speech',round(sum(D),2),'->',round(sum(D)/r,2))
trk=np.zeros(int(92*SR)); placed=[]
for i,(c,p) in enumerate(zip(C,P)):
    if r>1.0005:
        sf.write('/tmp/_i.wav',p,SR); subprocess.run(['ffmpeg','-v','error','-y','-i','/tmp/_i.wav','-af',f'atempo={r:.4f}','/tmp/_o.wav']); p,_=sf.read('/tmp/_o.wav')
    a=int(S[i]*SR); n=min(len(p),len(trk)-a); trk[a:a+n]+=p[:n]
    placed.append(dict(id=c['id'],t0=c['t0'],start=round(S[i],3),end=round(S[i]+len(p)/SR,3),shift=round(S[i]-c['t0'],2)))
    print(c['id'],f"cue {c['t0']:6.2f} start {S[i]:6.2f} end {S[i]+len(p)/SR:6.2f} shift {S[i]-c['t0']:+.2f}")
json.dump(dict(tempo=r,lines=placed),open('vo_user/placed.json','w'),indent=1)
sf.write('vo_user/vo_track.wav',trk,SR)
