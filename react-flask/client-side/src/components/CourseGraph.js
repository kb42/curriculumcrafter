import React, { useState, useEffect } from 'react';
import { Network } from 'vis-network/standalone';
import './CourseGraph.css';

function CourseGraph() {
  const [searchTerm, setSearchTerm] = useState('');
  const [graphData, setGraphData] = useState({ nodes: [], edges: [] });
  const [message, setMessage] = useState('');

  const fetchPrerequisiteGraph = async (courseID) => {
    try {
      const response = await fetch(`http://127.0.0.1:5000/api/course/${courseID}/prerequisite-graph`);
      if (response.ok) {
        const graph = await response.json();

        if (graph.nodes.length === 0) {
          setMessage('No Prerequisites for this course');
          setGraphData({ nodes: [], edges: [] }); // Clear the graph
          return;
        }

        const colors = ['#4CAF50', '#2196F3', '#FFC107', '#FF5722']; // Green, Blue, Yellow, Red
        const nodes = graph.nodes.map((node, index) => ({
          id: node.id,
          label: node.label,
          color: node.isRoot
            ? '#FF5733' // Unique color for the root node
            : colors[index % colors.length], // Assign colors cyclically
          font: { size: 18, color: '#fff' },
          size: node.isRoot ? 50 : 40, // Larger size for root node
        }));

        const edges = graph.edges.map((edge) => ({
          from: edge.from,
          to: edge.to,
          color: { color: '#848484', highlight: '#4CAF50', hover: '#2196F3' },
          arrows: 'to',
        }));

        setGraphData({ nodes, edges });
        setMessage(''); // Clear any previous messages
      } else {
        setMessage('Invalid Search');
        setGraphData({ nodes: [], edges: [] }); // Clear the graph
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('Invalid Search');
      setGraphData({ nodes: [], edges: [] }); // Clear the graph
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm) {
      fetchPrerequisiteGraph(searchTerm);
    }
  };

  const renderGraph = () => {
    const container = document.getElementById('course-graph');
    if (graphData.nodes.length && graphData.edges.length) {
      const network = new Network(container, graphData, {
        layout: {
          hierarchical: {
            enabled: true,
            levelSeparation: 200, // Horizontal spacing
            nodeSpacing: 150, // Vertical spacing
            direction: 'LR', // Left-to-right layout
          },
        },
        nodes: {
          shape: 'circle',
          borderWidth: 2,
          shadow: true,
        },
        edges: {
          smooth: {
            type: 'cubicBezier',
            roundness: 0.5,
          },
          arrows: { to: { enabled: true, scaleFactor: 0.8 } },
        },
        interaction: {
          hover: true,
          zoomView: true,
        },
      });

      // Attach event listener for node clicks
      network.on('click', (params) => {
        if (params.nodes.length > 0) {
          const clickedNodeId = params.nodes[0];
          setSearchTerm(clickedNodeId); // Update search term to match clicked course
          fetchPrerequisiteGraph(clickedNodeId); // Fetch the graph for the clicked course
        }
      });
    }
  };

  useEffect(() => {
    renderGraph();
  }, [graphData]);

  return (
    <div>
      <h2 style={{ textAlign: 'center' }}>Course Prerequisite Path</h2>
      <form onSubmit={handleSearch} style={{ textAlign: 'center', marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Enter Course ID"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            padding: '10px',
            width: '300px',
            borderRadius: '5px',
            border: '1px solid #ccc',
            marginRight: '10px',
          }}
        />
        <button
          type="submit"
          style={{
            padding: '10px 20px',
            borderRadius: '5px',
            backgroundColor: '#007BFF',
            color: '#fff',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Search
        </button>
      </form>

      {message && (
        <div
          style={{
            backgroundColor: '#FFECEC',
            color: '#D8000C',
            padding: '10px',
            margin: '10px auto',
            borderRadius: '5px',
            width: '50%',
            textAlign: 'center',
            border: '1px solid #D8000C',
            fontWeight: 'bold',
          }}
        >
          {message}
        </div>
      )}

      <div
        id="course-graph"
        style={{
          width: '100%',
          height: '700px',
          border: '1px solid #ddd',
          borderRadius: '8px',
          backgroundColor: '#f9f9f9',
        }}
      />
    </div>
  );
}

export default CourseGraph;
