import { utilService } from './util.service.js'
import { storageService } from './async-storage.service.js'

const BASE_URL = '/api/bug/'

export const bugService = {
    query,
    getById,
    save,
    remove,
    getDefaultFilter,
    getLabels
}

function query(filterBy = getDefaultFilter()) {
    const params = new URLSearchParams()
    
    if (filterBy.txt) params.append('txt', filterBy.txt)
    if (filterBy.minSeverity) params.append('minSeverity', filterBy.minSeverity)
    if (filterBy.userId) params.append('userId', filterBy.userId)
    
    if (filterBy.labels && filterBy.labels.length > 0) {
        filterBy.labels.forEach(label => {
            params.append('labels', label)
        })
    }
    
    if (filterBy.sortField) params.append('sortField', filterBy.sortField)
    if (filterBy.sortDir) params.append('sortDir', filterBy.sortDir)
    
    if (filterBy.pageIdx !== undefined) params.append('pageIdx', filterBy.pageIdx)
    
    return axios.get(BASE_URL + '?' + params.toString())
        .then(res => res.data)
}

function getById(bugId) {
    return axios.get(BASE_URL + bugId)
        .then(res => res.data)
}

function remove(bugId) {
    return axios.delete(BASE_URL + bugId)
}

function save(bug) {
    if (bug._id) {
        return axios.put(BASE_URL + bug._id, bug)
            .then(res => res.data)
    } else {
        return axios.post(BASE_URL, bug)
            .then(res => res.data)
    }
}

function getDefaultFilter() {
    return { 
        txt: '', 
        minSeverity: 0,
        labels: [],
        sortField: '',
        sortDir: 1
    }
}

function getLabels() {
    return [
        'critical',
        'need-CR',
        'dev-branch',
        'frontend',
        'backend',
        'hardware',
        'urgent'
    ]
}