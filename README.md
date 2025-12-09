# No-Code ML Pipeline Builder

A full-stack web application that allows users to build machine learning pipelines without writing a single line of code.

## 🚀 Features

- **Dataset Upload**: Support for CSV and Excel files with preview.
- **Data Preprocessing**: Standardization and Normalization options.
- **Train-Test Split**: Interactive slider to choose split ratio.
- **Model Selection**: Choose between Logistic Regression and Decision Tree.
- **Results Visualization**: View accuracy, classification report, and confusion matrix.

## 🛠 Tech Stack

- **Frontend**: React, Vite, Tailwind CSS
- **Backend**: Flask, Pandas, Scikit-Learn, Matplotlib
- **Deployment**: Ready for Vercel (Frontend) and Render (Backend)

## 🏃‍♂️ How to Run Locally

### Prerequisites
- Node.js & npm
- Python 3.8+

### 1. Backend Setup
```bash
cd backend
# Create virtual environment (optional but recommended)
python -m venv venv
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run Flask server
python app.py
```
The backend will start at `http://127.0.0.1:5000`.

### 2. Frontend Setup
```bash
cd frontend
# Install dependencies
npm install

# Run development server
npm run dev
```
The frontend will start at `http://localhost:5173`.

## 📦 Deployment

### Backend (Render)
1. Create a new Web Service on Render.
2. Connect your repository.
3. Set Build Command: `pip install -r requirements.txt`
4. Set Start Command: `gunicorn app:app` (or `python app.py` for simple testing)

### Frontend (Vercel/Netlify)
1. Import the repository.
2. Set Build Command: `npm run build`
3. Set Output Directory: `dist`
4. Add Environment Variable (if needed) for API URL.

## 📝 API Documentation

- `POST /api/upload`: Upload dataset.
- `GET /api/preview/<run_id>`: Get first 10 rows.
- `POST /api/preprocess`: Apply scaling.
- `POST /api/split`: Split data.
- `POST /api/train`: Train model.
- `GET /api/results/<run_id>`: Get metrics and plots.
