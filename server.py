from flask import Flask, jsonify, request, send_from_directory
import json
import os

app = Flask(__name__, static_folder='.')

DATA_FILE = 'data.json'

def load_tasks():
    if os.path.exists(DATA_FILE):
        with open(DATA_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    return {"tasks": []}

def save_tasks(data):
    with open(DATA_FILE, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

@app.route('/api/tasks', methods=['GET'])
def get_tasks():
    return jsonify(load_tasks())

@app.route('/api/tasks', methods=['POST'])
def add_task():
    task = request.json
    data = load_tasks()
    data["tasks"].append(task)
    save_tasks(data)
    return jsonify({"success": True})

@app.route('/api/tasks/<int:task_id>', methods=['DELETE'])
def delete_task(task_id):
    data = load_tasks()
    data["tasks"] = [t for t in data["tasks"] if t["id"] != task_id]
    save_tasks(data)
    return jsonify({"success": True})

@app.route('/api/tasks/<int:task_id>', methods=['PUT'])
def update_task(task_id):
    new_status = request.json.get("status")
    data = load_tasks()
    for task in data["tasks"]:
        if task["id"] == task_id:
            task["status"] = new_status
            break
    save_tasks(data)
    return jsonify({"success": True})

# Сервинг HTML и статики
@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/<path:path>')
def static_files(path):
    return send_from_directory('.', path)

if __name__ == '__main__':
    app.run(debug=True)