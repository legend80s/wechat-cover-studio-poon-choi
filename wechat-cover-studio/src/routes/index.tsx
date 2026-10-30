/** biome-ignore-all lint/a11y/noSvgWithoutTitle: <explanation> */
/** biome-ignore-all lint/a11y/useButtonType: <explanation> */
import { createFileRoute } from '@tanstack/react-router'
import './index.css'

import indexScript from './index.tsx.script.js?url'

console.log('indexScript:', indexScript)

export const Route = createFileRoute('/')({
  head: () => ({
    scripts: [
      {
        src: indexScript,
        defer: true, // optional
        async: true, // optional
      },
    ],
  }),
  component: () => {
    return (
      <main className="justme 1">
        <App></App>
      </main>
    )
  },
})

function App() {
  return (
    <main className="page-wrap px-4 pb-8 pt-14 1">
      <div className="wrap">
        <h1>封面拼接工具</h1>
        {/* <h1>微信公众号封面拼接工具</h1> */}
        <p className="sub">
          {/* 拖入 1–6 张图片，自动拼接为 2.35:1 公众号封面（900×383），并生成 1:1 */}
          拖入 1–6 张图片，自动拼接为 2.35:1 封面（900×383），并生成 1:1 缩略图
        </p>

        <div className="stage" id="stage">
          <canvas id="preview"></canvas>
          <div className="dropzone" id="dropzone">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.6"
            >
              <path
                d="M12 16V4m0 0L8 8m4-4l4 4"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2"
                stroke-linecap="round"
              />
            </svg>
            <span className="hint">拖入图片</span>
            <span className="subhint">或点击选择 · 支持粘贴 · 最多 6 张</span>
          </div>
        </div>

        <div className="strip" id="strip"></div>

        <div className="actions">
          <button className="btn btn-primary" id="dlCover" disabled>
            下载封面
          </button>
          <button className="btn btn-secondary" id="dlThumb" disabled>
            下载缩略图
          </button>
          <div className="spacer"></div>
          <button className="btn btn-secondary" id="clearAll" disabled>
            清空
          </button>
        </div>
      </div>

      <input type="file" id="fileInput" accept="image/*" multiple />
      <div id="toasts"></div>
    </main>
  )
}
