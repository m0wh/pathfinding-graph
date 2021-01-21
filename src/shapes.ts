import { citizenColors, colors, scl } from './data/global'
import { nodes } from './data/simple'

export function drawPlaza (ctx, plaza) {
  ctx.fillStyle = colors.gray
  ctx.beginPath()
  plaza.forEach((pt, i) => {
    if (i === 0) ctx.moveTo(nodes[pt].x * scl, nodes[pt].y * scl)
    else ctx.lineTo(nodes[pt].x * scl, nodes[pt].y * scl)
  })
  ctx.closePath()
  ctx.fill()
}

export function drawRoads (ctx, actionsWrapper, people) {
  ctx.lineWidth = 10
  ctx.strokeStyle = colors.gray
  nodes.forEach((node, i) => {
    Object.entries(node.relations).forEach(([relation, value]) => {
      if (Number(relation) > i) {
        ctx.moveTo(nodes[relation].x * scl, nodes[relation].y * scl)
        ctx.lineTo(node.x * scl, node.y * scl)
        ctx.stroke()
      }
    })
    const btn = document.createElement('button')
    btn.classList.add('node')
    actionsWrapper.append(btn)
    btn.style.transform = `translate3d(${node.x * scl - 30}px,${node.y * scl - 30}px,0)`

    btn.addEventListener('click', () => {
      const selected = people.filter(w => w.selected)[0]
      if (selected) {
        selected.citizen.sendTo(i)
      }
    })
  })
}

export function drawCitizenPath (ctx, citizen, x, y, wide) {
  ctx.lineWidth = wide ? 20 : 5
  ctx.strokeStyle = citizenColors[citizen.status.code]

  ctx.beginPath()
  ctx.moveTo(x, y)
  for (const segment of citizen.walker.path.slice(1)) {
    ctx.lineTo(nodes[segment].x * scl, nodes[segment].y * scl)
  }
  ctx.stroke()
}

export function drawCitizen (ctx, citizen, x, y) {
  ctx.fillStyle = citizenColors[citizen.status.code]
  ctx.beginPath()
  ctx.ellipse(x, y, 20, 20, 0, 0, Math.PI * 2)
  ctx.closePath()
  ctx.fill()
}

const selectedInfoFields = {
  name: document.querySelector('#citizen-info span.name'),
  age: document.querySelector('#citizen-info span.age'),
  gender: document.querySelector('#citizen-info span.gender'),
  sexuality: document.querySelector('#citizen-info span.sex'),
  race: document.querySelector('#citizen-info span.race'),
  religion: document.querySelector('#citizen-info span.religion'),
  score: document.querySelector('#citizen-info span.score'),
  version: document.querySelector('#citizen-info span.version'),
  security: document.querySelector('#citizen-info span.security'),
  integrity: document.querySelector('#citizen-info span.integrity'),
  status: document.querySelector('#citizen-info span.status'),
  trackBtn: document.querySelector('#citizen-info button.track')
}

export function drawSelectedInfo ({ citizen, tracked }) {
  selectedInfoFields.name.textContent = citizen.identity.firstName + ' ' + citizen.identity.lastName
  selectedInfoFields.age.textContent = citizen.identity.age
  selectedInfoFields.gender.textContent = citizen.identity.gender
  selectedInfoFields.sexuality.textContent = citizen.identity.sexuality
  selectedInfoFields.race.textContent = citizen.identity.race
  selectedInfoFields.religion.textContent = citizen.identity.religion
  selectedInfoFields.score.textContent = Math.round(citizen.identity.score * 100) + '%'
  selectedInfoFields.version.textContent = citizen.device.firmware.toString()
  selectedInfoFields.version.textContent = citizen.device.firmware.toString().slice(0, 2) + '.' + citizen.device.firmware.toString().slice(2, 3) + '.' + citizen.device.firmware.toString().slice(3)
  selectedInfoFields.security.textContent = Math.round(citizen.device.security * 100) + '%'
  selectedInfoFields.integrity.textContent = Math.round(citizen.device.integrity * 100) + '%'
  selectedInfoFields.status.textContent = citizen.status.name
  selectedInfoFields.trackBtn.innerHTML = tracked ? '<i class="material-icons">visibility_off</i> Stop tracking' : '<i class="material-icons">visibility</i> Keep track'
}
