import React, { useState, useEffect } from 'react';
import axios from 'axios';

function PrerequisitesTable() {
  const [search, setSearch] = useState(''); // Search input value
  const [filteredCourses, setFilteredCourses] = useState([]); // Filtered courses for display
  const [selectedCourse, setSelectedCourse] = useState(''); // Selected course ID
  const [prerequisites, setPrerequisites] = useState([]); // Prerequisites for the selected course

  // Fetch filtered courses from the server based on search query
  useEffect(() => {
    if (search.length >= 2) { // Trigger search after 2+ characters
      axios
        .get(`http://127.0.0.1:5000/api/courses/search?q=${search}`)
        .then((response) => {
          setFilteredCourses(response.data);
          if (response.data.length > 0) {
            setSelectedCourse(response.data[0].CourseID); // Set default selected course
          }
        })
        .catch((error) => {
          console.error('Error fetching filtered courses:', error);
        });
    } else {
      setFilteredCourses([]); // Clear dropdown when search is too short
    }
  }, [search]);

  // Fetch prerequisites when the selected course changes
  useEffect(() => {
    if (selectedCourse) {
      axios
        .get(`http://127.0.0.1:5000/api/course/${selectedCourse}/prerequisites`)
        .then((response) => {
          setPrerequisites(response.data);
        })
        .catch((error) => {
          console.error('Error fetching prerequisites:', error);
        });
    }
  }, [selectedCourse]);

  return (
    <div>
      <h2>Course Prerequisites</h2>

      {/* Search input */}
      <label htmlFor="course-search">Search for a Course:</label>
      <input
        type="text"
        id="course-search"
        placeholder="Enter course ID..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ margin: '10px', padding: '5px', width: '100%' }}
      />

      {/* Dropdown for filtered courses */}
      <label htmlFor="course-select">Select a Course:</label>
      <select
        id="course-select"
        value={selectedCourse}
        onChange={(e) => setSelectedCourse(e.target.value)}
        style={{ margin: '10px', padding: '5px', width: '100%' }}
      >
        {filteredCourses.map((course) => (
          <option key={course.CourseID} value={course.CourseID}>
            {course.CourseID}
          </option>
        ))}
      </select>

      {/* Display prerequisites */}
      {prerequisites.length > 0 ? (
        <>
          <h3>Prerequisites for {selectedCourse}</h3>
          <table border="1" style={{ borderCollapse: 'collapse', width: '100%' }}>
            <thead>
              <tr>
                {Object.keys(prerequisites[0]).map((key) => (
                  <th key={key}>{key}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {prerequisites.map((prerequisite, index) => (
                <tr key={index}>
                  {Object.keys(prerequisite).map((key) => (
                    <td key={key}>{prerequisite[key]}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </>
      ) : (
        <p>No prerequisites available for {selectedCourse}.</p>
      )}
    </div>
  );
}

export default PrerequisitesTable;
