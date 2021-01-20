import { nodes, plazas, size } from './nodes'
import { lerp } from './utils'
import Walker from './Walker'

window.addEventListener('dblclick', () => {
  if (document.body.requestFullscreen) {
    document.body.requestFullscreen()
  }
})

const colors = {
  lower: '#0b132b',
  low: '#1c2541',
  normal: '#3a506b',
  high: '#6fffe9',
  accent: '#fc2f00'
}

Object.entries(colors).forEach(([name, color]) => document.body.style.setProperty(`--color-${name}`, color))

// parameters
const scl = 4
const width = size[0] * scl
const height = size[1] * scl

// Main elements
const wrapper = document.querySelector('#wrapper') as HTMLElement
const actionsWrapper = document.querySelector('#actions') as HTMLElement
const walkersCanvas = document.querySelector('#walkers') as HTMLCanvasElement
const mapCanvas = document.querySelector('#map') as HTMLCanvasElement
const uiCanvas = document.querySelector('#ui') as HTMLCanvasElement

const layers = {
  map: mapCanvas.getContext('2d'),
  walkers: walkersCanvas.getContext('2d'),
  ui: uiCanvas.getContext('2d')
}

wrapper.style.width = width + 'px'
wrapper.style.height = height + 'px'
wrapper.style.setProperty('--scale', 0.8 * Math.min(window.innerWidth / width, window.innerHeight / height) + '')
let rotation = 45
wrapper.style.setProperty('--rotateZ', rotation + 'deg')

;[
  uiCanvas,
  mapCanvas,
  walkersCanvas
].forEach((canvas, i) => {
  canvas.width = width
  canvas.height = height
  canvas.style.width = width + 'px'
  canvas.style.height = height + 'px'
  canvas.style.zIndex = i + 1 + ''
})

actionsWrapper.style.width = width + 'px'
actionsWrapper.style.height = height + 'px'
actionsWrapper.style.zIndex = '10'

uiCanvas.style.transform = 'scale(2)'

const grid = 30
layers.ui.strokeStyle = colors.normal
layers.ui.lineWidth = 2
layers.ui.globalAlpha = 0.2
for (let x = 1; x < grid; x++) {
  layers.ui.beginPath()
  layers.ui.moveTo(x * width / grid, 0)
  layers.ui.lineTo(x * width / grid, height)
  layers.ui.stroke()

  layers.ui.beginPath()
  layers.ui.moveTo(0, x * height / grid)
  layers.ui.lineTo(width, x * height / grid)
  layers.ui.stroke()
}

const walkers = []
for (let i = 0; i < 10; i++) {
  walkers.push({
    walker: new Walker(nodes, Math.round(Math.random() * nodes.length - 1), Math.random() * 0.3 + 0.1),
    selected: false,
    btn: document.createElement('button')
  })
}

walkers.forEach(({ walker, btn }, i) => {
  walker.goTo(Math.round(Math.random() * nodes.length - 1))
  actionsWrapper.append(btn)

  btn.classList.add('walker')
  btn.addEventListener('click', () => {
    if (!walkers[i].selected) {
      walkers.forEach((w, a) => { w.selected = i === a })
      document.querySelectorAll('button.node').forEach(b => { (b as HTMLElement).classList.add('show') })
    } else {
      walkers[i].selected = false
      document.querySelectorAll('button.node').forEach(b => { (b as HTMLElement).classList.remove('show') })
    }
  })
})

wrapper.addEventListener('click', e => {
  if ((e.target as HTMLElement).tagName.toLowerCase() !== 'button') {
    walkers.forEach(w => { w.selected = false })
  }
})

layers.map.lineCap = 'round'
layers.map.lineJoin = 'round'
layers.walkers.lineCap = 'square'
layers.walkers.lineJoin = 'miter'

// ROADS
layers.map.lineWidth = 30
layers.map.strokeStyle = colors.low
nodes.forEach((node, i) => {
  Object.keys(node.relations).forEach(relation => {
    if (Number(relation) > i) {
      layers.map.moveTo(nodes[relation].x * scl, nodes[relation].y * scl)
      layers.map.lineTo(node.x * scl, node.y * scl)
      layers.map.stroke()
    }
  })
  const btn = document.createElement('button')
  btn.classList.add('node')
  actionsWrapper.append(btn)
  btn.style.transform = `translate3d(${node.x * scl - 30}px,${node.y * scl - 30}px,0)`

  btn.addEventListener('click', () => {
    const selected = walkers.filter(w => w.selected)[0]
    if (selected) {
      selected.walker.goTo(i)
    }
  })
})

plazas.forEach(plaza => {
  layers.map.fillStyle = colors.low
  layers.map.beginPath()
  plaza.forEach((pt, i) => {
    if (i === 0) layers.map.moveTo(nodes[pt].x * scl, nodes[pt].y * scl)
    else layers.map.lineTo(nodes[pt].x * scl, nodes[pt].y * scl)
  })
  layers.map.closePath()
  layers.map.fill()
})

function animate () {
  layers.walkers.clearRect(0, 0, width * scl, height * scl)

  // defines new objective for each walker
  walkers.forEach(({ walker }) => {
    if (!walker.isMoving && Math.random() > 0.99) {
      walker.goTo(Math.round(Math.random() * nodes.length - 1))
    }

    walker.step()
  })
  walkers.forEach(({ walker, selected, btn }) => {
    const x = Math.round(lerp(nodes[walker.actualNodeIndex].x, nodes[walker.nextNodeIndex]?.x || nodes[walker.actualNodeIndex].x, walker.segmentProgression) * scl)
    const y = Math.round(lerp(nodes[walker.actualNodeIndex].y, nodes[walker.nextNodeIndex]?.y || nodes[walker.actualNodeIndex].y, walker.segmentProgression) * scl)

    // PATH
    if (selected) {
      layers.walkers.lineWidth = 8
      layers.walkers.strokeStyle = colors.accent

      layers.walkers.beginPath()
      layers.walkers.moveTo(x, y)
      for (const segment of walker.path.slice(1)) {
        layers.walkers.lineTo(nodes[segment].x * scl, nodes[segment].y * scl)
      }
      layers.walkers.stroke()
    }

    // WALKERS
    layers.walkers.fillStyle = selected ? colors.accent : colors.high
    layers.walkers.fillRect(x - (selected ? 16 : 8), y - (selected ? 16 : 8), selected ? 32 : 16, selected ? 32 : 16)

    // console.log(`translate3d(${x - (selected ? 16 : 8)},${y - (selected ? 16 : 8)},0)`)
    btn.style.transform = `translate3d(${x - 50}px,${y - 50}px,0)`
  })

  rotation = (rotation + 0.05) % 360
  wrapper.style.setProperty('--rotateZ', rotation + 'deg')

  requestAnimationFrame(animate)
}

requestAnimationFrame(animate)

/* TODO ->
  CAMERAS threejs
  CHANGE MAP
*/
