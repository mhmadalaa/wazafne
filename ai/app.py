# Hint: The code is based on colab environment

from flask import Flask, request, jsonify

from sentence_transformers import SentenceTransformer
from pinecone import Pinecone, ServerlessSpec
from google.colab import userdata
from pyngrok import ngrok

# Initialize Flask app
app = Flask(__name__)

# Initialize the Sentence-BERT model
model = SentenceTransformer("Alibaba-NLP/gte-base-en-v1.5", trust_remote_code=True)

# Initialize Pinecone
pc = Pinecone(api_key=userdata.get("PINECONE"))  # Pinecone cloud vector database
index_name = "job-applications"
index = pc.Index(index_name)


@app.route("/add_employee", methods=["POST"])
def add_employee():
    data = request.json
    # print(data)
    # print(data["data"])
    employee_id = data["data"]["employee_id"]
    employee_profile = data["data"]["employee_profile"]
    print(f"start adding profile: {employee_profile}\nof employee: {employee_id}")

    employee_vector = model.encode(employee_profile).tolist()
    index.upsert([(employee_id, employee_vector)])
    return jsonify({"message": f"Added employee with ID: {employee_id}"}), 200


@app.route("/delete_employee", methods=["DELETE"])
def delete_employee():
    data = request.json
    employee_id = data.get("employee_id")
    print(f"start delete {employee_id} from vector-db")

    if not employee_id:
        return jsonify({"error": "Missing employee_id in request body"}), 400

    # Delete the employee from the index
    try:
        index.delete([employee_id])
        return (
            jsonify(
                {"message": f"Employee with ID: {employee_id} deleted successfully"}
            ),
            200,
        )
    except pc.errors.ResourceNotFoundError:
        return jsonify({"error": f"Employee with ID: {employee_id} not found"}), 404


@app.route("/find_matched_employees", methods=["POST"])
def find_matched_employees():
    data = request.json
    job_text = data["data"]["job_text"]
    print(f"start matching text: {job_text} with employees profiles")

    top_k = data.get("top_k", 10)
    job_vector = model.encode(job_text).tolist()
    results = index.query(vector=job_vector, top_k=top_k)
    matched_employee_ids = [res["id"] for res in results["matches"]]
    return jsonify({"matched_employee_ids": matched_employee_ids}), 200


@app.route("/", methods=["GET"])
def home():
    return "Hello, Wazafne AI-API"


if __name__ == "__main__":
    public_url = ngrok.connect(5000)
    print(f"Your public URL is: {public_url}")
    app.run()
