import React, { useEffect, useState } from 'react';
import axios from 'axios';

function CombinedPage() {
  const [netid, setNetID] = useState('awa2'); // Default NetID
  const [plans, setPlans] = useState([]);
  const [selectedPlanID, setSelectedPlanID] = useState(null);
  const [planDetails, setPlanDetails] = useState([]);
  const [message, setMessage] = useState('');
  const [newPlanID, setNewPlanID] = useState(null);
  const [newCourseData, setNewCourseData] = useState({
    planid: '',
    courseid: '',
    credits: '',
    semester: '',
  });

  useEffect(() => {
    fetchPlans();
  }, [netid]);

  const fetchPlans = async () => {
    try {
      const response = await axios.get(`http://127.0.0.1:5000/api/student/${netid}/plans`);
      setPlans(response.data);
      setMessage('');
    } catch (error) {
      setMessage('Error fetching plans or no plans found.');
      console.error(error);
    }
  };

  const fetchPlanDetails = async (planID) => {
    try {
      const response = await axios.get(`http://127.0.0.1:5000/api/plan/${planID}`);
      setPlanDetails(response.data);
      setSelectedPlanID(planID);
      setMessage('');
    } catch (error) {
      setMessage('Error fetching plan details.');
      console.error(error);
    }
  };

  const deletePlan = async (planID) => {
    try {
      await axios.delete(`http://127.0.0.1:5000/api/plan/${planID}`);
      setPlans(plans.filter(plan => plan.PlanID !== planID));
      if (planID === selectedPlanID) setPlanDetails([]);
      setMessage('Plan deleted successfully.');
    } catch (error) {
      setMessage('Error deleting plan.');
      console.error(error);
    }
  };

  const addPlan = async () => {
    try {
      // Dynamically calculate the lowest available PlanID
      const usedIDs = plans.map(plan => plan.PlanID);
      const newPlanID = Math.max(0, ...usedIDs) + 1; // Find the next available ID
  
      const response = await axios.post('http://127.0.0.1:5000/api/plan', { netid, planid: newPlanID });
  
      if (response.status === 201) {
        setMessage(`Plan with ID ${newPlanID} added successfully.`);
        fetchPlans(); // Refresh the plans list
      } else {
        setMessage(response.data.error || 'Error adding new plan.');
      }
    } catch (error) {
      setMessage('Error adding new plan.');
      console.error(error);
    }
  };
  

  const addCourse = async (e) => {
    e.preventDefault();
  
    if (!newCourseData.planid || !newCourseData.courseid || !newCourseData.credits || !newCourseData.semester) {
      setMessage('All fields are required for adding a course.');
      return;
    }
  
    try {
      const response = await axios.post('http://127.0.0.1:5000/api/course', newCourseData);
  
      if (response.status === 201) {
        setMessage('Course added successfully.');
        fetchPlanDetails(newCourseData.planid); // Refresh the plan details
        setNewCourseData({ planid: '', courseid: '', credits: '', semester: '' });
      } else {
        setMessage(response.data.error || 'Error adding course.');
      }
    } catch (error) {
      setMessage('Error adding course.');
      console.error(error);
    }
  };
  

  return (
    <div style={{ padding: '20px' }}>
      <h2>Academic Plans for {netid}</h2>

      {message && <p style={{ color: 'red' }}>{message}</p>}

      <button onClick={addPlan} style={{ marginBottom: '10px' }}>
        Add New Plan
      </button>

      {plans.length > 0 ? (
        <table border="1" style={{ borderCollapse: 'collapse', width: '100%' }}>
          <thead>
            <tr>
              <th>PlanID</th>
              <th>CreationDate</th>
              <th>NetID</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {plans.map(plan => (
              <tr key={plan.PlanID}>
                <td>{plan.PlanID}</td>
                <td>{plan.CreationDate}</td>
                <td>{plan.NetID}</td>
                <td>
                  <button onClick={() => fetchPlanDetails(plan.PlanID)}>View Details</button>
                  <button onClick={() => deletePlan(plan.PlanID)} style={{ marginLeft: '10px' }}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No plans available.</p>
      )}

      {selectedPlanID && (
        <>
          <h3>Plan Details for PlanID {selectedPlanID}</h3>
          {planDetails.length > 0 ? (
            <table border="1" style={{ borderCollapse: 'collapse', width: '100%' }}>
              <thead>
                <tr>
                  <th>CourseID</th>
                  <th>Credits</th>
                  <th>Semester</th>
                </tr>
              </thead>
              <tbody>
                {planDetails.map((course, index) => (
                  <tr key={index}>
                    <td>{course.CourseID}</td>
                    <td>{course.Credits}</td>
                    <td>{course.Semester}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No courses in this plan.</p>
          )}

          <h4>Add Course to Plan</h4>
          <form onSubmit={addCourse}>
            <label>
              PlanID:
              <input
                type="text"
                name="planid"
                value={newCourseData.planid}
                onChange={(e) => setNewCourseData({ ...newCourseData, planid: e.target.value })}
              />
            </label>
            <label>
              CourseID:
              <input
                type="text"
                name="courseid"
                value={newCourseData.courseid}
                onChange={(e) => setNewCourseData({ ...newCourseData, courseid: e.target.value })}
              />
            </label>
            <label>
              Credits:
              <input
                type="text"
                name="credits"
                value={newCourseData.credits}
                onChange={(e) => setNewCourseData({ ...newCourseData, credits: e.target.value })}
              />
            </label>
            <label>
              Semester:
              <input
                type="text"
                name="semester"
                value={newCourseData.semester}
                onChange={(e) => setNewCourseData({ ...newCourseData, semester: e.target.value })}
              />
            </label>
            <button type="submit">Add Course</button>
          </form>
        </>
      )}
    </div>
  );
}

export default CombinedPage;