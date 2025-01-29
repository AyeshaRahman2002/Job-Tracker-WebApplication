from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
import requests
import os
from datetime import datetime
import spacy
from flask_mail import Mail, Message
from apscheduler.schedulers.background import BackgroundScheduler
import PyPDF2
from docx import Document

app = Flask(__name__)
CORS(app)

# Database Configuration (SQLite)
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///jobs.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["UPLOAD_FOLDER"] = "uploads"  # Folder for resume uploads

db = SQLAlchemy(app)
nlp = spacy.load("en_core_web_sm")

# Create upload folder if it doesn't exist
if not os.path.exists(app.config["UPLOAD_FOLDER"]):
    os.makedirs(app.config["UPLOAD_FOLDER"])

# Configure Flask-Mail
app.config["MAIL_SERVER"] = "smtp.gmail.com"
app.config["MAIL_PORT"] = 587
app.config["MAIL_USE_TLS"] = True
app.config["MAIL_USERNAME"] = "your-email@gmail.com"
app.config["MAIL_PASSWORD"] = "your-email-password"
mail = Mail(app)

def send_deadline_reminders():
    jobs = Job.query.filter(Job.deadline >= datetime.utcnow()).all()
    for job in jobs:
        msg = Message(
            subject=f"Job Application Deadline: {job.title}",
            sender="your-email@gmail.com",
            recipients=["your-email@gmail.com"],
            body=f"Reminder: The application deadline for {job.title} at {job.company} is on {job.deadline}. Don't forget to apply!"
        )
        mail.send(msg)

# Schedule the job reminders
scheduler = BackgroundScheduler()
scheduler.add_job(func=send_deadline_reminders, trigger="interval", hours=24)
scheduler.start()

