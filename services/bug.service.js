import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const BUGS_FILE = path.join(__dirname, '..', 'data', 'bugs.json')

export const bugService = {
    query,
    getById,
    save,
    remove,
    getDefaultFilter
}

function query(filterBy = { txt: '', minSeverity: 0 }) {
    const bugs = _loadBugsFromFile()
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
    const bugs = _loadBugsFromFile()
    const bug = bugs.find(bug => bug._id === bugId)
    if (!bug) return Promise.reject('Cannot find bug - ' + bugId)
    return Promise.resolve(bug)
}

function remove(bugId) {
    const bugs = _loadBugsFromFile()
    const bugIdx = bugs.findIndex(bug => bug._id === bugId)
    if (bugIdx === -1) return Promise.reject('Cannot remove bug - ' + bugId)
    bugs.splice(bugIdx, 1)
    _saveBugsToFile(bugs)
    return Promise.resolve()
}

function save(bug) {
    const bugs = _loadBugsFromFile()
    
    if (bug._id) {
        const bugIdx = bugs.findIndex(b => b._id === bug._id)
        if (bugIdx === -1) return Promise.reject('Cannot update bug - ' + bug._id)
        bugs[bugIdx] = {...bugs[bugIdx], ...bug}
    } else {
        bug._id = _makeId()
        bug.createdAt = Date.now()
        bugs.unshift(bug)
    }
    
    _saveBugsToFile(bugs)
    return Promise.resolve(bug)
}

function getDefaultFilter() {
    return { txt: '', minSeverity: 0 }
}

function _loadBugsFromFile() {
    try {
        const data = fs.readFileSync(BUGS_FILE, 'utf8')
        return JSON.parse(data)
    } catch (err) {
        console.error('Error loading bugs from file:', err)
        return []
    }
}

function _saveBugsToFile(bugs) {
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

function _createBugs() {
    try {
        if (fs.existsSync(BUGS_FILE)) {
            const data = fs.readFileSync(BUGS_FILE, 'utf8')
            const bugs = JSON.parse(data)
            if (bugs && bugs.length > 0) return
        }
        
        const bugs = [
            {
                title: "Infinite Loop Detected",
                description: "Application freezes in an infinite loop when saving data",
                severity: 4,
                _id: "1NF1N1T3",
                createdAt: Date.now()
            },
            {
                title: "Keyboard Not Found",
                description: "Error message appears even when keyboard is connected",
                severity: 3,
                _id: "K3YB0RD",
                createdAt: Date.now()
            },
            {
                title: "404 Coffee Not Found",
                description: "Developer productivity decreased significantly",
                severity: 2,
                _id: "C0FF33",
                createdAt: Date.now()
            },
            {
                title: "Unexpected Response",
                description: "API returns random data occasionally",
                severity: 1,
                _id: "G0053",
                createdAt: Date.now()
            }
        ]
        
        _saveBugsToFile(bugs)
    } catch (err) {
        console.error('Error creating bugs:', err)
    }
}

_createBugs()