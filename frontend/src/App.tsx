import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

// Components
import { Navbar } from '@/components'

// Pages
import {
    Dashboard,
    Resumes,
    UploadResume,
    Jobs,
    CreateJob,
    Matches,
} from '@/pages'

function App() {
    return (
        <Router>
            <div className="flex min-h-screen bg-[var(--color-paper)]">
                {/* Sidebar Navigation */}
                <Navbar />

                {/* Main Content */}
                <main className="flex-1 overflow-auto">
                    <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/resumes" element={<Resumes />} />
                        <Route path="/resumes/upload" element={<UploadResume />} />
                        <Route path="/jobs" element={<Jobs />} />
                        <Route path="/jobs/create" element={<CreateJob />} />
                        <Route path="/matches" element={<Matches />} />
                    </Routes>
                </main>
            </div>
        </Router>
    )
}

export default App
