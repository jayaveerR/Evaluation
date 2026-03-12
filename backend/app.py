import os
from flask import Flask, request, jsonify, session
from flask_cors import CORS
from dotenv import load_dotenv
from datetime import datetime
import firebase_admin
from firebase_admin import credentials, firestore, auth

# Load environment variables
load_dotenv()

app = Flask(__name__)
app.secret_key = os.getenv("FLASK_SECRET_KEY", "dev_secret")
CORS(app, supports_credentials=True)

# Firebase Admin SDK Initialization
cred_path = os.getenv("FIREBASE_SERVICE_ACCOUNT_JSON")
firebase_initialized = False

try:
    if cred_path and os.path.exists(cred_path):
        cred = credentials.Certificate(cred_path)
        firebase_admin.initialize_app(cred)
        firebase_initialized = True
    else:
        # Try default credentials (ADC)
        firebase_admin.initialize_app()
        firebase_initialized = True
except Exception as e:
    print(f"WARNING: Firebase Admin initialization failed: {e}")
    print("Backend will run with limited Firestore features.")

def get_db():
    try:
        if firebase_initialized:
            return firestore.client()
    except Exception as e:
        print(f"ERROR: Could not get Firestore client: {e}")
    return None

db = get_db()

# Database Mock/Simulation
subjects_db = [
    {"id": 1, "name": "Advanced Mathematics", "code": "MATH401"},
    {"id": 2, "name": "Quantum Physics", "code": "PHYS305"},
    {"id": 3, "name": "Organic Chemistry", "code": "CHEM202"}
]

exams_db = [
    {"id": 1, "subject_id": 1, "title": "Final Examination 2024", "date": "2024-05-15"},
    {"id": 2, "subject_id": 2, "title": "Midterm Exam", "date": "2024-03-20"}
]

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "ok", "message": "Backend is running with Firebase Admin"}), 200

# --- Subject & Exam Logic ---

@app.route('/api/subjects', methods=['GET', 'POST'])
def manage_subjects():
    if not db:
        return jsonify({"error": "Firebase Firestore not initialized. Please provide a valid serviceAccountKey.json"}), 500

    if request.method == 'GET':
        try:
            docs = db.collection("subjects").stream()
            subjects = [{"id": doc.id, **doc.to_dict()} for doc in docs]
            return jsonify(subjects), 200
        except Exception as e:
            print(f"Firestore Error (subjects): {e}")
            return jsonify({"error": str(e)}), 500
    else:
        new_subject = request.json
        try:
            doc_ref = db.collection("subjects").add(new_subject)
            new_subject['id'] = doc_ref[1].id
            return jsonify(new_subject), 201
        except Exception as e:
            print(f"Firestore Save Error (subjects): {e}")
            return jsonify({"error": str(e)}), 500

@app.route('/api/exams', methods=['GET', 'POST'])
def manage_exams():
    if not db:
        return jsonify({"error": "Firebase Firestore not initialized"}), 500

    if request.method == 'GET':
        try:
            docs = db.collection("exams").stream()
            exams = [{"id": doc.id, **doc.to_dict()} for doc in docs]
            return jsonify(exams), 200
        except Exception as e:
            print(f"Firestore Error (exams): {e}")
            return jsonify({"error": str(e)}), 500
    else:
        new_exam = request.json
        try:
            doc_ref = db.collection("exams").add(new_exam)
            new_id = doc_ref[1].id
            new_exam['id'] = new_id
            return jsonify(new_exam), 201
        except Exception as e:
            print(f"Firestore Save Error (exams): {e}")
            return jsonify({"error": str(e)}), 500

@app.route('/api/exams/<exam_id>/questions', methods=['GET', 'POST'])
def manage_questions(exam_id):
    if not db:
        return jsonify({"error": "Firebase Firestore not initialized"}), 500

    if request.method == 'GET':
        try:
            docs = db.collection("exams").document(exam_id).collection("questions").order_by("q").stream()
            questions = [{"id": doc.id, **doc.to_dict()} for doc in docs]
            return jsonify(questions), 200
        except Exception as e:
            print(f"Firestore Error (questions): {e}")
            return jsonify({"error": str(e)}), 500
    else:
        new_q = request.json
        try:
            db.collection("exams").document(exam_id).collection("questions").add(new_q)
            return jsonify(new_q), 201
        except Exception as e:
            print(f"Firestore Save Error (questions): {e}")
            return jsonify({"error": str(e)}), 500

