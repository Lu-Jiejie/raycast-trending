import { readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { serviceDefinitions } from '../src/services/definitions'

// ESM-compatible way to get the directory name
const __dirname = dirname(fileURLToPath(import.meta.url))

async function updatePreferences() {
  const packageJsonPath = join(__dirname, '..', 'package.json')
  const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf-8'))

  const newPreferences = []

  // Generate a checkbox for each service from the single source of truth
  for (const service of serviceDefinitions) {
    newPreferences.push({
      name: `show-${service.id}`,
      title: `Show ${service.title.en}`,
      label: service.title.en,
      type: 'checkbox',
      required: false,
      default: true,
      description: `Whether to show trending topics from ${service.title.en}.`,
    })
  }

  // Generate a dropdown to select the primary service
  newPreferences.push({
    name: 'primaryService',
    title: 'Primary Service',
    description: 'Choose a service to display at the top of the list.',
    type: 'dropdown',
    required: false,
    default: serviceDefinitions[0].id,
    data: serviceDefinitions.map(service => ({
      title: service.title.en,
      value: service.id,
    })),
  }, {
    name: 'ttl',
    title: 'Cache Duration',
    description: 'Duration to cache trending topics (in minutes). Cache will be ignored when manually refreshing.',
    type: 'textfield',
    required: false,
    default: '5',
    placeholder: '5',
  }, {
    name: 'lang',
    title: 'Interface Language',
    description: 'Choose the language shown in the interface.',
    type: 'dropdown',
    required: false,
    default: 'en',
    data: [
      { title: 'English', value: 'en' },
      { title: '简体中文', value: 'zh' },
    ],
  })

  packageJson.preferences = newPreferences

  await writeFile(packageJsonPath, `${JSON.stringify(packageJson, null, 2)}
`)

  console.log('Successfully updated package.json preferences from the single source of truth!')
}

updatePreferences()
