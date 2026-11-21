// The one take: [t, target (Vector3 | subject), dist, az, el, fov, target offset?, {ease}?] and impact shakes [t, amp, decay].
// az 0 = camera on the +z side looking toward −z (cards read upright); el in radians. Portrait frame: the desk runs up the screen.
import { T } from './film.js';
const R = { ease: 1 };
export const KEYS = [
  // hook: the chat says BELI ODOL!, the tent and the shelf beside it
  [0.0, 'A', 1.2, .06, .96, 38],
  [1.4, 'A', 1.05, .1, 1.0, 38],
  [2.9, 'A', 1.02, .08, 1.02, 38, null, R],
  // the shelf: three tubes pop on their names; ODOL? over the hero
  [3.4, 'shelf', .9, -.18, .7, 38],
  [6.4, 'shelf', .84, -.28, .66, 38],
  [8.4, 'hero', .62, -.12, .5, 38],
  [9.55, 'hero', .6, -.1, .5, 38, null, R],
  // whip to the search card and rise to read it
  [10.1, 'B', 1.2, -.2, .78, 38],
  [11.4, 'Btop', 1.18, -.08, 1.04, 38],
  [19.3, 'Btop', 1.14, -.04, 1.07, 38, null, R],
  // whip to the map of Europe; the pin drops on Dresden
  [20.2, 'C', 1.25, .15, .86, 38],
  [21.0, 'Cpin', .72, .2, .74, 38],
  [24.4, 'Cpin', .68, .26, .7, 38, null, R],
  // Lingner's lab
  [25.3, 'lab', .98, -.25, .68, 38],
  [28.6, 'lab', .92, -.14, .76, 38],
  [33.4, 'lab', .9, 0, .95, 38],
  [36.9, 'lab', .88, .04, .96, 38, null, R],
  [38.2, 'lab', .82, .26, .6, 38],
  [42.4, 'lab', .9, .12, .7, 38, null, R],
  // back to the North Sea: the ship; ride beside it up the desk to Java
  [43.1, 'port', .82, .6, .56, 38],
  [46.0, 'port', .78, .7, .5, 38, null, R],
  [47.2, 'ship', .85, .95, .46, 38],
  [49.6, 'ship', .9, .55, .62, 38],
  [50.4, 'E', 1.2, .2, .92, 38],
  // the newspaper, 1894 → 1903
  [51.1, 'news', 1.02, -.1, 1.0, 38],
  [54.0, 'news', .96, -.05, 1.02, 38],
  [58.7, 'news', .96, 0, 1.0, 38, null, R],
  // the silence, then the stamp: every tube is ODOL
  [59.9, 'F', 1.5, 0, .9, 38],
  [62.2, 'F', 1.32, .05, .96, 38],
  [64.8, 'F', 1.12, .25, .62, 38],
  [68.3, 'F', 1.12, -.15, .7, 38],
  [70.9, 'F', 1.2, -.05, .86, 38, null, R],
  // the close: banner and the kid brushing; Aqua / Sanyo / Honda; the question
  [71.9, 'G', 1.7, 0, .86, 38],
  [73.2, 'G', 1.5, .1, .8, 38],
  [78.3, 'G', 1.45, .06, .84, 38, null, R],
  [79.4, 'tents', 1.3, 0, .5, 38],
  [82.6, 'tents', 1.26, .05, .5, 38, null, R],
  [83.4, 'Gphone', 1.06, .05, 1.0, 38],
  [85.9, 'Gphone', 1.02, .05, 1.02, 38, null, R],
  // the whole desk: curtain call, scissors, the Gunting Fakta card
  [88.2, 'final', 5.1, .04, .86, 38],
  [92.0, 'final', 5.3, .07, .88, 38],
];
export const SHAKES = [[T.pinC, .003, 9], [T.stamp0, .008, 8], [T.stamps[2], .004, 9], [T.logo, .004, 9]];
