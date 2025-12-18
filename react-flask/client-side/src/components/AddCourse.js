import React from 'react';
import './AddCourse.css'; // Import the CSS file

function AddCourse() {
  return (
    <div className="page-shell">
      <div className="page-grid">
        <div className="glass-card hero-card">
          <p className="eyebrow">Course Admin</p>
          <h1>Add Course</h1>
          <p className="muted-strong">
            Drop in a new course so it can be surfaced across search, prerequisites, and planning flows.
          </p>
          <div className="badge-row" style={{ marginTop: '16px' }}>
            <span className="tag accent">Quick add</span>
            <span className="tag soft">Staff only</span>
          </div>
        </div>

        <div className="glass-card">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Course details</p>
              <h3>Core information</h3>
            </div>
            <span className="chip">Manual entry</span>
          </div>

          <form
            id="add-course-form"
            className="form-grid"
            onSubmit={(e) => e.preventDefault()}
          >
            <div className="field">
              <label htmlFor="courseid">Course ID</label>
              <input
                type="text"
                id="courseid"
                name="courseid"
                placeholder="CS 411"
                className="input"
              />
            </div>

            <div className="field">
              <label htmlFor="credits">Credits</label>
              <input
                type="text"
                id="credits"
                name="credits"
                placeholder="3"
                className="input"
              />
            </div>

            <button type="submit" className="btn primary">
              Submit
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddCourse;
