import soundsSrcs from './assets/sounds/*.mp3'

export default function playSound (name: string): void {
  const audio = new Audio(soundsSrcs[name])
  audio.play()
  audio.addEventListener('ended', () => audio.remove())
}
