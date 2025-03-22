import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const BUGS_FILE = path.join(__dirname, '..', 'data', 'bugs.json')

// Initialize bugs data
let bugs = []

// Create data directory if it doesn't exist
const dataDir = path.join(__dirname, '..', 'data')
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
}

// Check if bugs.json exists, if not create it
if (!fs.existsSync(BUGS_FILE)) {
    bugs = [
        {
            title: "Infinite Loop Detected",
            description: "Application freezes in an infinite loop when saving data",
            severity: 4,
            _id: "1NF1N1T3",
            createdAt: 1542107359454
        },
        {
            title: "Keyboard Not Found",
            description: "Error message appears even when keyboard is connected",
            severity: 3,
            _id: "K3YB0RD",
            createdAt: 1542107359454
        },
        {
            title: "404 Coffee Not Found",
            description: "Developer productivity decreased significantly",
            severity: 2,
            _id: "C0FF33",
            createdAt: 1542107359454
        },
        {
            title: "Unexpected Response",
            description: "API returns random data occasionally",
            severity: 1,
            _id: "G0053",
            createdAt: 1542107359454
        }
    ]
    fs.writeFileSync(BUGS_FILE, JSON.stringify(bugs, null, 2))
} else {
    // Read existing bugs
    try {
        const data = fs.readFileSync(BUGS_FILE, 'utf8')
        bugs = JSON.parse(data)
    } catch (err) {
        console.error('Error reading bugs.json:', err)
    }
}

export const bugService = {
    query,
    getById,
    remove,
    save,
    getDefaultFilter
}

function query(filterBy = { txt: '', minSeverity: 0 }) {
    let filteredBugs = [...bugs]
    
    if (filterBy.txt) {
        const regExp = new RegExp(filterBy.txt, 'i')
        filteredBugs = filteredBugs.filter(bug => regExp.test(bug.title))
    }
    
    if (filterBy.minSeverity) {
        filteredBugs = filteredBugs.filter(bug => bug.severity >= filterBy.minSeverity)
    }
    
    return Promise.resolve(filteredBugs)
}

function getById(bugId) {
    const bug = bugs.find(bug => bug._id === bugId)
    if (!bug) return Promise.reject('Cannot find bug - ' + bugId)
    return Promise.resolve(bug)
}

function remove(bugId) {
    const bugIdx = bugs.findIndex(bug => bug._id === bugId)
    if (bugIdx === -1) return Promise.reject('Cannot remove bug - ' + bugId)
    bugs.splice(bugIdx, 1)
    _saveBugsToFile()
    return Promise.resolve()
}

function save(bug) {
    if (bug._id) {
        const bugIdx = bugs.findIndex(b => b._id === bug._id)
        if (bugIdx === -1) return Promise.reject('Cannot update bug - ' + bug._id)
        bugs[bugIdx] = {...bugs[bugIdx], ...bug}
    } else {
        bug._id = _makeId()
        bug.createdAt = Date.now()
        bugs.unshift(bug)
    }
    
    _saveBugsToFile()
    return Promise.resolve(bug)
}

function getDefaultFilter() {
    return { txt: '', minSeverity: 0 }
}

function _saveBugsToFile() {
    try {
        fs.writeFileSync(BUGS_FILE, JSON.stringify(bugs, null, 2))
    } catch (err) {
        console.error('Error saving bugs to file:', err)
    }
}

function _makeId(length = 6) {
    var txt = ''
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    for (var i = 0; i < length; i++) {
        txt += possible.charAt(Math.floor(Math.random() * possible.length))
    }
    return txt
}