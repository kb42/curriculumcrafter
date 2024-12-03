import React, { useEffect, useState } from 'react';
import axios from 'axios';

function CoursesTable() {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    axios.get('http://127.0.0.1:5000/api/courses')
      .then((response) => {
        setCourses(response.data);
      })
      .catch((error) => {
        console.error('Error fetching courses:', error);
      });
  }, []);

  return (
    <div>
      <h2>Courses</h2>
      {courses.length > 0 ? (
        <table border="1" style={{ borderCollapse: 'collapse', width: '100%' }}>
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
      ) : (
        <p>Loading courses...</p>
      )}
    </div>
  );
}

export default CoursesTable;
