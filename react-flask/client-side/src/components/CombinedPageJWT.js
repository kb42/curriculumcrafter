// src/components/CombinedPageJWT.js
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './CombinedPage.css';
import { authGet, authPost, authDelete, isAuthenticated, logout } from '../utils/api';

function CombinedPageJWT() {
  const navigate = useNavigate();
  const netid = localStorage.getItem('netid') || '';
  const userName = localStorage.getItem('name') || '';
  const [plans, setPlans] = useState([]);
  const [selectedPlanID, setSelectedPlanID] = useState(null);
  const [planDetails, setPlanDetails] = useState([]);
  const [message, setMessage] = useState('');

  // Check authentication on mount
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
    }
  }, [navigate]);

  // fetchPlans is now stable (recreated only when netid changes)
  const fetchPlans = useCallback(async () => {
    try {
      const response = await authGet(`/api/student/${netid}/plans`);
      const data = await response.json();

      if (response.ok) {
        setPlans(data);
        setMessage('');
      } else {
        setMessage(data.error || 'Error fetching plans');
      }
    } catch (error) {
      setMessage('Error fetching plans or no plans found.');
      console.error(error);
    }
  }, [netid]);

  useEffect(() => {
    if (netid) {
      fetchPlans();
    }
  }, [fetchPlans, netid]);

  const fetchPlanDetails = useCallback(
    async (planID) => {
      try {
        const response = await authGet(`/api/plan/${planID}`);
        const data = await response.json();

        if (response.ok) {
          setPlanDetails(data);
          setSelectedPlanID(planID);
          setMessage('');
        } else {
          setMessage(data.error || 'Error fetching plan details');
        }
      } catch (error) {
        setMessage('Error fetching plan details.');
        console.error(error);
      }
    },
    []
  );

  const deletePlan = useCallback(
    async (planID) => {
      if (!window.confirm('Are you sure you want to delete this plan?')) {
        return;
      }

      try {
        const response = await authDelete(`/api/plan/${planID}`);
        const data = await response.json();

        if (response.ok) {
          setPlans((p) => p.filter((plan) => plan.PlanID !== planID));
          if (planID === selectedPlanID) setPlanDetails([]);
          setMessage('Plan deleted successfully.');
        } else {
          setMessage(data.error || 'Error deleting plan');
        }
      } catch (error) {
        setMessage('Error deleting plan.');
        console.error(error);
      }
    },
    [selectedPlanID]
  );

  const deleteCourse = useCallback(
    async (courseID) => {
      if (!window.confirm('Are you sure you want to remove this course?')) {
        return;
      }

      try {
        const response = await authDelete(`/api/plan/${selectedPlanID}/course/${courseID}`);
        const data = await response.json();

        if (response.ok) {
          setMessage(data.message || 'Course removed successfully');
          fetchPlanDetails(selectedPlanID);
        } else {
          setMessage(data.error || 'Error deleting course');
        }
      } catch (error) {
        setMessage('Error deleting course.');
        console.error(error);
      }
    },
    [selectedPlanID, fetchPlanDetails]
  );

  const addPlan = useCallback(async () => {
    try {
      const response = await authPost('/api/plan', { netid });
      const data = await response.json();

      if (response.ok) {
        setMessage(data.message || 'Plan created successfully');
        fetchPlans();
      } else {
        setMessage(data.error || 'Error adding new plan.');
      }
    } catch (error) {
      console.error('Error adding new plan:', error);
      setMessage('Error adding new plan.');
    }
  }, [netid, fetchPlans]);

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
    }
  };

  return (
    <div className="page-shell">
      <div className="page-grid">
        <div className="glass-card hero-card">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Plans</p>
              <h1>Academic Plans for {userName} ({netid})</h1>
              <p className="muted">
                Manage your authenticated plans with the refreshed layout. Everything stays consistent with the login experience.
              </p>
            </div>
            <div className="badge-row">
              <span className="tag accent">{plans.length} plan{plans.length === 1 ? '' : 's'}</span>
              <button className="btn ghost" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </div>
          <div className="pill-row">
            <span className="chip">JWT protected</span>
            <span className="chip success">Synced state</span>
          </div>
        </div>

        {message && (
          <div
            className={`inline-alert ${message.toLowerCase().includes('success') ? 'success' : 'error'}`}
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
                    <th>Plan ID</th>
                    <th>Creation Date</th>
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
            <p className="no-data-message">No plans available. Create your first plan!</p>
          )}
        </div>

        {selectedPlanID && (
          <div className="glass-card stack">
            <div className="toolbar">
              <div>
                <p className="eyebrow">Plan Details</p>
                <h3>Plan ID: {selectedPlanID}</h3>
              </div>
              <span className="chip">{planDetails.length} course{planDetails.length === 1 ? '' : 's'}</span>
            </div>

            {planDetails.length > 0 ? (
              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Course ID</th>
                      <th>Semester</th>
                      <th>Credits</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {planDetails.map((course, idx) => (
                      <tr key={idx}>
                        <td>{course.CourseID}</td>
                        <td>{course.Semester}</td>
                        <td>{course.Credits}</td>
                        <td>
                          <button
                            className="btn danger"
                            onClick={() => deleteCourse(course.CourseID)}
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="no-data-message">No courses in this plan yet.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default CombinedPageJWT;
