import './App.css';
import { PaperAirplaneIcon } from '@heroicons/react/outline'
import NavBar from './components/NavBar'
import ProfileLink from './components/ProfileLink'
import { withAuthenticator } from '@aws-amplify/ui-react'
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom'
import Vacations from './pages/Vacations'
import Teams from './pages/Teams'
import People from './pages/People'
import Settings from './pages/Settings'
import Profile from './pages/Profile'
import { useEffect, useState } from 'react'
import { Auth } from 'aws-amplify'
import Modal from './components/Modal'
import { createNanoEvents } from "nanoevents"

function App() {
  const emmiter = createNanoEvents()
  emmiter.on("showModal", (visible, header, subtitle, component) => {
    setModal({ header, subtitle, component })
    setShowModal(visible)
  })

  const [user, setUser] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [modal, setModal] = useState({ header: "", subtitle: "", component: null })

  useEffect(() => {
    checkUser()
  }, [])

  async function checkUser() {
    await Auth.currentAuthenticatedUser()
      .then(data => {
        setUser(data)
      })
      .catch(err => {
        console.log("user is not authenticated. redirecting...");
      })
  }
  if (!user) return null

  return (
    <Router>
      <div className="flex">
        <div className="relative min-h-screen flex flex-grow">
          {/* sidebar */}


          <div className="bg-gray-100 text-gray-800 w-64 pt-6 px-2 space-y-6 flex flex-col h-screen z-0 relative">
            {/* logo */}
            <Link to="/">
              <div className="text-gray-800 flex items-center space-x-2 pl-4 border-b-1">
                <PaperAirplaneIcon className="w-8 h-8 text-purple-800" />
                <span className="text-xl font-bold">VacationTracker</span>
              </div>
            </Link>
            {/* nav */}
            <NavBar className="static" user={user} />

            {/* Signed-in user */}
            <ProfileLink user={user} />
          </div>

          {/* content */}
          <div className="p-6 text-2xl font-bold z-0 flex-1 flex-grow relative">
            <Switch>
              <Route path="/" exact render={() => <Vacations emmiter={emmiter} user={user} />} />
              <Route path="/vacations" render={() => <Vacations emmiter={emmiter} user={user} />} />

              <Route path="/teams" component={Teams} />
              <Route path="/people" component={People} />
              <Route path="/settings" render={() => <Settings emmiter={emmiter} user={user} />} />

              <Route path="/profile" component={Profile} />
            </Switch>
          </div>

        </div>

        {/* popup */}
        {showModal &&
          <Modal showModal={showModal} setShowModal={setShowModal} header={modal.header} subtitle={modal.subtitle} content={modal.component} />
        }

      </div>
    </Router>
  );
}

export default withAuthenticator(App);
