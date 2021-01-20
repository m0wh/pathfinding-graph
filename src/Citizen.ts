import Walker from './Walker'
import { randomFromArray, range } from './utils'
import { firstNames, genders, lastNames, races, religions, sexualities } from './data/possibilities'
import { nodes } from './data/simple'

let currentFirmware = 1281
setInterval(() => {
  if (Math.random() > 0.9) currentFirmware++
}, 10000)

export class Citizen {
  public identity = {
    firstName: '',
    lastName: '',
    age: 20,
    gender: '',
    sexuality: '',
    race: '',
    religion: '',
    score: 1
  }

  public device = {
    firmware: 1200,
    security: 1,
    integrity: 1,
    hacked: false
  }

  public walker

  constructor (identity, device, startNodeIndex) {
    this.identity = identity
    this.device = device

    const speed = identity.age < 20 ? range(identity.age, 0, 20, 0.3, 0.4) : range(identity.age, 20, 120, 0.4, 0.1)
    this.walker = new Walker(startNodeIndex, speed)
  }

  get status (): { code: number, name: string } {
    const statuses = [
      { code: 0, name: 'OK' },
      { code: 1, name: 'Check hardware' },
      { code: 2, name: 'Vulnerable' },
      { code: 3, name: 'Infected' },
      { code: 4, name: 'Independent' },
      { code: 5, name: 'Hacked' }
    ]

    if (this.device.hacked) return statuses[6]

    if (this.device.security > this.device.integrity) {
      if (this.device.integrity < 0.3) return statuses[4]
      else if (this.device.integrity < 0.7) return statuses[1]
    } else {
      if (this.device.security < 0.2) return statuses[3]
      else if (this.device.security < 0.7) return statuses[2]
    }
    return statuses[0]
  }

  public sendTo (nodeIndex: number) {
    if (this.device.hacked) return
    if (this.device.integrity > Math.random() * 0.6) {
      this.walker.goTo(nodeIndex)
    } else {
      this.identity.score *= 0.9
    }
  }

  public step () {
    let changed = false
    if (this.device.security < 0.2 && Math.random() * this.device.security < 0.05) {
      this.device.hacked = true
      changed = true
    }

    if (Math.random() < 0.01 * (1 - this.identity.score)) {
      this.device.security -= 0.005 * (currentFirmware - this.device.firmware) / 100
      changed = true
    }

    if (Math.random() < 0.01 * (1 - this.identity.score)) {
      this.device.integrity -= 0.005 * (currentFirmware - this.device.firmware) / 100
      changed = true
    }

    this.walker.step()
    return changed
  }
}

export function generateRandomCitizen () {
  const g = randomFromArray(genders)
  const fn = randomFromArray(firstNames)[g === 'Male' ? 1 : g === 'Female' ? 0 : Math.round(Math.random())]

  return new Citizen({
    firstName: fn,
    lastName: randomFromArray(lastNames),
    age: Math.round(Math.random() * (Math.random() > 0.7 ? 70 : 120)),
    gender: g,
    sexuality: randomFromArray(sexualities),
    race: randomFromArray(races),
    religion: randomFromArray(religions),
    score: Math.random() > 0.2 ? Math.random() * 0.2 + 0.8 : Math.random()
  }, {
    firmware: Math.round(range(Math.random(), 0, 1, 1131, currentFirmware)),
    security: Math.random() * 0.75 + 0.25,
    integrity: Math.random() * 0.75 + 0.25
  }, randomNode())
}

export function randomNode () {
  return Math.round(Math.random() * nodes.length - 1)
}
