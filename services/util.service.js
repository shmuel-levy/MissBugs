import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export const utilService = {
    makeId,
    readJsonFile,
    writeJsonFile
}

function makeId(length = 5) {
    let text = ''
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length))
    }
    return text
}

function readJsonFile(relativePath) {
    const fullPath = path.resolve(__dirname, '..', relativePath)
    
    try {
        if (!fs.existsSync(fullPath)) {
            return null
        }
        
        const str = fs.readFileSync(fullPath, 'utf8')
        const json = JSON.parse(str)
        return json
    } catch (err) {
        console.error('Error reading JSON file:', err)
        return null
    }
}

function writeJsonFile(relativePath, data) {
    const fullPath = path.resolve(__dirname, '..', relativePath)
    
    try {
        // Ensure directory exists
        const dir = path.dirname(fullPath)
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true })
        }
        
        const str = JSON.stringify(data, null, 2)
        fs.writeFileSync(fullPath, str)
        return true
    } catch (err) {
        console.error('Error writing JSON file:', err)
        return false
    }
}