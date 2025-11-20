# Windows Setup Guide

## Prerequisites

Before setting up the project, install:
- **Python 3.8 or higher**: Download from [python.org](https://www.python.org/downloads/)
- **Node.js 18 or higher**: Download from [nodejs.org](https://nodejs.org/)
- **Git**: Download from [git-scm.com](https://git-scm.com/download/win)

## Setup Steps

### 1. Clone the Repository

```cmd
git clone <repository-url>
cd Call-helper-main
```

### 2. Python Backend Setup

Create and activate a virtual environment:

```cmd
python -m venv venv
venv\Scripts\activate
```

Install Python dependencies:

```cmd
pip install -r requirements.txt
```

### 3. Frontend Setup

Install Node.js dependencies:

```cmd
npm install
```

### 4. Configuration

Copy the example environment file:

```cmd
copy .env.example .env
```

Edit `.env` and configure your settings (database, API keys, etc.)

### 5. Prepare Knowledge Base

Make sure `CallHelper_Data.xlsx` is present and properly configured with your data.

## Running the Application

### Start Backend Server

In one terminal:

```cmd
venv\Scripts\activate
python app.py
```

The backend will run on `http://localhost:5000`

### Start Frontend Development Server

In another terminal:

```cmd
npm run dev
```

The frontend will run on `http://localhost:5173`

## Testing

Run tests with:

```cmd
python test_alternatives.py
```

## Troubleshooting

### Python not found
Make sure Python is added to your PATH during installation

### Permission errors
Run Command Prompt as Administrator

### Port already in use
Change the port in `app.py` or `vite.config.ts`

### Module import errors
Ensure virtual environment is activated before running Python commands

## Additional Notes

- Use Command Prompt or PowerShell (not Git Bash) for best compatibility
- Make sure to activate the virtual environment (`venv\Scripts\activate`) before running any Python commands
- Keep both backend and frontend terminals open while developing
