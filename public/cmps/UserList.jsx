const { Link } = ReactRouterDOM

export function UserList({ users, onRemoveUser }) {
    if (!users || users.length === 0) return <div>No users to display</div>
    
    return (
        <table className="user-list">
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Admin</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                {users.map(user => (
                    <tr key={user._id}>
                        <td>
                            <Link to={`/user/${user._id}`}>
                                {user.fullname}
                            </Link>
                        </td>
                        <td>{user.isAdmin ? '✓' : ''}</td>
                        <td>
                            <button 
                                onClick={() => onRemoveUser(user._id)}
                                className="btn-remove"
                            >
                                Remove
                            </button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    )
}