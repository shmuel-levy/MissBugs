const { useState, useEffect } = React
const { useNavigate } = ReactRouterDOM

import { UserList } from '../cmps/UserList.jsx'
import { showErrorMsg, showSuccessMsg } from '../services/event-bus.service.js'
import { userService } from '../services/user.service.js'

export function AdminDashboard() {
    const user = userService.getLoggedInUser()
    const navigate = useNavigate()
    
    const [users, setUsers] = useState([])
    
    useEffect(() => {
        if (!user || !user.isAdmin) {
            showErrorMsg('Not Authorized')
            navigate('/')
            return
        }
        userService.query().then(setUsers)
    }, [])
    
    function onRemoveUser(userId) {
        userService.remove(userId)
            .then(() => {
                setUsers(users => users.filter(user => user._id !== userId))
                showSuccessMsg('Removed successfully')
            })
            .catch(err => {
                console.log('err', err)
                showErrorMsg('Had issues removing the user')
            })
    }
    

    if (!user) return <div>Loading...</div>
    
    return (
        <section className="admin-dashboard main-layout">
            <h1>Hello, {user.fullname}</h1>
            <h3>User Management</h3>
            <UserList users={users} onRemoveUser={onRemoveUser} />
        </section>
    )
}