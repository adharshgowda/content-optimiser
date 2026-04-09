import requests
from bs4 import BeautifulSoup
import re

def extract_text_from_url(url: str) -> str:
    """
    Scrapes the provided URL and extracts the main article text 
    using BeautifulSoup, removing unnecessary boilerplate.
    
    Args:
        url (str): The web page to scrape.
        
    Returns:
        str: Cleaned extracted text, limited to 5000 characters 
             to prevent context window overflow in the LLM.
    """
    try:
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        }
        res = requests.get(url, headers=headers, timeout=10)
        res.raise_for_status()
        
        soup = BeautifulSoup(res.text, 'html.parser')
        
        # Remove noisy elements
        for script in soup(["script", "style", "nav", "footer", "header", "aside"]):
            script.extract()
            
        # Get text
        text = soup.get_text(separator=' ')
        
        # Clean up whitespace
        lines = (line.strip() for line in text.splitlines())
        chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
        cleaned_text = '\n'.join(chunk for chunk in chunks if chunk)
        
        # Limit to 5000 characters for LLM context limits
        if len(cleaned_text) > 5000:
            cleaned_text = cleaned_text[:5000] + "... [Text Truncated]"
            
        return cleaned_text
        
    except Exception as e:
        raise ValueError(f"Failed to scrape URL: {str(e)}")
