# **Job Tracker Web Application (Frontend)**
This is the **frontend** of the **Job Tracker Web Application**, built using **React**. It allows users to **search jobs, track applications, upload resumes, and view application statistics**.

## **Features**
- **Search Jobs**: Fetch job listings using an external API.
- **Track Applications**: Store job applications with status, priority, deadlines, and interview dates.
- **Resume Upload**: Upload a resume for each job application.
- **Resume Matching**: Compare resume content with job descriptions to calculate a **match score**.
- **Dashboard**: View **job application statistics** in a visual format using **Chart.js**.

---

## **Getting Started**
This project was bootstrapped with **Create React App**.

### **Installation**
1. Clone the repository:
   ```bash
   git clone https://github.com/AyeshaRahman2002/Job-Tracker-WebApplication.git
   cd Job-Tracker-WebApplication/frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

### **Running the App**
Start the frontend development server:
```bash
npm start
```
- Open [http://localhost:3000](http://localhost:3000) in your browser.

The page will **reload** when you make changes.

---

## **Backend API**
The frontend connects to a **Flask-based backend**. Ensure that the backend is running before using the frontend.

- **Start Backend**:
   ```bash
   cd ../backend
   python app.py
   ```
- API is available at `http://127.0.0.1:5000/`

---

## **Available Scripts**
In the **frontend directory**, you can run:

### **`npm start`**
Runs the app in **development mode**.

### **`npm run build`**
Builds the app for **production** into the `build/` folder.

### **`npm test`**
Launches the **test runner** in interactive watch mode.

---

## **Technologies Used**
- **React.js** (Frontend UI)
- **Axios** (API requests)
- **Chart.js** (Data visualization)
- **Flask** (Backend API)
- **SQLite** (Database for job applications)

---

## **Job Tracker Dashboard**
The dashboard provides a **visual breakdown** of job applications:
- **Applications Submitted**
- **Interviews Scheduled**
- **Rejections**
- **Offers Received**

---

## **Deployment**
To deploy the frontend:
```bash
npm run build
```
This will create an optimized build in the `build/` directory.
