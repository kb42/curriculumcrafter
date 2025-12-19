// src/components/CombinedPage.js
import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import './CombinedPage.css';
import API_BASE_URL from '../config';

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
        `${API_BASE_URL}/api/student/${netid}/plans`
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
          `${API_BASE_URL}/api/plan/${planID}`
        );
        setPlanDetails(response.data);
        setSelectedPlanID(planID);
        setNewCourseData((prev) => ({ ...prev, planid: planID }));
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
          `${API_BASE_URL}/api/plan/${planID}`
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
          `${API_BASE_URL}/api/plan/${selectedPlanID}/course/${courseID}`
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
        `${API_BASE_URL}/api/plan`,
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
          `${API_BASE_URL}/api/course`,
          payload
        );
        if (response.status === 201) {
          setMessage(response.data.message);
          fetchPlanDetails(newCourseData.planid);
          setNewCourseData((prev) => ({
            ...prev,
            courseid: '',
            semester: '',
          }));
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
    <div className="page-shell">
      <div className="page-grid">
        <div className="glass-card hero-card">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Plans</p>
              <h1>Academic Plans for {netid || 'Guest'}</h1>
              <p className="muted">
                Create, view, and curate the plans tied to this account. This view mirrors the refreshed design language.
              </p>
            </div>
            <div className="badge-row">
              <span className="tag accent">{plans.length} plan{plans.length === 1 ? '' : 's'}</span>
              <span className="tag">Legacy session</span>
            </div>
          </div>
          <div className="pill-row">
            <span className="chip">Add plans quickly</span>
            <span className="chip success">Track progress</span>
            <span className="chip warning">Stay on top of prereqs</span>
          </div>
        </div>

        {message && (
          <div
            className={`inline-alert ${message.includes('success') ? 'success' : 'error'}`}
          >
            {message}
          </div>
        )}

        <div className="glass-card stack">
          <div className="toolbar">
            <div>
              <p className="eyebrow">Saved plans</p>
              <h3>Plan overview</h3>
            </div>
            <button className="btn primary" onClick={addPlan}>
              + Add New Plan
            </button>
          </div>

          {plans.length > 0 ? (
            <div className="table-wrapper">
              <table className="data-table">
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
                      <td className="pill-row">
                        <button
                          className="btn subtle"
                          onClick={() => fetchPlanDetails(plan.PlanID)}
                        >
                          View Details
                        </button>
                        <button
                          className="btn danger"
                          onClick={() => deletePlan(plan.PlanID)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="subtle-card">No plans available yet.</div>
          )}
        </div>

        {selectedPlanID && (
          <div className="glass-card stack">
            <div className="toolbar">
              <div>
                <p className="eyebrow">Plan Details</p>
                <h3>Plan {selectedPlanID}</h3>
              </div>
              <span className="chip">{planDetails.length} course{planDetails.length === 1 ? '' : 's'}</span>
            </div>

            {planDetails.length > 0 ? (
              <div className="table-wrapper">
                <table className="data-table">
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
                            className="btn danger"
                            onClick={() => deleteCourse(course.CourseID)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="subtle-card">No courses in this plan.</div>
            )}

            <div className="section-heading">
              <div>
                <p className="eyebrow">Add course</p>
                <h4>Attach a course to this plan</h4>
              </div>
              <span className="chip soft">Saves instantly</span>
            </div>
            <form
              className="combined-page-form compact-form"
              onSubmit={addCourse}
            >
              <div className="field inline-field">
                <label>Plan</label>
                <input
                  type="text"
                  name="planid"
                  value={selectedPlanID || ''}
                  readOnly
                  className="input"
                />
              </div>
              <div className="field inline-field">
                <label>Course ID</label>
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
                  className="input"
                  placeholder="e.g., CS225"
                  required
                />
              </div>
              <div className="field inline-field">
                <label>Semester</label>
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
                  className="input"
                  placeholder="e.g., FA23"
                  required
                />
              </div>
              <div className="inline-actions">
                <span className="hint-text">Courses and semesters will auto-uppercase.</span>
                <button className="btn primary" type="submit">
                  Add Course
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default CombinedPage;
