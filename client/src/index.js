// dependencies
import React from 'react'
import ReactDOM from 'react-dom/client'
// Page
import CreateAttendanceLog from './pages/create_attendance_log.js'
import Profile from './pages/profile.js'
import History from './pages/history.js'
import { Navbar } from './esomos_ui_kit/index.js'
import Home from './pages/home.js'

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<Navbar navData={[
    [ // home and about
        {
            name: "Home",
            link: "/home",
            component: <Home />
        }
    ],
    [ // core functioning
        {
            name: "Create Attendance Log",
            link: "/create-attendance-log",
            component: <CreateAttendanceLog />
        },
        {
            name: "History",
            link: "/history",
            component: <History />
        }
    ],
    [ // personal
        {
            name: "Profile",
            link: "/profile",
            component: <Profile />
        }
    ]
]} />)
