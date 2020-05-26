#!/usr/bin/env node

const HyperIndex = require('hyperindex')
const minimist = require('minimist')
const blake2b = require('blake2b-universal')
const path = require('path')
const fs = require('fs')

const args = minimist(process.argv, {
  alias: {
    db: 'd',
    keyword: 'k',
    card: 'c',
    id: 'i',
    replica: 'r'
  }
})

const cmd = args._[2]
const d = args.d || './dazaar-search'

if (cmd !== 'init' && !fs.existsSync(d)) {
  throw new Error('Run dazaar-search init --replica=<optional index key> first')
}

const key = args.replica ? Buffer.from(args.replica, 'hex') : null

const index = new HyperIndex(d, key, { valueEncoding: 'json' })

index.trie.ready(function (err) {
  if (err) throw err

  console.log('Data stored in ' + d)
  console.log('Search index key: ' + index.trie.key.toString('hex'))

  if (cmd === 'add') {
    if (!args.card) throw new Error('Usage: dazaar-search add --card <filename-of-dazaar-card>')
    const { card, key, keywords } = getCard()

    if (!keywords.length) throw new Error('You must specify at least one keyword using -k or in the dazaar card using .keywords')

    index.add(card, {
      key,
      keywords
    }, function (err) {
      if (err) throw err
      console.log('Dazaar card added')
      console.log('Entry Key:', key)
      console.log('Keywords:', keywords)
    })
    return
  }

  if (cmd === 'remove') {
    if (!args.card) throw new Error('Usage: dazaar-search add --card <filename-of-dazaar-card>')
    const { card, key, keywords } = getCard()

    index.remove(key, { keywords }, function (err) {
      if (err) throw err
      console.log('Dazaar card removed')
      console.log('Entry Key:', key)
      console.log('Keywords:', keywords)
    })
    return
  }

  if (cmd === 'replicate') {
    require('@hyperswarm/replicator')(index.trie, {
      announce: true,
      lookup: true,
      live: true
    })
  }
})

function getCard () {
  const card = require(path.resolve(args.card))
  const buf = Buffer.alloc(32)
  blake2b(buf, Buffer.from(JSON.stringify(card)))
  const key = args.key || buf.toString('hex')
  const keywords = [].concat(card.keywords || []).concat(args.k || [])
  return { card, key, keywords }
}
