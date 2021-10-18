import { UserIcon, UserGroupIcon, AdjustmentsIcon, CalendarIcon } from '@heroicons/react/solid'
import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'

function NavBar({user}) {

    const [isAdmin, setIsAdmin] = useState(false)

    useEffect(() => {
        checkUserRole()
    })

    async function checkUserRole() {
        if (user?.signInUserSession.idToken.payload['cognito:groups']?.includes("Approvers")) {
            setIsAdmin(true)
        }
    }

    return (
        <nav className="flex-grow text-gray-500 sticky">

            <Link to="/vacations">
                <div className="py-2.5 px-4 flex items-center rounded-xl transform transition ease-in-out hover:bg-gray-200 hover:text-gray-900">
                    <CalendarIcon className="w-6 h-6" />
                    <span className="text-xl pl-2 pt-1">Vacations</span>
                </div>
            </Link>

            {
                isAdmin &&
                <>
                    <Link to="/teams">
                        <div className="py-2.5 px-4 flex items-center rounded-xl transform transition ease-in-out hover:bg-gray-200 hover:text-gray-900">
                            <UserGroupIcon className="w-6 h-6" />
                            <span className="text-xl pl-2 pt-1">Teams</span>
                        </div>
                    </Link>
                    <Link to="/people">
                        <div className="py-2.5 px-4 flex items-center rounded-xl transform transition ease-in-out hover:bg-gray-200 hover:text-gray-900">
                            <UserIcon className="w-6 h-6" />
                            <span className="text-xl pl-2 pt-1">People</span>
                        </div>
                    </Link>


                    <Link to="/settings">
                        <div className="py-2.5 px-4 flex items-center rounded-xl transform transition ease-in-out hover:bg-gray-200 hover:text-gray-900">
                            <AdjustmentsIcon className="w-6 h-6" />
                            <span className="text-xl pl-2 pt-1">Settings</span>
                        </div>
                    </Link>
                </>
            }

        </nav>
    )
}

export default NavBar
