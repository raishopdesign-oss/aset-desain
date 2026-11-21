// The one take: [t, target (Vector3 | subject), dist, az, el, fov, target offset?, {ease}?] and impact shakes [t, amp, decay].
// az 0 = camera on the +z side looking toward −z (cards read upright); el in radians. Portrait frame: the desk runs up the screen.
import { T } from './film.js';
const R = { ease: 1 };
export const KEYS = [
  // hook: the chat says BELI AQUA!, the warung shelf of other brands, the reply, the question
  [0.0, 'AS', 1.25, .06, .96, 38],
  [2.6, 'A', 1.0, .08, 1.02, 38, null, R],
  [3.6, 'shelf', .9, -.18, .7, 38],
  [9.5, 'shelf', .84, -.25, .66, 38, null, R],
  [10.2, 'A', 1.0, .05, 1.0, 38],
  [13.3, 'A', 1.02, .04, 1.02, 38, null, R],
  [14.2, 'hero', .62, -.1, .5, 38],
  [15.1, 'AS', 1.2, 0, .85, 38],
  [16.6, 'AS', 1.22, 0, .86, 38, null, R],
  // the search card: Aqua is a brand, Latin for water; glass then plastic
  [17.6, 'B', 1.2, -.2, .78, 38],
  [18.7, 'Btop', 1.18, -.08, 1.04, 38],
  [32.6, 'Btop', 1.14, -.04, 1.07, 38, null, R],
  [33.5, 'Bb', .75, -.3, .6, 38],
  [37.8, 'Bb', .7, -.35, .58, 38, null, R],
  // West Java, 1973; not yet common
  [38.7, 'C', 1.25, .15, .86, 38],
  [39.6, 'Cpin', .72, .2, .74, 38],
  [42.6, 'Cpin', .7, .26, .7, 38, null, R],
  [43.6, 'C', 1.2, .05, .9, 38],
  [47.9, 'C', 1.15, 0, .92, 38, null, R],
  // a 1970s home: water is boiled; the idea
  [48.9, 'D', 1.0, -.2, .7, 38],
  [56.4, 'D', .92, -.1, .66, 38, null, R],
  [57.2, 'hero', .72, -.05, .42, 38],
  [60.2, 'hero', .74, 0, .44, 38, null, R],
  // Tirto Utomo; the deed of PT Golden Mississippi; practical and hygienic
  [61.1, 'E', 1.2, .1, .82, 38],
  [63.3, 'Tirto', .8, .15, .6, 38],
  [64.9, 'Akta', .9, -.1, .95, 38],
  [72.4, 'Akta', .88, -.05, .98, 38, null, R],
  [73.1, 'Tirto', .95, .1, .8, 38],
  [78.2, 'Tirto', .92, .12, .82, 38, null, R],
  [79.2, 'E', 1.2, .05, .85, 38],
  [80.8, 'E', 1.18, .05, .86, 38, null, R],
  // 1974: the first product, 950 ml, Rp75; not an easy business
  [81.9, 'F', 1.25, -.15, .85, 38],
  [89.4, 'F', 1.2, -.1, .88, 38],
  [90.6, 'Fb', .75, .25, .5, 38],
  [95.8, 'Fb', .72, .3, .52, 38, null, R],
  [96.7, 'F', 1.2, .05, .95, 38],
  [108.9, 'F', 1.16, .08, .97, 38, null, R],
  // packaging through the years; the truck to shops, warungs and malls
  [109.9, 'G', 1.0, -.1, .8, 38],
  [115.7, 'G', .95, -.05, .84, 38, null, R],
  [116.7, 'truck', .9, .5, .55, 38],
  [121.0, 'truck', 1.0, .3, .6, 38],
  [123.2, 'truck', 1.05, .15, .72, 38],
  [125.9, 'truck', 1.05, .05, .78, 38],
  [127.6, 'ban2', .95, -.1, .95, 38],
  [132.4, 'ban2', .92, -.05, .98, 38, null, R],
  // today's shelf: every bottle is AQUA
  [133.6, 'H', 1.3, 0, .9, 38],
  [136.3, 'H', 1.15, .05, .95, 38],
  [139.9, 'H', 1.1, -.15, .7, 38],
  [147.4, 'H', 1.12, -.05, .85, 38, null, R],
  // the dictionary: genericized trademark; then the question
  [148.6, 'I', 1.42, 0, .95, 38],
  [155.6, 'I', 1.36, .02, .98, 38, null, R],
  [156.6, 'ban3', 1.0, -.05, .95, 38],
  [158.0, 'ban3', .98, -.05, .97, 38, null, R],
  [158.7, 'Gphone', 1.06, .05, 1.0, 38],
  [164.2, 'Gphone', 1.02, .05, 1.02, 38, null, R],
  // the whole desk, then fly to the Gunting Fakta card and hold
  [165.4, 'final', 8.0, .04, .86, 38],
  [166.9, 'final', 8.1, .05, .87, 38],
  [168.3, 'logoC', 2.0, 0, 1.05, 38],
  [169.0, 'logoC', 1.95, 0, 1.06, 38, null, R],
];
export const SHAKES = [[T.pinC, .003, 9], [T.stampA, .004, 9], [T.big, .008, 8], [T.stamps[3], .004, 9], [T.logo, .004, 9]];
