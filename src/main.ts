import { nodes, plazas, size } from './data/simple'
import { lerp } from './utils'
import { generateRandomCitizen, randomNode } from './Citizen'
import { drawCitizen, drawCitizenPath, drawPlaza, drawRoads } from './shapes'
import { citizenColors, scl, populationSize } from './data/global'

window.addEventListener('dblclick', () => {
  if (document.body.requestFullscreen) {
    document.body.requestFullscreen()
  }
})

// Parameters
const width = size[0] * scl
const height = size[1] * scl

// Main elements
const wrapper = document.querySelector('#wrapper') as HTMLElement
const actionsWrapper = document.querySelector('#actions') as HTMLElement

const canvas = {
  map: document.querySelector('#map') as HTMLCanvasElement,
  people: document.querySelector('#people') as HTMLCanvasElement
}

const layers = {
  map: canvas.map.getContext('2d'),
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

const people = []

function setSelect (i: number, value: boolean) {
  if (value) {
    people.forEach((c, a) => {
      c.selected = i === a
      if (i === a) c.btn.classList.add('active')
      else c.btn.classList.remove('active')
    })
    document.querySelectorAll('button.node').forEach(b => { (b as HTMLElement).classList.add('show') })
  } else {
    people[i].selected = false
    people[i].btn.classList.remove('active')
    document.querySelectorAll('button.node').forEach(b => { (b as HTMLElement).classList.remove('show') })
  }
}

for (let i = 0; i < populationSize; i++) {
  const citizen = generateRandomCitizen()
  citizen.walker.goTo(randomNode())

  const btn = document.createElement('button')
  btn.classList.add('citizen')
  btn.style.setProperty('--self-color', citizenColors[citizen.status.code])
  actionsWrapper.append(btn)

  people.push({ citizen, selected: false, btn })

  btn.addEventListener('click', () => {
    console.table(citizen.identity)
    console.log(citizen.status.name)
    setSelect(i, !people[i].selected) // if clicked citizen is not selected
  })
}

window.addEventListener('click', e => {
  if ((e.target as HTMLElement).tagName.toLowerCase() !== 'button') {
    for (const c in people) setSelect(Number(c), false)
  }
})

// ROADS
drawRoads(layers.map, actionsWrapper, people)
plazas.forEach(plaza => drawPlaza(layers.map, plaza))

// MAIN LOOP
function loop () {
  layers.people.clearRect(0, 0, width * scl, height * scl)

  people.forEach(({ citizen, selected, btn }) => {
    if (!citizen.walker.isMoving) { // define new objective
      citizen.walker.isMoving = true
      setTimeout(() => {
        citizen.walker.goTo(randomNode())
      }, Math.random() * 5000)
    }

    citizen.walker.step()

    const x = Math.round(lerp(nodes[citizen.walker.actualNodeIndex].x, nodes[citizen.walker.nextNodeIndex]?.x || nodes[citizen.walker.actualNodeIndex].x, citizen.walker.segmentProgression) * scl)
    const y = Math.round(lerp(nodes[citizen.walker.actualNodeIndex].y, nodes[citizen.walker.nextNodeIndex]?.y || nodes[citizen.walker.actualNodeIndex].y, citizen.walker.segmentProgression) * scl)

    // PATH
    if (selected) {
      drawCitizenPath(layers.people, citizen, x, y)
    }

    // PEOPLE
    drawCitizen(layers.people, citizen, x, y)

    btn.style.transform = `translate3d(${x - 45}px,${y - 45}px,0)`
  })

  requestAnimationFrame(loop)
}

window.addEventListener('load', () => {
  requestAnimationFrame(loop)
})
