import { size } from './simple'

export const scl = 4
export const width = size[0] * scl
export const height = size[1] * scl

export const populationSize = 10

export const colors = {
  white: '#F6F4E6',
  black: '#26272B',
  superblack: '#1B1C1F',
  gray: '#393D42',
  red: '#FF3A0F',
  yellow: '#FDDB3A',
  green: '#05FF00'
}

export const antiColors = {
  white: '#393D42',
  black: '#F6F4E6',
  superblack: '#F6F4E6',
  gray: '#F6F4E6',
  red: '#26272B',
  yellow: '#393D42',
  green: '#393D42'
}

export const citizenColors = [
  colors.white, // OK
  colors.yellow, // Check hardware
  colors.yellow, // Vulnerable
  colors.red, // Infected
  colors.red, // Independent
  colors.superblack, // Hacked
  colors.superblack // Disconnected
]

export const citizenAntiColors = [
  antiColors.white,
  antiColors.yellow,
  antiColors.yellow,
  antiColors.red,
  antiColors.red,
  antiColors.superblack,
  antiColors.superblack
]
