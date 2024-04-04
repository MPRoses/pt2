from urllib.parse import urlsplit
from flask import render_template, flash, redirect, url_for, request, jsonify
from flask_login import login_user, logout_user, current_user, login_required
import sqlalchemy as sa
from app import app, db
from app.forms import LoginForm, RegistrationForm
from app.models import User


@app.route('/', methods=['GET', 'POST'])
def landing():
    print("Received a request")  # Debugging statement
    if current_user.is_authenticated:
        return redirect(url_for('index'))

    login_form = LoginForm(request.form)
    register_form = RegistrationForm(request.form)

    if request.method == 'POST':
        print("Received a POST request")  # Debugging statement
        print(f"Request form: {request.form}")  # New debugging statement
        if 'login_submit' in request.form:
            print("Login form was submitted")  # Debugging statement
            if login_form.validate():
                print("Login form data is valid")  # Debugging statement
                user = User.query.filter_by(username=login_form.username.data).first()
                if user is None or not user.check_password(login_form.password.data):
                    print("Invalid username or password")  # Debugging statement
                    return jsonify(error='Invalid username or password')
                login_user(user, remember=login_form.remember_me.data)
                next_page = request.args.get('next')
                if not next_page or urlsplit(next_page).netloc != '':
                    next_page = url_for('index')
                return jsonify(redirect_url=next_page)
            else:
                print("Form validation failed")  # Debugging statement
                print(f"Errors: {login_form.errors}")  # New debugging statement
                return jsonify(error='Form validation failed')
                
        elif 'register_submit' in request.form:
            print("Register form was submitted")  # Debugging statement
            print(f"Register form data: {register_form.data}")  # New debugging statement
            if register_form.validate():
                print("Register form data is valid")  # Debugging statement
                user = User(username=register_form.username.data, email=register_form.email.data)
                user.set_password(register_form.password.data)
                db.session.add(user)
                db.session.commit()
                flash('Congratulations, you are now a registered user!')
                return jsonify(message='Registration successful')
            else:
                print("Form validation failed")  # Debugging statement
                print(f"Errors: {register_form.errors}")  # New debugging statement
                return jsonify(error='Form validation failed', form_errors=register_form.errors)

    return render_template('landing.html', title='Connectr.', login_form=login_form, register_form=register_form)

@app.route('/index')
@login_required
def index():
    user = {'username': '123'}
    return render_template("index.html", title='Home Page')

@app.route('/register', methods=['GET', 'POST'])
def register():
    if current_user.is_authenticated:
        return redirect(url_for('index'))
    form = RegistrationForm()
    if form.validate_on_submit():
        user = User(username=form.username.data, email=form.email.data)
        user.set_password(form.password.data)
        db.session.add(user)
        db.session.commit()
        flash('Congratulations, you are now a registered user!')
        return redirect(url_for('login'))
    return render_template('register.html', title='Register', form=form)

@app.route('/logout')
def logout():
    logout_user()
    return redirect(url_for('landing'))