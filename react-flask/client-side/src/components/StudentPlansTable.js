import React, { useEffect, useState } from 'react';
import axios from 'axios';

function StudentPlansTable() {
  const [plans, setPlans] = useState([]);
  const netid = "awa2"; // Replace with dynamic value if needed

  useEffect(() => {
    axios.get(`http://127.0.0.1:5000/api/student/${netid}/plans`)
      .then((response) => {
        setPlans(response.data);
      })
      .catch((error) => {
        console.error('Error fetching student plans:', error);
      });
  }, [netid]);

  return (
    <div>
      <h2>Academic Plans for {netid}</h2>
      {plans.length > 0 ? (
        <table border="1" style={{ borderCollapse: 'collapse', width: '100%' }}>
          <thead>
            <tr>
              {Object.keys(plans[0]).map((key) => (
                <th key={key}>{key}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {plans.map((plan, index) => (
              <tr key={index}>
                {Object.keys(plan).map((key) => (
                  <td key={key}>{plan[key]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>Loading plans...</p>
      )}
    </div>
  );
}

export default StudentPlansTable;
