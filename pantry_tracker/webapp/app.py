from flask import Flask, request, jsonify, render_template
import os
import requests
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)

# Initialize Flask app
app = Flask(__name__, static_url_path='/static', static_folder='static', template_folder='templates')

# Home Assistant connection details
HA_URL = 'http://supervisor/core'
HA_TOKEN = os.environ.get('SUPERVISOR_TOKEN')
HEADERS = {
    "Authorization": f"Bearer {HA_TOKEN}",
    "Content-Type": "application/json",
}

# Log the start of the application
logging.info("Pantry Tracker add-on started")

# Adjust the SCRIPT_NAME based on X-Ingress-Path
@app.before_request
def adjust_script_name():
    ingress_path = request.headers.get('X-Ingress-Path', '')
    if ingress_path:
        # Adjust SCRIPT_NAME and PATH_INFO for correct URL generation
        request.environ['SCRIPT_NAME'] = ingress_path
        path_info = request.environ.get('PATH_INFO', '')
        if path_info.startswith(ingress_path):
            request.environ['PATH_INFO'] = path_info[len(ingress_path):]

@app.route("/")
def index():
    logging.debug("Rendering index.html")
    return render_template("index.html")

@app.route("/api/products", methods=["GET"])
def get_products():
    try:
        logging.debug("Fetching products from Home Assistant")
        response = requests.get(f"{HA_URL}/api/states", headers=HEADERS)
        response.raise_for_status()
        entities = response.json()
        products = [entity for entity in entities if entity['entity_id'].startswith('pantry_tracker.')]
        logging.info(f"Retrieved {len(products)} products")
        return jsonify(products)
    except Exception as e:
        logging.exception("Error fetching products")
        return jsonify({"error": str(e)}), 500

@app.route("/api/products/<path:entity_id>/adjust", methods=["POST"])
def adjust_product_quantity(entity_id):
    data = request.json
    adjustment = data.get("adjustment", 0)
    logging.info(f"Adjusting quantity for {entity_id} by {adjustment}")
    try:
        # Get the current state
        response = requests.get(f"{HA_URL}/api/states/{entity_id}", headers=HEADERS)
        response.raise_for_status()
        entity = response.json()
        current_quantity = int(entity['state'])
        new_quantity = current_quantity + adjustment
        if new_quantity >= 0:
            # Update the state
            payload = {"state": str(new_quantity), "attributes": entity['attributes']}
            response = requests.post(f"{HA_URL}/api/states/{entity_id}", headers=HEADERS, json=payload)
            response.raise_for_status()
            logging.info(f"Updated {entity_id} quantity to {new_quantity}")
            return jsonify({"status": "success", "new_value": new_quantity})
        else:
            logging.warning(f"Attempted to set negative quantity for {entity_id}")
            return jsonify({"error": "Quantity cannot be negative"}), 400
    except Exception as e:
        logging.exception(f"Error adjusting quantity for {entity_id}")
        return jsonify({"error": str(e)}), 500

@app.route("/api/entities", methods=["POST"])
def create_entity():
    data = request.json
    entity_type = data.get("type")  # 'category' or 'product'
    name = data.get("name")
    image_url = data.get("image_url", "")
    category = data.get("category", "")
    entity_id = data.get("entity_id", "")

    if not name:
        return jsonify({"error": "Name is required"}), 400

    if not entity_id:
        entity_id = f"pantry_tracker.{name.lower().replace(' ', '_')}"

    attributes = {
        "friendly_name": name,
    }

    if entity_type == "category":
        attributes["is_category"] = True
        state = "-10"  # Indicate category with a special state
    else:
        attributes["product_image"] = image_url
        attributes["assoc_cat"] = category
        state = "0"

    try:
        # Create or update the entity
        payload = {
            "state": state,
            "attributes": attributes
        }
        response = requests.post(f"{HA_URL}/api/states/{entity_id}", headers=HEADERS, json=payload)
        response.raise_for_status()
        logging.info(f"Entity {entity_id} created or updated")
        return jsonify({"status": "success"}), 201
    except Exception as e:
        logging.exception("Error creating entity")
        return jsonify({"error": str(e)}), 500

# New endpoint to delete an entity
@app.route("/api/entities/<path:entity_id>", methods=["DELETE"])
def delete_entity(entity_id):
    try:
        # Call the Home Assistant service to remove the entity
        service_data = {"entity_id": entity_id}
        response = requests.post(f"{HA_URL}/api/services/homeassistant/remove_entity", headers=HEADERS, json=service_data)
        response.raise_for_status()
        logging.info(f"Entity {entity_id} deleted")
        return jsonify({"status": "success"}), 200
    except Exception as e:
        logging.exception(f"Error deleting entity {entity_id}")
        return jsonify({"error": str(e)}), 500

# Optional test endpoint
@app.route("/api/test_connection", methods=["GET"])
def test_connection():
    try:
        response = requests.get(f"{HA_URL}/api/", headers=HEADERS)
        response.raise_for_status()
        return jsonify({"status": "success", "data": response.json()}), 200
    except Exception as e:
        logging.exception("Error testing connection to Home Assistant API")
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
