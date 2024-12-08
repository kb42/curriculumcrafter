// import React, { useEffect, useState } from 'react';
// import axios from 'axios';

// function CombinedPage() {
//   const [netid, setNetID] = useState(localStorage.getItem('netid') || '')
//   const [plans, setPlans] = useState([]);
//   const [selectedPlanID, setSelectedPlanID] = useState(null);
//   const [planDetails, setPlanDetails] = useState([]);
//   const [message, setMessage] = useState('');
//   const [newPlanID, setNewPlanID] = useState(null);
//   const [newCourseData, setNewCourseData] = useState({
//     planid: '',
//     courseid: '',
//     credits: '',
//     semester: '',
//   });

//   // Fetch plans when the component mounts or when netid changes
//   useEffect(() => {
//     fetchPlans();
//   }, [netid]);

//   const fetchPlans = async () => {
//     try {
//       const response = await axios.get(`http://127.0.0.1:5000/api/student/${netid}/plans`);
//       setPlans(response.data);
//       setMessage('');
//     } catch (error) {
//       setMessage('Error fetching plans or no plans found.');
//       console.error(error);
//     }
//   };

//   const fetchPlanDetails = async (planID) => {
//     try {
//       const response = await axios.get(`http://127.0.0.1:5000/api/plan/${planID}`);
//       setPlanDetails(response.data);
//       setSelectedPlanID(planID);
//       setMessage('');
//     } catch (error) {
//       setMessage('Error fetching plan details.');
//       console.error(error);
//     }
//   };

//   const deletePlan = async (planID) => {
//     try {
//       await axios.delete(`http://127.0.0.1:5000/api/plan/${planID}`);
//       setPlans(plans.filter(plan => plan.PlanID !== planID));
//       if (planID === selectedPlanID) setPlanDetails([]);
//       setMessage('Plan deleted successfully.');
//     } catch (error) {
//       setMessage('Error deleting plan.');
//       console.error(error);
//     }
//   };

//   const addPlan = async () => {
//     try {
//       // Dynamically calculate the lowest available PlanID
//       const usedIDs = plans.map(plan => plan.PlanID);
//       const newPlanID = Math.max(0, ...usedIDs) + 1; // Find the next available ID
  
//       const response = await axios.post('http://127.0.0.1:5000/api/plan', { netid, planid: newPlanID });
  
//       if (response.status === 201) {
//         setMessage(`Plan with ID ${newPlanID} added successfully.`);
//         fetchPlans(); // Refresh the plans list
//       } else {
//         setMessage(response.data.error || 'Error adding new plan.');
//       }
//     } catch (error) {
//       setMessage('Error adding new plan.');
//       console.error(error);
//     }
//   };

//   const addCourse = async (e) => {
//     e.preventDefault();
  
//     if (!newCourseData.planid || !newCourseData.courseid || !newCourseData.credits || !newCourseData.semester) {
//       setMessage('All fields are required for adding a course.');
//       return;
//     }
  
//     try {
//       const response = await axios.post('http://127.0.0.1:5000/api/course', newCourseData);
  
//       if (response.status === 201) {
//         setMessage('Course added successfully.');
//         fetchPlanDetails(newCourseData.planid); // Refresh the plan details
//         setNewCourseData({ planid: '', courseid: '', credits: '', semester: '' });
//       } else {
//         setMessage(response.data.error || 'Error adding course.');
//       }
//     } catch (error) {
//       setMessage('Error adding course.');
//       console.error(error);
//     }
//   };

//   return (
//     <div style={{ padding: '20px' }}>
//       <h2>Academic Plans for {netid}</h2>

//       {message && <p style={{ color: 'red' }}>{message}</p>}

//       <button onClick={addPlan} style={{ marginBottom: '10px' }}>
//         Add New Plan
//       </button>

//       {plans.length > 0 ? (
//         <table border="1" style={{ borderCollapse: 'collapse', width: '100%' }}>
//           <thead>
//             <tr>
//               <th>PlanID</th>
//               <th>CreationDate</th>
//               <th>NetID</th>
//               <th>Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {plans.map(plan => (
//               <tr key={plan.PlanID}>
//                 <td>{plan.PlanID}</td>
//                 <td>{plan.CreationDate}</td>
//                 <td>{plan.NetID}</td>
//                 <td>
//                   <button onClick={() => fetchPlanDetails(plan.PlanID)}>View Details</button>
//                   <button onClick={() => deletePlan(plan.PlanID)} style={{ marginLeft: '10px' }}>
//                     Delete
//                   </button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       ) : (
//         <p>No plans available.</p>
//       )}

//       {selectedPlanID && (
//         <>
//           <h3>Plan Details for PlanID {selectedPlanID}</h3>
//           {planDetails.length > 0 ? (
//             <table border="1" style={{ borderCollapse: 'collapse', width: '100%' }}>
//               <thead>
//                 <tr>
//                   <th>CourseID</th>
//                   <th>Credits</th>
//                   <th>Semester</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {planDetails.map((course, index) => (
//                   <tr key={index}>
//                     <td>{course.CourseID}</td>
//                     <td>{course.Credits}</td>
//                     <td>{course.Semester}</td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           ) : (
//             <p>No courses in this plan.</p>
//           )}

