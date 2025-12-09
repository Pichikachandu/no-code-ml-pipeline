from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
import uuid
import os
import io
import base64
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.preprocessing import StandardScaler, MinMaxScaler
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.metrics import accuracy_score, confusion_matrix, classification_report

app = Flask(__name__)
CORS(app)

# In-memory storage for pipeline state
runs = {}

@app.route('/api/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    try:
        if file.filename.endswith('.csv'):
            df = pd.read_csv(file)
        elif file.filename.endswith(('.xls', '.xlsx')):
            df = pd.read_excel(file)
        else:
            return jsonify({'error': 'Invalid file format. Please upload CSV or Excel.'}), 400
        
        run_id = str(uuid.uuid4())
        runs[run_id] = {
            'df': df,
            'original_df': df.copy()
        }
        
        return jsonify({
            'run_id': run_id,
            'filename': file.filename,
            'rows': df.shape[0],
            'columns': df.shape[1],
            'column_names': df.columns.tolist()
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/preview/<run_id>', methods=['GET'])
def preview_data(run_id):
    if run_id not in runs:
        return jsonify({'error': 'Invalid run_id'}), 404
    
    page = int(request.args.get('page', 1))
    limit = int(request.args.get('limit', 10))
    
    df = runs[run_id]['df']
    total_rows = len(df)
    
    start = (page - 1) * limit
    end = start + limit
    
    # Slice dataframe for pagination
    paginated_df = df.iloc[start:end]
    
    # Replace NaN with None for valid JSON
    preview_data = paginated_df.where(pd.notnull(paginated_df), None).to_dict(orient='records')
    
    return jsonify({
        'preview': preview_data,
        'total_rows': total_rows,
        'page': page,
        'limit': limit,
        'total_pages': (total_rows + limit - 1) // limit
    })

@app.route('/api/preprocess', methods=['POST'])
def preprocess_data():
    data = request.json
    run_id = data.get('run_id')
    steps = data.get('steps', []) # List of steps e.g., ['standardize', 'normalize']
    target = data.get('target')
    
    if run_id not in runs:
        return jsonify({'error': 'Invalid run_id'}), 404
    
    df = runs[run_id]['df'].copy()
    
    try:
        # Identify numeric columns (excluding target)
        numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
        if target in numeric_cols:
            numeric_cols.remove(target)
            
        if not numeric_cols:
             return jsonify({'message': 'No numeric columns to preprocess', 'columns': df.columns.tolist()})

        if 'standardize' in steps:
            scaler = StandardScaler()
            df[numeric_cols] = scaler.fit_transform(df[numeric_cols])
            
        if 'normalize' in steps:
            scaler = MinMaxScaler()
            df[numeric_cols] = scaler.fit_transform(df[numeric_cols])
            
        runs[run_id]['df'] = df
        
        return jsonify({
            'message': 'Preprocessing completed',
            'columns': df.columns.tolist()
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/split', methods=['POST'])
def split_data():
    data = request.json
    run_id = data.get('run_id')
    test_size = float(data.get('test_size', 0.2))
    target = data.get('target')
    
    if run_id not in runs:
        return jsonify({'error': 'Invalid run_id'}), 404
        
    if not target:
        return jsonify({'error': 'Target column is required'}), 400
    
    df = runs[run_id]['df']
    
    if target not in df.columns:
        return jsonify({'error': f'Target column {target} not found'}), 400
        
    try:
        X = df.drop(columns=[target])
        y = df[target]
        
        # Handle non-numeric features if any (simple encoding or drop? For MVP, we might assume numeric or drop non-numeric)
        # For robustness, let's drop non-numeric columns from X for now or assume they are handled.
        # The prompt says "Only numeric feature columns should be processed", implying we might only use numeric features.
        X = X.select_dtypes(include=[np.number])
        
        # Validate target for classification
        from sklearn.utils.multiclass import type_of_target
        target_type = type_of_target(y)
        if target_type == 'continuous':
             return jsonify({'error': f'Target column "{target}" is continuous (numbers). These models (Logistic Regression, Decision Tree) are for Classification (categories/labels). Please select a categorical column like "Outcome" or "Species".'}), 400

        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=test_size, random_state=42)
        
        runs[run_id]['X_train'] = X_train
        runs[run_id]['X_test'] = X_test
        runs[run_id]['y_train'] = y_train
        runs[run_id]['y_test'] = y_test
        runs[run_id]['target'] = target
        
        return jsonify({
            'message': 'Train-Test split completed',
            'train_rows': len(X_train),
            'test_rows': len(X_test)
        })
        
    except Exception as e:
        print(f"Error in /api/split: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/train', methods=['POST'])
def train_model():
    data = request.json
    run_id = data.get('run_id')
    model_type = data.get('model') # 'logistic' or 'decision-tree'
    
    if run_id not in runs:
        return jsonify({'error': 'Invalid run_id'}), 404
        
    if 'X_train' not in runs[run_id]:
        return jsonify({'error': 'Data not split yet'}), 400
        
    X_train = runs[run_id]['X_train']
    y_train = runs[run_id]['y_train']
    
    try:
        if model_type == 'logistic':
            model = LogisticRegression(max_iter=1000)
        elif model_type == 'decision-tree':
            model = DecisionTreeClassifier()
        else:
            return jsonify({'error': 'Invalid model type'}), 400
            
        model.fit(X_train, y_train)
        runs[run_id]['model'] = model
        runs[run_id]['model_type'] = model_type
        
        return jsonify({'message': 'Model trained successfully'})
        
    except Exception as e:
        print(f"Error in /api/train: {str(e)}") # Debug log
        import traceback
        traceback.print_exc() # Print full stack trace
        return jsonify({'error': str(e)}), 500

@app.route('/api/results/<run_id>', methods=['GET'])
def get_results(run_id):
    if run_id not in runs:
        return jsonify({'error': 'Invalid run_id'}), 404
        
    if 'model' not in runs[run_id]:
        return jsonify({'error': 'Model not trained yet'}), 400
        
    model = runs[run_id]['model']
    X_test = runs[run_id]['X_test']
    y_test = runs[run_id]['y_test']
    
    try:
        y_pred = model.predict(X_test)
        
        accuracy = accuracy_score(y_test, y_pred)
        report = classification_report(y_test, y_pred, output_dict=True)
        cm = confusion_matrix(y_test, y_pred)
        
        # Generate Confusion Matrix Plot
        plt.figure(figsize=(8, 6))
        sns.heatmap(cm, annot=True, fmt='d', cmap='Blues')
        plt.xlabel('Predicted')
        plt.ylabel('Actual')
        plt.title('Confusion Matrix')
        
        img = io.BytesIO()
        plt.savefig(img, format='png', bbox_inches='tight')
        img.seek(0)
        plot_url = base64.b64encode(img.getvalue()).decode()
        plt.close()
        
        return jsonify({
            'accuracy': accuracy,
            'classification_report': report,
            'confusion_matrix': plot_url
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
