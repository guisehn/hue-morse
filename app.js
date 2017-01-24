'use strict'

require('dotenv').config({ silent: true })

const DIT_DURATION = 100
const DAH_DURATION = DIT_DURATION * 3

const _ = require('lodash')
const readline = require('readline')
const morse = require('morse')

const hue = require('node-hue-api')
const api = new hue.HueApi(process.env.HUE_HOSTNAME, process.env.HUE_USER)

function createState (on) {
  return hue.lightState.create().on().white(154, on ? 100 : 0).transitionInstant()
}

function getMorseLights () {
  return api.lights()
    .then(result => result.lights.filter(light => light.name.trim().toLowerCase() === 'morse'))
}

function askInput (callback) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })

  rl.question('What do you wanna say? ', answer => {
    callback(answer)
    rl.close()
  })
}

function symbolToRhythm (symbol) {
  switch (symbol) {
    case '.':
      return [
        [true, DIT_DURATION],
        [false, DIT_DURATION]
      ]

    case '-':
      return [
        [true, DAH_DURATION],
        [false, DIT_DURATION]
      ]

    case ' ':
      return [[false, DIT_DURATION]]

    default:
      return []
  }
}

function printMorse (lights, rhytm, index) {
  index = index || 0
  if (index >= rhytm.length) return

  let item = rhytm[index]
  let state = createState(item[0])
  let wait = item[1]

  lights.forEach(light => api.setLightState(light.id, state))
  setTimeout(() => printMorse(lights, rhytm, index + 1), wait)
}

getMorseLights().then(lights => {
  askInput(answer => {
    let encoded = morse.encode(answer)
    console.log(`Morse: ${encoded}`)

    let rhytm = _(encoded).map(symbolToRhythm).flatten().value()
    printMorse(lights, rhytm)
  })
})
.catch(err => {
  console.log('===')
  console.log('Whoops! Something wrong happened:')
  console.log(err.stack)
})
