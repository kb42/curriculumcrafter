import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import Home from './components/Home';
import About from './components/About';
import AddCourse from './components/AddCourse';
import Auth from './components/Auth';  // New JWT-based authentication
import StudentsTable from './components/StudentsTable';
//import StudentPlansTable from './components/StudentPlansTable';
// import PlanDetailsTable from './components/PlanDetailsTable';
import CombinedPageJWT from './components/CombinedPageJWT';  // JWT-protected version
import CoursesTable from './components/CoursesTable';
import PrerequisitesTable from './components/PrerequisitesTable';
import QuickActions from './components/QuickActions';

// const graphData = {
//   nodes: [
//     { id: 1, label: 'CS124' },
//     { id: 2, label: 'CS128' },
//     { id: 3, label: 'CS225' },
//   ],
//   edges: [
//     { from: 1, to: 2 },
//     { from: 2, to: 3 },
//   ],
// };

function App() {
  return (
    <Router>
      <div className="app-shell">
        <QuickActions />
        <Routes>
          {/* Main pages */}
          {/* <Route path="/" element={<Home />} /> */}
          <Route path="/" element={<About />} />
          <Route path="/add-course" element={<AddCourse />} />
          <Route path="/login" element={<Auth />} />  {/* JWT Authentication */}

          {/* Data-related pages */}
          <Route path="/students" element={<StudentsTable />} />
          {/* <Route path="/" element={<Login />} />
          <Route path="/student-plan" element={<StudentPlansTable />} /> */}
          {/* <Route path="/student-plans" element={<StudentPlansTable />} />
          <Route path="/plan-details" element={<PlanDetailsTable />} /> */}
          <Route path="/combinedpage" element={<CombinedPageJWT />} />  {/* JWT Protected */}
          <Route path="/courses" element={<CoursesTable />} />
          <Route path="/prerequisites" element={<PrerequisitesTable />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
