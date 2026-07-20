#!/usr/bin/env node
/* eslint-disable import/no-nodejs-modules */
/* eslint-disable no-console */

'use strict'

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')
const readline = require('readline')

const ROOT = path.resolve(__dirname, '..')
const ENV_PATH = path.join(ROOT, '.env')
const MANIFEST_PATH = path.join(ROOT, 'manifest.json')
const CLIENTS_PATH = path.join(ROOT, 'node', 'clients', 'index.ts')
const SELF_PATH = path.join(ROOT, 'scripts', 'setup-vendor.js')

const PLACEHOLDER = '{{account}}'
const PLACEHOLDER_PATTERN = /^\{\{.*\}\}$/
const VENDOR_NAME_PATTERN = /^[a-z0-9_-]+$/i
const EXCLUDE_DIRS = new Set(['node_modules', '.git', 'dist', 'build'])

// manifest.json's own policies intentionally use {{account}} as VTEX's runtime
// templating syntax (resolved per installing account); only its top-level
// `vendor` field is a one-time config placeholder, checked separately below.
// CLIENTS_PATH is also checked and updated separately (readClientsImportVendor/applyVendor).
const EXCLUDE_FILES = new Set([MANIFEST_PATH, CLIENTS_PATH, SELF_PATH])

function isBypassed() {
  if (!fs.existsSync(ENV_PATH)) return false

  return /VENDOR_SETUP_DONE=true/.test(fs.readFileSync(ENV_PATH, 'utf8'))
}

function markDone() {
  const existing = fs.existsSync(ENV_PATH) ? fs.readFileSync(ENV_PATH, 'utf8') : ''
  const lines = existing.split('\n').filter((line) => line && !line.startsWith('VENDOR_SETUP_DONE='))

  lines.push('VENDOR_SETUP_DONE=true')
  fs.writeFileSync(ENV_PATH, `${lines.join('\n')}\n`)
}

function walk(dir, files) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.endsWith('.md') || entry.name.endsWith('.lock')) continue

    const full = path.join(dir, entry.name)

    if (entry.isDirectory()) {
      if (!EXCLUDE_DIRS.has(entry.name)) walk(full, files)

      continue
    }

    if (!EXCLUDE_FILES.has(full)) files.push(full)
  }

  return files
}

function findStrayPlaceholders() {
  const hits = []

  for (const file of walk(ROOT, [])) {
    let content

    try {
      content = fs.readFileSync(file, 'utf8')
    } catch {
      continue
    }

    if (content.includes(PLACEHOLDER)) hits.push(file)
  }

  return hits
}

function readManifest() {
  return JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'))
}

function readClientsImportVendor() {
  const source = fs.readFileSync(CLIENTS_PATH, 'utf8')
  const match = source.match(/from '([^']+)\.my-orders-app'/)

  return match ? match[1] : null
}

function applyVendor(vendor, strayFiles) {
  const manifest = readManifest()

  manifest.vendor = vendor
  fs.writeFileSync(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`)

  const clientsSource = fs.readFileSync(CLIENTS_PATH, 'utf8')

  fs.writeFileSync(CLIENTS_PATH, clientsSource.replace(/from '[^']+\.my-orders-app'/, `from '${vendor}.my-orders-app'`))

  for (const file of strayFiles) {
    const content = fs.readFileSync(file, 'utf8')

    fs.writeFileSync(file, content.split(PLACEHOLDER).join(vendor))
  }

  const updated = [MANIFEST_PATH, CLIENTS_PATH, ...strayFiles].map((file) => path.relative(ROOT, file))

  console.log(`\nSet vendor to "${vendor}" in:`)
  updated.forEach((file) => console.log(`  - ${file}`))
  console.log('')
}

/** Best-effort: needs an active `vtex link` session, which may not exist yet on a first run */
function runTypingsCheck() {
  console.log('\n[setup-vendor] Running `vtex setup --typings`...\n')

  try {
    execSync('vtex setup --typings', { stdio: 'inherit', cwd: ROOT })
  } catch {
    console.warn('\n[setup-vendor] `vtex setup --typings` failed — run it manually after `vtex link` if needed.\n')
  }
}

function promptVendor(callback) {
  if (!process.stdin.isTTY) {
    console.warn(
      '\n[setup-vendor] A vendor placeholder was found, but no interactive terminal is available to ask for it.'
    )
    console.warn('[setup-vendor] Set manifest.json "vendor" and re-run, or fix it manually.\n')
    process.exit(1)
  }

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })

  const ask = () => {
    rl.question('Enter the VTEX account/vendor name for this app: ', (answer) => {
      const vendor = answer.trim()

      if (!VENDOR_NAME_PATTERN.test(vendor)) {
        console.log('Vendor name must be alphanumeric (dashes/underscores allowed). Try again.')
        ask()

        return
      }

      rl.close()
      callback(vendor)
    })
  }

  ask()
}

function main() {
  if (isBypassed()) return

  const manifestVendor = readManifest().vendor
  const importVendor = readClientsImportVendor()
  const strayFiles = findStrayPlaceholders()

  const needsSetup =
    PLACEHOLDER_PATTERN.test(manifestVendor) ||
    importVendor === null ||
    PLACEHOLDER_PATTERN.test(importVendor) ||
    importVendor !== manifestVendor ||
    strayFiles.length > 0

  if (!needsSetup) {
    markDone()
    runTypingsCheck()

    return
  }

  console.log(
    '\n[setup-vendor] manifest.json vendor, the masterdata typings import, or another file still reference a placeholder.'
  )
  promptVendor((vendor) => {
    applyVendor(vendor, strayFiles)
    markDone()
    runTypingsCheck()
  })
}

main()
