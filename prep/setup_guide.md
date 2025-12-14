# VectorShift Project Setup Guide

This guide details the steps to set up and run the VectorShift project on a new device. The project consists of a Python FastAPI backend and a React frontend.

## Prerequisites

Ensure you have the following installed on your machine:
- **Node.js**: (Version 16 or higher recommended) - [Download Node.js](https://nodejs.org/)
- **Python**: (Version 3.8 or higher recommended) - [Download Python](https://www.python.org/)
- **Git**: For cloning the repository - [Download Git](https://git-scm.com/)

---

## 1. Clone the Repository

First, clone the project repository to your local machine:

```bash
git clone <repository_url>
cd VectorShift
```

---

## 2. Backend Setup

The backend is built with FastAPI.

1.  **Navigate to the backend directory:**
    ```bash
    cd backend
    ```

2.  **Create a virtual environment (Optional but Recommended):**
    It is best practice to run Python projects in an isolated environment.
    ```bash
    # Windows
    python -m venv venv
    .\venv\Scripts\activate

    # macOS/Linux
    python3 -m venv venv
    source venv/bin/activate
    ```

3.  **Install Dependencies:**
    Install the required Python packages.
    ```bash
    pip install fastapi uvicorn pydantic
    # Or if a requirements.txt exists (recommended to create one):
    # pip install -r requirements.txt
    ```

4.  **Run the Backend Server:**
    Start the FastAPI server.
    ```bash
    # Using python module (recommended)
    python -m uvicorn main:app --reload --port 8000 --host 0.0.0.0

    # Or directly with uvicorn command
    uvicorn main:app --reload --port 8000 --host 0.0.0.0
    ```
    The backend will be running at `http://localhost:8000`. You can verify it by visiting that URL (you should see a health check message).

---

## 3. Frontend Setup

The frontend is built with React.

1.  **Open a new terminal window** (keep the backend running in the first one).

2.  **Navigate to the frontend directory:**
    ```bash
    cd frontend
    ```

3.  **Install Node Modules:**
    Install the JavaScript dependencies defined in `package.json`.
    ```bash
    npm install
    ```

4.  **Run the Frontend Application:**
    Start the development server.
    ```bash
    npm start
    ```
    The frontend will open automatically in your browser at `http://localhost:3000`.

---

## 4. Verification

- **Backend**: Visit `http://localhost:8000/`. You should see `{"status":"ok","message":"VectorShift Pipeline API is running"}`.
- **Frontend**: Visit `http://localhost:3000/`. You should see the VectorShift pipeline builder interface.
- **Integration**: Try adding nodes and clicking "Submit" in the frontend. It should communicate with the backend and return a result alert.

## Troubleshooting

- **Port Conflicts**: If port 8000 or 3000 is in use, you may need to kill the process using that port or specify a different port in the start commands.
- **Missing Modules**: If you see "Module not found" errors, ensuring you ran `pip install` or `npm install` in the correct directories is usually the fix.
