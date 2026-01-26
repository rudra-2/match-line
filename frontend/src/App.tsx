import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Navbar } from '@/components/Navbar'
import { Dashboard } from '@/pages/Dashboard'
import { Resumes } from '@/pages/Resumes'
import { UploadResume } from '@/pages/UploadResume'
import { Jobs } from '@/pages/Jobs'
import { CreateJob } from '@/pages/CreateJob'
import { Matches } from '@/pages/Matches'

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
