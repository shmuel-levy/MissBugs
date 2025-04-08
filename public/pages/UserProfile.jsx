const { useState, useEffect } = React
const { useParams, useNavigate } = ReactRouterDOM

import { userService } from '../services/user.service.js'
import { bugService } from '../services/bug.service.js'
import { showErrorMsg } from '../services/event-bus.service.js'
import { BugList } from '../cmps/BugList.jsx'

export function UserProfile() {
    const [user, setUser] = useState(null)
    const [userBugs, setUserBugs] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const params = useParams()
    const navigate = useNavigate()

    useEffect(() => {
        console.log('UserProfile mounted')
        loadUser()
    }, [])

    function loadUser() {
        setIsLoading(true)
        const loggedInUser = userService.getLoggedInUser()
        console.log('Logged in user:', loggedInUser)
        
        if (!params.userId && !loggedInUser) {
            showErrorMsg('Please login to view profile')
            navigate('/bug')
            return
        }
        
        const userId = params.userId || loggedInUser._id
        console.log('Loading user with ID:', userId)
        
        userService.get(userId)
            .then(user => {
                console.log('User loaded:', user)
                setUser(user)
                loadUserBugs(userId)
            })
            .catch(err => {
                console.error('Error loading user:', err)
                showErrorMsg('Cannot load user')
                setIsLoading(false)
            })
    }

    function loadUserBugs(userId) {
        console.log('Loading bugs for user:', userId)
      
        bugService.query({ userId })
            .then(bugs => {
                console.log('User bugs loaded:', bugs)
                setUserBugs(bugs)
                setIsLoading(false)
            })
            .catch(err => {
                console.error('Error loading user bugs:', err)
                showErrorMsg('Cannot load user bugs')
                setIsLoading(false)
            })
    }

    if (isLoading) return <div>Loading profile data...</div>
    if (!user) return <div>No user data available</div>

    return (
        <section className="user-profile">
            <h2>User Profile</h2>
            
            <div className="user-info">
                <h3>{user.fullname}</h3>
                {user.isAdmin && <div className="admin-badge">Admin</div>}
            </div>
            
            <section className="user-bugs">
                <h3>My Bugs</h3>
                {userBugs && userBugs.length > 0 ? (
                    <BugList bugs={userBugs} />
                ) : (
                    <p>No bugs created by this user</p>
                )}
            </section>
        </section>
    )
}