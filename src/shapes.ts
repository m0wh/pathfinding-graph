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
        selected.citizen.walker.goTo(i)
      }
    })
  })
}

export function drawCitizenPath (ctx, citizen, x, y) {
  ctx.lineWidth = 20
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
