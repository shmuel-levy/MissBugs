import Cryptr from 'cryptr'
import { userService } from './user.service.js'

const cryptr = new Cryptr(process.env.SECRET1 || 'unknown-pw-1212')

export const authService = {
    checkLogin,
    getLoginToken,
    validateToken
}

function checkLogin({ username, password }) {
    return userService.getByUsername(username)
        .then(user => {
            if (user && user.password === password) {
                const miniUser = {
                    _id: user._id,
                    fullname: user.fullname,
                    isAdmin: !!user.isAdmin
                }
                return miniUser
            }
            return Promise.reject('Invalid username or password')
        })
}

function getLoginToken(user) {
    const str = JSON.stringify(user)
    const encryptedStr = cryptr.encrypt(str)
    return encryptedStr
}

function validateToken(token) {
    if (!token) return null
    try {
        const str = cryptr.decrypt(token)
        const user = JSON.parse(str)
        return user
    } catch(err) {
        console.log('Invalid login token')
    }
    return null
}