import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './CoursesTable.css';
import API_BASE_URL from '../config';

function CoursesTable() {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    axios.get(`${API_BASE_URL}/api/courses`)
      .then((response) => {
        setCourses(response.data);
      })
      .catch((error) => {
        console.error('Error fetching courses:', error);
      });
  }, []);

  return (
    <div className="page-shell">
      <div className="page-grid">
        <div className="glass-card hero-card">
          <p className="eyebrow">Catalog</p>
          <h1>Courses</h1>
          <p className="muted-strong">Browse the live catalog powering prerequisite checks and plan creation.</p>
        </div>

        <div className="glass-card">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Dataset</p>
              <h3>Available Courses</h3>
            </div>
            <span className="chip">{courses.length > 0 ? `${courses.length} results` : 'Loading'}</span>
          </div>

          {courses.length > 0 ? (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    {Object.keys(courses[0]).map((key) => (
                      <th key={key}>{key}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {courses.map((course, index) => (
                    <tr key={index}>
                      {Object.keys(course).map((key) => (
                        <td key={key}>{course[key]}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="subtle-card">Loading courses...</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CoursesTable;
