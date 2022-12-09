const WATCH_DIR = './schema'
const TARGET_FILE = 'schema.prisma'

const isPrismaPath = (path: string) => path.match(/.prisma$/)
const includesPrismaPath = (paths: string[]) => paths.some((path) => isPrismaPath(path))

const clearTargetFile = () =>
  Deno.writeTextFile(TARGET_FILE, '')

const scrapeDir = async (dir: string) => {
  const dirEntries: Deno.DirEntry[] = []

  for await (const dirEntry of Deno.readDir(dir)) {
    dirEntries.push(dirEntry)
  }

  const sortedDirEntries = dirEntries.sort(({ isFile }) => isFile ? -1 : 1)

  const promises = sortedDirEntries.map(async (dirEntry) => {
    const path = `${dir}/${dirEntry.name}`

    if (dirEntry.isFile) {
      if (!isPrismaPath(dirEntry.name)) {
        console.log('Skipping non-prisma file', dirEntry.name)
        return
      }
      console.log('reading from 📄', path)
      const data = await Deno.readTextFile(path)
      await Deno.writeTextFile(TARGET_FILE, `${data}\n\n`, {
        append: true
      })
    } else if (dirEntry.isDirectory) {
      console.log('jumping into 📂', path)
      await scrapeDir(path)
    }
  })

  await Promise.all(promises)
}

const gatherPrismaSchemas = async () => {
  await clearTargetFile()
  await scrapeDir(WATCH_DIR)
  console.log(`\n👂 Listening for Prisma changes in ${WATCH_DIR}`)
}

const listen = async () => {
  const watcher = Deno.watchFs('schema')
  await gatherPrismaSchemas()

  for await (const event of watcher) {
    console.log(`[${new Date().toLocaleTimeString()}]`, 'fs event', event)

    if (!includesPrismaPath(event.paths)) continue
    if (!['create', 'modify', 'remove'].includes(event.kind)) continue

    await gatherPrismaSchemas()
  }
}

await listen()
