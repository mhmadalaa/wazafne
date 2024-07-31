from dotenv import load_dotenv
from flask import Flask, request, jsonify
from sentence_transformers import SentenceTransformer
import pinecone
import os

load_dotenv()

# # Initialize Flask app
app = Flask(__name__)

# Initialize the Sentence-BERT model
model = SentenceTransformer("all-MiniLM-L6-v2")

# Initialize Pinecone
pinecone.init(api_key=os.getenv("PINECONE_API"))  # pinecone cloud vector database
index_name = "job_applications"
if index_name not in pinecone.list_indexes():
    pinecone.create_index(index_name)
index = pinecone.Index(index_name)


@app.route("/add_employee", methods=["POST"])
def add_employee():
    data = request.json
    employee_id = data["employee_id"]
    employee_bio = data["employee_bio"]
    employee_vector = model.encode(employee_bio).tolist()
    index.upsert([(employee_id, employee_vector)])
    return jsonify({"message": f"Added employee with ID: {employee_id}"}), 200


@app.route("/find_matched_employees", methods=["POST"])
def find_matched_employees():
    data = request.json
    job_text = data["job_text"]
    top_k = data.get("top_k", 10)
    job_vector = model.encode(job_text).tolist()
    results = index.query(job_vector, top_k=top_k)
    matched_employee_ids = [res["id"] for res in results["matches"]]
    return jsonify({"matched_employee_ids": matched_employee_ids}), 200


@app.route("/", methods=["GET"])
def home():
    return "hello from wazafne ai"


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
