import React, { useState, useEffect } from "react";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend } from "chart.js";
import "./App.css";

// Register ChartJS Components
ChartJS.register(BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend);


function App() {
  const [jobTitle, setJobTitle] = useState("");
  const [jobResults, setJobResults] = useState([]); // Store search results
  const [location, setLocation] = useState(""); // Add location input
  const [company, setCompany] = useState("");
  const [status, setStatus] = useState("Applied");
  const [jobType, setJobType] = useState("Full-time");
  const [priority, setPriority] = useState("Medium");
  const [applicationDate, setApplicationDate] = useState("");
  const [deadline, setDeadline] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [tags, setTags] = useState(""); 
  const [interviewDate, setInterviewDate] = useState("");
  const [resumeFile, setResumeFile] = useState(null);
  const [jobList, setJobList] = useState([]);
  const [editingJobId, setEditingJobId] = useState(null); // For tracking the job being edited
  const [jobStats, setJobStats] = useState({
    applied: 0,
    interviews: 0,
    rejected: 0,
    offers: 0
  });
  
  // Fetch jobs from backend
  const fetchJobs = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:5000/jobs");
      setJobList(response.data);
    } catch (error) {
      console.error("Error fetching jobs:", error.response?.data || error.message);
    }
  };

  // Fetch Jobs from API
  const searchJobs = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:5000/search-jobs", {
        params: { query: jobTitle, location: location || "United States" } // ✅ Default if empty
      });
      setJobResults(response.data.jobs);
    } catch (error) {
      console.error("Error searching jobs:", error.response?.data || error.message);
    }
  };

  // Fetch Job Stats for Dashboard
  const fetchJobStats = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:5000/job-stats");
      setJobStats(response.data);
    } catch (error) {
      console.error("Error fetching job stats:", error.response?.data || error.message);
    }
  };

  useEffect(() => {
    fetchJobs();
    fetchJobStats();
  }, []);  


  const handleMatchResume = async (jobId) => {
    try {
      const response = await axios.get(`http://127.0.0.1:5000/match-resume/${jobId}`);
      alert(`Resume Match Score: ${response.data.match_score}%`);
    } catch (error) {
      console.error("Error matching resume:", error.response?.data || error.message);
    }
  };
  

  // Add or Update Job
  const handleSubmit = async (e) => {
    e.preventDefault();

    const jobData = {
      title: jobTitle,
      company: company,
      status: status,
      job_type: jobType,
      priority: priority,
      application_date: applicationDate,
      deadline: deadline || null,
      description: jobDescription,
      tags: tags.split(",").map(tag => tag.trim()),
      interview_date: interviewDate || null,
    };

    try {
      if (editingJobId) {
        await axios.put(`http://127.0.0.1:5000/edit-job/${editingJobId}`, jobData);
        alert("Job updated successfully!");
      } else {
        await axios.post("http://127.0.0.1:5000/add-job", jobData);
        alert("Job added successfully!");
      }
      clearForm();
      fetchJobs();
    } catch (error) {
      console.error("Error saving job:", error.response?.data || error.message);
    }
  };

  // Delete job function
  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://127.0.0.1:5000/delete-job/${id}`);
      alert("Job deleted successfully!");
      fetchJobs();
    } catch (error) {
      console.error("Error deleting job:", error.response?.data || error.message);
    }
  };

  // Upload Resume
  const handleResumeUpload = async (jobId) => {
    if (!resumeFile) {
      alert("Please select a file first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", resumeFile);

    try {
      await axios.post(`http://127.0.0.1:5000/upload-resume/${jobId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      alert("Resume uploaded successfully!");
      fetchJobs();
    } catch (error) {
      console.error("Error uploading resume:", error.response?.data || error.message);
    }
  };

  // Populate Form with Job Data for Editing
  const handleEdit = (job) => {
    setEditingJobId(job.id);
    setJobTitle(job.title);
    setCompany(job.company);
    setStatus(job.status);
    setJobType(job.job_type);
    setPriority(job.priority);
    setApplicationDate(job.application_date);
    setDeadline(job.deadline || "");
    setJobDescription(job.description);
    setTags(job.tags.join(", "));
    setInterviewDate(job.interview_date || "");
  };

  // Clear input fields
  const clearForm = () => {
    setEditingJobId(null);
    setJobTitle("");
    setCompany("");
    setStatus("Applied");
    setJobType("Full-time");
    setPriority("Medium");
    setApplicationDate("");
    setDeadline("");
    setJobDescription("");
    setTags("");
    setInterviewDate("");
    setResumeFile(null);
  };

  return (
    <div className="container">
      <div className="title-container">Job Tracker</div>
      
      <div className="form-container">
        <h2>Find Jobs</h2>
        <input
            type="text"
            placeholder="Search job title..."
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
        />
        <input
            type="text"
            placeholder="Enter location (e.g., London, United States, Remote)"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
        />
        <button onClick={searchJobs} className="btn">Search Jobs</button>
        </div>

        <div className="job-list">
        <h2>Search Results</h2>
        {jobResults.length === 0 ? (
            <p>No jobs found.</p>
        ) : (
            <ul>
            {jobResults.map((job, index) => (
                <li key={index} className="job-item">
                <div className="job-details">
                    <strong>{job.title}</strong> at <strong>{job.company}</strong>
                    <p>
                    <span className="job-location">{job.location || "Location not specified"}</span>
                    </p>
                    <a href={job.job_link} target="_blank" rel="noopener noreferrer" className="apply-btn">
                    Apply on {job.source || "Website"}
                    </a>
                </div>
                </li>
            ))}
            </ul>
        )}
        </div>

      <div className="form-container">
        <h2>{editingJobId ? "Edit Job" : "Add a Job"}</h2>
        <form onSubmit={handleSubmit} className="job-form">
          <input type="text" placeholder="Job Title" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} required />
          <input type="text" placeholder="Company" value={company} onChange={(e) => setCompany(e.target.value)} required />
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="Applied">Applied</option>
            <option value="Interview">Interview</option>
            <option value="Rejected">Rejected</option>
            <option value="Offer">Offer</option>
          </select>
          <select value={jobType} onChange={(e) => setJobType(e.target.value)}>
            <option value="Full-time">Full-time</option>
            <option value="Part-time">Part-time</option>
            <option value="Internship">Internship</option>
          </select>
          <select value={priority} onChange={(e) => setPriority(e.target.value)}>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
          <input type="date" value={applicationDate} onChange={(e) => setApplicationDate(e.target.value)} required />
          <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} required />
          <input type="text" placeholder="Tags (e.g., Remote, Hybrid, On-site)" value={tags} onChange={(e) => setTags(e.target.value)} />
          <input type="date" placeholder="Interview Date" value={interviewDate} onChange={(e) => setInterviewDate(e.target.value)} />
          <textarea placeholder="Job Description" value={jobDescription} onChange={(e) => setJobDescription(e.target.value)}></textarea>
          <button type="submit" className="btn">{editingJobId ? "Update Job" : "Add Job"}</button>
        </form>
      </div>

      <div className="job-list">
        <h2>My Job Applications</h2>
        {jobList.length === 0 ? <p>No jobs added yet.</p> :
          <ul>
            {jobList.map((job) => (
              <li key={job.id} className="job-item">
                <strong>{job.title}</strong> at <strong>{job.company}</strong> - {job.status} | {job.priority} priority
                <p>Applied on: {job.application_date} | Deadline: {job.deadline}</p>
                {job.interview_date && <p>Interview Date: {job.interview_date}</p>}
                {job.tags.length > 0 && <p>Tags: {job.tags.join(", ")}</p>}

                {/* Resume Upload */}
                <input type="file" onChange={(e) => setResumeFile(e.target.files[0])} />
                <button onClick={() => handleResumeUpload(job.id)} className="upload-btn">Upload Resume</button>

                {/* Edit & Delete Buttons */}
                <button className="edit-btn" onClick={() => handleEdit(job)}>Edit</button>
                <button className="delete-btn" onClick={() => handleDelete(job.id)}>Delete</button>
              </li>
            ))}
          </ul>
        }
      </div>
      {/* Job Application Dashboard */}
      <div className="dashboard">
        <h2>Job Application Stats</h2>
        {jobStats && (
        <Bar
            data={{
            labels: ["Applied", "Interviews", "Rejected", "Offers"],
            datasets: [
                {
                label: "Job Applications",
                data: jobStats
                    ? [jobStats.applied, jobStats.interviews, jobStats.rejected, jobStats.offers]
                    : [0, 0, 0, 0],
                backgroundColor: ["blue", "orange", "red", "green"],
                },
            ],
            }}
        />
        )}
      </div>
      {/* Add Resume Matching for Each Job */}
      <div className="job-list">
        <h2>Resume Match Scores</h2>
        {jobList.length === 0 ? <p>No jobs added yet.</p> :
            <ul>
            {jobList.map((job) => (
                <li key={job.id} className="job-item">
                <strong>{job.title}</strong> at <strong>{job.company}</strong>
                <button onClick={() => handleMatchResume(job.id)}>Check Resume Match</button>
                </li>
            ))}
            </ul>
        }
      </div>
    </div>
  );
}

export default App;
