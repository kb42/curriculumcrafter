import React, { useEffect, useState } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config';

function StudentsTable() {
  const [students, setStudents] = useState([]);

  useEffect(() => {
    axios.get(`${API_BASE_URL}/api/students`)
      .then((response) => {
        setStudents(response.data);
      })
      .catch((error) => {
        console.error('Error fetching students:', error);
      });
  }, []);

  return (
    <div className="page-shell">
      <div className="page-grid">
        <div className="glass-card hero-card">
          <p className="eyebrow">Roster</p>
          <h1>Students</h1>
          <p className="muted-strong">A quick look at the student data backing plan creation.</p>
        </div>

        <div className="glass-card">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Dataset</p>
              <h3>Active students</h3>
            </div>
            <span className="chip">{students.length > 0 ? `${students.length} records` : 'Loading'}</span>
          </div>

          {students.length > 0 ? (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    {Object.keys(students[0]).map((key) => (
                      <th key={key}>{key}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {students.map((student, index) => (
                    <tr key={index}>
                      {Object.keys(student).map((key) => (
                        <td key={key}>{student[key]}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="subtle-card">Loading students...</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default StudentsTable;
