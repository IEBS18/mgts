from flask import Blueprint, request, jsonify, make_response
from werkzeug.security import generate_password_hash, check_password_hash
import json
import os

auth_blueprint = Blueprint('auth', __name__)

USER_FILE_PATH = os.path.join(os.path.dirname(__file__), 'users.json')

# Helper function to load users from the JSON file
def load_users():
    try:
        with open(USER_FILE_PATH, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        return []  # If the file doesn't exist, return an empty list

# Helper function to save users to the JSON file
def save_users(users):
    try:
        with open(USER_FILE_PATH, 'w') as f:
            json.dump(users, f, indent=4)
    except Exception as e:
        print(f"Error saving users to file: {e}")


# Signup route
@auth_blueprint.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()

    # Extract user details
    first_name = data.get('firstName')
    last_name = data.get('lastName')
    email = data.get('email')
    password = data.get('password')

    # Basic validation for input
    if not first_name or not last_name or not email or not password:
        return jsonify({"error": "All fields are required!"}), 400

    # Load existing users from the JSON file
    users = load_users()

    # Check if the email already exists
    if any(user['email'] == email for user in users):
        return jsonify({"error": "Email already exists!"}), 400

    # Hash the password before storing
    hashed_password = generate_password_hash(password, method='pbkdf2:sha256')

    # Create a new user and add it to the list
    new_user = {
        "id": len(users) + 1,  # Assign a new unique ID based on existing users
        "first_name": first_name,
        "last_name": last_name,
        "email": email,
        "password_hash": hashed_password
    }
    users.append(new_user)

    # Save the updated users list back to the JSON file
    save_users(users)

    # Prepare response with success and set cookie
    response = make_response(jsonify({
        "user_pharmax_id": new_user["id"],
        "first_name": first_name,
        "message": "Account created successfully!"
    }), 201)

    # Set the user_pharmax_id cookie
    response.set_cookie(
        'user_pharmax_id', 
        value=str(new_user["id"]), 
        max_age=60*60*24*7,  # 1 week validity
        samesite='Lax'       # Adjust based on your requirements
    )

    return response


@auth_blueprint.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    users = load_users()
    user = next((u for u in users if u['email'] == email), None)

    if user and check_password_hash(user['password_hash'], password):
        response = make_response(jsonify({
            "user_pharmax_id": user["id"],
            "first_name": user["first_name"],
            "message": "Login successful!"
        }), 200)

        # Set the cookie with proper attributes for local development
        response.set_cookie(
            'user_pharmax_id',
            value=str(user["id"]),
            max_age=60*60*24*7,  
            samesite='Lax'
        )
        return response

    return jsonify({"error": "Invalid credentials!"}), 401

@auth_blueprint.route('/check_login', methods=['GET'])
def check_login():
    user_id = request.cookies.get('user_pharmax_id')
    if user_id:
        return jsonify({'logged_in': True}), 200
    return jsonify({'logged_in': True}), 200
