import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { copyFileSync, mkdirSync, readdirSync, statSync, existsSync } from 'node:fs'
import { join } from 'node:path'

// data/ ディレクトリを dist/data/ に再帰コピーするプラグイン
// （Claudeが解析した insights.json などをWebアプリで配信できるように）
function copyDataDir() {
  return {
    name: 'copy-data-dir',
    apply: 'build',
    closeBundle() {
      const src = 'data'
      const dest = 'dist/data'
      if (!existsSync(src)) return
      copyDir(src, dest)
      console.log(`[copy-data-dir] copied ${src} → ${dest}`)
    }
  }
}

function copyDir(src, dest) {
  mkdirSync(dest, { recursive: true })
  for (const entry of readdirSync(src)) {
    if (entry.startsWith('.')) continue
    const s = join(src, entry)
    const d = join(dest, entry)
    if (statSync(s).isDirectory()) copyDir(s, d)
    else copyFileSync(s, d)
  }
}

export default defineConfig({
  plugins: [react(), copyDataDir()],
})
