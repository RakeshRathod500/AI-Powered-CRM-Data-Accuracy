import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest, RandomForestRegressor
from sklearn.impute import SimpleImputer
import streamlit as st

def load_and_clean_crm_data(csv_file):
    """
    Load and clean raw CRM data from a CSV file.
    """
    # Read CSV into DataFrame
    df = pd.read_csv(csv_file)
    
    # Handle duplicates
    df = df.drop_duplicates(subset=['Email'], keep='first')
    
    # Handle missing values
    imputer = SimpleImputer(strategy='constant', fill_value='')
    df[['Phone', 'Company']] = imputer.fit_transform(df[['Phone', 'Company']])
    
    # Standardize phone numbers (example: ensure XXX-XXX-XXXX format)
    df['Phone'] = df['Phone'].apply(lambda x: f"{x[:3]}-{x[3:6]}-{x[6:]}" if len(str(x).replace('-', '')) == 10 else x)
    
    return df

def detect_anomalies(df):
    """
    Use Isolation Forest to detect anomalies in CRM data.
    """
    # Prepare data for anomaly detection (focus on numeric columns like phone length)
    X = df[['Phone']].dropna()
    X['Phone_Length'] = X['Phone'].str.replace('-', '').str.len()
    
    # Fit Isolation Forest
    iso_forest = IsolationForest(contamination=0.1, random_state=42)
    anomalies = iso_forest.fit_predict(X)
    
    # Flag records as anomalies (-1) or normal (1)
    df['Anomaly_Score'] = anomalies
    anomalous_records = df[df['Anomaly_Score'] == -1]
    return anomalous_records, df

def predict_outcomes(df):
    """
    Use Random Forest to predict outcomes (e.g., sales potential) based on cleaned data.
    """
    # Example: Predict sales based on company size (simplified)
    df['Company_Size'] = np.random.randint(1, 1000, size=len(df))  # Simulated company size
    X = df[['Company_Size']]
    y = np.random.randint(1000, 10000, size=len(df))  # Simulated sales
    
    # Train Random Forest Regressor
    rf = RandomForestRegressor(n_estimators=100, random_state=42)
    rf.fit(X, y)
    
    # Predict sales
    predictions = rf.predict(X)
    df['Predicted_Sales'] = predictions
    return df

def visualize_results(df):
    """
    Visualize results using Streamlit dashboard.
    """
    st.title("AI-Powered CRM Data Analysis")
    
    st.subheader("Cleaned CRM Data")
    st.write(df)
    
    st.subheader("Anomalies Detected")
    st.write(df[df['Anomaly_Score'] == -1])
    
    st.subheader("Predicted Sales Outcomes")
    st.bar_chart(df[['Company', 'Predicted_Sales']])

def main():
    """
    Main function to process CRM data.
    """
    st.file_uploader("Upload CSV file", type=["csv"])
    if st.session_state.get('uploaded_file'):
        df = load_and_clean_crm_data(st.session_state.uploaded_file)
        anomalous_records, df = detect_anomalies(df)
        df = predict_outcomes(df)
        visualize_results(df)

if __name__ == "__main__":
    main()