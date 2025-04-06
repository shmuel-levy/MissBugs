import express from 'express'
import cookieParser from 'cookie-parser'
import path from 'path'
import { fileURLToPath } from 'url'

import { bugService } from './services/bug.service.js'
import { loggerService } from './services/logger.service.js'

import { userService } from './services/user.service.js'
import { authService } from './services/auth.service.js'
import { requiredAuth } from './middlewares/requiredAuth.middleWare.js'
const app = express()

// App Configuration
app.use(express.static('public'))
app.use(cookieParser())
app.use(express.json())


app.get('/api/bug', (req, res) => {
    const filterBy = {
        txt: req.query.txt || '',
        minSeverity: +req.query.minSeverity || 0,
        labels: req.query.labels || [],
        userId: req.query.userId || '',
    }
    
    const sortBy = {
        sortField: req.query.sortField || '',
        sortDir: +req.query.sortDir || 1,
    }
    
    const pagination = {
        pageIdx: req.query.pageIdx !== undefined ? +req.query.pageIdx || 0 : undefined,
        pageSize: +req.query.pageSize || 3,
    }
    
    const queryOptions = { filterBy, sortBy, pagination }
    
    bugService.query(queryOptions)
        .then(bugs => res.send(bugs))
        .catch(err => {
            loggerService.error('Cannot get bugs', err)
            res.status(400).send('Cannot get bugs')
        })
})

app.get('/api/bug/:bugId', (req, res) => {
    const { bugId } = req.params
    let visitedBugs = req.cookies.visitedBugs || []
    
    if (!visitedBugs.includes(bugId)) visitedBugs.push(bugId)
    if (visitedBugs.length > 3) {
        return res.status(401).send('Wait for a bit')
    }
    
    bugService.getById(bugId)
        .then(bug => {
            res.cookie('visitedBugs', visitedBugs, { maxAge: 1000 * 10 })
            res.send(bug)
        })
        .catch(err => {
            loggerService.error('Cannot get bug', err)
            res.status(401).send('Cannot get bug')
        })
})

app.delete('/api/bug/:bugId', requiredAuth, (req, res) => {
    const { loggedinUser } = req
    const { bugId } = req.params
    
    bugService.remove(bugId, loggedinUser)
        .then(() => res.send(`Bug id : ${bugId} deleted`))
        .catch(err => {
            loggerService.error('Cannot remove bug', err)
            res.status(401).send('Cannot remove bug')
        })
})

app.post('/api/bug', requiredAuth, (req, res) => {
    const { loggedinUser } = req
    const bug = req.body
    
    if (!bug.title) return res.status(400).send('Missing required fields')
    
    delete loggedinUser.username
    bug.creator = loggedinUser
    
    bugService.save(bug)
        .then(addedBug => res.send(addedBug))
        .catch(err => {
            loggerService.error('Cannot save bug', err)
            res.status(400).send('Cannot save bug')
        })
})

app.put('/api/bug/:bugId', requiredAuth, (req, res) => {
    const { loggedinUser } = req
    const bug = req.body
    
    if (!bug._id || !bug.title) return res.status(400).send('Missing required fields')
    
    bugService.save(bug, loggedinUser)
        .then(savedBug => res.send(savedBug))
        .catch(err => {
            loggerService.error('Cannot save bug', err)
            res.status(400).send('Cannot save bug')
        })
})

//* ------------------- User API -------------------
app.get('/api/user', (req, res) => {
    userService.query()
        .then(users => res.send(users))
        .catch(err => {
            loggerService.error('Cannot get users', err)
            res.status(500).send('Cannot get users')
        })
})

app.get('/api/user/:userId', (req, res) => {
    const { userId } = req.params
    userService.getById(userId)
        .then(user => res.send(user))
        .catch(err => {
            loggerService.error('Cannot get user:', err)
            res.status(500).send('Cannot get user')
        })
})

app.delete('/api/user/:userId', requiredAuth, (req, res) => {
    const { loggedinUser } = req
    if (!loggedinUser.isAdmin) return res.status(401).send('Cannot remove user')
    
    const { userId } = req.params
    bugService.hasBugs(userId)
        .then(() => userService.remove(userId))
        .then(() => res.send('Removed!'))
        .catch(err => {
            loggerService.error('Cannot delete user!', err)
            res.status(401).send('Cannot delete user!')
        })
})

//* ------------------- Auth API -------------------
app.post('/api/auth/signup', (req, res) => {
    const credentials = req.body
    
    userService.add(credentials)
        .then(user => {
            const loginToken = authService.getLoginToken(user)
            res.cookie('loginToken', loginToken)
            res.send(user)
        })
        .catch(err => {
            loggerService.error('Cannot signup', err)
            res.status(401).send('Cannot signup')
        })
})

app.post('/api/auth/login', (req, res) => {
    const credentials = {
        username: req.body.username,
        password: req.body.password,
    }
    
    authService.checkLogin(credentials)
        .then(user => {
            const loginToken = authService.getLoginToken(user)
            res.cookie('loginToken', loginToken)
            res.send(user)
        })
        .catch(err => {
            loggerService.error('Cannot login', err)
            res.status(401).send('Cannot login')
        })
})

app.post('/api/auth/logout', (req, res) => {
    res.clearCookie('loginToken')
    res.send('Logged out')
})

// Fallback route
app.get('/**', (req, res) => {
    res.sendFile(path.resolve('public/index.html'))
})

const port = 3030
app.listen(port, () => loggerService.info(`Server listening on port http://127.0.0.1:${port}/`))
