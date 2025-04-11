from flask import Flask, request, jsonify
import subprocess
import json
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # This line allows cross-origin requests from your frontend

@app.route("/api/info", methods=["POST"])
def get_video_info():
    data = request.get_json()
    url = data.get("url")

    if not url:
        return jsonify({"error": "No URL provided"}), 400

    try:
        result = subprocess.run(
            ["yt-dlp", "-J", "--no-playlist", url],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            timeout=20
        )

        if result.returncode != 0:
            return jsonify({"error": result.stderr.decode()}), 400

        info = json.loads(result.stdout)
        return jsonify(info)

    except subprocess.TimeoutExpired:
        return jsonify({"error": "Timeout while fetching video info"}), 408

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, port=5000)