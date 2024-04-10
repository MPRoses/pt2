from datetime import datetime, timezone
from typing import Optional
import sqlalchemy as sa
from werkzeug.security import generate_password_hash, check_password_hash
import sqlalchemy.orm as so
from app import db
from app import login
from flask_login import UserMixin

favourite_chats = db.Table('favourite_chats',
    db.Column('user_id', db.Integer, db.ForeignKey('user.id')),
    db.Column('chat_id', db.Integer, db.ForeignKey('chat.id'))
)

class User(UserMixin, db.Model):
    privacy: so.Mapped[str] = so.mapped_column(sa.String(64), default='private')
    is_active: so.Mapped[int] = so.mapped_column(sa.Integer, default=1)


    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    id: so.Mapped[int] = so.mapped_column(primary_key=True)
    username: so.Mapped[str] = so.mapped_column(sa.String(64), index=True,
                                                unique=True)
    email: so.Mapped[str] = so.mapped_column(sa.String(120), index=True,
                                             unique=True)
    password_hash: so.Mapped[Optional[str]] = so.mapped_column(sa.String(256))
    
    last_checked = db.Column(db.DateTime, default=datetime.utcnow)

    posts: so.WriteOnlyMapped['Post'] = so.relationship(
        back_populates='author')

    sent_requests = so.relationship(
        'FriendRequest',
        foreign_keys='FriendRequest.from_user_id',
        backref='from_user_backref',
        lazy='dynamic'
    )

    received_requests = so.relationship(
        'FriendRequest',
        foreign_keys='FriendRequest.to_user_id',
        backref='to_user_backref',
        lazy='dynamic'
    )

    favourite_chats = db.relationship(
        'Chat',
        secondary=favourite_chats,
        backref=db.backref('favourited_by', lazy='dynamic')
    )

    @property
    def pending_requests(self):
        return FriendRequest.query.filter_by(to_user_id=self.id, status=0)

    @property
    def friends(self):
        return User.query.join(
            FriendRequest, (FriendRequest.from_user_id == User.id) | (FriendRequest.to_user_id == User.id)
        ).filter(FriendRequest.status == 1)


    def __repr__(self):
        return '<User {}>'.format(self.username)


class Post(db.Model):
    id: so.Mapped[int] = so.mapped_column(primary_key=True)
    body: so.Mapped[str] = so.mapped_column(sa.String(140))
    timestamp: so.Mapped[datetime] = so.mapped_column(
        index=True, default=lambda: datetime.now(timezone.utc))
    user_id: so.Mapped[int] = so.mapped_column(sa.ForeignKey(User.id),
                                               index=True)

    author: so.Mapped[User] = so.relationship(back_populates='posts')

    def __repr__(self):
        return '<Post {}>'.format(self.body)

class Chat(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    users = db.relationship(
        'User',
        secondary='chat_users',
        backref=db.backref('chats', lazy='dynamic')
    )
    messages = db.relationship('Message', backref='chat', lazy='dynamic')



class Message(db.Model):
    id: so.Mapped[int] = so.mapped_column(primary_key=True)
    text: so.Mapped[str] = so.mapped_column(sa.String(500))
    timestamp: so.Mapped[datetime] = so.mapped_column(
        index=True, default=lambda: datetime.now(timezone.utc))
    user_id: so.Mapped[int] = so.mapped_column(sa.ForeignKey(User.id))
    chat_id: so.Mapped[int] = so.mapped_column(sa.ForeignKey(Chat.id))

    user: so.Mapped[User] = so.relationship('User', backref='messages')

# Association table for many-to-many relationship between User and Chat
chat_users = db.Table('chat_users',
    db.Column('user_id', db.Integer, db.ForeignKey('user.id')),
    db.Column('chat_id', db.Integer, db.ForeignKey('chat.id'))
)


class Friendship(db.Model):
    __tablename__ = 'friendship'
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), primary_key=True)
    friend_id = db.Column(db.Integer, db.ForeignKey('user.id'), primary_key=True)
    timestamp = db.Column(db.DateTime, index=True, default=datetime.utcnow)

    user = db.relationship('User', foreign_keys=[user_id], backref=db.backref('friends', lazy='dynamic'))

    def __repr__(self):
        return '<Friendship {} - {}>'.format(self.user_id, self.friend_id)



class FriendRequest(db.Model):
    id: so.Mapped[int] = so.mapped_column(primary_key=True)
    from_user_id: so.Mapped[int] = so.mapped_column(sa.ForeignKey(User.id))
    to_user_id: so.Mapped[int] = so.mapped_column(sa.ForeignKey(User.id))
    status: so.Mapped[int] = so.mapped_column(sa.Integer, default=0)  # 0 for pending, 1 for accepted

    from_user: so.Mapped[User] = so.relationship(User, foreign_keys=[from_user_id], backref='from_user_backref')
    to_user: so.Mapped[User] = so.relationship(User, foreign_keys=[to_user_id], backref='to_user_backref')

@login.user_loader
def load_user(id):
    return db.session.get(User, int(id))
