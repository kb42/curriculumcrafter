import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './components/Home';
import About from './components/About';
import AddCourse from './components/AddCourse';
import Login from './components/Login';
import StudentsTable from './components/StudentsTable';
import StudentPlansTable from './components/StudentPlansTable';
import PlanDetailsTable from './components/PlanDetailsTable';
import CoursesTable from './components/CoursesTable';
import PrerequisitesTable from './components/PrerequisitesTable';

function App() {
  return (
    <Router>
      <div>
        <Navbar />
        <Routes>
          {/* Main pages */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/add-course" element={<AddCourse />} />
          <Route path="/login" element={<Login />} />

          {/* Data-related pages */}
          <Route path="/students" element={<StudentsTable />} />
          <Route path="/student-plans" element={<StudentPlansTable />} />
          <Route path="/plan-details" element={<PlanDetailsTable />} />
          <Route path="/courses" element={<CoursesTable />} />
          <Route path="/prerequisites" element={<PrerequisitesTable />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;