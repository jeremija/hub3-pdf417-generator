const fs = require('fs')
const path = require('path')

const buildDir = 'build'
const srcDir = 'src'

const regex = /<script .* src="(.*)"><\/script>/g
const scripts = []
let i = 0
const html = fs
.readFileSync(path.join(srcDir, 'index.html'), 'utf8')
.replace(regex, (match, p1) => {
  const text = i == 0 ? '<script src="index.js"></script>' : ''
  i++
  scripts.push(p1)
  return text
})

const data = []
for (let script of scripts) {
  script = path.relative(process.cwd(), path.resolve(srcDir, script))
  console.log('script:', script)
  data.push(fs.readFileSync(script, 'utf8'))
}

fs.mkdirSync(buildDir, { recursive: true })
fs.writeFileSync(path.join(buildDir, 'index.html'), html)
fs.writeFileSync(path.join(buildDir, 'index.js'), data.join('\n'))
