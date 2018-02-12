'use strict'

const LE = require('greenlock')
const storeCertbot = require('le-store-certbot')
const dnsChallenge = require('./dnsChallenge')

const debug = require('debug')
const log = debug('nodetrust:letsencrypt')

function leAgree (opts, agreeCb) {
  console.log('Agreeing to tos %s with email %s to obtain certificate for %s', opts.tosUrl, opts.email, opts.domains.join(', '))
  // opts = { email, domains, tosUrl }
  agreeCb(null, opts.tosUrl)
}

class Letsencrypt {
  constructor (opt) {
    const debug = log.enabled
    const leStore = storeCertbot.create({
      configDir: opt.storageDir,
      debug,
      log
    })

    this.email = opt.email

    const dns = new dnsChallenge(opt)

    this.le = LE.create({
      server: LE.stagingServerUrl,
      store: leStore,
      challenges: {
        challenges: {
          'dns-01': dns
        }
      },
      challengeType: 'dns-01',
      aggreeToTerms: leAgree,
      debug,
      log
    })
  }
  handle (domain, cb) {
    this.le.register({
      domains: [domain],
      email: this.email,
      agreeTos: true, // yolo
      rsaKeySize: 2048,
      challengeType: 'dns-01'
    }).then(res => cb(null, res), cb)
  }
}

module.exports = Letsencrypt