// src/components/CombinedPage.js
import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import './CombinedPage.css';

function CombinedPage() {
  const netid = localStorage.getItem('netid') || '';
  const [plans, setPlans] = useState([]);
  const [selectedPlanID, setSelectedPlanID] = useState(null);
  const [planDetails, setPlanDetails] = useState([]);
  const [message, setMessage] = useState('');
  const [newCourseData, setNewCourseData] = useState({
    planid: '',
    courseid: '',
    semester: '',
  });

  // fetchPlans is now stable (recreated only when netid changes)
  const fetchPlans = useCallback(async () => {
    try {
      const response = await axios.get(
        `https://karthikbaga04.pythonanywhere.com/api/student/${netid}/plans`
      );
      setPlans(response.data);
      setMessage('');
    } catch (error) {
      setMessage('Error fetching plans or no plans found.');
      console.error(error);
    }
  }, [netid]);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const fetchPlanDetails = useCallback(
    async (planID) => {
      try {
        const response = await axios.get(
          `https://karthikbaga04.pythonanywhere.com/api/plan/${planID}`
        );
        setPlanDetails(response.data);
        setSelectedPlanID(planID);
        setMessage('');
      } catch (error) {
        setMessage('Error fetching plan details.');
        console.error(error);
      }
    },
    []
  );

  const deletePlan = useCallback(
    async (planID) => {
      try {
        await axios.delete(
          `https://karthikbaga04.pythonanywhere.com/api/plan/${planID}`
        );
        setPlans((p) => p.filter((plan) => plan.PlanID !== planID));
        if (planID === selectedPlanID) setPlanDetails([]);
        setMessage('Plan deleted successfully.');
      } catch (error) {
        setMessage('Error deleting plan.');
        console.error(error);
      }
    },
    [selectedPlanID]
  );

  const deleteCourse = useCallback(
    async (courseID) => {
      try {
        const response = await axios.delete(
          `https://karthikbaga04.pythonanywhere.com/api/plan/${selectedPlanID}/course/${courseID}`
        );
        setMessage(response.data.message);
        fetchPlanDetails(selectedPlanID);
      } catch (error) {
        setMessage('Error deleting course.');
        console.error(error);
      }
    },
    [selectedPlanID, fetchPlanDetails]
  );

  const addPlan = useCallback(async () => {
    try {
      const response = await axios.post(
        'https://karthikbaga04.pythonanywhere.com/api/plan',
        { netid }
      );
      if (response.status === 201) {
        setMessage(response.data.message);
        fetchPlans();
      } else {
        setMessage(response.data.error || 'Error adding new plan.');
      }
    } catch (error) {
      console.error('Error adding new plan:', error);
      setMessage('Error adding new plan.');
    }
  }, [netid, fetchPlans]);

  const addCourse = useCallback(
    async (e) => {
      e.preventDefault();
      const payload = {
        planid: newCourseData.planid,
        courseid: newCourseData.courseid.toUpperCase(),
        semester: newCourseData.semester.toUpperCase(),
      };
      try {
        const response = await axios.post(
          'https://karthikbaga04.pythonanywhere.com/api/course',
          payload
        );
        if (response.status === 201) {
          setMessage(response.data.message);
          fetchPlanDetails(newCourseData.planid);
        } else {
          setMessage(response.data.error || 'Error adding new course.');
        }
      } catch (error) {
        console.error('Error adding new course:', error);
        setMessage('Error adding new course.');
      }
    },
    [newCourseData, fetchPlanDetails]
  );

  return (
    <div className="combined-page-container">
      <h2>Academic Plans for {netid}</h2>

      {message && (
        <p
          className={`combined-page-message ${
            message.includes('success') ? 'success' : 'error'
          }`}
        >
          {message}
        </p>
      )}

      <button className="combined-page-button" onClick={addPlan}>
        Add New Plan
      </button>

      {plans.length > 0 ? (
        <table className="combined-page-table">
          <thead>
            <tr>
              <th>PlanID</th>
              <th>CreationDate</th>
              <th>NetID</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {plans.map((plan) => (
              <tr key={plan.PlanID}>
                <td>{plan.PlanID}</td>
                <td>{plan.CreationDate}</td>
                <td>{plan.NetID}</td>
                <td>
                  <button
                    className="combined-page-button"
                    onClick={() => fetchPlanDetails(plan.PlanID)}
                  >
                    View Details
                  </button>
                  <button
                    className="combined-page-button"
                    onClick={() => deletePlan(plan.PlanID)}
                  >
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
            <table className="combined-page-table">
              <thead>
                <tr>
                  <th>CourseID</th>
                  <th>Semester</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {planDetails.map((course, idx) => (
                  <tr key={idx}>
                    <td>{course.CourseID}</td>
                    <td>{course.Semester}</td>
                    <td>
                      <button
                        className="combined-page-button"
                        onClick={() => deleteCourse(course.CourseID)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No courses in this plan.</p>
          )}

          <h4>Add Course to Plan</h4>
          <form
            className="combined-page-form"
            onSubmit={addCourse}
          >
            <label>
              PlanID:
              <input
                type="text"
                name="planid"
                value={newCourseData.planid}
                onChange={(e) =>
                  setNewCourseData({
                    ...newCourseData,
                    planid: e.target.value,
                  })
                }
                required
              />
            </label>
            <label>
              CourseID:
              <input
                type="text"
                name="courseid"
                value={newCourseData.courseid}
                onChange={(e) =>
                  setNewCourseData({
                    ...newCourseData,
                    courseid: e.target.value,
                  })
                }
                required
              />
            </label>
            <label>
              Semester:
              <input
                type="text"
                name="semester"
                value={newCourseData.semester}
                onChange={(e) =>
                  setNewCourseData({
                    ...newCourseData,
                    semester: e.target.value,
                  })
                }
                required
              />
            </label>
            <button className="combined-page-button" type="submit">
              Add Course
            </button>
          </form>
        </>
      )}
    </div>
  );
}

export default CombinedPage;
