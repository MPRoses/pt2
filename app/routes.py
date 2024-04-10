from urllib.parse import urlsplit
from flask import render_template, flash, redirect, url_for, request, jsonify, current_app
from flask_login import login_user, logout_user, current_user, login_required
import sqlalchemy as sa
from app import app, db
from app.forms import LoginForm, RegistrationForm
from app.models import User, FriendRequest, Chat, Message, Friendship
from sqlalchemy.orm import joinedload
from datetime import datetime, timedelta


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
    return render_template("index.html", title='Home Page', username=current_user)

@app.route('/get_public_users', methods=['GET'])
def get_public_users():
    public_users = User.query.filter_by(privacy='public').all()
    user_names = [user.username for user in public_users]
    return jsonify(user_names), 200

@app.route('/set_user_to_public', methods=['POST'])
@login_required
def set_user_to_public():
    current_user.privacy = 'public'
    db.session.commit()
    return jsonify({'status': 'success'}), 200

@app.route('/get_user_privacy', methods=['GET'])
@login_required
def get_user_privacy():
    return jsonify({'privacy': current_user.privacy}), 200

@app.route('/set_user_to_private', methods=['POST'])
@login_required
def set_user_to_private():
    current_user.privacy = 'private'
    db.session.commit()
    return jsonify({'status': 'success'}), 200


@app.route('/get_chats', methods=['GET'])
@login_required
def get_chats():
    user = current_user
    chats = Chat.query.filter(Chat.users.contains(user)).all()
    chat_usernames = [[user.username for user in chat.users if user.id != current_user.id] for chat in chats]

    # Get the timestamp from the request
    timestamp = request.args.get('timestamp')

    # Convert the timestamp string to a datetime object
    user.last_checked = datetime.strptime(timestamp, '%Y-%m-%d %H:%M:%S')
    db.session.commit()

    return jsonify(chat_usernames), 200


@app.route('/send_friend_request/<username>', methods=['POST'])
@login_required
def send_friend_request(username):
    user_to = User.query.filter_by(username=username).first() 
    if not user_to:
        return jsonify(message='No user with this username')

    user_from = current_user

    if user_to == current_user:
        return jsonify(message="You can't friend yourself, you are not that lonely :) ")     

    if user_to in user_from.friends:
        return jsonify(message='You are already friends with this user')

    existing_friendship = Friendship.query.filter(
        (Friendship.user_id == user_from.id) & (Friendship.friend_id == user_to.id)
    ).first()

    if existing_friendship:
        return jsonify(message='You are already friends with this user')

    existing_request = FriendRequest.query.filter_by(
        from_user_id=user_from.id,
        to_user_id=user_to.id
    ).first()

    if existing_request:
        return jsonify(message='Friend request already sent')

    friend_request = FriendRequest(from_user_id=user_from.id, to_user_id=user_to.id, status=0)

    db.session.add(friend_request)
    db.session.commit()

    return jsonify(message='Friend request sent')
    
@app.route('/get_friend_requests', methods=['GET'])
@login_required
def get_friend_requests():
    user = current_user

    friend_requests = FriendRequest.query.filter_by(to_user_id=user.id, status=0).all()

    friend_request_usernames = [fr.from_user.username for fr in friend_requests]

    return jsonify(friend_request_usernames), 200

@app.route('/accept_friend_request/<username>', methods=['POST'])
@login_required
def accept_friend_request(username):
    user_to = current_user
    user_from = User.query.filter_by(username=username).first()

    if not user_from:
        return jsonify({'message': 'User not found'}), 404

    friend_request = FriendRequest.query.filter_by(
        from_user_id=user_from.id,
        to_user_id=user_to.id
    ).first()

    if not friend_request:
        return jsonify({'message': 'Friend request not found'}), 404

    # Add a friendship relation in both directions
    friendship1 = Friendship(user_id=user_to.id, friend_id=user_from.id)
    friendship2 = Friendship(user_id=user_from.id, friend_id=user_to.id)
    db.session.add(friendship1)
    db.session.add(friendship2)

    # Create a new chat between the two users
    new_chat = Chat()
    new_chat.users.append(user_to)
    new_chat.users.append(user_from)
    db.session.add(new_chat)

    # Reset the friend request
    db.session.delete(friend_request)

    db.session.commit()

    return jsonify({'message': 'Friend request accepted and friendship added'}), 200

@app.route('/delete_friend_request/<username>', methods=['DELETE'])
@login_required
def delete_friend_request(username):
    user_to = current_user
    user_from = User.query.filter_by(username=username).first()

    friend_request = FriendRequest.query.filter_by(
        from_user_id=user_from.id,
        to_user_id=user_to.id
    ).first()

    db.session.delete(friend_request)
    db.session.commit()

    return jsonify({'message': 'success'}), 200


