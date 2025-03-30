import fs from 'fs'
import path from 'path'
import { utilService } from './util.service.js'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const BUGS_FILE = path.join(__dirname, '..', 'data', 'bugs.json')
const PAGE_SIZE = 5

let bugs = []

const dataDir = path.join(__dirname, '..', 'data')
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
}

if (!fs.existsSync(BUGS_FILE)) {
    const initialBugs = [
        {
            _id: "1NF1N1T3",
            title: "Infinite Loop Detected",
            description: "Application freezes in an infinite loop when saving data",
            severity: 4,
            createdAt: 1542107359454,
            labels: ['critical', 'frontend', 'bug']
        },
        {
            _id: "K3YB0RD",
            title: "Keyboard Not Found",
            description: "Error message appears even when keyboard is connected",
            severity: 3,
            createdAt: 1542107359454,
            labels: ['hardware', 'need-CR']
        },
        {
            _id: "C0FF33",
            title: "404 Coffee Not Found",
            description: "Developer productivity decreased significantly",
            severity: 2,
            createdAt: 1542107359454,
            labels: ['urgent', 'dev-branch']
        },
        {
            _id: "G0053",
            title: "Unexpected Response",
            description: "API returns random data occasionally",
            severity: 1,
            createdAt: 1542107359454,
            labels: ['backend', 'need-CR', 'dev-branch']
        }
    ]
    fs.writeFileSync(BUGS_FILE, JSON.stringify(initialBugs, null, 2))
    bugs = initialBugs
} else {
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

function query(filterBy = {}) {
    let bugsToReturn = [...bugs]
    
    if (filterBy.txt) {
        const regex = new RegExp(filterBy.txt, 'i')
        bugsToReturn = bugsToReturn.filter(bug => regex.test(bug.title))
    }
    
    if (filterBy.minSeverity) {
        bugsToReturn = bugsToReturn.filter(bug => bug.severity >= filterBy.minSeverity)
    }
    
    if (filterBy.label) {
        bugsToReturn = bugsToReturn.filter(bug => 
            bug.labels && bug.labels.some(label => label.includes(filterBy.label))
        )
    }
    
    if (filterBy.sortBy) {
        const dir = filterBy.sortDir === '-1' ? -1 : 1
        
        bugsToReturn.sort((a, b) => {
            if (typeof a[filterBy.sortBy] === 'string') {
                return a[filterBy.sortBy].localeCompare(b[filterBy.sortBy]) * dir
            } else {
                return (a[filterBy.sortBy] - b[filterBy.sortBy]) * dir
            }
        })
    }
    
    if (filterBy.pageIdx !== undefined) {
        const startIdx = filterBy.pageIdx * PAGE_SIZE
        bugsToReturn = bugsToReturn.slice(startIdx, startIdx + PAGE_SIZE)
    }
    
    return Promise.resolve(bugsToReturn)
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
        if (!bug.labels) bug.labels = []
        bugs.unshift(bug)
    }
    
    _saveBugsToFile()
    return Promise.resolve(bug)
}

function getDefaultFilter() {
    return { 
        txt: '', 
        minSeverity: 0,
        label: '',
        sortBy: '',
        sortDir: '1'
    }
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