# ✅ Job Model
class Job(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    company = db.Column(db.String(200), nullable=False)
    status = db.Column(db.String(50), nullable=False, default="Applied")
    job_type = db.Column(db.String(50), nullable=False, default="Full-time")
    priority = db.Column(db.String(50), nullable=False, default="Medium")
    application_date = db.Column(db.Date, default=datetime.utcnow)
    deadline = db.Column(db.Date, nullable=True)
    description = db.Column(db.Text, nullable=False)
    resume = db.Column(db.String(200), nullable=True)  # Resume file path
    interview_date = db.Column(db.Date, nullable=True)  # Interview date
    tags = db.Column(db.String(200), nullable=True)  # Tags (e.g., remote, hybrid)
    job_link = db.Column(db.String(500), nullable=True)

# Initialize Database with Schema Upgrade
with app.app_context():
    db.reflect()
    db.drop_all()
    db.create_all()

@app.route("/")
def home():
    return "Job Tracker Backend is Running!"

# ✅ Add Job
@app.route("/add-job", methods=["POST"])
def add_job():
    data = request.json
    try:
        new_job = Job(
            title=data["title"],
            company=data["company"],
            status=data["status"],
            job_type=data["job_type"],
            priority=data["priority"],
            application_date=datetime.strptime(data["application_date"], "%Y-%m-%d"),
            deadline=datetime.strptime(data["deadline"], "%Y-%m-%d") if data["deadline"] else None,
            description=data["description"],
            tags=", ".join(data.get("tags", [])),  
            interview_date=datetime.strptime(data["interview_date"], "%Y-%m-%d") if data.get("interview_date") else None,
            job_link=data.get("job_link")
        )
        db.session.add(new_job)
        db.session.commit()
        return jsonify({"message": "Job added successfully!"})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/jobs", methods=["GET"])
def get_jobs():
    jobs = Job.query.all()
    return jsonify([
        {
            "id": job.id,
            "title": job.title,
            "company": job.company,
            "status": job.status,
            "job_type": job.job_type,
            "priority": job.priority,
            "application_date": job.application_date.strftime("%Y-%m-%d"),
            "deadline": job.deadline.strftime("%Y-%m-%d") if job.deadline else None,
            "description": job.description,
            "resume": job.resume,
            "tags": job.tags.split(", ") if job.tags else [],
            "interview_date": job.interview_date.strftime("%Y-%m-%d") if job.interview_date else None,
        }
        for job in jobs
    ])

@app.route("/edit-job/<int:job_id>", methods=["PUT"])
def edit_job(job_id):
    job = Job.query.get(job_id)
    if not job:
        return jsonify({"error": "Job not found"}), 404

    data = request.json
    try:
        job.title = data["title"]
        job.company = data["company"]
        job.status = data["status"]
        job.job_type = data["job_type"]
        job.priority = data["priority"]
        job.application_date = datetime.strptime(data["application_date"], "%Y-%m-%d")
        job.deadline = datetime.strptime(data["deadline"], "%Y-%m-%d") if data["deadline"] else None
        job.description = data["description"]
        job.tags = ", ".join(data.get("tags", []))
        job.interview_date = datetime.strptime(data["interview_date"], "%Y-%m-%d") if data.get("interview_date") else None
        
        db.session.commit()
        return jsonify({"message": "Job updated successfully!"})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/delete-job/<int:job_id>", methods=["DELETE"])
def delete_job(job_id):
    job = Job.query.get(job_id)
    if job:
        db.session.delete(job)
        db.session.commit()
        return jsonify({"message": "Job deleted successfully!"})
    return jsonify({"error": "Job not found"}), 404

@app.route("/upload-resume/<int:job_id>", methods=["POST"])
def upload_resume(job_id):
    if "file" not in request.files:
        return jsonify({"error": "No file provided"}), 400

    file = request.files["file"]
    filename = f"resume_{job_id}.pdf"
    file_path = os.path.join(app.config["UPLOAD_FOLDER"], filename)
    file.save(file_path)

    job = Job.query.get(job_id)
    if job:
        job.resume = file_path
        db.session.commit()
        return jsonify({"message": "Resume uploaded successfully!"})
    
    return jsonify({"error": "Job not found"}), 404

@app.route("/search-jobs", methods=["GET"])
def search_jobs():
    query = request.args.get("query", "software developer")  # Default search query
    location = request.args.get("location", "United States")  # Default location

    try:
        # Jooble API Configuration
        jooble_api_url = "https://jooble.org/api/"
        jooble_api_key = "YOUR_JOOBLE_API_KEY"

        # API Request Body
        payload = {
            "keywords": query,
            "location": location
        }

        # Send POST request to Jooble API
        response = requests.post(
            f"{jooble_api_url}{jooble_api_key}",
            json=payload,
            headers={"Content-Type": "application/json"}
        )

        # Check for successful response
        if response.status_code == 200:
            job_results = response.json().get("jobs", [])
            return jsonify({"jobs": job_results})
        else:
            return jsonify({"error": f"Jooble API returned status {response.status_code}: {response.text}"}), response.status_code

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/job-stats", methods=["GET"])
def job_stats():
    jobs = Job.query.all()
    
    total_jobs = len(jobs)
    applied_count = sum(1 for job in jobs if job.status == "Applied")
    interview_count = sum(1 for job in jobs if job.status == "Interview")
    rejected_count = sum(1 for job in jobs if job.status == "Rejected")
    offer_count = sum(1 for job in jobs if job.status == "Offer")

    return jsonify({
        "total_jobs": total_jobs,
        "applied": applied_count,
        "interviews": interview_count,
        "rejected": rejected_count,
        "offers": offer_count
    })

@app.route("/salary-estimate", methods=["GET"])
def salary_estimate():
    query = request.args.get("query", "Software Engineer")
    location = request.args.get("location", "United States")

    adzuna_api_id = "YOUR_ADZUNA_APP_ID"
    adzuna_api_key = "YOUR_ADZUNA_API_KEY"
    adzuna_url = f"https://api.adzuna.com/v1/api/jobs/us/search/1?app_id={adzuna_api_id}&app_key={adzuna_api_key}&what={query}&where={location}"

    try:
        response = requests.get(adzuna_url)
        if response.status_code == 200:
            jobs_data = response.json().get("results", [])
            salaries = [job.get("salary_min") for job in jobs_data if job.get("salary_min")]

            if salaries:
                avg_salary = sum(salaries) / len(salaries)
                return jsonify({"average_salary": round(avg_salary, 2)})
            else:
                return jsonify({"message": "No salary data available"})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

def extract_keywords(text):
    doc = nlp(text.lower())
    keywords = [token.lemma_ for token in doc if token.is_alpha and not token.is_stop]
    return set(keywords)


@app.route("/match-resume/<int:job_id>", methods=["GET"])
def match_resume(job_id):
    job = Job.query.get(job_id)
    if not job or not job.resume:
        return jsonify({"error": "Job or Resume not found"}), 404

    resume_path = job.resume

    # Determine file type based on extension
    file_extension = os.path.splitext(resume_path)[1].lower()

    try:
        if file_extension == ".pdf":
            # Extract text from PDF
            with open(resume_path, "rb") as file:
                reader = PyPDF2.PdfReader(file)
                resume_text = " ".join([page.extract_text() for page in reader.pages if page.extract_text()])

        elif file_extension == ".docx":
            # Extract text from DOCX
            doc = Document(resume_path)
            resume_text = " ".join([para.text for para in doc.paragraphs])

        else:
            return jsonify({"error": "Unsupported file format. Only PDF and DOCX are supported."}), 400

        # Extract Keywords
        job_keywords = extract_keywords(job.description)
        resume_keywords = extract_keywords(resume_text)

        # Calculate Match Score
        match_score = (len(job_keywords.intersection(resume_keywords)) / len(job_keywords)) * 100 if job_keywords else 0

        return jsonify({"match_score": round(match_score, 2)})

    except Exception as e:
        return jsonify({"error": f"Error processing resume: {str(e)}"}), 500


if __name__ == "__main__":
    app.run(debug=True)
