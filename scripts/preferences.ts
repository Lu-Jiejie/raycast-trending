import { readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

async function updatePreferences() {
  const packageJsonPath = join(__dirname, '..', 'package.json')
  const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf-8'))

  // Static preferences that don't need to be generated from source code
  const preferences = [
    {
      name: 'ttl',
      title: 'Cache Duration',
      description: 'Duration to cache trending content (in minutes).',
      type: 'textfield',
      required: false,
      default: '5',
      placeholder: '5',
    },
    {
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
    },
    {
      name: 'proxyUrl',
      title: 'Proxy URL',
      description: 'Proxy server URL (e.g., http://127.0.0.1:7890). Leave empty to disable proxy.',
      type: 'textfield',
      required: false,
      placeholder: 'http://127.0.0.1:7890',
    },
  ]

  packageJson.preferences = preferences

  await writeFile(packageJsonPath, `${JSON.stringify(packageJson, null, 2)}
`)

  console.log('Successfully updated package.json preferences! Source configuration is now managed through the "Configure Sources" command.')
}

updatePreferences()
