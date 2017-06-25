from flask import Flask, render_template, url_for, request, session, redirect, jsonify
from database import database_reader, write_to_database
import werkzeug
from datetime import datetime

app = Flask(__name__)


@app.route("/")
def index():
    if "username" in session:
        return render_template("index.html", user=session["username"])
    return render_template("index.html")


@app.route("/registration.html")
def reg_page():
    return render_template("registration.html")


@app.route("/register", methods=["POST"])
def register():
    regname = request.form["regname"]
    regpass = request.form["regpass"]
    secpass = werkzeug.security.generate_password_hash(regpass, method='pbkdf2:sha256', salt_length=8)
    write_to_database("INSERT INTO users (username, password) VALUES ('{}','{}');".format(regname, secpass))

    return render_template("index.html")


@app.route("/login.html")
def login_page():
    return render_template("login.html")


@app.route("/login", methods=["POST"])
def login():
    logname = request.form["logname"]
    logpass = request.form["logpass"]
    user_info = database_reader("SELECT * FROM users WHERE username='{}';".format(logname))

    if not user_info:
        return render_template("login.html", wrong_pass=True)

    user_info = user_info[0]
    secpass = werkzeug.security.check_password_hash(user_info[2], logpass)

    if secpass:
        session["username"] = logname
        return render_template("index.html", user_id=user_info[0], user=user_info[1])
    else:
        return render_template("login.html", wrong_pass=True) 

 
@app.route("/log-out")
def log_out():
    session.pop("username", None)
    return redirect(url_for("index"))


@app.route("/vote-planet", methods=["POST"])
def vote_planet():
    planet_id = request.form["pId"][0]
    user_id = database_reader("SELECT id FROM users WHERE username='{}';".format(session["username"]))
    user_id = user_id[0][0]
    sub_time = str(datetime.now())[:19]
    write_to_database("INSERT INTO planetvotes (planet_id, user_id, submission_time)\
                                                VALUES ('{}','{}','{}');".format(planet_id, user_id, sub_time))
    return redirect(url_for("index"))


@app.route("/show-votes", methods=["POST"])
def show_votes():
    data = database_reader("SELECT planet_id, COUNT(planet_id) FROM planetvotes GROUP BY planet_id;")
    return jsonify(data=data)


if __name__ == '__main__':
    app.secret_key = "abcd1234"
    app.run(debug=True)
