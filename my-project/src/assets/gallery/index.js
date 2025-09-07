// Hero & CTA images
export { default as galleryHero } from "./hero.webp";
export { default as galleryCTA } from "./cta.webp";

// Section showcase images
import section1 from "./section1.webp";
import section2 from "./section2.webp";

export const gallerySections = [section1, section2];

// Before & After transformations
import before1 from "./before-1.webp";
import after1 from "./after-1.webp";
import before2 from "./before-2.webp";
import after2 from "./after-2.webp";
import before3 from "./before-3.webp";
import after3 from "./after-3.webp";

export const beforeAfterPairs = [
  { before: before1, after: after1 },
  { before: before2, after: after2 },
  { before: before3, after: after3 },
];

import post1 from "./post1.webp"
import post2 from "./post2.webp"
import post3 from "./post3.webp"


export const posts = [
  post1, post2 , post3
]

import video1 from "./video-1.mp4"
import video2 from "./video-2.mp4"
import video3 from "./video-3.mp4"

// Video gallery sources (no import needed since served from /public/videos)
export const videoSources = [
  video1,
  video2,
  video3,
];
