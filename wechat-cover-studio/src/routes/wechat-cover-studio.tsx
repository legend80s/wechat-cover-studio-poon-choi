import { createFileRoute } from '@tanstack/react-router'
import { App } from '.'

export const Route = createFileRoute('/wechat-cover-studio')({
  component: About,
})

function About() {
  return <App></App>
}
