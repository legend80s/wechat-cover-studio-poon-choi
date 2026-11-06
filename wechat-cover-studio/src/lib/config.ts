export const config = {
  COVER_W: 900,
  COVER_H: 383,
  //  COVER_W : 1440,
  //  COVER_H : 720,
  GAP: 5, // gap in px,
  //  BG_COLOR : 'white' // 图片间隙底色（深灰，白图上也清晰可见）,
  get GAP_COLOR() {
    return config.PRESETS[0]
  }, // 图片间隙底色（深灰，白图上也清晰可见）,

  PRESETS: [
    'yellowgreen',
    'white',
    '#6ff1a3',
    '#7a7c88',
    '#bfbfbf',
    '#c1cbcc',
    '#c6c9d8',
    '#d6d5da',
    '#f7d24f',
    '#fda036',
    '#c28f74',
    '#a48157',
    '#fac29f',
    '#815f39',
  ],

  // GAP_COLOR: '', // 图片间隙底色（深灰，白图上也清晰可见）,
  // white
  // yellowgreen
  // #6ff1a3
  // #7a7c88
  // #bfbfbf
  // #c1cbcc
  // #c6c9d8
  // #d6d5da
  // #f7d24f
  // #fda036
  // #c28f74
  // #a48157
  // #fac29f
  // #815f39
}
