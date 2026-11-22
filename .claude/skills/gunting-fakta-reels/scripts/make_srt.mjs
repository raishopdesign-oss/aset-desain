// SRT from the subtitle cues in src/vo.js (VO: [{t0, t1, zh}]). Usage (from the project folder): node <skill>/scripts/make_srt.mjs [out.srt]
import { writeFileSync } from 'fs'; import { pathToFileURL } from 'url'; import { resolve } from 'path';
const { VO } = await import(pathToFileURL(resolve('src/vo.js')).href);
const f = s => { const ms = Math.round(s * 1000), p = (n, w = 2) => String(n).padStart(w, '0');
  return `${p(Math.floor(ms / 3600000))}:${p(Math.floor(ms / 60000) % 60)}:${p(Math.floor(ms / 1000) % 60)},${p(ms % 1000, 3)}`; };
const out = process.argv[2] || 'subtitles_id_vo.srt';
writeFileSync(out, VO.map((c, i) => `${i + 1}\n${f(c.t0)} --> ${f(c.t1)}\n${c.zh}\n`).join('\n')); console.log(out, VO.length, 'cues');
