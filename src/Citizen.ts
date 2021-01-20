import Walker from './Walker'
import { randomFromArray, range } from './utils'
import { firstNames, genders, lastNames, races, religions, sexualities } from './data/possibilities'
import { nodes } from './data/simple'

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
    integrity: 1
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
      { code: 5, name: 'Public enemy' }
    ]

    const publicEnemy = this.identity.score < 20
    if (this.device.security > this.device.integrity) {
      if (this.device.integrity < 0.3) {
        return publicEnemy ? statuses[5] : statuses[4]
      } else if (this.device.integrity < 0.7) {
        return statuses[1]
      }
    } else {
      if (this.device.security < 0.3) {
        return statuses[3]
      } else if (this.device.security < 0.7) {
        return statuses[2]
      }
    }
    return statuses[0]
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
    firmware: Math.round(range(Math.random(), 0, 1, 1131, 1281)),
    security: Math.random() * 0.75 + 0.25,
    integrity: Math.random() * 0.75 + 0.25
  }, randomNode())
}

export function randomNode () {
  return Math.round(Math.random() * nodes.length - 1)
}
