# 🥘 盆菜（poon-choi）

<p align="center">
  <img src="https://koboyo.com/icons/svg/geometric-mezze-platter.svg" width="30%" />
</p>

[English](./README.md) | 中文

> 一个轻量本地服务，把多张图片拼合成微信封面——就像一份**盆菜**，一钵容纳多种不同食材。

[![npm version](https://img.shields.io/npm/v/poon-choi.svg)](https://www.npmjs.com/package/poon-choi)
[![npm downloads](https://img.shields.io/npm/dm/poon-choi.svg)](https://www.npmjs.com/package/poon-choi)
[![0 dependencies](https://img.shields.io/badge/0-green?logo=npm&labelColor=blue&label=dependencies&color=green)](https://www.npmjs.com/package/poon-choi?activeTab=dependencies)

**poon-choi（盆菜）** 是一道粤菜，多种食材码在同一个盆里，由上至下享用。这个工具也是同理：放入 1–6 张图片，它会自动拼出一张 **2.35:1 的微信封面（900×383）**，同时生成一张 **1:1 的缩略图（383×383）**。

无需构建流程，不用额外配置，一条命令即可启动本地服务。

## 快速上手

```bash
pnpx poon-choi
```

工具会在本地端口启动，并输出访问链接，之后直接把图片拖入页面即可。

### 指定端口

```bash
pnpx poon-choi --port 5173
```

## 使用方式

```bash
poon-choi [选项]

选项：
  -p, --port <数字>   监听端口（默认：3000）
  -h, --help          展示帮助信息
  -v, --version       查看版本
```

### 使用示例

```bash
# 使用默认端口
pnpx poon-choi

# 指定自定义端口
pnpx poon-choi --port 5173

# 使用短参数
pnpx poon-choi -p 3000
```

然后在浏览器打开输出的链接，例如 `[http://localhost:5173](http://localhost:5173)`。

>
> 想要全局安装？
>
>
> ```bash
> npm i -g poon-choi
> poon-choi --port 5173
> ```

## 功能说明

- **导入** — 支持拖拽上传、点击选择或者剪贴板粘贴。最多上传 **6 张图片**，超出部分会通过弹窗提示并忽略；非图片文件、损坏文件会单独跳过。
- **布局** — 根据图片数量自动排版：

| 图片数量 | 布局方式 |
| --- | --- |
| 1 | 全屏裁切铺满 |
| 2 | 等宽两列 |
| 3 | 等宽三列 |
| 4 | 2×2 网格 |
| 5–6 | 3×2 网格（5 张时最后一格留空） |

- **填充模式** — `Cover`（居中裁切，填满格子）或者 `Contain`（完整展示图片，留白使用间隙色填充），随时切换。
- **间隙颜色** — 拾色器、带色卡的预设调色板，还有一键轮换预设颜色的按钮。
- **分隔边** — 每个格子带有细微的 1 像素内边线，白底图片叠加在一起时也能分清边界。
- **调整顺序** — 拖拽缩略图自由排序；点击 × 删除图片。触屏设备会显示左右切换按钮。
- **导出**
  - `wechat-cover-900x383.jpg` — 2.35:1 封面图
  - `wechat-cover-thumbnail-383x383.jpg` — 居中裁切的 1:1 缩略图
  - 输出为 JPEG，画质约 0.92；预览适配设备像素比，导出尺寸严格符合像素规格。

## 为什么叫“盆菜”？

盆菜是汇聚众多食材的大盆：底层放萝卜、芋头吸饱汤汁，鲍鱼、大虾这类名贵食材摆在顶层。这个工具把你的图片装进同一个“盆状”封面，每张图片各自一格，合并成一整张图。一钵盛百味。

## 环境要求

- Node.js **22.18.0+**
- 现代浏览器（Chrome、Edge、Firefox、Safari）

---

## 开发

```bash
pnpm install
pnpm dev        # 启动监听模式的本地服务
pnpm build      # 打包发布版本
```

## 发布

```bash
cd wechat-cover-studio

npm run pub:patch/minor/major
```