//           <h4>Add Course to Plan</h4>
//           <form onSubmit={addCourse}>
//             <label>
//               PlanID:
//               <input
//                 type="text"
//                 name="planid"
//                 value={newCourseData.planid}
//                 onChange={(e) => setNewCourseData({ ...newCourseData, planid: e.target.value })}
//               />
//             </label>
//             <label>
//               CourseID:
//               <input
//                 type="text"
//                 name="courseid"
//                 value={newCourseData.courseid}
//                 onChange={(e) => setNewCourseData({ ...newCourseData, courseid: e.target.value })}
//               />
//             </label>
//             <label>
//               Credits:
//               <input
//                 type="text"
//                 name="credits"
//                 value={newCourseData.credits}
//                 onChange={(e) => setNewCourseData({ ...newCourseData, credits: e.target.value })}
//               />
//             </label>
//             <label>
//               Semester:
//               <input
//                 type="text"
//                 name="semester"
//                 value={newCourseData.semester}
//                 onChange={(e) => setNewCourseData({ ...newCourseData, semester: e.target.value })}
//               />
//             </label>
//             <button type="submit">Add Course</button>
//           </form>
//         </>
//       )}
//     </div>
//   );
// }

// export default CombinedPage;







import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './CombinedPage.css';

function CombinedPage() {
  const [netid, setNetID] = useState(localStorage.getItem('netid') || '') 
  const [plans, setPlans] = useState([]);
  const [selectedPlanID, setSelectedPlanID] = useState(null);
  const [planDetails, setPlanDetails] = useState([]);
  const [message, setMessage] = useState('');
  const [newCourseData, setNewCourseData] = useState({
    planid: '',
    courseid: '',
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

  const deleteCourse = async (courseID) => {
    try {
      const response = await axios.delete(`http://127.0.0.1:5000/api/plan/${selectedPlanID}/course/${courseID}`);
      setMessage(response.data.message);
      fetchPlanDetails(selectedPlanID); // Refresh the plan details
    } catch (error) {
      setMessage('Error deleting course.');
      console.error('Error deleting course:', error);
    }
  };

  const addPlan = async () => {
    try {
      const payload = { netid }; // Only pass the netid, backend handles planid
      const response = await axios.post('http://127.0.0.1:5000/api/plan', payload);

      if (response.status === 201) {
        setMessage(response.data.message);
        fetchPlans(); // Refresh the plans list
      } else {
        setMessage(response.data.error || 'Error adding new plan.');
      }
    } catch (error) {
      console.error('Error adding new plan:', error);
      setMessage('Error adding new plan.');
    }
  };

  const addCourse = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior

    const payload = {
      planid: newCourseData.planid,
      courseid: newCourseData.courseid.toUpperCase(),
      semester: newCourseData.semester.toUpperCase(),
    };

    try {
      const response = await axios.post('http://127.0.0.1:5000/api/course', payload);

      if (response.status === 201) {
        setMessage(response.data.message);
        fetchPlanDetails(newCourseData.planid); // Refresh the plan details
      } else {
        setMessage(response.data.error || 'Error adding new course.');
      }
    } catch (error) {
      console.error('Error adding new course:', error);
      setMessage('Error adding new course.');
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
            {plans.map(plan => (
              <tr key={plan.PlanID}>
                <td>{plan.PlanID}</td>
                <td>{plan.CreationDate}</td>
                <td>{plan.NetID}</td>
                <td>
                  <button className="combined-page-button" onClick={() => fetchPlanDetails(plan.PlanID)}>
                    View Details
                  </button>
                  <button className="combined-page-button" onClick={() => deletePlan(plan.PlanID)}>
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
                {planDetails.map((course, index) => (
                  <tr key={index}>
                    <td>{course.CourseID}</td>
                    <td>{course.Semester}</td>
                    <td>
                      <button className="combined-page-button" onClick={() => deleteCourse(course.CourseID)}>
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
        <form className="combined-page-form" onSubmit={addCourse}>
        <label>
            PlanID:
            <input
            type="text"
            name="planid"
            value={newCourseData.planid}
            onChange={(e) => setNewCourseData({ ...newCourseData, planid: e.target.value })}
            required
            />
        </label>
        <label>
            CourseID:
            <input
            type="text"
            name="courseid"
            value={newCourseData.courseid}
            onChange={(e) => setNewCourseData({ ...newCourseData, courseid: e.target.value })}
            required
            />
        </label>
        <label>
            Semester:
            <input
            type="text"
            name="semester"
            value={newCourseData.semester}
            onChange={(e) => setNewCourseData({ ...newCourseData, semester: e.target.value })}
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