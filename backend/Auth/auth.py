from flask import Flask, Blueprint, request, jsonify, make_response
from werkzeug.security import generate_password_hash, check_password_hash
from flask_cors import CORS
import json
import os
import logging

# Blueprint for Auth functionality
auth_blueprint = Blueprint('auth', __name__)

USER_FILE_PATH = os.path.join(os.path.dirname(__file__), "users.json")

def load_users():
    """Helper function to load users from the JSON file."""
    try:
        with open(USER_FILE_PATH, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        return []


def save_users(users):
    """Helper function to save users to the JSON file."""
    try:
        with open(USER_FILE_PATH, 'w') as f:
            json.dump(users, f, indent=4)
    except Exception as e:
        logging.error(f"Error saving users to file: {e}")


@auth_blueprint.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()

    first_name = data.get('firstName')
    last_name = data.get('lastName')
    email = data.get('email')
    password = data.get('password')

    if not first_name or not last_name or not email or not password:
        return jsonify({"error": "All fields are required!"}), 400

    users = load_users()

    # Check for duplicate email
    if any(user['email'] == email for user in users):
        return jsonify({"error": "Email already exists!"}), 400

    hashed_password = generate_password_hash(password, method='pbkdf2:sha256')

    new_user = {
        "id": len(users) + 1,
        "first_name": first_name,
        "last_name": last_name,
        "email": email,
        "password_hash": hashed_password
    }
    users.append(new_user)
    save_users(users)

    response = make_response(jsonify({
        "user_pharmax_id": new_user["id"],
        "first_name": first_name,
        "message": "Account created successfully!"
    }), 201)

    response.set_cookie(
        'user_pharmax_id',
        value=str(new_user["id"]),
        max_age=60 * 60 * 24 * 7,  # Cookie valid for 1 week
        samesite='Lax'
    )
    return response



# @auth_blueprint.route('/signup', methods=['POST'])
# def signup():
#     data = request.get_json()

#     first_name = data.get('firstName')
#     last_name = data.get('lastName')
#     email = data.get('email')
#     password = data.get('password')

#     # Basic validation
#     if not first_name or not last_name or not email or not password:
#         return jsonify({"error": "All fields are required!"}), 400

#     users = load_users()

#     # Check for duplicate email
#     if any(user['email'] == email for user in users):
#         return jsonify({"error": "Email already exists!"}), 400

#     hashed_password = generate_password_hash(password, method='pbkdf2:sha256')

#     new_user = {
#         "id": len(users) + 1,
#         "first_name": first_name,
#         "last_name": last_name,
#         "email": email,
#         "password_hash": hashed_password
#     }
#     users.append(new_user)
#     save_users(users)

#     response = make_response(jsonify({
#         "user_pharmax_id": new_user["id"],
#         "first_name": first_name,
#         "message": "Account created successfully!"
#     }), 201)

#     # Set cookie
#     response.set_cookie(
#         'user_pharmax_id',
#         value=str(new_user["id"]),
#         max_age=60 * 60 * 24 * 7,  # 1 week
#         samesite='Lax'
#     )
#     return response


@auth_blueprint.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    users = load_users()
    user = next((u for u in users if u['email'] == email), None)

    if user and check_password_hash(user['password_hash'], password):
        # Successful login
        response = make_response(jsonify({
            "user_pharmax_id": user["id"],
            "first_name": user["first_name"],
            "message": "Login successful!"
        }), 200)

        response.set_cookie(
            'user_pharmax_id',
            value=str(user["id"]),
            max_age=60 * 60 * 24 * 7,  # Cookie valid for 1 week
            samesite='Lax'
        )
        return response
    else:
        # Invalid credentials
        return jsonify({"error": "Invalid credentials!"}), 401


# @auth_blueprint.route('/login', methods=['POST'])
# def login():
#     data = request.get_json()
#     email = data.get('email')
#     password = data.get('password')

#     users = load_users()
#     user = next((u for u in users if u['email'] == email), None)

#     if user and check_password_hash(user['password_hash'], password):
#         response = make_response(jsonify({
#             "user_pharmax_id": user["id"],
#             "first_name": user["first_name"],
#             "message": "Login successful!"
#         }), 200)
#         response.set_cookie(
#             'user_pharmax_id',
#             value=str(user["id"]),
#             max_age=60 * 60 * 24 * 7,
#             samesite='Lax'
#         )
#         return response

#     return jsonify({"error": "Invalid credentials!"}), 401


# @auth_blueprint.route('/check_login', methods=['GET'])
# def check_login():
#     user_id = request.cookies.get('user_pharmax_id')
#     if user_id:
#         return jsonify({'logged_in': True}), 200
#     else:
#         # If no cookie found, returns false
#         return jsonify({'logged_in': False}), 200

@auth_blueprint.route('/check_login', methods=['GET'])
def check_login():
    # Get user data from request headers
    user_id = request.headers.get('user_pharmax_id')
    first_name = request.headers.get('first_name_pharmax_user')

    # If both user_id and first_name are found, user is logged in
    if user_id and first_name:
        logging.info(f"User with ID {user_id} and First Name {first_name} is logged in.")
        return jsonify({'logged_in': True}), 200
    else:
        # If not, user is not logged in
        logging.info("No user is logged in. Missing user data in request headers.")
        return jsonify({'logged_in': True}), 400  # Return 200, indicating checked successfully
        # return jsonify({'logged_in': False}), 400  # Return 200, indicating checked successfully


# 4. Create the Flask app instance, configure logging/CORS, and register the blueprint
def create_app():
    app = Flask(__name__)

    # Configure Logging
    log_directory = os.path.join(os.path.dirname(os.path.abspath(__file__)), "logs")
    os.makedirs(log_directory, exist_ok=True)
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s - %(levelname)s - %(message)s",
        handlers=[
            logging.FileHandler(os.path.join(log_directory, "app.log")),
            logging.StreamHandler()
        ]
    )

    # Set up CORS
    CORS(
        app,
        supports_credentials=True,
        origins=[
            "http://localhost:5173",
            "http://68.154.56.138:3000",
            "http://localhost:5174",
            "http://127.0.0.1:5000"
        ]
    )

    # Register Blueprint
    app.register_blueprint(auth_blueprint)

    return app


# 5. Run the application
if __name__ == '__main__':
    logging.info("Starting Flask Auth microservice on port 5001...")
    app = create_app()
    app.run(host="0.0.0.0", port=5001)
