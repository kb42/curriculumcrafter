import React from 'react';
import { Link } from 'react-router-dom';
import './About.css';

function About() {
  return (
    <div className="page-shell">
      <div className="page-grid">
        <div className="glass-card hero-card about-hero">
          <div className="section-heading">
            <div>
              <p className="eyebrow">About</p>
              <h1>Curriculum Crafter</h1>
              <p className="muted-strong">
                A modern planning companion that turns messy course requirements into a clear graduation story.
              </p>
            </div>
            <div className="badge-row">
              <span className="tag accent">Prototype</span>
              <span className="tag soft">Design refresh</span>
            </div>
          </div>

          <div className="callout">
            Reminder: this build is still in prototype mode. Some features are intentionally lightweight while the experience is being tuned.
          </div>

          <div className="cta-row">
            <Link className="btn primary" to="/login">Go to Login</Link>
            <Link className="btn ghost" to="/combinedpage">View Plans</Link>
            <Link className="btn ghost" to="/courses">Browse Courses</Link>
            <Link className="btn ghost" to="/prerequisites">Prereqs</Link>
          </div>
        </div>

        <div className="card-grid">
          <section className="glass-card info-card">
            <h3>Project Summary</h3>
            <p>
              Our project is a web application that assists learners in designing their own customized lesson plans. It creates a plan based on data from previous courses, transfer credits, AP credits, and competency test scores. The app allows users to input their academic objectives and desired courses, and it generates a personalized plan that illustrates the most efficient route to graduation.
            </p>
            <p className="muted">
              We factor in prerequisites, graduation requirements, and even early-graduation options so students always see the clearest next step.
            </p>
          </section>

          <section className="glass-card info-card">
            <h3>What We Want to Do</h3>
            <ul className="list-reset">
              <li>Accumulate academic data from student history and map it with Transferology, AP credits, and departmental policies.</li>
              <li>Generate a course graph based on student inputs like interests, major, and expected graduation timeline.</li>
              <li>Optimize graduation paths by analyzing course prerequisites, graduation requirements, and credit overlaps.</li>
              <li>Provide visual tools such as interactive timelines and progress charts to help students track their academic journey.</li>
            </ul>
          </section>
        </div>

        <div className="card-grid">
          <section className="glass-card info-card">
            <h3>Problem We Want to Solve</h3>
            <p>
              Students juggle credits, policies, and prerequisites every semester. Curriculum Crafter simplifies the chaos with a single, visual source of truth that keeps them aligned to their goals.
            </p>
          </section>

          <section className="glass-card info-card">
            <h3>Good Creative Component</h3>
            <p>
              We are building an interactive academic map that shows courses as connected nodes. As students adjust their plan, the map responds in real time, highlighting impacts on timelines and prerequisites.
            </p>
          </section>
        </div>

        <div className="card-grid">
          <section className="glass-card info-card">
            <h3>Realness</h3>
            <p>
              We pull from AP credit policies, Course Explorer, proficiency exams, and Transferology to keep guidance grounded in live rules and transfer equivalents.
            </p>
          </section>

          <section className="glass-card info-card">
            <h3>Usefulness</h3>
            <p>
              Registration stress is universal. This tool reduces it by clarifying requirements, surfacing smart options, and keeping progress visible.
            </p>
          </section>
        </div>

        <div className="card-grid">
          <section className="glass-card info-card">
            <h3>Data Sources</h3>
            <ul className="list-reset">
              <li><a href="https://citl.illinois.edu/citl-101/measurement-evaluation/placement-proficiency/cutoffs-2024-2025/2024-advanced-placement-program" target="_blank" rel="noreferrer">2024 Advanced Placement Program</a></li>
              <li><a href="https://citl.illinois.edu/citl-101/measurement-evaluation/placement-proficiency/proficiency-testing/subjects-with-proficiency-exams" target="_blank" rel="noreferrer">Departmental Proficiency Exams</a></li>
              <li><a href="https://www.transferology.com/index.htm" target="_blank" rel="noreferrer">Transferology</a></li>
              <li><a href="https://courses.illinois.edu/" target="_blank" rel="noreferrer">Course Explorer</a></li>
            </ul>
          </section>

          <section className="glass-card info-card">
            <h3>Work Distribution</h3>
            <ul className="list-reset">
              <li>Kundan Mergu: Frontend Development, UI/UX Design, Data Visualization</li>
              <li>Karthik Bagavathy: Backend Development, Data Integration, API Requests</li>
              <li>Vashishth Goswami: Data Collection, Data Cleaning, Data Analysis</li>
              <li>Harshita Thota: Project Management, Documentation, Testing, Product Design</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}

export default About;
