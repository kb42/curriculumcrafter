// src/components/CourseGraph.js
import React, { useState, useEffect, useCallback } from 'react';
import { Network } from 'vis-network/standalone';
import './CourseGraph.css';
import API_BASE_URL from '../config';

function CourseGraph({ selectedCourse }) {
  const [graphData, setGraphData] = useState({ nodes: [], edges: [] });
  const [message, setMessage] = useState('');

  const fetchPrerequisiteGraph = useCallback(
    async (courseID) => {
      if (!courseID) return;
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/course/${courseID}/prerequisite-graph`
        );
        if (!response.ok) {
          setMessage('Invalid Search');
          setGraphData({ nodes: [], edges: [] });
          return;
        }
        const graph = await response.json();
        if (graph.nodes.length === 0) {
          setMessage('No Prerequisites for this course');
          setGraphData({ nodes: [], edges: [] });
          return;
        }
        const colors = ['#4CAF50', '#2196F3', '#FFC107', '#FF5722'];
        const nodes = graph.nodes.map((node, idx) => ({
          id: node.id,
          label: node.label,
          color: node.isRoot
            ? '#FF5733'
            : colors[idx % colors.length],
          font: { size: 18, color: '#fff' },
          size: node.isRoot ? 50 : 40,
        }));
        const edges = graph.edges.map((edge) => ({
          from: edge.from,
          to: edge.to,
          color: { color: '#848484', highlight: '#4CAF50', hover: '#2196F3' },
          arrows: 'to',
        }));
        setGraphData({ nodes, edges });
        setMessage('');
      } catch (error) {
        console.error('Error:', error);
        setMessage('Invalid Search');
        setGraphData({ nodes: [], edges: [] });
      }
    },
    []
  );

  // renderGraph only changes when graphData changes
  const renderGraph = useCallback(() => {
    const container = document.getElementById('course-graph');
    if (
      container &&
      graphData.nodes.length > 0 &&
      graphData.edges.length > 0
    ) {
      const network = new Network(container, graphData, {
        layout: {
          hierarchical: {
            enabled: true,
            levelSeparation: 200,
            nodeSpacing: 150,
            direction: 'LR',
          },
        },
        nodes: { shape: 'circle', borderWidth: 2, shadow: true },
        edges: {
          smooth: { type: 'cubicBezier', roundness: 0.5 },
          arrows: { to: { enabled: true, scaleFactor: 0.8 } },
        },
        interaction: { hover: true, zoomView: true },
      });
      network.on('click', (params) => {
        if (params.nodes.length > 0) {
          fetchPrerequisiteGraph(params.nodes[0]);
        }
      });
    }
  }, [graphData, fetchPrerequisiteGraph]);

  useEffect(() => {
    if (selectedCourse) {
      fetchPrerequisiteGraph(selectedCourse);
    } else {
      setGraphData({ nodes: [], edges: [] });
      setMessage('');
    }
  }, [selectedCourse, fetchPrerequisiteGraph]);

  useEffect(() => {
    renderGraph();
  }, [renderGraph]);

  return (
    <div className="glass-card stack graph-card">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Graph</p>
          <h3>Course Prerequisite Path</h3>
        </div>
        <span className="chip">{selectedCourse || 'Select a course'}</span>
      </div>
      {message && (
        <div className="inline-alert error" style={{ justifyContent: 'center' }}>
          {message}
        </div>
      )}
      <div
        id="course-graph"
        className="graph-canvas"
      />
    </div>
  );
}

export default CourseGraph;
