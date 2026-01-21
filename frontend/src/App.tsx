import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Header } from '@/components/Header'
import { Dashboard } from '@/pages/Dashboard'
import { Resumes } from '@/pages/Resumes'
import { UploadResume } from '@/pages/UploadResume'
import { Jobs } from '@/pages/Jobs'
import { CreateJob } from '@/pages/CreateJob'
import { Matches } from '@/pages/Matches'
import '@/index.css'

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-50">
        <Header />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/resumes" element={<Resumes />} />
          <Route path="/resumes/upload" element={<UploadResume />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/jobs/create" element={<CreateJob />} />
          <Route path="/matches" element={<Matches />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