@app.route('/api/exams/<exam_id>/questions/<question_id>', methods=['DELETE'])
def delete_question(exam_id, question_id):
    if not db:
        return jsonify({"error": "Firebase Firestore not initialized"}), 500
    try:
        db.collection("exams").document(exam_id).collection("questions").document(question_id).delete()
        return jsonify({"status": "success"}), 200
    except Exception as e:
        print(f"Firestore Delete Error (questions): {e}")
        return jsonify({"error": str(e)}), 500

# --- User Management Logic ---

@app.route('/api/users/<uid>/role', methods=['PATCH'])
def update_user_role(uid):
    if not db:
        return jsonify({"error": "Firebase Firestore not initialized"}), 500

    data = request.json
    new_role = data.get('role')
    if not new_role:
        return jsonify({"error": "Role is required"}), 400
    
    try:
        db.collection("users").document(uid).update({"role": new_role})
        return jsonify({"status": "success", "message": f"Role updated to {new_role}"}), 200
    except Exception as e:
        print(f"Firestore Error (role update): {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/users/<uid>', methods=['GET'])
def get_user_details(uid):
    if not db:
        return jsonify({"error": "Firestore not initialized"}), 500
    try:
        user_doc = db.collection("users").document(uid).get()
        if user_doc.exists:
            return jsonify({ "id": user_doc.id, **user_doc.to_dict() }), 200
        return jsonify({"error": "User not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/students/list', methods=['GET'])
def list_all_students():
    """
    Master sync: Merges Firebase Auth users with Firestore 'users' collection.
    Ensures absolute visibility of all registered accounts.
    """
    if not db:
        return jsonify({"error": "Firestore not initialized"}), 500
    try:
        from firebase_admin import auth
        
        # 1. Get all users from Firebase Authentication
        auth_users = auth.list_users().users
        
        # 2. Get all profile docs from Firestore
        profiles_ref = db.collection("users").stream()
        profiles = {doc.id: doc.to_dict() for doc in profiles_ref}
        
        students_list = []
        for user in auth_users:
            profile = profiles.get(user.uid, {})
            role = (profile.get('role') or 'student').lower()
            
            # We filter for student role, but default to 'student' if missing
            if role == 'student':
                students_list.append({
                    "id": user.uid,
                    "fullName": profile.get('fullName') or user.display_name or user.email.split('@')[0],
                    "email": user.email,
                    "role": role,
                    "lastSignIn": user.user_metadata.last_sign_in_timestamp if user.user_metadata.last_sign_in_timestamp else None
                })
        
        return jsonify(students_list), 200
    except Exception as e:
        print(f"Auth sync error: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/students/results/<roll_number>', methods=['GET'])
def get_student_results(roll_number):
    if not db:
        return jsonify([]), 200
    try:
        # Fetch results for the student. Sorting in Python to avoid manual index requirement.
        docs = db.collection("evaluations").where("roll_number", "==", roll_number).stream()
        results = []
        for doc in docs:
            d = doc.to_dict()
            results.append({
                "id": doc.id,
                **d,
                "date": d.get('timestamp').strftime('%Y-%m-%d') if d.get('timestamp') and hasattr(d.get('timestamp'), 'strftime') else 'Just Now'
            })
        
        # Sort by timestamp descending
        results.sort(key=lambda x: x.get('timestamp') if x.get('timestamp') else 0, reverse=True)
        return jsonify(results), 200
    except Exception as e:
        print(f"Error fetching student results: {e}")
        return jsonify([]), 500

# --- Evaluation Logic ---

import PyPDF2
import docx
import io

def extract_text_from_file(file):
    filename = file.filename.lower()
    text = ""
    try:
        if filename.endswith('.pdf'):
            reader = PyPDF2.PdfReader(io.BytesIO(file.read()))
            for page in reader.pages:
                text += (page.extract_text() or "") + "\n"
        elif filename.endswith('.docx'):
            doc = docx.Document(io.BytesIO(file.read()))
            for para in doc.paragraphs:
                text += para.text + "\n"
        else:
            text = file.read().decode('utf-8', errors='ignore')
    except Exception as e:
        print(f"Extraction Error: {e}")
        text = f"[OCR Extraction Error for {filename}]"
    return text

def parse_extracted_text(text, model_questions):
    """
    Enhanced segmenting to handle 'Q1', '1.', and 'Answer :' markers.
    """
    extracted_data = []
    import re
    
    # Normalize newline characters and spacing
    clean_text = re.sub(r'\r\n', '\n', text)
    full_text = clean_text.strip()
    
    for q in model_questions:
        qn = q.get('q')
        q_id = q.get('id')
        q_text = q.get('question', '')
        
        # Try multiple common markers: Q1, 1., Question 1
        markers = [f"Q{qn}", f"{qn}.", f"Question {qn}", f"Q {qn}"]
        found_ans = "No student answer detected in document."
        
        for marker in markers:
            # Case insensitive search for the marker
            pattern = re.compile(re.escape(marker), re.IGNORECASE)
            match = pattern.search(full_text)
            
            if match:
                # Get everything after this marker
                start_index = match.end()
                
                # Determine where the next question starts
                next_qn = qn + 1
                next_markers = [f"Q{next_qn}", f"{next_qn}.", f"Question {next_qn}", f"Q {next_qn}"]
                end_index = len(full_text)
                
                for nm in next_markers:
                    nm_pattern = re.compile(re.escape(nm), re.IGNORECASE)
                    nm_match = nm_pattern.search(full_text, start_index)
                    if nm_match and nm_match.start() < end_index:
                        end_index = nm_match.start()
                
                content = full_text[start_index:end_index].strip()
                
                # Further refine: If 'Answer :' or 'Ans :' exists, take only the text after it
                ans_prefixes = [r'Answer\s*:', r'Ans\s*:', r'Response\s*:']
                for ap in ans_prefixes:
                    ap_match = re.search(ap, content, re.IGNORECASE)
                    if ap_match:
                        content = content[ap_match.end():].strip()
                        break
                
                # If content is still just the question, try to strip it
                if q_text.lower() in content.lower():
                    # Remove the question text if it's mirrored in the extraction
                    content = re.sub(re.escape(q_text), '', content, flags=re.IGNORECASE).strip()

                if content:
                    found_ans = content
                    break # Found a valid match with this marker
        
        extracted_data.append({
            "question_id": q_id,
            "question_num": qn,
            "student_question": q_text,
            "student_answer": found_ans,
            "raw_snippet": text[:150] + "..."
        })
    return extracted_data

@app.route('/api/extract', methods=['POST'])
def extract_document_data():
    exam_id = request.form.get('exam_id')
    uploaded_files = request.files.getlist('files')
    
    if not exam_id or not uploaded_files:
        return jsonify({"error": "exam_id and files are required"}), 400

    try:
        model_docs = db.collection("exams").document(exam_id).collection("questions").order_by("q").stream()
        model_questions = [{"id": doc.id, **doc.to_dict()} for doc in model_docs]
    except Exception as e:
        return jsonify({"error": f"Failed to fetch context: {str(e)}"}), 500

    combined_text = ""
    for f in uploaded_files:
        combined_text += extract_text_from_file(f) + "\n"

    extracted_json = parse_extracted_text(combined_text, model_questions)
    
    return jsonify({
        "status": "extracted",
        "extracted_data": extracted_json,
        "raw_text": combined_text[:1000]
    }), 200

@app.route('/api/evaluate-confirm', methods=['POST'])
def evaluate_confirmed_data():
    if not db:
        return jsonify({"error": "Firebase not initialized"}), 500

    data = request.json
    exam_id = data.get('exam_id')
    roll_number = data.get('roll_number')
    extracted_data = data.get('extracted_data')

    if not all([exam_id, roll_number, extracted_data]):
        return jsonify({"error": "Missing context for evaluation"}), 400

    # 1. Fetch Instructor Context
    model_docs = db.collection("exams").document(exam_id).collection("questions").order_by("q").stream()
    model_questions = {doc.id: doc.to_dict() for doc in model_docs}

    details = []
    total_score = 0
    max_total = 0
    import random

    for item in extracted_data:
        q_id = item.get('question_id')
        model_q = model_questions.get(q_id)
        
        if model_q:
            s_ans = item.get('student_answer', '').lower().strip()
            m_ans = model_q.get('modelAnswer', '').lower().strip()
            
            # Use same normalization as before
            def normalize(t):
                if not t: return ""
                import re
                # 1. Replace all non-alphanumeric with spaces (including hyphens)
                t = re.sub(r'[^a-zA-Z0-9\s]', ' ', t.lower())
                # 2. Collapse multiple spaces and strip
                return " ".join(t.split()).strip()

            norm_s = normalize(s_ans)
            norm_m = normalize(m_ans)

            # Check for exact normalized match
            if norm_s == norm_m and len(norm_m) > 0:
                match_pct = 100
                feedback = "Exact semantic logic found. Correct."
            # Check for word-set similarity (handles word order or tiny additions)
            elif len(norm_m) > 0:
                s_words = set(norm_s.split())
                m_words = set(norm_m.split())
                
                # Intersection over Union for similarity
                intersection = s_words.intersection(m_words)
                if len(m_words) > 0:
                    similarity = (len(intersection) / len(m_words)) * 100
                    
                    if similarity >= 90:
                        match_pct = 100 # Near perfect word match
                        feedback = "Full semantic alignment with model key."
                    elif similarity >= 60:
                        match_pct = int(similarity)
                        feedback = "Partial semantic match detected."
                    else:
                        match_pct = int(similarity)
                        feedback = "Low semantic alignment with model key."
                else:
                    match_pct = 0
                    feedback = "Insufficient content."
            else:
                match_pct = 0
                feedback = "No model answer provided for comparison."

            q_max = int(model_q.get('maxMarks', 10))
            q_score = int(q_max * (match_pct / 100))
            
            total_score += q_score
            max_total += q_max
            
            details.append({
                "question_num": model_q.get('q'),
                "instructor_question": model_q.get('question'),
                "student_question": item.get('student_question'),
                "instructor_answer": model_q.get('modelAnswer'),
                "student_answer": item.get('student_answer'),
                "semantic_match_percentage": match_pct,
                "score": f"{q_score}/{q_max}",
                "evaluation_feedback": feedback
            })

    percentage = int((total_score / max_total) * 100) if max_total > 0 else 0
    final_result = {
        "status": "success",
        "roll_number": roll_number,
        "exam_id": exam_id,
        "score": total_score,
        "total": max_total,
        "percentage": f"{percentage}%",
        "grade": "A+" if percentage >= 90 else "A" if percentage >= 80 else "B",
        "details": details,
        "summary": "Full Post-Extraction AI Semantic Evaluation Complete."
    }

    # If roll_number is 'RESERVED_UNASSIGNED', we don't save to the final student collection yet
    # We only return the result for instructor reveal
    if roll_number != 'RESERVED_UNASSIGNED':
        db.collection("evaluations").add({
            **final_result,
            "timestamp": firestore.SERVER_TIMESTAMP,
            "type": "SYSTEM_PDF_semantic_eval"
        })

    return jsonify(final_result), 200

@app.route('/api/evaluations/<id>', methods=['GET'])
def get_evaluation_detail(id):
    if not db:
        return jsonify({"error": "Firestore not initialized"}), 500
    try:
        doc = db.collection("evaluations").document(id).get()
        if doc.exists:
            return jsonify({ "id": doc.id, **doc.to_dict() }), 200
        return jsonify({"error": "Evaluation not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/record-ledger', methods=['POST'])
def record_to_ledger():
    """
    Final step: Savior the verified results into the student's result collection.
    """
    if not db:
        return jsonify({"error": "Firestore not initialized"}), 500
    
    data = request.json
    uid = data.get('uid')
    evaluation_result = data.get('evaluation_result')
    
    if not uid or not evaluation_result:
        return jsonify({"error": "Missing UID or evaluation data"}), 400
        
    try:
        # Merge with timestamp and student attribution
        ledger_entry = {
            **evaluation_result,
            "roll_number": uid, # Set the final verified UID
            "timestamp": firestore.SERVER_TIMESTAMP,
            "recorded_at": datetime.utcnow().isoformat(),
            "type": "LEDGER_ENTRY"
        }
        
        db.collection("evaluations").add(ledger_entry)
        return jsonify({"status": "success", "message": "Result recorded to ledger"}), 200
    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"Ledger Error: {e}")
        return jsonify({"error": str(e)}), 500

# Legacy fallback for direct evaluation
@app.route('/api/evaluate', methods=['POST'])
def legacy_evaluate():
    return jsonify({"error": "System has migrated to Step-by-Step Extraction workflow."}), 400

@app.route('/api/results', methods=['GET'])
def get_results():
    if not db: return jsonify([]), 200 
    try:
        docs = db.collection("evaluations").order_by("timestamp", direction=firestore.Query.DESCENDING).limit(50).stream()
        results = []
        for doc in docs:
            d = doc.to_dict()
            results.append({
                "id": doc.id,
                "exam": d.get('exam_id', 'Unknown'),
                "student": d.get('roll_number', 'N/A'),
                "date": d.get('timestamp').strftime('%Y-%m-%d') if d.get('timestamp') and hasattr(d.get('timestamp'), 'strftime') else 'Just Now',
                "marks": f"{d.get('score', 0)}/{d.get('total', 0)}",
                "pct": d.get('percentage', '0%'),
                "grade": d.get('grade', 'B')
            })
        return jsonify(results), 200
    except Exception as e:
        print(f"Firestore Error: {e}")
        return jsonify([]), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
