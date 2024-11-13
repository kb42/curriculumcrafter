from flask import Flask

app = Flask(__name__)

@app.route("/points")
def members():
    return {"points": ["Point1", "Point2", "Point3"]}

if __name__ == "__main__":
    app.run(debug=True)