@app.route('/get_user_chats/<usernames>', methods=['GET'])
@login_required
def get_user_chats(usernames):
    usernames = usernames.split(',')
    print(f"Usernames: {usernames}") 
    users = User.query.filter(User.username.in_(usernames)).all()
    print(f"Users: {users}")  
    users.append(current_user)

    # Get the chat that includes all these users
    chat = Chat.query.filter(
        *(Chat.users.any(User.id == user.id) for user in users),
        ~Chat.users.any(User.id.notin_([user.id for user in users]))
    ).first()

    print(f"Chat: {chat}")  # Print the chat

    if chat:
        # Fetch the messages for the chat
        messages = Message.query.filter(Message.chat_id == chat.id).all()

        # Convert the messages into a list of message texts, usernames, and timestamps
        message_texts = []
        for message in messages:
            # Get the current time
            now = datetime.utcnow()

            # Calculate one week ago
            one_week_ago = now - timedelta(weeks=1)

            # Check if the message was sent within the last week
            if message.timestamp > one_week_ago:
                if message.timestamp.date() == now.date():
                    date = 'Today ' + message.timestamp.strftime('%H:%M')
                elif message.timestamp.date() == now.date() - timedelta(days=1):
                    date = 'Yesterday ' + message.timestamp.strftime('%H:%M')
                else:
                    date = message.timestamp.strftime('%a %H:%M')
            else:
                date = message.timestamp.strftime('%m/%d %H:%M')

            message_texts.append({'text': message.text, 'username': message.user.username, 'timestamp': date})

        return jsonify(message_texts), 200
    else:
        return jsonify({'message': 'Chat does not exist'}), 404

@app.route('/favourite_chat/<usernames>', methods=['POST'])
@login_required
def favourite_chat(usernames):
    usernames = usernames.split(',')
    users = User.query.filter(User.username.in_(usernames)).all()
    users.append(current_user)

    # Get the chat that includes all these users
    chat = Chat.query.filter(
        *(Chat.users.any(User.id == user.id) for user in users),
        ~Chat.users.any(User.id.notin_([user.id for user in users]))
    ).first()

    print(f"Users: {users}")  
    print(f"Chat: {chat}")  # Print the chat

    if chat:
        # Add the chat to the user's favourite chats
        current_user.favourite_chats.append(chat)
        db.session.commit()

        # Refresh the current_user
        db.session.refresh(current_user)

        return jsonify({'message': 'Chat added to favourites'}), 200
    else:
        return jsonify({'message': 'Chat does not exist'}), 404



@app.route('/unfavourite_chat/<usernames>', methods=['POST'])
@login_required
def unfavourite_chat(usernames):
    usernames = usernames.split(',')
    users = User.query.filter(User.username.in_(usernames)).all()
    users.append(current_user)

    # Get the chat that includes all these users
    chat = Chat.query.filter(
        *(Chat.users.any(User.id == user.id) for user in users),
        ~Chat.users.any(User.id.notin_([user.id for user in users]))
    ).first()

    if chat and chat in current_user.favourite_chats:
        # Remove the chat from the user's favourite chats
        current_user.favourite_chats.remove(chat)
        db.session.commit()
        db.session.refresh(current_user)

        return jsonify({'message': 'Chat removed from favourites'}), 200
    else:
        return jsonify({'message': 'Chat does not exist or is not a favourite'}), 404

@app.route('/delete_chat/<usernames>', methods=['DELETE'])
@login_required
def delete_chat(usernames):

    usernames = usernames.split(',')
    users = User.query.filter(User.username.in_(usernames)).all()
    users.append(current_user)

    # Get the chat that includes all these users
    chat = Chat.query.filter(
        *(Chat.users.any(User.id == user.id) for user in users),
        ~Chat.users.any(User.id.notin_([user.id for user in users]))
    ).first()

    if chat:
        # Delete the messages associated with the chat
        messages = Message.query.filter(Message.chat_id == chat.id).all()
        for message in messages:
            db.session.delete(message)

        # Delete the chat
        db.session.delete(chat)

    # Remove the friendship relation in both directions
    for user in users:
        for friend in users:
            if user != friend:
                friendship = Friendship.query.filter_by(user_id=user.id, friend_id=friend.id).first()
                if friendship:
                    db.session.delete(friendship)

    db.session.commit()

    return jsonify({'message': 'Friendship and chat removed'}), 200


@app.route('/send_message', methods=['POST'])
@login_required
def send_message():
    data = request.get_json()
    user_sending = current_user
    users_receiving = User.query.filter(User.username.in_(data['userReceiving'].split(','))).all()

    # Ensure all users exist
    if not user_sending or not users_receiving:
        return jsonify({'message': 'One or more users do not exist'}), 400

    # Get the chat that includes all these users
    chat = Chat.query.filter(
        *(Chat.users.any(User.id == user.id) for user in users_receiving),
        Chat.users.any(User.id == user_sending.id),
        ~Chat.users.any(User.id.notin_([user.id for user in [user_sending] + users_receiving]))
    ).first()

    if not chat:
        chat = Chat(users=[user_sending] + users_receiving)
        db.session.add(chat)

    # Use the provided timestamp
    timestamp = datetime.strptime(data['timestamp'], '%Y-%m-%d %H:%M:%S')

    message = Message(text=data['text'], user=user_sending, chat=chat, timestamp=timestamp)
    db.session.add(message)
    db.session.commit()

    return jsonify({'message': 'Message sent successfully'}), 200



