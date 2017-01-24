'use strict'

const hue = require('node-hue-api')
const HueApi = hue.HueApi

hue.nupnpSearch().then(bridges => {
  let bridge = bridges[0]
  let hostname = bridge.ipaddress

  console.log(`HUE_HOSTNAME=${hostname}`)

  let api = new HueApi()

  return api.registerUser(hostname)
    .then(result => console.log(`HUE_USER=${result}`))
})
.catch(err => {
  console.log('===')
  console.log('Whoops! Something wrong happened:')
  console.log(err.stack)
})
