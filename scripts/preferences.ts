import { readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
// import { sourceInfo } from '../src/sources'

const __dirname = dirname(fileURLToPath(import.meta.url))

async function updatePreferences() {
  const packageJsonPath = join(__dirname, '..', 'package.json')
  const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf-8'))
  const sourceInfo = await getSourceInfo() as { id: string, title: { en: string } }[]
  const newPreferences = []

  // Generate a checkbox for each source from the single source of truth
  for (const source of sourceInfo) {
    newPreferences.push({
      name: `show-${source.id}`,
      title: `Show ${source.title.en}`,
      label: source.title.en,
      type: 'checkbox',
      required: false,
      default: true,
      description: `Whether to show trending topics from ${source.title.en}.`,
    })
  }

  // Generate a dropdown to select the primary source
  newPreferences.push({
    name: 'primarySource',
    title: 'Primary Source',
    description: 'Choose a source to display at the top of the list.',
    type: 'dropdown',
    required: false,
    default: sourceInfo[0].id,
    data: sourceInfo.map(source => ({
      title: source.title.en,
      value: source.id,
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

// avoid react import error
async function getSourceInfo() {
  const content = await readFile(join(__dirname, '../src/sources/index.ts'), 'utf-8')

  const match = content.match(/export const sourceInfo = (\[[\s\S]*?\]) as const/)
  if (match) {
    // remove hook property
    const arrayStr = match[1].replace(/,?\s*hook:[^,}]+/g, '')
    // eslint-disable-next-line no-eval
    const sourceInfo = eval(`(${arrayStr})`)
    return sourceInfo
  }
}

updatePreferences()
