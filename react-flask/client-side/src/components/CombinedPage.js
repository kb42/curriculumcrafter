import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './CombinedPage.css';
import APCreditPopup from './popup';

function CombinedPage() {
  // State definitions
  const [netid, setNetID] = useState(localStorage.getItem('netid') || '');
  const [plans, setPlans] = useState([]);
  const [selectedPlanID, setSelectedPlanID] = useState(null);
  const [planDetails, setPlanDetails] = useState([]);
  const [message, setMessage] = useState('');
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [showAPForm, setShowAPForm] = useState(false);
  const [apCourses, setAPCourses] = useState([]);
  const [showAPPopup, setShowAPPopup] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [newCourseData, setNewCourseData] = useState({
    courseid: '',
    semester: '',
  });

  const [newAPData, setNewAPData] = useState({
    apCredit: '',
    apScore: '',
  });

  // Fetch initial data
  useEffect(() => {
    if (netid) {
      fetchPlans();
    }
  }, [netid]);

  // Fetch AP courses when form is shown
  useEffect(() => {
    if (showAPForm) {
      console.log('AP form shown, fetching courses...');
      fetchAPCourses();
    }
  }, [showAPForm]);

  // API calls
  const fetchPlans = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`http://127.0.0.1:5000/api/student/${netid}/plans`);
      setPlans(response.data);
      setMessage('');
    } catch (error) {
      console.error('Error fetching plans:', error);
      setMessage('Error fetching plans or no plans found.');
    } finally {
      setIsLoading(false);
    }
  };

  const getTotalCredits = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`http://127.0.0.1:5000/api/students/total-credits/${netid}`);
      if (response.data && response.data.length > 0) {
        setMessage(`Total Planned Credits: ${response.data[0].Total_Planned_Credits}`);
      } else {
        setMessage('No credits information found');
      }
    } catch (error) {
      console.error('Error fetching total credits:', error);
      setMessage('Error fetching total credits');
    } finally {
      setIsLoading(false);
    }
  };
  
  const getRequirementsFulfilled = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`http://127.0.0.1:5000//api/students/requirements/${netid}`);
      if (response.data && response.data.length > 0) {
        const courses = response.data.map(r => r.CourseID).join(', ');
        setMessage(`Requirements Fulfilled: ${courses}`);
      } else {
        setMessage('No requirements fulfilled yet');
      }
    } catch (error) {
      console.error('Error fetching requirements:', error);
      setMessage('Error fetching requirements fulfilled');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAPCourses = async () => {
    try {
      console.log('Fetching AP courses...');
      setIsLoading(true);
      const response = await axios.get('http://127.0.0.1:5000/api/ap-courses');
      console.log('AP courses response:', response.data);
      
      if (Array.isArray(response.data)) {
        setAPCourses(response.data);
      } else {
        console.error('Unexpected AP courses response format:', response.data);
        setAPCourses([]);
        setMessage('Error loading AP courses.');
      }
    } catch (error) {
      console.error('Error fetching AP courses:', error);
      setAPCourses([]);
      setMessage('Error loading AP courses.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPlanDetails = async (planID) => {
    try {
      setIsLoading(true);
      const response = await axios.get(`http://127.0.0.1:5000/api/plan/${planID}`);
      setPlanDetails(response.data);
      setSelectedPlanID(planID);
      setShowCourseForm(false);
      setShowAPForm(false);
      setMessage('');
    } catch (error) {
      console.error('Error fetching plan details:', error);
      setMessage('Error fetching plan details.');
    } finally {
      setIsLoading(false);
    }
  };

  // Validation functions
  const validateAPScore = (score) => {
    const numScore = Number(score);
    if (!Number.isInteger(numScore) || numScore < 1 || numScore > 5) {
      setMessage('AP Score must be an integer between 1 and 5');
      return false;
    }
    return true;
  };

  // Form handling
  const handleAPSubmit = async ({ semester }) => {
    try {
      setIsLoading(true);
      // First get the CourseID based on AP Course and Score
      const apResponse = await axios.get('http://127.0.0.1:5000/api/ap-course-mapping', {
        params: {
          courseName: newAPData.apCredit,
          score: newAPData.apScore
        }
      });
      
      // If we got a valid CourseID, add it as a regular course
      if (apResponse.data.CourseID) {
        const payload = {
          planid: selectedPlanID,
          courseid: apResponse.data.CourseID, // Use the mapped CourseID
          semester: semester.toUpperCase()
        };
  
        // Use the existing course addition endpoint
        const response = await axios.post('http://127.0.0.1:5000/api/course', payload);
        
        if (response.status === 201) {
          setMessage('AP credit course added successfully');
          fetchPlanDetails(selectedPlanID);
          setShowAPForm(false);
          setNewAPData({ apCredit: '', apScore: '' });
        }
      }
    } catch (error) {
      console.error('Error adding AP credit course:', error);
      setMessage(error.response?.data?.error || 'Error adding AP credit course');
    } finally {
      setIsLoading(false);
      setShowAPPopup(false);
    }
  };

  const addAPCredit = async (e) => {
    e.preventDefault();
    
    if (!validateAPScore(newAPData.apScore)) {
      return;
    }
    
    setShowAPPopup(true);
  };

  const addCourse = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const payload = {
        planid: selectedPlanID,
        courseid: newCourseData.courseid.toUpperCase(),
        semester: newCourseData.semester.toUpperCase(),
      };

      const response = await axios.post('http://127.0.0.1:5000/api/course', payload);
      if (response.status === 201) {
        setMessage('Course added successfully');
        fetchPlanDetails(selectedPlanID);
        setShowCourseForm(false);
        setNewCourseData({ courseid: '', semester: '' });
      }
    } catch (error) {
      console.error('Error adding course:', error);
      setMessage(error.response?.data?.error || 'Error adding course');
    } finally {
      setIsLoading(false);
    }
  };

  // Delete operations
  const deletePlan = async (planID) => {
    try {
      setIsLoading(true);
      await axios.delete(`http://127.0.0.1:5000/api/plan/${planID}`);
      setPlans(plans.filter(plan => plan.PlanID !== planID));
      if (planID === selectedPlanID) {
        setPlanDetails([]);
        setShowCourseForm(false);
        setShowAPForm(false);
      }
      setMessage('Plan deleted successfully');
    } catch (error) {
      console.error('Error deleting plan:', error);
      setMessage('Error deleting plan');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteCourse = async (courseID) => {
    try {
      setIsLoading(true);
      await axios.delete(`http://127.0.0.1:5000/api/plan/${selectedPlanID}/course/${courseID}`);
      setMessage('Course deleted successfully');
      fetchPlanDetails(selectedPlanID);
    } catch (error) {
      console.error('Error deleting course:', error);
      setMessage('Error deleting course');
    } finally {
      setIsLoading(false);
    }
  };

  // Add new plan
  const addPlan = async () => {
    try {
      setIsLoading(true);
      const response = await axios.post('http://127.0.0.1:5000/api/plan', { netid });
      if (response.status === 201) {
        setMessage('Plan added successfully');
        fetchPlans();
      }
    } catch (error) {
      console.error('Error adding plan:', error);
      setMessage(error.response?.data?.error || 'Error adding plan');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="combined-page-container">
      <h2>Academic Plans for {netid}</h2>

      {message && (
        <p className={`combined-page-message ${message.includes('success') ? 'success' : 'error'}`}>
          {message}
        </p>
      )}

      <button 
        className="combined-page-button" 
        onClick={addPlan}
        disabled={isLoading}
      >
        {isLoading ? 'Adding...' : 'Add New Plan'}
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
            {plans.map(plan => (
              <tr key={plan.PlanID}>
                <td>{plan.PlanID}</td>
                <td>{plan.CreationDate}</td>
                <td>{plan.NetID}</td>
                <td>
                  <button 
                    className="combined-page-button" 
                    onClick={() => fetchPlanDetails(plan.PlanID)}
                    disabled={isLoading}
                  >
                    View Details
                  </button>
                  <button 
                    className="combined-page-button" 
                    onClick={() => deletePlan(plan.PlanID)}
                    disabled={isLoading}
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

          <div className="plan-actions">
            <button 
              className="combined-page-button"
              onClick={getTotalCredits}
              disabled={isLoading}
            >
              View Total Credits
            </button>
            <button 
              className="combined-page-button"
              onClick={getRequirementsFulfilled}
              disabled={isLoading}
            >
              View Requirements Fulfilled
            </button>
            <button 
              className="combined-page-button"
              onClick={() => {
                setShowCourseForm(true);
                setShowAPForm(false);
              }}
              disabled={isLoading}
            >
              Add Course
            </button>
            <button 
              className="combined-page-button"
              onClick={() => {
                setShowAPForm(true);
                setShowCourseForm(false);
              }}
              disabled={isLoading}
            >
              Add AP Credit
            </button>
          </div>

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
                {planDetails.map((course, index) => (
                  <tr key={index}>
                    <td>{course.CourseID}</td>
                    <td>{course.Semester}</td>
                    <td>
                      <button 
                        className="combined-page-button" 
                        onClick={() => deleteCourse(course.CourseID)}
                        disabled={isLoading}
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

          {showCourseForm && (
            <div className="form-container">
              <h4>Add Course to Plan</h4>
              <form className="combined-page-form" onSubmit={addCourse}>
                <label>
                  CourseID:
                  <input
                    type="text"
                    value={newCourseData.courseid}
                    onChange={(e) => setNewCourseData({ ...newCourseData, courseid: e.target.value })}
                    required
                    disabled={isLoading}
                  />
                </label>
                <label>
                  Semester:
                  <input
                    type="text"
                    value={newCourseData.semester}
                    onChange={(e) => setNewCourseData({ ...newCourseData, semester: e.target.value })}
                    required
                    disabled={isLoading}
                  />
                </label>
                <button 
                  className="combined-page-button" 
                  type="submit"
                  disabled={isLoading}
                >
                  {isLoading ? 'Adding...' : 'Add Course'}
                </button>
              </form>
            </div>
          )}

          {showAPForm && (
            <div className="form-container">
              <h4>Add AP Credit to Plan</h4>
              <form className="combined-page-form" onSubmit={addAPCredit}>
                <label>
                  AP Credit:
                  <select
                    value={newAPData.apCredit}
                    onChange={(e) => setNewAPData({ ...newAPData, apCredit: e.target.value })}
                    required
                    className="combined-page-select"
                    disabled={isLoading || !apCourses.length}
                  >
                    <option value="">Select AP Course</option>
                    {apCourses.map((course, index) => (
                      <option key={index} value={course.CourseName}>
                        {course.CourseName}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  AP Score:
                  <select
                    value={newAPData.apScore}
                    onChange={(e) => setNewAPData({ ...newAPData, apScore: e.target.value })}
                    required
                    className="combined-page-select"
                    disabled={isLoading}
                  >
                    <option value="">Select AP Score</option>
                    {[1, 2, 3, 4, 5].map((score) => (
                      <option key={score} value={score}>
                        {score}
                      </option>
                    ))}
                  </select>
                </label>
                <button 
                  className="combined-page-button" 
                  type="submit"
                  disabled={isLoading || !apCourses.length}
                >
                  {isLoading ? 'Adding...' : 'Add AP Credit'}
                </button>
              </form>
            </div>
          )}
        </>
      )}
      
      <APCreditPopup
        show={showAPPopup}
        apCredit={newAPData.apCredit}
        apScore={newAPData.apScore}
        onClose={() => setShowAPPopup(false)}
        onSubmit={handleAPSubmit}
      />

      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
        </div>
      )}
    </div>
  );
}

export default CombinedPage;