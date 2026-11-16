# 🥘 poon-choi

English | [中文](./README.zh.md)

<p align="center">
  <img src="https://koboyo.com/icons/svg/geometric-mezze-platter.svg" width="30%" />
</p>

> A tiny local server that plates up your images into a WeChat cover — like a **poon choi**, one basin holding many ingredients, layer by layer.

[![npm version](https://img.shields.io/npm/v/poon-choi.svg)](https://www.npmjs.com/package/poon-choi)
[![npm downloads](https://img.shields.io/npm/dm/poon-choi.svg)](https://www.npmjs.com/package/poon-choi)
[![0 dependencies](https://img.shields.io/badge/0-green?logo=npm&labelColor=blue&label=dependencies&color=green)](https://www.npmjs.com/package/poon-choi?activeTab=dependencies)

**poon-choi** (盆菜) is a Cantonese dish where many ingredients are stacked in one basin and shared from the top down. This tool does the same for images: drop in 1–6 pictures, and it plates them into a single **2.35:1 WeChat cover (900×383)**, plus a **1:1 thumbnail (383×383)**.

No build step, no config. One command and a local server.

## Quick start

```bash
pnpx poon-choi
```

Opens the tool on a local port and prints the URL. Then just drag images into the page.

### Pick your own port

```bash
pnpx poon-choi --port 5173
```

## Usage

```bash
poon-choi [options]

Options:
  -p, --port <number>   Port to listen on (default: 3000)
  -h, --help            Show this help
  -v, --version         Show version
```

### Examples

```bash
# default port
pnpx poon-choi

# custom port
pnpx poon-choi --port 5173

# short flag
pnpx poon-choi -p 3000
```

Then open the printed URL (e.g. `http://localhost:5173`) in your browser.

> Prefer a global install?
>
> ```bash
> npm i -g poon-choi
> poon-choi --port 5173
> ```

## What it does

* **Input** — drag & drop, click to pick, or paste from clipboard. Hard cap of **6 images**; extras are ignored with a toast. Non-image and corrupt files are skipped individually.

* **Layout** — auto-arranged by image count:

    | Images | Layout                                  |
    | ------ | --------------------------------------- |
    | 1      | full-bleed cover-crop                   |
    | 2      | two equal columns                       |
    | 3      | three equal columns                     |
    | 4      | 2×2 grid                                |
    | 5–6    | 3×2 grid (5 leaves the last cell blank) |

* **Fit mode** — `Cover` (center crop, fills the cell) or `Contain` (whole image, padded with the gap color). Toggle anytime.

* **Gap color** — color picker, a preset palette with visible swatches, and a "cycle through presets" button.

* **Boundaries** — a subtle 1px inner edge per cell so white-on-white images stay distinguishable.

* **Reorder** — drag thumbnails to reorder (free-form insert); remove with ×. On touch devices, ←/→ buttons appear.

* **Export**
  * `wechat-cover-900x383.jpg` — the 2.35:1 cover
  * `wechat-cover-thumbnail-383x383.jpg` — 1:1 center-crop thumbnail
  * JPEG, quality ≈ 0.92; preview is DPR-aware, export is exact pixel size.

## Why "poon-choi"?

Poon choi is a shared basin of many ingredients — bottom layer of radish and taro soaking up the juices, prized abalone and prawns on top. This tool stacks your images into one basin-shaped cover, each in its own cell, shared as a single frame. One basin, many ingredients.

## Requirements

* Node.js **22.18.0+**
* A modern browser (Chrome, Edge, Firefox, Safari)

***

## Development

```bash
pnpm install
pnpm dev        # start the local server in watch mode
pnpm build      # build for distribution
```

## Publishing

```bash
cd wechat-cover-studio

npm run pub:patch/minor/major
```
