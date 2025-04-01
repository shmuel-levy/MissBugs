import fs from 'fs'
import http from 'http'
import https from 'https'
import path from 'path'

export const utilService = {
  readJsonFile,
  download,
  httpGet,
  makeId
}

function readJsonFile(filePath) {
  try {
    // Check if file exists first
    if (!fs.existsSync(filePath)) {
      console.log(`File not found: ${filePath}`)
      
      // Create directory if it doesn't exist
      const dir = path.dirname(filePath)
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
        console.log(`Created directory: ${dir}`)
      }
      
      // Return empty array if file doesn't exist
      return []
    }
    
    const str = fs.readFileSync(filePath, 'utf8')
    const json = JSON.parse(str)
    return json
  } catch (err) {
    console.error('Error reading JSON file:', err)
    return [] // Return empty array on error
  }
}

function download(url, fileName) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(fileName)
    https.get(url, (content) => {
      content.pipe(file)
      file.on('error', reject)
      file.on('finish', () => {
        file.close()
        resolve()
      })
    })
  })
}

function httpGet(url) {
  const protocol = url.startsWith('https') ? https : http
  const options = {
    method: 'GET'
  }
  
  return new Promise((resolve, reject) => {
    const req = protocol.request(url, options, (res) => {
      let data = ''
      res.on('data', (chunk) => {
        data += chunk
      })
      res.on('end', () => {
        resolve(data)
      })
    })
    req.on('error', (err) => {
      reject(err)
    })
    req.end()
  })
}

function makeId(length = 5) {
  let text = ''
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length))
  }
  return text
}