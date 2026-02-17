
import os
import google.generativeai as genai
from sqlalchemy.orm import Session
from .tools import (
    get_leaderboard_context, 
    get_sales_summary_context, 
    get_product_performance_context,
    get_low_stock_context,
    get_regional_sales_context
)
import time

class AIService:
    def __init__(self, db: Session, user):
        self.db = db
        self.user = user
        self.api_key = os.getenv("GEMINI_API_KEY")
        
        if self.api_key:
            genai.configure(api_key=self.api_key)
            self.model = None # We will instantiate per request or just use client
        else:
            self.model = None

    def get_context(self):
        """
        Aggregates context from various tools.
        """
        company_id = self.user.company_id
        # Fetch data
        leaderboard = get_leaderboard_context(self.db, company_id)
        sales_summary = get_sales_summary_context(self.db, company_id)
        products = get_product_performance_context(self.db, company_id)
        low_stock = get_low_stock_context(self.db, company_id)
        regional_sales = get_regional_sales_context(self.db, company_id)
        
        # Determine Company Name safely
        company_name = self.user.company.name if self.user.company else "Unknown Company"

        return f"""
        You are an AI assistant for a Sales Portal at {company_name}. 
        Your goal is to answer questions based on the following real-time data:
        
        {leaderboard}
        
        {sales_summary}
        
        {products}

        {regional_sales}

        {low_stock}
        
        User Context:
        Name: {self.user.full_name}
        Role: {self.user.role}
        Company: {company_name}
        Current Date: {time.strftime('%Y-%m-%d')}
        
        Instructions:
        - Be helpful and professional.
        - If the user asks about the leaderboard, use the data provided above.
        - If the user asks "who is top", look at the rank 1 in the leaderboard.
        - Keep answers concise.
        - ALWAYS display currency in Indian Rupees (₹).
        """

    async def get_response(self, question: str):
        if not self.api_key:
            return "AI Service is not configured. Please set GEMINI_API_KEY."
            
        context = self.get_context()
        prompt = f"{context}\n\nUser Question: {question}\nAI Answer:"
        
        # Models to try, ordered by stability and likelihood of working on free tier
        models_to_try = [
            'gemini-flash-latest',       # Highly stable alias
            'gemini-2.0-flash-lite-001', # Provided in user list
            'gemini-2.0-flash-lite',     # Alias
            'gemini-pro-latest',         # Fallback
            'gemini-2.0-flash'           # Often rate limited but worth a try last
        ]

        last_error = None

        for model_name in models_to_try:
            try:
                # print(f"Attempting model: {model_name}") # Debug
                model = genai.GenerativeModel(model_name)
                response = model.generate_content(prompt)
                return response.text
            except Exception as e:
                last_error = e
                error_input = str(e).lower()
                
                # If rate limited (429) or not found (404), continue to next model
                if "429" in error_input or "quota" in error_input or "404" in error_input or "not found" in error_input:
                    continue
                else:
                    # For other errors, we might want to continue too, just in case
                    continue
        
        return f"Unable to generate response. All models failed. Last error: {str(last_error)}"
