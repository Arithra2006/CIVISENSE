
from flask import Flask, request, jsonify, render_template
import pandas as pd
import numpy as np
import bcrypt
import jwt
import datetime
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__, static_folder='static', template_folder='templates')

app.config['SECRET_KEY'] = 'your-secret-key'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///users.db'
CORS(app)
db = SQLAlchemy(app)

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100))
    email = db.Column(db.String(100), unique=True)
    password_hash = db.Column(db.String(128))
    role = db.Column(db.String(50))
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)

class Goal(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_email = db.Column(db.String(100), db.ForeignKey('user.email'))
    name = db.Column(db.String(100))
    target_amount = db.Column(db.Float)
    daily_habit = db.Column(db.String(100))
    habit_cost = db.Column(db.Float)
    start_date = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    saved_amount = db.Column(db.Float, default=0.0)
    days_completed = db.Column(db.Integer, default=0)
    days_skipped = db.Column(db.Integer, default=0)
    history = db.Column(db.JSON)  # stores list of {"date": ..., "amount": ..., "type": ...}

@app.route('/api/save_goal', methods=['POST'])
def save_goal():
    token = request.headers.get('Authorization')
    if not token:
        return jsonify({'error': 'Missing token'}), 403
    try:
        decoded = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
        email = decoded['email']
    except jwt.ExpiredSignatureError:
        return jsonify({'error': 'Token expired'}), 401
    except jwt.InvalidTokenError:
        return jsonify({'error': 'Invalid token'}), 401

    data = request.get_json()
    goal = Goal.query.filter_by(user_email=email).first()
    if not goal:
        goal = Goal(user_email=email)
    goal.name = data['name']
    goal.target_amount = data['targetAmount']
    goal.daily_habit = data['dailyHabit']
    goal.habit_cost = data['habitCost']
    goal.start_date = datetime.datetime.utcnow()
    goal.saved_amount = data.get('savedAmount', 0)
    goal.days_completed = data.get('daysCompleted', 0)
    goal.days_skipped = data.get('daysSkipped', 0)
    goal.history = data.get('history', [])

    db.session.add(goal)
    db.session.commit()

    return jsonify({'message': 'Goal saved successfully'})

@app.route('/api/get_goal', methods=['GET'])
def get_goal():
    token = request.headers.get('Authorization')
    if not token:
        return jsonify({'error': 'Missing token'}), 403
    try:
        decoded = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
        email = decoded['email']
    except jwt.ExpiredSignatureError:
        return jsonify({'error': 'Token expired'}), 401
    except jwt.InvalidTokenError:
        return jsonify({'error': 'Invalid token'}), 401

    goal = Goal.query.filter_by(user_email=email).first()
    if not goal:
        return jsonify({})
    return jsonify({
        'name': goal.name,
        'targetAmount': goal.target_amount,
        'dailyHabit': goal.daily_habit,
        'habitCost': goal.habit_cost,
        'startDate': str(goal.start_date),
        'savedAmount': goal.saved_amount,
        'daysCompleted': goal.days_completed,
        'daysSkipped': goal.days_skipped,
        'history': goal.history or []
    })


# Load the main dataset
college_df = pd.read_csv("enhanced_college_dataset.csv")

# Clean up column names and data
college_df.columns = college_df.columns.str.strip()
college_df = college_df.dropna(subset=["fees"])
college_df["fees"] = pd.to_numeric(college_df["fees"], errors='coerce')
college_df["student_rating"] = pd.to_numeric(college_df["student_rating"], errors='coerce')
college_df["placement_rate"] = pd.to_numeric(college_df["placement_rate"], errors='coerce')
college_df = college_df.dropna()


@app.route('/')
def index():
    return render_template("index.html")

@app.route('/dashboard')
def dashboard():
    return render_template("student-dashboard.html")

@app.route('/goals')
def goals():
    return render_template("goal-tracker.html")

@app.route('/expenses')
def expenses():
    return render_template("expense-tracker.html")

@app.route('/college-finder')
def college_finder():
    return render_template("college-finder.html")

@app.route('/compare')
def compare_page():
    return render_template("college-comparer.html")

@app.route('/job-dashboard')
def job_dashboard():
    return render_template("job-dashboard.html")

@app.route('/expenses-job')
def expense_job():
    return render_template("expense-tracker-job.html")


@app.route('/gov-dashboard')
def gov_dashboard():
    return render_template("governmentdashboard.html")



@app.route('/api/find_colleges')
def find_colleges():
    state = request.args.get('state', '')
    stream = request.args.get('stream', '')
    budget = request.args.get('budget', '')

    try:
        budget = float(budget) if budget else float('inf')
    except ValueError:
        return jsonify({"error": "Invalid budget"}), 400

    filtered = college_df.copy()

    if state:
        filtered = filtered[filtered["state"].str.lower() == state.lower()]
    if stream:
        filtered = filtered[filtered["stream"].str.lower() == stream.lower()]
    
    filtered = filtered[filtered["fees"] <= budget]

    filtered = filtered.sort_values(by="student_rating", ascending=False)

    results = filtered[[
        "name","state","stream","fees","student_rating","placement_rate","industry_tieups","location"
    ]].to_dict(orient="records")

    return jsonify(results)

@app.route('/api/average_fees_by_stream')
def average_fees_by_stream():
    avg_fees = (
        college_df.groupby("stream")["fees"]
        .mean()
        .reset_index()
        .sort_values(by="fees", ascending=False)
    )
    return jsonify(avg_fees.to_dict(orient="records"))
    

@app.route('/api/college_names')
def college_names():
    names = college_df['name'].dropna().unique().tolist()
    return jsonify(names)


@app.route('/api/compare_colleges')
def compare_colleges():
    name1 = request.args.get('college1', '').strip().lower()
    name2 = request.args.get('college2', '').strip().lower()

    # Always return 2 items (null-filled if missing)
    college1 = college_df[college_df["name"].str.lower() == name1].iloc[0] if any(college_df["name"].str.lower() == name1) else None
    college2 = college_df[college_df["name"].str.lower() == name2].iloc[0] if any(college_df["name"].str.lower() == name2) else None

    result = [college1, college2]
    return jsonify([r.to_dict() if r is not None else {} for r in result])

    result = college_df[
        college_df["name"].str.lower().isin([name1, name2])
    ][["name", "state", "stream", "fees", "student_rating", "placement_rate", "industry_tieups", "location"]]

    data = result.to_dict(orient="records")
    return jsonify(data)

gov_df = pd.read_csv("India_State_Costs_and_Job_Index.csv")

@app.route('/state_data', methods=['GET', 'POST'])
def state_data():
    if request.method == 'POST':
        data = request.get_json()
        state_name = data.get("state")

        # Use the correct dataset
        state_row = gov_df[gov_df["State"].str.lower() == state_name.lower()]
        if state_row.empty:
            return jsonify({"error": "State not found"}), 404

        # Convert to dictionary, return only one row
        result = state_row.iloc[0].to_dict()
        return jsonify(result)
    
    # If GET request → render page
    return render_template("statecost.html")

@app.route('/census-explorer')
def census_explorer():
    return render_template('census-explorer.html')

# Load 2011 census data at app start
census_2011_df = pd.read_csv("census_2011_india_formatted.csv")

@app.route('/api/census_2011')
def census_api():
    state = request.args.get('state', '').strip().lower()
    row = census_2011_df[census_2011_df['State'].str.lower() == state]

    if row.empty:
        return jsonify({"error": "State not found"}), 404

    return jsonify(row.iloc[0].to_dict())

@app.route('/development')
def development():
    return render_template("development_comparator.html")


# ✅ Map year ranges to CSV files
year_dataset_mapping = {
    "1990-2000": pd.read_csv("census_1991_india_formatted.csv"),
    "2001-2010": pd.read_csv("census_2001_india_formatted.csv"),
    "2011-2025": pd.read_csv("census_2011_india_formatted.csv")
}

# ✅ Function to get correct dataset for any year
def get_dataset_for_year(year):
    if 1990 <= year <= 2000:
        return year_dataset_mapping["1990-2000"]
    elif 2001 <= year <= 2010:
        return year_dataset_mapping["2001-2010"]
    elif 2011 <= year <= 2025:
        return year_dataset_mapping["2011-2025"]
    else:
        return None


@app.route('/api/compare_development')
def compare_development():
    state1 = request.args.get('state1')
    state2 = request.args.get('state2')
    year_from = request.args.get('from')
    year_to = request.args.get('to')

    if not (state1 and state2 and year_from and year_to):
        return jsonify({"error": "Missing parameters. Please provide state1, state2, from, and to."}), 400

    try:
        year_from = int(year_from)
        year_to = int(year_to)
    except ValueError:
        return jsonify({"error": "Year parameters must be integers."}), 400

    if year_from == year_to:
        return jsonify({"error": "No change in year range. Select different years."}), 400

    df_from = get_dataset_for_year(year_from)
    df_to = get_dataset_for_year(year_to)

    if df_from is None or df_to is None:
        return jsonify({"error": f"Data not available for selected years: {year_from}, {year_to}"}), 404

    def extract_values(state, df):
        row = df[df["State"].str.lower() == state.lower()]
        if row.empty:
            raise ValueError(f"No data found for state: {state}")
        row = row.iloc[0]
        return {
            "Population": int(str(row["Population"]).replace(",", "")),
            "Poverty Rate (%)": float(str(row["Poverty Rate (%)"]).replace(",", "")),
            "Literacy Rate (%)": float(str(row["Literacy Rate (%)"]).replace(",", "")),
            "Average Income (INR)": int(str(row["Average Income (INR)"]).replace(",", ""))
        }

    try:
        state1_from = extract_values(state1, df_from)
        state1_to = extract_values(state1, df_to)
        state2_from = extract_values(state2, df_from)
        state2_to = extract_values(state2, df_to)
    except ValueError as e:
        return jsonify({"error": str(e)}), 404

    def compute_change(to, frm):
        result = {}
        for col in to:
            change = to[col] - frm[col]
            arrow = "↑" if change > 0 else "↓" if change < 0 else "→"
            result[col] = {"change": change, "arrow": arrow}
        return result

    change1 = compute_change(state1_to, state1_from)
    change2 = compute_change(state2_to, state2_from)

    suggestion = ""
    if state1_to["Literacy Rate (%)"] > state1_from["Literacy Rate (%)"] and state1_to["Average Income (INR)"] <= state1_from["Average Income (INR)"]:
        suggestion += f"📌 For {state1}: Education improved but income didn't — may lack job opportunities.\n"
    if state1_to["Average Income (INR)"] > state1_from["Average Income (INR)"] and state1_to["Literacy Rate (%)"] <= state1_from["Literacy Rate (%)"]:
        suggestion += f"📌 For {state1}: Income grew despite no improvement in literacy — maybe informal jobs.\n"
    if state1_to["Poverty Rate (%)"] > state1_from["Poverty Rate (%)"] and state1_to["Average Income (INR)"] < state1_from["Average Income (INR)"]:
        suggestion += f"📌 For {state1}: Poverty worsened while income declined — consider employment generation schemes.\n"

    if state2_to["Literacy Rate (%)"] > state2_from["Literacy Rate (%)"] and state2_to["Average Income (INR)"] <= state2_from["Average Income (INR)"]:
        suggestion += f"📌 For {state2}: Education improved but income didn't — may lack job opportunities.\n"
    if state2_to["Average Income (INR)"] > state2_from["Average Income (INR)"] and state2_to["Literacy Rate (%)"] <= state2_from["Literacy Rate (%)"]:
        suggestion += f"📌 For {state2}: Income grew despite no improvement in literacy — maybe informal jobs.\n"
    if state2_to["Poverty Rate (%)"] > state2_from["Poverty Rate (%)"] and state2_to["Average Income (INR)"] < state2_from["Average Income (INR)"]:
        suggestion += f"📌 For {state2}: Poverty worsened while income declined — consider employment generation schemes.\n"

    return jsonify({
        state1: {"from": state1_from, "to": state1_to, "change": change1},
        state2: {"from": state2_from, "to": state2_to, "change": change2},
        "suggestion": suggestion.strip()
    })

@app.route('/budget')
def budget():
    return render_template("budget-tracker.html")
# Jupyter Notebook Code to Run Your Flask App for Govt Schemes

# Step 2: Load your dataset (ensure the CSV is in the same directory or provide full path)
df = pd.read_csv("indian_government_schemes_dataset_updated.csv")


@app.route('/govt-schemes')
def govt_schemes():
    return render_template("scheme_selector.html")

@app.route('/get_schemes', methods=['POST'])
def get_schemes():
    data = request.get_json()
    state = data.get('state')
    age = int(data.get('age'))
    sector = data.get('sector')
    gender = data.get('gender')

    filtered_df = df[
        (df['state'] == state) &
        (df['sector'] == sector) &
        (df['min_age'] <= age) &
        (df['max_age'] >= age)
    ]
    results = filtered_df[[
    'scheme_name', 'conditions', 'documents_needed', 'skills_offered', 'offered_by'
]].drop_duplicates().to_dict(orient='records')

    return jsonify(results)

@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    name = data['name']
    email = data['email']
    password = data['password']
    role = data['role']

    existing_user = User.query.filter_by(email=email).first()
    if existing_user:
        return jsonify({'error': 'Email already registered'}), 400

    hashed_pw = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

    user = User(name=name, email=email, password_hash=hashed_pw, role=role)
    db.session.add(user)
    db.session.commit()

    return jsonify({'message': 'Registration successful'}), 201

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data['email']
    password = data['password']
    role = data['role']

    user = User.query.filter_by(email=email, role=role).first()
    if not user or not bcrypt.checkpw(password.encode('utf-8'), user.password_hash):
        return jsonify({'error': 'Invalid credentials'}), 401

    token = jwt.encode({
        'email': user.email,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=2)
    }, app.config['SECRET_KEY'], algorithm='HS256')

    return jsonify({'message': 'Login successful', 'token': token, 'name': user.name})

if __name__ == '__main__':
    app.run(debug=True)