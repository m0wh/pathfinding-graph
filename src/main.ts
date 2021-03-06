import { nodes, plazas } from './data/simple'
import { lerp, randomFromArray } from './utils'
import { generateRandomCitizen, randomNode } from './Citizen'
import { drawCitizen, drawCitizenPath, drawPlaza, drawRoads, drawSelectedInfo, drawTokens } from './shapes'
import { citizenColors, scl, populationSize, colors, citizenAntiColors, width, height } from './data/global'
import playSound from './sounds'

window.addEventListener('dblclick', () => {
  if (document.body.requestFullscreen) {
    document.body.requestFullscreen()
  }
})

Object.entries(colors).forEach(([name, color]) => document.body.style.setProperty(`--color-${name}`, color))
document.body.style.setProperty('--selected-color', colors.white)

// Main elements
const wrapper = document.querySelector('#wrapper') as HTMLElement
const actionsWrapper = document.querySelector('#actions') as HTMLElement

const canvas = {
  map: document.querySelector('#map') as HTMLCanvasElement,
  tokens: document.querySelector('#tokens') as HTMLCanvasElement,
  people: document.querySelector('#people') as HTMLCanvasElement
}

const layers = {
  map: canvas.map.getContext('2d'),
  tokens: canvas.tokens.getContext('2d'),
  people: canvas.people.getContext('2d')
}

wrapper.style.width = width + 'px'
wrapper.style.height = height + 'px'
wrapper.style.setProperty('--scale', 0.8 * Math.min(window.innerWidth / width, window.innerHeight / height) + '')

Object.values(canvas).forEach((canvas, i) => {
  canvas.width = width
  canvas.height = height
  canvas.style.width = width + 'px'
  canvas.style.height = height + 'px'
  canvas.style.zIndex = i + 1 + ''
})

actionsWrapper.style.width = width + 'px'
actionsWrapper.style.height = height + 'px'

layers.map.lineCap = 'round'
layers.map.lineJoin = 'round'
layers.people.lineCap = 'round'
layers.people.lineJoin = 'round'

const tokens = []

const people = []

function setSelect (i: number, value: boolean) {
  wrapper.style.setProperty('--translateX', value ? '-56%' : '-50%')
  document.querySelector('#citizen-info').classList.toggle('show', value)

  if (value) {
    playSound('select')
    people.forEach((c, a) => {
      c.selected = i === a
      if (i === a) c.btn.classList.add('active')
      else c.btn.classList.remove('active')
    })
    document.body.style.setProperty('--selected-color', citizenColors[people[i].citizen.status.code])
    drawSelectedInfo(people[i])
    document.querySelectorAll('button.node').forEach(b => { (b as HTMLElement).classList.add('show') })
  } else {
    people[i].selected = false
    people[i].btn.classList.remove('active')
    document.body.style.setProperty('--selected-color', colors.white)
    document.querySelectorAll('button.node').forEach(b => { (b as HTMLElement).classList.remove('show') })
  }
}

for (let i = 0; i < populationSize; i++) {
  const citizen = generateRandomCitizen()
  citizen.walker.goTo(randomNode())

  const btn = document.createElement('button')
  btn.classList.add('citizen')
  btn.style.setProperty('--self-color', citizenColors[citizen.status.code])
  btn.style.setProperty('--self-anti-color', citizenAntiColors[citizen.status.code])
  actionsWrapper.append(btn)

  people.push({ citizen, selected: false, btn, tracked: false })

  btn.addEventListener('click', () => {
    setSelect(i, !people[i].selected) // if clicked citizen is not selected
  })
}

const trackBtn = document.querySelector('#citizen-info button.track')
trackBtn.addEventListener('click', () => {
  const i = people.findIndex(c => c.selected)
  people[i].tracked = !people[i].tracked
  trackBtn.innerHTML = people[i].tracked ? '<i class="material-icons">visibility_off</i> Stop tracking' : '<i class="material-icons">visibility</i> Keep track'
  people[i].btn.innerHTML = people[i].tracked ? '<i class="material-icons">visibility</i>' : ''
})

window.addEventListener('click', e => {
  if ((e.target as HTMLElement).tagName.toLowerCase() !== 'button') {
    for (const c in people) setSelect(Number(c), false)
  }
})

// ROADS
drawRoads(layers.map, actionsWrapper, people)
plazas.forEach(plaza => drawPlaza(layers.map, plaza))

// MAIN LOOP
let stopLoop = false
function loop () {
  layers.people.clearRect(0, 0, width * scl, height * scl)

  people.forEach(({ citizen, selected, tracked, btn }, i) => {
    if (!citizen.walker.isMoving) { // define new objective
      citizen.walker.isMoving = true
      setTimeout(() => {
        citizen.walker.goTo(randomNode())
      }, Math.random() * 5000)
    }

    const changed = citizen.step()
    if (changed) {
      btn.style.setProperty('--self-color', citizenColors[citizen.status.code])
      btn.style.setProperty('--self-anti-color', citizenAntiColors[citizen.status.code])

      tokens.forEach((token, i) => {
        if (citizen.walker.actualNodeIndex === token.node) {
          citizen.giveToken(token.type)
          tokens.splice(i, 1)
          drawTokens(actionsWrapper, tokens)
          if (!(citizen.device.hacked || citizen.device.integrity === 0)) playSound('token')
        }
      })

      if (selected) {
        drawSelectedInfo({ citizen, tracked })
        document.body.style.setProperty('--selected-color', citizenColors[citizen.status.code])
      }

      if (people.filter(p => !(p.citizen.device.hacked || p.citizen.device.integrity === 0)).length === 0) {
        playSound('end')
        document.querySelector('.loader').textContent = 'You have lost control'
        setTimeout(() => {
          stopLoop = true
          document.body.classList.add('waiting')
        })
      }
    }

    const x = Math.round(lerp(nodes[citizen.walker.actualNodeIndex].x, nodes[citizen.walker.nextNodeIndex]?.x || nodes[citizen.walker.actualNodeIndex].x, citizen.walker.segmentProgression) * scl)
    const y = Math.round(lerp(nodes[citizen.walker.actualNodeIndex].y, nodes[citizen.walker.nextNodeIndex]?.y || nodes[citizen.walker.actualNodeIndex].y, citizen.walker.segmentProgression) * scl)

    // PATH
    if (selected || tracked) {
      drawCitizenPath(layers.people, citizen, x, y, selected)
    }

    // PEOPLE
    drawCitizen(layers.people, citizen, x, y)

    btn.style.transform = `translate3d(${x - 45}px,${y - 45}px,0)`
  })

  if (!stopLoop) requestAnimationFrame(loop)
}

window.addEventListener('click', () => {
  playSound('start')
  document.body.classList.remove('waiting')
  requestAnimationFrame(loop)

  setInterval(() => {
    if (stopLoop) return
    if (Math.random() > 0.05 && tokens.length > 10) {
      tokens.splice(Math.round(Math.random() * (tokens.length - 1)), 1)
    }

    if (Math.random() > 0.15) {
      let n = randomNode()
      while (tokens.filter(t => t.node === n).length !== 0) n = randomNode()
      const type = randomFromArray(['security', 'firmware', 'integrity', 'job'])
      tokens.push({ node: n, type })

      drawTokens(actionsWrapper, tokens)
    }
  }, 900)
}, { once: true })
