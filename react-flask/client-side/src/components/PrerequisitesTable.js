import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CourseGraph from './CourseGraph'; // Import the CourseGraph component
import './PrerequisitesTable.css';
import API_BASE_URL from '../config';

function PrerequisitesTable() {
  const [search, setSearch] = useState('');
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [prerequisites, setPrerequisites] = useState([]);

  useEffect(() => {
    if (search.length >= 2) {
      axios
        .get(`${API_BASE_URL}/api/courses/search?q=${search}`)
        .then((response) => {
          setFilteredCourses(response.data);
          if (response.data.length > 0) {
            setSelectedCourse(response.data[0].CourseID);
          } else {
            setSelectedCourse('');
            setPrerequisites([]);
          }
        })
        .catch((error) => {
          console.error('Error fetching filtered courses:', error);
        });
    } else {
      setFilteredCourses([]);
      setSelectedCourse('');
      setPrerequisites([]);
    }
  }, [search]);

  useEffect(() => {
    if (selectedCourse) {
      axios
        .get(`${API_BASE_URL}/api/course/${selectedCourse}/prerequisites`)
        .then((response) => {
          setPrerequisites(response.data);
        })
        .catch((error) => {
          console.error('Error fetching prerequisites:', error);
          setPrerequisites([]);
        });
    } else {
      setPrerequisites([]);
    }
  }, [selectedCourse]);

  return (
    <div className="page-shell">
      <div className="page-grid">
        <div className="glass-card hero-card">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Prerequisites</p>
              <h1>Course prerequisites</h1>
              <p className="muted-strong">Search a course, review its requirements, and explore the graph with the updated visual language.</p>
            </div>
            <span className="tag soft">Laptop recommended</span>
          </div>
          <div className="callout">
            Computer screen strongly recommended for this feature!
          </div>
        </div>

        <div className="glass-card stack">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Search</p>
              <h3>Find a course</h3>
            </div>
            <span className="chip">{selectedCourse || 'No course selected'}</span>
          </div>

          <div className="two-column">
            <div className="field">
              <label htmlFor="course-search">Search for a Course</label>
              <input
                type="text"
                id="course-search"
                placeholder="Enter course ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input"
              />
            </div>

            {filteredCourses.length > 0 && (
              <div className="field">
                <label htmlFor="course-select">Select a Course</label>
                <select
                  id="course-select"
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  className="input"
                >
                  {filteredCourses.map((course) => (
                    <option key={course.CourseID} value={course.CourseID}>
                      {course.CourseID}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {selectedCourse && prerequisites.length > 0 ? (
            <>
              <div className="section-heading">
                <h4>Prerequisites for {selectedCourse}</h4>
                <span className="chip soft">{prerequisites.length} records</span>
              </div>
              <div className="table-wrapper">
                <table className="data-table">
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
              </div>
            </>
          ) : (
            selectedCourse && <div className="subtle-card">No prerequisites available for {selectedCourse}.</div>
          )}
        </div>

        {selectedCourse && (
          <CourseGraph selectedCourse={selectedCourse} />
        )}
      </div>
    </div>
  );
}

export default PrerequisitesTable;
