const { useState } = React

const { NavLink, useNavigate } = ReactRouterDOM
import { userService } from '../services/user.service.js'
import { LoginSignup } from './LoginSignup.jsx'
import { UserMsg } from './UserMsg.jsx'

export function AppHeader() {
    const [user, setUser] = useState(userService.getLoggedInUser())
    const navigate = useNavigate()

    function onLogout() {
        userService.logout().then(() => {
            setUser(null)
            navigate('/')
        })
    }

    return (
        <React.Fragment>
            <header className="app-header main-layout">
                <img
                    onClick={() => navigate('/')}
                    className="logo"
                    src="/assets/img/small-logo.png"
                />
                {!user && <LoginSignup setUser={setUser} />}
                {user && (
                    <div className="nav-bar-container flex space-between">
                        <nav className="nav-bar">
                            
                            <NavLink to="/bug">Bugs</NavLink>
                            <NavLink to="/user">Profile</NavLink>
                            {user.isAdmin && <NavLink to="/admin">Admin</NavLink>}
                            <NavLink to="/about">About</NavLink>
                        </nav>
                        <div>
                            <p>Hello {user.fullname}</p>
                            <button className="btn" onClick={onLogout}>
                                Logout
                            </button>
                        </div>
                    </div>
                )}
            </header>
            <UserMsg />
        </React.Fragment>
    )
}
