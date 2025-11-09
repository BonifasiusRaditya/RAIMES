# Dependency imports for evidence processing
from typing import List, Dict, Any
import PyPDF2
from docx import Document
from PIL import Image
import pytesseract
from transformers import pipeline
from sentence_transformers import SentenceTransformer
import chromadb
from langchain.text_splitter import RecursiveCharacterTextSplitter
import spacy

class EvidenceProcessor:
    def __init__(self):
        # Initialize models and databases
        self.embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
        self.nlp = spacy.load('en_core_web_sm')
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200
        )
        self.chroma_client = chromadb.Client()
    
    async def extract_text(self, file_path: str, file_type: str) -> str:
        """Extract text from various file types."""
        if file_type == 'pdf':
            return self._extract_from_pdf(file_path)
        elif file_type == 'docx':
            return self._extract_from_docx(file_path)
        elif file_type in ['png', 'jpg', 'jpeg']:
            return self._extract_from_image(file_path)
        else:
            raise ValueError(f"Unsupported file type: {file_type}")
    
    def _extract_from_pdf(self, file_path: str) -> str:
        """Extract text from PDF files."""
        text = ""
        with open(file_path, 'rb') as file:
            reader = PyPDF2.PdfReader(file)
            for page in reader.pages:
                text += page.extract_text()
        return text
    
    def _extract_from_docx(self, file_path: str) -> str:
        """Extract text from DOCX files."""
        doc = Document(file_path)
        return "\n".join([paragraph.text for paragraph in doc.paragraphs])
    
    def _extract_from_image(self, file_path: str) -> str:
        """Extract text from images using OCR."""
        image = Image.open(file_path)
        return pytesseract.image_to_string(image)
    
    def process_text(self, text: str) -> List[str]:
        """Split text into chunks for processing."""
        return self.text_splitter.split_text(text)
    
    def generate_embeddings(self, chunks: List[str]) -> List[List[float]]:
        """Generate embeddings for text chunks."""
        return self.embedding_model.encode(chunks).tolist()
    
    def store_evidence(self, 
                      question_id: str,
                      chunks: List[str],
                      embeddings: List[List[float]],
                      metadata: Dict[str, Any]) -> None:
        """Store evidence chunks and embeddings in vector database."""
        collection = self.chroma_client.get_or_create_collection(
            name=f"evidence_{question_id}"
        )
        
        collection.add(
            embeddings=embeddings,
            documents=chunks,
            metadatas=[metadata] * len(chunks)
        )
    
    def retrieve_relevant_chunks(self,
                               question: str,
                               question_id: str,
                               n_results: int = 3) -> List[str]:
        """Retrieve most relevant evidence chunks for a question."""
        collection = self.chroma_client.get_collection(f"evidence_{question_id}")
        query_embedding = self.embedding_model.encode(question).tolist()
        
        results = collection.query(
            query_embeddings=[query_embedding],
            n_results=n_results
        )
        
        return results['documents'][0]  # Return top matching chunks