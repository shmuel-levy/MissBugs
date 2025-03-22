import express from 'express'
import { bugService } from './services/bug.service.js'
import { loggerService } from './services/logger.service.js'
import cookieParser from 'cookie-parser'

const app = express()

app.use(express.static('public'))
app.use(cookieParser())
app.use(express.json())


app.get('/api/bug', (req, res) => {
    const { txt = '', minSeverity = 0 } = req.query
    const filterBy = { txt, minSeverity: +minSeverity }
    
    bugService.query(filterBy)
        .then(bugs => res.send(bugs))
        .catch(err => {
            loggerService.error('Cannot get bugs', err)
            res.status(500).send('Cannot load bugs')
        })
})

app.get('/api/bug/save', (req, res) => {
    const bugToSave = {
        _id: req.query._id,
        title: req.query.title,
        description: req.query.description || '',
        severity: +req.query.severity,
        createdAt: req.query.createdAt || Date.now()
    }
    
    bugService.save(bugToSave)
        .then(bug => res.send(bug))
        .catch(err => {
            loggerService.error('Cannot save bug', err)
            res.status(500).send('Cannot save bug')
        })
})

app.get('/api/bug/:bugId', (req, res) => {
    const { bugId } = req.params
    
    let visitedBugs = []
    if (req.cookies.visitedBugs) {
        try {
            visitedBugs = JSON.parse(req.cookies.visitedBugs)
        } catch (err) {
            loggerService.error('Failed to parse visitedBugs cookie', err)
        }
    }
    
    if (!visitedBugs.includes(bugId) && visitedBugs.length >= 3) {
        return res.status(401).send('Wait for a bit')
    }
    
 
    if (!visitedBugs.includes(bugId)) {
        visitedBugs.push(bugId)
    }
    
    loggerService.info('User visited at the following bugs:', visitedBugs)
    
    res.cookie('visitedBugs', JSON.stringify(visitedBugs), { maxAge: 7000 })
    
    bugService.getById(bugId)
        .then(bug => res.send(bug))
        .catch(err => {
            loggerService.error('Cannot get bug', err)
            res.status(500).send('Cannot load bug')
        })
})

app.get('/api/bug/:bugId/remove', (req, res) => {
    const { bugId } = req.params
    bugService.remove(bugId)
        .then(() => res.send('Bug Removed'))
        .catch(err => {
            loggerService.error('Cannot remove bug', err)
            res.status(500).send('Cannot remove bug')
        })
})

app.get('/', (req, res) => {
    res.send('MissBug API Server is Running')
})

app.get('/api/logs', (req, res) => {
    res.sendFile(process.cwd() + '/logs/backend.log')
})

const port = 3031 
app.listen(port, () =>
    loggerService.info(`Server listening on port http://127.0.0.1:${port}/`)
)