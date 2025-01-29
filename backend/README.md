# Job Tracker Web Application - Backend

This is the backend for the **Job Tracker Web Application**, built using **Flask**. It provides an API to manage job applications, upload resumes, match resumes with job descriptions, fetch job listings using the **Jooble API**, and send reminders for deadlines.

---

## Features
- Store job applications with details like company, status, priority, deadlines, and interview dates.
- Upload resumes and associate them with job applications.
- Match job descriptions with uploaded resumes and calculate a match score.
- **Fetch job listings from the Jooble API**.
- Display job application statistics.
- Send email reminders for approaching job deadlines.

---

## Setup Instructions

### 1. Clone the Repository
```bash
git clone https://github.com/AyeshaRahman2002/Job-Tracker-WebApplication.git
cd Job-Tracker-WebApplication/backend
```

### 2. Create a Virtual Environment
```bash
python -m venv venv
```

### 3. Activate the Virtual Environment
- **Mac/Linux**:
  ```bash
  source venv/bin/activate
  ```
- **Windows**:
  ```bash
  venv\Scripts\activate
  ```

### 4. Install Dependencies
```bash
pip install -r requirements.txt
```

---

## Running the Backend Server
Start the Flask server using:
```bash
python app.py
```
By default, the server runs on **http://127.0.0.1:5000/**.

Make sure the frontend is configured to connect to this backend.

---

## API Endpoints

### Job Management
| Method | Endpoint                   | Description |
|--------|----------------------------|-------------|
| GET    | `/jobs`                     | Retrieve all job applications |
| POST   | `/add-job`                   | Add a new job application |
| PUT    | `/edit-job/<job_id>`         | Edit an existing job application |
| DELETE | `/delete-job/<job_id>`       | Delete a job application |

### Resume Management
| Method | Endpoint                    | Description |
|--------|----------------------------|-------------|
| POST   | `/upload-resume/<job_id>`   | Upload a resume for a job application |
| GET    | `/match-resume/<job_id>`    | Compare resume with job description and get a match score |

### Job Search & Statistics
| Method | Endpoint                      | Description |
|--------|------------------------------|-------------|
| GET    | `/search-jobs?query=xxx&location=yyy` | **Fetch job listings from Jooble API** |
| GET    | `/job-stats`                   | Get statistics on job applications |
| GET    | `/salary-estimate?query=xxx&location=yyy` | Fetch estimated salaries |

---

## Job Search with **Jooble API**
This application integrates the **Jooble API** to fetch job listings. The API is queried using job titles and locations provided by the user.

If you want to use this feature, **make sure to get an API key from Jooble**.

### Steps to Configure Jooble API:
1. Register at [Jooble API](https://jooble.org/api/about) to get an API key.
2. Replace `jooble_api_key` in `app.py` with your key:
   ```python
   jooble_api_key = "YOUR_JOOBLE_API_KEY"
   ```
3. Now you can fetch job listings dynamically.

---

## Database
- Uses **SQLite** to store job applications.
- The database schema is automatically created on the first run.

To reset the database, delete `jobs.db` and restart the server:
```bash
rm jobs.db
python app.py
```

---

## Technologies Used
- **Flask** - Python web framework
- **Flask-SQLAlchemy** - Database ORM
- **Flask-CORS** - Cross-Origin Resource Sharing
- **Flask-Mail** - Email notifications
- **SQLite** - Database storage
- **APScheduler** - Background task scheduling for reminders
- **spaCy** - NLP processing for resume text analysis
- **PyPDF2** - Extract text from PDFs
- **python-docx** - Extract text from DOCX files
- **Jooble API** - Fetch job listings from various sources

---

## Deployment
For deployment, you can use **Gunicorn** with:
```bash
gunicorn -w 4 app:app
```
You can deploy using services like **Heroku**, **AWS**, or **NGINX**.

---

## Contributing
Feel free to contribute to this project. If you find a bug or have an idea for improvement, open an issue or submit a pull request.

---

## Author
- **Ayesha Rahman** - [GitHub](https://github.com/AyeshaRahman2002)
