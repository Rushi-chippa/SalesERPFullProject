import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from database import SessionLocal
from sales.router import Sale

class SalesPredictor:
    def __init__(self):
        self.model = LinearRegression()
        # Initialize with dummy training if DB is empty
        self.train_model()

    def load_data_from_db(self):
        db: Session = SessionLocal()
        try:
            sales = db.query(Sale).order_by(Sale.date).all()
            if not sales:
                return pd.DataFrame()
            
            data = []
            for sale in sales:
                data.append({
                    'date': sale.date,
                    'amount': sale.amount
                })
            
            df = pd.DataFrame(data)
            df['date'] = pd.to_datetime(df['date'])
            # Group by month for prediction
            df['month_start'] = df['date'].dt.to_period('M').dt.to_timestamp()
            monthly_sales = df.groupby('month_start')['amount'].sum().reset_index()
            monthly_sales['month_ordinal'] = monthly_sales['month_start'].apply(lambda x: x.toordinal())
            return monthly_sales
        finally:
            db.close()

    def train_model(self):
        self.df = self.load_data_from_db()
        
        if self.df.empty or len(self.df) < 2:
            print("Not enough data to train model. Need at least 2 months of data.")
            self.model_trained = False
            return

        X = self.df[['month_ordinal']]
        y = self.df['amount']
        self.model.fit(X, y)
        self.model_trained = True

    def predict_next_months(self, months=6):
        if not hasattr(self, 'model_trained') or not self.model_trained:
            # Return dummy prediction or empty if no data
            return []

        future_months = []
        last_item = self.df.iloc[-1]
        last_ordinal = last_item['month_ordinal']
        last_date = last_item['month_start']
        
        for i in range(1, months + 1):
            # Approx next month ordinal
            next_date = last_date + pd.DateOffset(months=i)
            next_ordinal = next_date.toordinal()
            
            prediction = self.model.predict([[next_ordinal]])[0]
            
            # Ensure no negative sales
            prediction = max(0, prediction)
            
            future_months.append({
                'date': next_date.strftime("%Y-%m-%d"),
                'predicted_amount': round(prediction, 2),
                'is_prediction': True
            })
            
        return future_months

    def get_full_forecast(self):
        self.train_model() # Retrain with latest data
        
        if not hasattr(self, 'model_trained') or not self.model_trained:
             return {
                'history': [],
                'forecast': [],
                'summary': {'message': "Not enough data for prediction"}
            }

        history = []
        for _, row in self.df.iterrows():
            history.append({
                'date': row['month_start'].strftime("%Y-%m-%d"),
                'amount': row['amount'],
                'is_prediction': False
            })
            
        future = self.predict_next_months(6)
        
        return {
            'history': history,
            'forecast': future,
            'summary': {
                'total_historical_revenue': float(self.df['amount'].sum()),
                'average_monthly_sales': float(self.df['amount'].mean()),
                'predicted_growth': 'Positive' if self.model.coef_[0] > 0 else 'Negative'
            }
        }