@app.route('/chat_add_user', methods=['POST'])
@login_required
def chat_add_user():
    try:
        data = request.get_json()
        new_user = User.query.filter_by(username=data['new_user']).first()
        if not new_user:
            return jsonify({'message': 'New user not found'}), 404

        current_chat_users = User.query.filter(User.username.in_(data['current_chat_users'].split(','))).all()

        if not current_chat_users:
            return jsonify({'message': 'Current chat users not found'}), 404

        # Check if new_user is already part of current_chat_users or equal to current_user
        if new_user in current_chat_users or new_user == current_user:
            return jsonify({'message': 'Already part of chat'}), 400

        # Add current_user to the list of users
        current_chat_users.append(current_user)

        # Get the chat that includes all these users
        chat = Chat.query.filter(
            *(Chat.users.any(User.id == user.id) for user in current_chat_users),
            ~Chat.users.any(User.id.notin_([user.id for user in current_chat_users]))
        ).first()

        if not chat:
            return jsonify({'message': 'Chat not found'}), 404

        # Add the new user to the existing chat
        chat.users.append(new_user)

        # Save the changes to the database
        db.session.commit()

        print("Chat updated successfully")
        return jsonify({'message': 'Chat updated'}), 200

    except Exception as e:
        print(f"An error occurred: {e}")
        return jsonify({'message': 'An error occurred'}), 500



@app.route('/check_new_messages', methods=['GET'])
@login_required
def check_new_messages():
    chats = Chat.query.filter(Chat.users.contains(current_user)).all()
    new_messages = False
    timestamp = request.args.get('timestamp')

    for chat in chats:
        # Get the last message in the chat
        last_message = Message.query.filter_by(chat_id=chat.id).order_by(Message.timestamp.desc()).first()

        # Check if the last message was sent after the last time the user checked
        if last_message and (current_user.last_checked is None or last_message.timestamp > current_user.last_checked):
            new_messages = True
            current_user.last_checked = datetime.strptime(timestamp, '%Y-%m-%d %H:%M:%S')
            db.session.commit()
            break

    return jsonify({'newMessages': new_messages}), 200


@app.route('/get_chat/<usernames>', methods=['GET'])
@login_required
def get_chat(usernames):
    usernames = usernames.split(',')
    users = User.query.filter(User.username.in_(usernames)).all()
    users.append(current_user)

    # Get the chat that includes all these users
    chat = Chat.query.filter(
        *(Chat.users.any(User.id == user.id) for user in users),
        ~Chat.users.any(User.id.notin_([user.id for user in users]))
    ).first()

    if chat:
        last_message = Message.query.filter_by(chat_id=chat.id).order_by(Message.timestamp.desc()).first()
        is_favourite = chat in current_user.favourite_chats
        if last_message:
            # Get the current time
            now = datetime.utcnow()

            # Calculate one week ago
            one_week_ago = now - timedelta(weeks=1)

            # Check if the message was sent within the last week
            if last_message.timestamp > one_week_ago:
                # Format the date as 'Day HH:MM'
                date = last_message.timestamp.strftime('%a %H:%M')
            else:
                # Format the date as 'MM/DD HH:MM'
                date = last_message.timestamp.strftime('%m/%d %H:%M')

            return jsonify({'chatExists': True, 'lastText': last_message.text, 'date': date, 'isFavourite': is_favourite}), 200
        else:
            return jsonify({'chatExists': True, 'lastText': '', 'date': '', 'isFavourite': is_favourite}), 200
    else:
        return jsonify({'chatExists': False}), 200


@app.route('/create_chat/<usernames>', methods=['POST'])
@login_required
def create_chat(usernames):
    usernames = usernames.split(',')
    users = User.query.filter(User.username.in_(usernames)).all()

    # Ensure we have exactly 2 users
    if len(users) != 2:
        return jsonify({'message': 'Invalid usernames'}), 400

    # Check if a chat already exists between these two users
    existing_chat = Chat.query.filter(
        Chat.users.any(User.id == users[0].id),
        Chat.users.any(User.id == users[1].id),
        ~Chat.users.any(User.id.notin_([user.id for user in users]))
    ).first()

    if existing_chat:
        return jsonify({'message': 'Chat already exists'}), 400

    # Create a new chat
    chat = Chat(users=users)
    db.session.add(chat)
    db.session.commit()

    return jsonify({'message': 'Chat created'}), 200

@app.route('/logout')
def logout():
    logout_user()
    return redirect(url_for('landing'))