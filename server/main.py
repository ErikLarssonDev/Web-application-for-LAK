from ast import Pass
from flask import Flask
from flask import jsonify
from flask import request
from flask import redirect
from flask import render_template
from flask import abort
from flask import Response
from flask_sqlalchemy import SQLAlchemy
import http
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager
from flask_jwt_extended import create_access_token
from flask_jwt_extended import jwt_required
from flask_jwt_extended import get_jwt_identity
import secrets
import datetime
from datetime import date, timedelta, time, datetime
from dateutil.relativedelta import relativedelta
import re
from sqlalchemy import CheckConstraint
from sqlalchemy import UniqueConstraint
from flask_mail import Mail, Message #Imports used for emails
import pyrebase #Imports for storing images with firebase
import urllib3
import os
import tempfile
import csv
from flask_mail import Mail, Message #Imports used for emails
from base import db
from classes import *
import stripe
import pytz

#Import DB in terminal: 
#from main import db, User, Password_reset_tokens, Post, Membership, Event, Booked_events, Has_membership, Association_data, Opening_hour, Board_member, Standard_page

app = Flask(__name__, static_folder='../client', static_url_path='/')

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = 'U0A6DRhYvG3XXgzWCUEGvu5F9UuvVCAiSYwicGbKIFpktoSb5WSgf7Fkp_YbAXhQ'
db.init_app(app)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)

#Used to send emails
mail = Mail(app)
app.config['MAIL_SERVER'] = 'smtp.sendgrid.net' 
app.config['MAIL_PORT'] = 465
app.config['MAIL_USERNAME'] = 'apikey'
app.config['MAIL_PASSWORD'] = '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'
app.config['MAIL_USE_TLS'] = False
app.config['MAIL_USE_SSL'] = True
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=24)
mail = Mail(app)
timezone = pytz.timezone("Europe/Stockholm")

# Used to store images
config = {
    "apiKey": "AIzaSyDmKVEg-ZcZS7RzGTs3tCkcYuoiirpiDW0",
    "authDomain": "tddd83-de5b9.firebaseapp.com",
    "projectId": "tddd83-de5b9",
    "storageBucket": "tddd83-de5b9.appspot.com",
    "messagingSenderId": "726217138572",
    "appId": "1:726217138572:web:07f70f340eced58e0736a9",
    "measurementId": "G-RX5R2VQMBH",
    "databaseURL" : "https://tddd83-de5b9.firebaseio.com" 
}

# Test secret API key (Stripe).
stripe.api_key = 'sk_test_51Kj4EIEpC5iP84jgdLp7zqFWcnpTcnpYZhZEFrlZKNSxMUskEyEMbzZcQ0qyZdDkieMRrvOrg6aFuWIX6wylaxix00MAqkA9qv'

#Initalizes the firebase storage
firebase = pyrebase.initialize_app(config)
storage = firebase.storage()


#Generates a 64 character long random string. 
def generate_reset_token(): 
    return secrets.token_urlsafe(48)
#Will be used to change the password and check if the given token is correct
#def redeemToken(passwordResetToken, newPassword):

def set_password(user, password):
    user.password_hash = bcrypt.generate_password_hash(password).decode('utf8')

def export_to_csv(filename, dictionary_list): #assumed that all dictionaries in this list have the same Keys
    if len(dictionary_list) <= 0:
        return None
    with open(filename + '.csv', 'w', newline='') as csvfile:
        fieldnames = dictionary_list[0].keys()
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames, dialect='excel')
        writer.writeheader()
        for dictionary in dictionary_list:
            writer.writerow(dictionary)


#Gets an attribute and checks that it's not None.
def safe_get(element):
    if element is None:
        abort(400, "Non-processable null value entered")
    return element


#Gets a date in string format "YYYY-MM-DD" and converts it into a date
def str_date(date_string):
    if date_string is None:
        return date_string
    if isinstance(date_string, date):
        return date_string
    date_var = datetime.strptime(date_string, '%Y-%m-%d').date()
    return date_var


#Gets a datetime in string format "YYYY-MM-DD HH:MM:SS"
def str_datetime(datetime_string):
    if datetime_string is None:
        return datetime_string
    if isinstance(datetime_string, datetime):
        return datetime_string
    date_time = timezone.localize(datetime.strptime(datetime_string, '%Y-%m-%d %H:%M:%S'))
    return date_time                                                    


#A function that uploads a file to the firebase database.
def upload_file(file_path, file):
    # temp = tempo
    upload = file
    temp = tempfile.NamedTemporaryFile(delete=False)
    upload.save(temp.name)
    storage.child(file_path).put(temp.name)
    os.remove(temp.name)
    file_url = storage.child(file_path).get_url('3c1ebbeb-1b80-4a34-99c2-e2fe6bdbe9d2')
    return file_url


# A function that gets the URL to a file in the firebase database.
def get_file_url(file_path):
    file_url = storage.child(file_path).get_url('3c1ebbeb-1b80-4a34-99c2-e2fe6bdbe9d2')
    return file_url
#TODO Add a function that downloads a file.

#TODO Add a function that returns a file.

# A function that deletes a file from the firebase database.
def delete_file(file_path):
    storage.delete(file_path, '3c1ebbeb-1b80-4a34-99c2-e2fe6bdbe9d2')
    return "Deleted file."
#Checks a given personal number to make sure it's formatted correctly
def pnr_format_check(pnr):
    return re.match("^[0-9]{8}-[0-9]{4}", pnr) != None
#Checks a given zip_code to make sure it's formatted correctly
def zip_code_format_check(zip):
    if zip is None:
        return True
    if zip == "":
        return True
    return re.match("^[0-9]{5}$", zip) != None
#Checks a given tel number to make sure it's formatted correctly
def tel_format_check(tel):
    if tel is None:
        return True
    if tel == "":
        return True
    return re.match("^[0-9]{10}$", tel) != None
#Checks a given email to make sure it's formatted correctly
def email_format_check(email): 
    return re.match("^[a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$", email) != None


    # Calculates the order total on the server to prevent
    # people from directly manipulating the amount on the client
def calculate_order_amount(item): 
    total = 0

    if item['type'] == "membership":
        membership = Membership.query.get_or_404({ 'id': item['id'] })
        total += membership.price
    elif item['type'] == "event":
        event = Event.query.get_or_404({ 'id': item['id'] })
        total += event.price

    return total * 100 #Conversion from kronor to öre since price is saved as an integer and decimal points therefore are not allowed


#Used to get all users, admin only
@app.route('/users', methods = ['GET']) 
@jwt_required()
def users():
    if User.query.get_or_404({'id' : get_jwt_identity()}).is_admin == False:
        abort(401, "Only admins may access user-information")
    if request.method == 'GET':
        user_list = []
        for user in User.query.all():
            user_list.append(user.serialize())
        return jsonify(user_list)


#Used to view memberships and to add a membership, admin only. When a membership is bought it is added through the stripe-related routes
@app.route('/memberships', methods = ['GET', 'POST'])
@jwt_required(optional=True) 
def memberships():
    if request.method == 'GET':
        membership_list = []
        for membership in Membership.query.all():
            membership_list.append(membership.serialize())
        return jsonify(membership_list)
    elif request.method == 'POST':
        if User.query.get_or_404({'id':get_jwt_identity()}).is_admin == False:
            abort(401, "Only admins may add memberships")
        post = request.get_json()
        title = safe_get(post.get('title'))
        description = safe_get(post.get('description'))
        price = safe_get(post.get('price'))
        duration = safe_get(post.get('duration'))
        img = post.get('img')
        if price < 0: abort(400, "A membership price must be greater than 0")
        membership = Membership(title=title, description=description, price=price, duration=duration, img=img)
        db.session.add(membership)
        db.session.commit()
        return membership.serialize()


#Used to add and get events.
#Non-admins may not add events
@app.route('/events', methods = ['GET', 'POST'])
@jwt_required(optional=True)
def events():
    if request.method == 'GET':
        event_list = []
        for event in Event.query.all():
            event_list.append(event.serialize())
        return jsonify(event_list)
    elif request.method == 'POST':
        if User.query.get_or_404({'id':get_jwt_identity()}).is_admin == False:
            abort(401, "Only admins may add events")
        post = request.get_json()
        title = safe_get(post.get('title'))
        description = safe_get(post.get('description'))
        price = post.get('price')
        start_datetime = str_datetime(safe_get(post.get('start_datetime')))
        end_datetime = str_datetime(safe_get(post.get('end_datetime')))
        available_spots = post.get('available_spots')
        img = post.get('img')
        last_booking_datetime = str_datetime(post.get('last_booking_datetime'))
        event = Event(title=title, description=description, price=price, start_datetime = start_datetime, end_datetime = end_datetime, last_booking_datetime=last_booking_datetime, available_spots=available_spots, img=img)
        db.session.add(event)
        db.session.commit()
        return event.serialize()


#Used to get and add posts
#Non-admins may not add posts
@app.route('/posts', methods = ['GET', 'POST'])
@jwt_required(optional=True)
def posts():
    if request.method == 'GET':
        post_list = []
        for post in Post.query.all():
            post_list.append(post.serialize())
        return jsonify(post_list)
    elif request.method == 'POST':
        if User.query.get_or_404({'id':get_jwt_identity()}).is_admin == False:
            abort(401, "Only admins may add posts")
        post = request.get_json()
        title = safe_get(post.get('title'))
        description = safe_get(post.get('description'))
        posted_by = post.get('posted_by')
        post_time = timezone.localize(datetime.now())
        img = post.get('img')
        new_post = Post(title=title, description=description, posted_by=posted_by, post_time=post_time, img=img)
        db.session.add(new_post)
        db.session.commit()
        return new_post.serialize()

#Used to get and add associations, should only be 1?
#Upon further consideration this table is quite unnecessary, since there will only be one association per association.
@app.route('/associations', methods = ['GET', 'POST'])
@jwt_required(optional=True)
def associations():
    if request.method == 'GET':
        association_list = []
        for association in Association_data.query.all():
            association_list.append(association.serialize())
            return jsonify(association_list)
    elif request.method == 'POST':
        if User.query.get_or_404({'id':get_jwt_identity()}).is_admin == False:
            abort(401, "Only admins may add associations")
        post = request.get_json()
        name = safe_get(post.get('name'))
        address = post.get('address')
        zip_code = post.get('zip_code')
        if not zip_code_format_check(zip_code): abort(400, "Zip code format incorrect")
        district = post.get('district')
        instagram = post.get('instagram')
        facebook = post.get('facebook')
        img = post.get('img')
        email = post.get('email')
        tel = post.get('tel')
        association = Association_data(name=name, address=address, zip_code=zip_code, district=district, instagram=instagram, facebook=facebook, img=img, email=email, tel=tel)
        opening_hours = []
        for day in range(1, 8):
            opening_hour = Opening_hour(day=day)
            opening_hours.append(opening_hour)
        db.session.add_all(opening_hours)
        db.session.add(association)
        db.session.commit()
        return association.serialize()


#Used to get and add board members
#Only admins may add
@app.route('/board_members', methods = ['GET', 'POST'])
@jwt_required(optional=True)
def board_members():
    if request.method == 'GET':
        board_member_list = []
        for board_member in Board_member.query.all():
            board_member_list.append(board_member.serialize())
        if len(board_member_list) == 0: #Returns 404 if there are no board members
            abort(404,"No board members found")
        return jsonify(board_member_list)
    elif request.method == 'POST':
        if User.query.get_or_404({'id':get_jwt_identity()}).is_admin == False:
            abort(401, "Only admins may add board members")
        post = request.get_json()
        name = safe_get(post.get('name'))
        title = safe_get(post.get('title'))
        email = safe_get(post.get('email'))
        if not email_format_check(email): abort(400, "Incorrectly formatted email")
        img = post.get('img')
        board_member = Board_member(name=name, title=title, email=email, img=img)
        db.session.add(board_member)
        db.session.commit()
        return board_member.serialize()


#Used to get all opening hours
@app.route('/opening_hours', methods = ['GET'])
def opening_hours():
    opening_hours_list = []
    for opening_hour in Opening_hour.query.all():
        opening_hours_list.append(opening_hour.serialize())
    return jsonify(opening_hours_list)

#Used to get all tags and add tags.
@app.route('/tags', methods = ['GET', 'POST'])
@jwt_required()
def tags():
    if User.query.get_or_404({'id':get_jwt_identity()}).is_admin == False:
        abort(401, "Admin only")
    if request.method == 'GET':
        tag_list = []
        for tag in Tag.query.all():
            tag_list.append(tag.serialize())
        return jsonify(tag_list)
    if request.method == 'POST': 
        post = request.get_json()
        id = safe_get(post.get('id'))
        if Tag.query.get({'id':id}) is not None:
            abort(400,"a tag with this id already exists")
        active_until = str_date(post.get('active_until'))
        tag = Tag(id=id, active_until=active_until)
        db.session.add(tag)
        db.session.commit()
        return tag.serialize()

#Used to get and add (admin only) club records
@app.route('/club_records', methods = ['GET', 'POST'])
@jwt_required(optional=True)
def club_records():
    if request.method == 'GET':
        club_records_list = []
        for club_record in Club_record.query.all():
            club_records_list.append(club_record.serialize())
        return jsonify(club_records_list)
    elif request.method == 'POST':
        if User.query.get_or_404({'id':get_jwt_identity()}).is_admin == False:
            abort(401, "Only admins may add club records")
        post = request.get_json()
        record_holder_id = safe_get(post.get('record_holder_id'))
        category = safe_get(post.get('category'))
        accomplishment = safe_get(post.get('accomplishment'))
        club_record = Club_record(record_holder_id=record_holder_id, category=category, accomplishment=accomplishment)
        db.session.add(club_record)
        db.session.commit()
        return club_record.serialize()
            
#Used to add payments to a payment history which is individual to all users.
#The GET returns all payments, for admin viewing. Will later be integrated with stripes history
@app.route('/payments', methods = ['GET', 'POST'])
@jwt_required()
def payments():
    if User.query.get_or_404({'id':get_jwt_identity()}).is_admin == False:
        abort(401, "Admin only")
    if request.method == 'GET':
        payment_list = []
        for payment in Payments.query.all():
            payment_list.append(payment.serialize())
        return jsonify(payment_list)
    if request.method == 'POST':
        post = request.get_json()
        amount = safe_get(post.get('amount'))
        payee = safe_get(post.get('payee'))
        payment_time = timezone.localize(datetime.now())
        payment = Payments(amount=amount, payee=payee, payment_time=payment_time)
        db.session.add(payment)
        db.session.commit()
        return payment.serialize()

@app.route('/files', methods = ['GET', 'POST'])
@jwt_required(optional=True)
def files():
    if request.method == 'GET':
        file_list = []
        for files in File.query.all():
            file_list.append(files.serialize())
        return jsonify(file_list)
    elif request.method == 'POST':
        if User.query.get_or_404({'id':get_jwt_identity()}).is_admin == False:
            abort(401, "Only admins may add files")
        post = request.get_json()
        print(post)
        name = safe_get(post.get('name'))
        src = safe_get(post.get('src'))
        category = post.get('category')
        true_category = File_category.query.get_or_404({'id' : category})
        new_file = File(name=name, src=src, category=true_category.name)
        db.session.add(new_file)
        db.session.commit()
        return new_file.serialize()

#Used to retrieve a list of the emails of all the users that have signed up for the newsletter
@app.route('/emails', methods = ['GET'])
@jwt_required()
def emails():
    if User.query.get_or_404({'id':get_jwt_identity()}).is_admin == False:
        abort(401, "Only admins may retrieve email lists")
    email_list = []
    for user in User.query.filter_by(newsletter = True):
        email_list.append(user.email)
    return jsonify(email_list)

#Used to add (admin only) and get FAQs
@app.route('/FAQs', methods = ['GET', 'POST'])
@jwt_required(optional=True)
def FAQs():
    if request.method == 'GET':
        FAQ_list = []
        for faqs in Faq.query.all():
            FAQ_list.append(faqs.serialize())
        return jsonify(FAQ_list)
    elif request.method == 'POST':
        if User.query.get_or_404({'id':get_jwt_identity()}).is_admin == False:
            abort(401, "Only admins may add FAQs")
        post = request.get_json()
        question = safe_get(post.get('question'))
        answer = safe_get(post.get('answer'))
        faq = Faq(question=question, answer=answer)
        db.session.add(faq)
        db.session.commit()
        return faq.serialize()

#Used to organize cloud hosted images
@app.route('/file_categories', methods = ['GET', 'POST'])
def file_categories():
    if request.method == 'GET':
        category_list = []
        for category in File_category.query.all():
            category_list.append(category.serialize())
        return jsonify(category_list)
    elif request.method == 'POST':
        post = request.get_json()
        name = safe_get(post.get('name'))
        category = File_category(name=name)
        db.session.add(category)
        db.session.commit()
        return category.serialize()

#Used to export user-data to a csv file
@app.route('/users/exportdata', methods = ['GET'])
@jwt_required()
def export_user_data():
    if User.query.get_or_404({'id':get_jwt_identity()}).is_admin == False:
        abort(401, "Admin only")
    user_list = []
    for user in User.query.all():
        user_list.append(user.serialize())
    export_to_csv('Medlemmar', user_list)
    return Response(200)
    

#Used to get, edit or delete users by used id (non-admins may only get, edit or delete themselves) 
@app.route('/users/<int:user_id>', methods = ['GET', 'PUT', 'DELETE'])
@jwt_required()  
def user(user_id):
    if request.method == 'GET':
        if (User.query.get_or_404({'id':get_jwt_identity()}).is_admin == False) and (user_id != get_jwt_identity()):
            abort(401, "Non-admin users can only get their own profile information")
        user = User.query.get_or_404({'id' : user_id})
        return user.serialize()
    elif request.method == 'PUT':
        if (User.query.get_or_404({'id':get_jwt_identity()}).is_admin == False):
            if (user_id != get_jwt_identity()):
                abort(401, "Non-admin users can only edit themselves")
            elif (request.json.get('is_admin', False) == True):
                abort(401, "Non-admin users cannot make themselves admins")
        user = User.query.get_or_404({'id' : user_id})
        if not pnr_format_check(request.json.get('pnr', user.pnr)):
            abort(400, "Incorrectly formatted PNR")
        if not email_format_check(request.json.get('email', user.email)):
            abort(400, "Incorrectly formatted email")
        if not tel_format_check(request.json.get('tel', user.tel)):
            abort(400, "Incorrectly formatted tel-nbr")
        if not zip_code_format_check(request.json.get('zip_code', user.zip_code)):
            abort(400, "Incorrectly formatted zip_code")
        user.newsletter = request.json.get('newsletter', user.newsletter)
        user.pnr = request.json.get('pnr', user.pnr)
        user.first_name = request.json.get('first_name', user.first_name)
        user.last_name = request.json.get('last_name', user.last_name)
        user.email = request.json.get('email', user.email)
        user.tel = request.json.get('tel', user.tel)
        user.is_admin = request.json.get('is_admin', user.is_admin)
        user.address = request.json.get('address', user.address)
        user.zip_code = request.json.get('zip_code', user.zip_code)
        user.district = request.json.get('district', user.district)
        tag = request.json.get('tag')
        if tag is not None:
            true_tag = Tag.query.get_or_404({'id' : tag})
            user.tag = true_tag.id
        db.session.commit()
        return user.serialize()
    elif request.method == 'DELETE':
        if (User.query.get_or_404({'id':get_jwt_identity()}).is_admin == False) and (user_id != get_jwt_identity()):
            abort(401, "Non admin users may only delete themselves")
        user = User.query.get_or_404({'id' : user_id})
        db.session.delete(user)
        db.session.commit()
        return ('', http.HTTPStatus.OK)


#Used to edit, view or delete specific memberships, only admins may edit or delete
@app.route('/memberships/<int:membership_id>', methods = ['GET', 'PUT', 'DELETE'])
@jwt_required(optional=True) 
def membership(membership_id):
    if request.method == 'GET':
        membership = Membership.query.get_or_404({'id' : membership_id}) 
        return membership.serialize()
    elif request.method == 'PUT':
        if User.query.get_or_404({'id':get_jwt_identity()}).is_admin == False:
            abort(401, "Only admins may edit memberships")
        membership = Membership.query.get_or_404({'id' : membership_id}) 
        if request.json.get('price', membership.price) < 0:
            abort(400, "A membership price must be greater than 0")
        membership.title = request.json.get('title', membership.title)
        membership.description = request.json.get('description', membership.description)
        membership.price = request.json.get('price', membership.price)
        membership.duration = request.json.get('duration', membership.duration)
        membership.members = request.json.get('members', membership.members)
        membership.img = request.json.get('img', membership.img)
        db.session.commit()
        return membership.serialize()
    elif request.method == 'DELETE':
        if User.query.get_or_404({'id':get_jwt_identity()}).is_admin == False:
            abort(401, "Only admins may delete memberships")
        membership = Membership.query.get_or_404({'id' : membership_id}) 
        db.session.delete(membership)
        db.session.commit()
        return('', http.HTTPStatus.OK)


#Used to edit, view or delete specific events, only admins may edit or delete
@app.route('/events/<int:event_id>', methods = ['GET', 'PUT', 'DELETE'])
@jwt_required(optional=True)
def event(event_id):
    if request.method == 'GET':
        event = Event.query.get_or_404({'id' : event_id})
        return event.serialize()
    elif request.method == 'PUT':
        if User.query.get_or_404({'id':get_jwt_identity()}).is_admin == False:
            abort(401,"Only admins may edit events")
        event = Event.query.get_or_404({'id' : event_id})
        event.title = request.json.get('title', event.title)
        event.description = request.json.get('description', event.description)
        event.price = request.json.get('price', event.price)
        event.start_datetime = str_datetime(request.json.get('start_datetime', event.start_datetime))
        event.end_datetime = str_datetime(request.json.get('end_datetime', event.end_datetime))
        event.booked_members = request.json.get('members', event.booked_members)
        event.available_spots = request.json.get('available_spots', event.available_spots)
        event.img = request.json.get('img', event.img)
        event.last_booking_datetime = str_datetime(request.json.get('last_booking_datetime', event.last_booking_datetime))
        db.session.commit()
        return event.serialize()
    elif request.method == 'DELETE':
        if User.query.get_or_404({'id':get_jwt_identity()}).is_admin == False:
            abort(401, "Only admins may delete events")
        event = Event.query.get_or_404({'id' : event_id})
        db.session.delete(event)
        db.session.commit()
        return('', http.HTTPStatus.OK)


#Used to edit, view or delete specific posts (only admins may edit or delete)
@app.route('/posts/<int:post_id>', methods = ['GET', 'PUT', 'DELETE'])
@jwt_required(optional=True)
def post(post_id):
    if request.method == 'GET':
        post = Post.query.get_or_404({'id' : post_id})
        return post.serialize()
    elif request.method == 'PUT':
        if User.query.get_or_404({'id' : get_jwt_identity()}).is_admin == False:
            abort(401, "Only admins may edit posts")
        post = Post.query.get_or_404({'id' : post_id})
        post.title = request.json.get('title', post.title)
        post.description = request.json.get('description', post.description)
        post.posted_by = request.json.get('posted_by', post.posted_by)
        post.post_time = str_datetime(request.json.get('post_time', post.post_time)) 
        post.last_edited = timezone.localize(datetime.now())
        post.edited_by = request.json.get('edited_by', post.edited_by)
        post.img = request.json.get('img', post.img)
        db.session.commit()
        return post.serialize()
    elif request.method == 'DELETE':
        if User.query.get_or_404({'id':get_jwt_identity()}).is_admin == False:
            abort(401, "Only admins may delete posts")
        post = Post.query.get_or_404({'id' : post_id})
        db.session.delete(post)
        db.session.commit()
        return('', http.HTTPStatus.OK)


#Used to edit, view or delete a specific association (only admins may edit or delete)
@app.route('/associations/<int:association_id>', methods = ['GET', 'PUT', 'DELETE'])
@jwt_required(optional=True)
def association(association_id):
    if request.method == 'GET':
        association = Association_data.query.get_or_404({'id' : association_id})
        return association.serialize()
    elif request.method == 'PUT':
        if User.query.get_or_404({'id':get_jwt_identity()}).is_admin == False:
            abort(401, "Only admins may edit association data")
        association = Association_data.query.get_or_404({'id' : association_id})
        association.name = request.json.get('name', association.name)
        association.address = request.json.get('address', association.address)
        association.zip_code = request.json.get('zip_code', association.zip_code)
        association.district = request.json.get('district', association.district)
        association.instagram = request.json.get('instagram', association.instagram)
        association.facebook = request.json.get('facebook', association.facebook)
        association.img = request.json.get('img', association.img)
        association.email = request.json.get('email', association.email)
        association.tel = request.json.get('tel', association.tel)
        association.primary_color = request.json.get('primary_color', association.primary_color)
        association.secondary_color = request.json.get('secondary_color', association.secondary_color)
        db.session.commit()
        return association.serialize()
    elif request.method == 'DELETE':
        if User.query.get_or_404({'id':get_jwt_identity()}).is_admin == False:
            abort(401, "Only admins may delete associations")
        association = Association_data.query.get_or_404({'id' : association_id})
        db.session.delete(association)
        db.session.commit()
        return('', http.HTTPStatus.OK)


#Used to edit, view or delete a specific board member (only admins may edit or delete)
@app.route('/board_members/<int:board_member_id>', methods = ['GET', 'PUT', 'DELETE'])
@jwt_required(optional=True)
def board_member(board_member_id):
    if request.method == 'GET':
        board_member = Board_member.query.get_or_404({'id' : board_member_id})
        return board_member.serialize()
    elif request.method == 'PUT':
        if User.query.get_or_404({'id':get_jwt_identity()}).is_admin == False:
            abort(401, "Only admins may edit board-members")
        board_member = Board_member.query.get_or_404({'id' : board_member_id})
        if not email_format_check(request.json.get('email', board_member.email)):
            abort(400, "Email formatted incorrectly")
        board_member.name = request.json.get('name', board_member.name)
        board_member.title = request.json.get('title', board_member.title)
        board_member.email = request.json.get('email', board_member.email)
        board_member.img = request.json.get('img', board_member.img)
        db.session.commit()
        return board_member.serialize()
    elif request.method == 'DELETE':
        if User.query.get_or_404({'id':get_jwt_identity()}).is_admin == False:
            abort(401, "Only admins may delete board members")
        board_member = Board_member.query.get_or_404({'id' : board_member_id})
        db.session.delete(board_member)
        db.session.commit()
        return('', http.HTTPStatus.OK)


#Used to edit, view or opening hours (only admins may edit)
@app.route('/opening_hours/<int:opening_hour_day>', methods = ['GET', 'PUT'])
@jwt_required(optional=True)
def opening_hour(opening_hour_day):
    if request.method == 'GET':
        opening_hour = Opening_hour.query.get_or_404({'day' : opening_hour_day})
        return opening_hour.serialize()
    elif request.method == 'PUT':
        if User.query.get_or_404({'id':get_jwt_identity()}).is_admin == False:
            abort(401, "Only admins may change opening hours")
        opening_hour = Opening_hour.query.get_or_404({'day' : opening_hour_day})
        opening_hour.open_time = request.json.get('open_time', opening_hour.open_time)
        opening_hour.close_time = request.json.get('close_time', opening_hour.close_time)
        db.session.commit()
        return opening_hour.serialize()


# GET, PUT and DELETE for a Tag based on ID (admin only)
@app.route('/tags/<int:tag_id>', methods = ['GET', 'PUT', 'DELETE'])
@jwt_required()
def tag(tag_id):
    if request.method == 'GET':
        tag = Tag.query.get_or_404({'id' : tag_id})
        if User.query.get_or_404({'id':get_jwt_identity()}).is_admin == False:
            abort(401, "Only admins may get tags based on id")
        return tag.serialize()
    elif request.method == 'PUT':
        if User.query.get_or_404({'id':get_jwt_identity()}).is_admin == False:
            abort(401, "Only admins may edit tags")
        tag = Tag.query.get_or_404({'id' : tag_id})
        tag.id = request.json.get('id', tag.id)
        tag.active_until = str_date(request.json.get('active_until', tag.active_until))
        db.session.commit()
        return tag.serialize()
    elif request.method == 'DELETE':
        if User.query.get_or_404({'id':get_jwt_identity()}).is_admin == False:
            abort(401, "Only admins may delete tags")
        tag = Tag.query.get_or_404({'id' : tag_id})
        db.session.delete(tag)
        db.session.commit()
        return('', http.HTTPStatus.OK)

#edit and delete club records
@app.route('/club_records/<int:club_record_id>', methods = ['GET', 'PUT', 'DELETE'])
@jwt_required(optional=True)
def club_record(club_record_id):
    if request.method == 'GET':
        club_record = Club_record.query.get_or_404({'id' : club_record_id})
        return club_record.serialize()
    elif request.method == 'PUT':
        if User.query.get_or_404({'id':get_jwt_identity()}).is_admin == False:
            abort(401, "Only admins may add club-records")
        club_record = Club_record.query.get_or_404({'id' : club_record_id})
        club_record.record_holder_id = request.json.get('record_holder_id', club_record.record_holder_id)
        club_record.category = request.json.get('category', club_record.category)
        club_record.accomplishment = request.json.get('accomplishment', club_record.accomplishment)
        db.session.commit()
        return club_record.serialize()
    elif request.method == 'DELETE':
        if User.query.get_or_404({'id':get_jwt_identity()}).is_admin == False:
            abort(401,"Only admins may delete club-records")
        club_record = Club_record.query.get_or_404({'id' : club_record_id})
        db.session.delete(club_record)
        db.session.commit()
        return Response(200)        


@app.route('/files/<int:file_id>', methods = ['GET', 'PUT', 'DELETE'])
@jwt_required(optional=True)
def file_(file_id):
    if request.method == 'GET':
        file_ = File.query.get_or_404({'id' : file_id})
        return file_.serialize()
    elif request.method == 'PUT':
        if User.query.get_or_404({'id':get_jwt_identity()}).is_admin == False:
            abort(401, "Only admins may edit files")
        file_ = File.query.get_or_404({'id' : file_id})
        file_.name = request.json.get('name', file_.name)
        file_.src = request.json.get('src', file_.src)
        category = request.json.get('category', file_.category)
        if category is not None:
            true_category = File_category.query.get_or_404({'id' : category})
        file_.category = true_category.name
        db.session.commit()
        return file_.serialize()
    elif request.method == 'DELETE':
        if User.query.get_or_404({'id':get_jwt_identity()}).is_admin == False:
            abort(401, "Only admins may delete files")
        file_ = File.query.get_or_404({'id' : file_id})
        db.session.delete(file_)
        db.session.commit()
        return Response(200)

#Get edit and delete FAQs
@app.route('/FAQs/<int:FAQ_id>', methods = ['GET', 'PUT', 'DELETE'])
@jwt_required(optional=True)
def FAQ(FAQ_id):
    if request.method == 'GET':
        faq = Faq.query.get_or_404({'id' : FAQ_id})
        return faq.serialize()
    elif request.method == 'PUT':
        if User.query.get_or_404({'id':get_jwt_identity()}).is_admin == False:
            abort(401, "Only admins may edit FAQs")
        faq = Faq.query.get_or_404({'id' : FAQ_id})
        faq.question = request.json.get('question', faq.question)
        faq.answer = request.json.get('answer', faq.answer)
        db.session.commit()
        return faq.serialize()
    elif request.method == 'DELETE':
        if User.query.get_or_404({'id':get_jwt_identity()}).is_admin == False:
            abort(401, "Only admins may delete FAQs")
        faq = Faq.query.get_or_404({'id' : FAQ_id})
        db.session.delete(faq)
        db.session.commit()
        return Response(200)


@app.route('/file_categories/<int:category_id>', methods = ['GET', 'PUT', 'DELETE'])
def file_category(category_id):
    #TODO find out who should have access to this route
    if request.method == 'GET':
        category = File_category.query.get_or_404({'id' : category_id})
        return category.serialize()
    elif request.method == 'PUT':
        category = File_category.query.get_or_404({'id' : category_id})
        category.name = request.json.get('name', category.name)
        db.session.commit()
        return category.serialize
    elif request.method == 'DELETE':
        category = File_category.query.get_or_404({'id' : category_id})
        db.session.delete(category)
        db.session.commit()
        return Response(200)


#get specific users memberships, non admins may only get their own memberships
@app.route('/users/<int:user_id>/memberships', methods = ['GET'])
@jwt_required()
def get_users_memberships(user_id):
    if User.query.get_or_404({'id':get_jwt_identity()}).is_admin == False and user_id != get_jwt_identity():
        abort(401,"Non admins may only get their own memberships")
    user = User.query.get_or_404({'id' : user_id})
    membership_list = []
    for membership_link in user.owned_memberships:
        membership = Membership.query.get_or_404({'id' : membership_link.membership_id}).serialize()
        membership["purchase_date"] = membership_link.purchase_date
        membership["end_date"] = membership_link.end_date
        time_left = membership_link.end_date - date.today()
        membership["days_left"] = time_left.days
        membership_list.append(membership)
    return jsonify(membership_list)


#GET, PUT or delete a specific users tag, or add a tag to a user. Non admins may only get their own tags
@app.route('/users/<int:user_id>/tags', methods = ['GET', 'PUT', 'DELETE'])
@jwt_required()
def get_users_tag(user_id):
    user = User.query.get_or_404({'id' : user_id})
    if user is not None:
        if request.method == 'GET':
            if User.query.get_or_404({'id':get_jwt_identity()}).is_admin == False and user_id != get_jwt_identity():
                abort(401)
            if user.tag is not None:
                return user.tag.serialize()
            else:
                return "" 
        elif request.method == 'PUT':
            if User.query.get_or_404({'id':get_jwt_identity()}).is_admin == False:
                abort(401)
            tag = Tag.query.get_or_404({'id' : user.tag})
            tag.id = request.json.get('id', tag.id)
            tag.active_until = str_date(request.json.get('active_until', tag.active_until))
            db.session.commit()
            return Tag.serialize(tag)
        elif request.method == 'DELETE':
            if User.query.get_or_404({'id':get_jwt_identity()}).is_admin == False:
                abort(401, "Only an admin may remove a tag from a user")
            user.tag_id = None
            db.session.commit()
            return('', http.HTTPStatus.OK)
    else:
        abort(404)
    abort(404)

#get specific users events Non admins may only get their own events 
@app.route('/users/<int:user_id>/events', methods = ['GET'])
@jwt_required()
def get_users_events(user_id):
    if User.query.get_or_404({'id':get_jwt_identity()}).is_admin == False and user_id != get_jwt_identity():
        abort(401, "Non admins may only get their own booked events")
    user = User.query.get_or_404({'id' : user_id})
    event_list = []
    for event_link in user.booked_events:
        event_list.append((Event.query.get_or_404({'id' : event_link.event_id})).serialize())
    return jsonify(event_list)


#get specific users posts non admins may only get their own posts (kind of unneccesary since only admins can make posts, but why not)
@app.route('/users/<int:user_id>/posts', methods = ['GET'])
@jwt_required()
def get_users_posts(user_id):
    if User.query.get_or_404({'id':get_jwt_identity()}).is_admin == False and user_id != get_jwt_identity():
        abort(401,"Non admins may only get their own posts")
    user = User.query.get_or_404({'id' : user_id})
    post_list = []
    for post in user.posts:
        post_list.append(post.serialize())
    return jsonify(post_list)    

#Non admins may only view their own club records
@app.route('/users/<int:user_id>/club_records', methods = ['GET'])
@jwt_required()
def get_user_club_records(user_id):
    if User.query.get_or_404({'id':get_jwt_identity()}).is_admin == False and user_id != get_jwt_identity():
        abort(401,"Non admin users may only get their own club records")
    user = User.query.get_or_404({'id' : user_id})
    club_record_list = []
    for club_record in user.club_records:
        club_record_list.append(club_record.serialize())
    return jsonify(club_record_list)

#Non admins may only get their own payments
@app.route('/users/<int:user_id>/payments', methods = ['GET'])
@jwt_required()
def get_users_payments(user_id):
    if request.method == 'GET':
        if User.query.get_or_404({'id':get_jwt_identity()}).is_admin == False and user_id != get_jwt_identity():
            abort(401,"Non admin users may only get their own payments")
        user = User.query.get_or_404({'id' : user_id})
        payment_list = []
        for payment in user.payment_history:
            payment_list.append(payment.serialize())
        return jsonify(payment_list)

#get specific memberships users, admin only
@app.route('/memberships/<int:membership_id>/users', methods = ['GET'])
@jwt_required()
def get_memberships_users(membership_id):
    if User.query.get_or_404({'id':get_jwt_identity()}).is_admin == False:
        abort(401, "Admin only")
    membership = Membership.query.get_or_404({'id' : membership_id})
    user_list = []
    for membership_link in membership.members:
        user_list.append((User.query.get_or_404({'id' : membership_link.user_id})).serialize())
    return jsonify(user_list)


#get specific events users, admin only
@app.route('/events/<int:event_id>/users', methods = ['GET'])
@jwt_required()
def get_events_users(event_id):
    if User.query.get_or_404({'id':get_jwt_identity()}).is_admin == False:
        abort(401, "Admin only")
    event = Event.query.get_or_404({'id' : event_id})
    user_list = []
    for event_link in event.booked_members:
        user_list.append((User.query.get_or_404({'id' : event_link.user_id})).serialize())
    return jsonify(user_list)

#used to link or delete a link of a memership to a user. right now a 404 error is called if an existing link is made again
@app.route('/users/<int:user_id>/memberships/<int:membership_id>', methods = ['POST', 'DELETE'])
@jwt_required(optional=True)
def buymembership(user_id, membership_id):
    if request.method == 'POST':
        if User.query.get_or_404({'id':get_jwt_identity()}).is_admin == False:
            abort(401, "Admin only")
        user = User.query.get_or_404({'id' : user_id})
        membership = Membership.query.get_or_404({'id' : membership_id}) 
        membership_link = Has_membership.query.filter_by(user_id=user_id, membership_id=membership_id).first()
        if membership_link is not None:
            db.session.delete(membership_link) #Deletes the previous link between membership and user so that new membership can be bought
        membership_link = Has_membership(user_id=user_id, membership_id=membership_id)
        membership_link.buy_now()
        db.session.add(membership_link)
        db.session.commit()
        return('', http.HTTPStatus.OK)
    if request.method == 'DELETE':
        if User.query.get_or_404({'id':get_jwt_identity()}).is_admin == False and user_id != get_jwt_identity():
            abort(401, "Non admins may only delete their own memberships")
        user = User.query.get_or_404({'id' : user_id})
        membership = Membership.query.get_or_404({'id' : membership_id}) 
        membership_link = Has_membership.query.get_or_404({'user_id' : user_id, 'membership_id' : membership_id})
        db.session.delete(membership_link)
        db.session.commit()
        return('', http.HTTPStatus.OK)

#used to link a event to a user. right now a 404 error is called if an existing link is made again
#Admin only, for events with a price greater than 0. When an event is bought by a user it is added through stripe-related routes
@app.route('/users/<int:user_id>/events/<int:event_id>', methods = ['POST', 'DELETE'])
@jwt_required() 
def book_event(user_id, event_id):
    #Books an user on an event.
    if request.method == 'POST':
        if User.query.get_or_404({'id':get_jwt_identity()}).is_admin == False:
            abort(401,"Admin only")
        user = User.query.get_or_404({'id' : user_id})
        event = Event.query.get_or_404({'id' : event_id}) 
        if event.price > 0:
            if User.query.get_or_404({'id':get_jwt_identity()}).is_admin == False:
                abort(401, "Admin only") # If user is not admin and the event has a price > 0, tell them to f-off.
        if event.last_booking_datetime is not None:
            if event.last_booking_datetime < timezone.localize(datetime.now()):
                abort(401,"The last booking date of this event has passed")
        event_link = Booked_events.query.filter_by(user_id=user_id, event_id=event_id).first()
        if event_link is not None:
            abort(403, "The user is already booked on this event")
        event_link = Booked_events(user_id=user_id, event_id=event_id) 
        if event.available_spots is not None:
            if event.available_spots <= 0:
                abort(403, "The event is fully booked")
            event.available_spots -= 1
        db.session.add(event_link)
        db.session.commit()
        return('', http.HTTPStatus.OK)
    if request.method == 'DELETE':
        if User.query.get_or_404({'id':get_jwt_identity()}).is_admin == False and user_id != get_jwt_identity():
            abort(401, "Non admins may only delete their own bookings")
        user = User.query.get_or_404({'id' : user_id})
        event = Event.query.get_or_404({'id' : event_id})
        event_link = Booked_events.query.get_or_404({'user_id' : user_id, 'event_id' : event_id})
        if event.available_spots is not None:
            event.available_spots += 1
        db.session.delete(event_link)
        db.session.commit()
        return('', http.HTTPStatus.OK)

#Used to add a tag to a user (admin only). If the tag is already owned, an error message is sent
@app.route('/users/<int:user_id>/tags/<int:tag_id>', methods = ['POST'])
@jwt_required()
def add_tag_to_user(user_id, tag_id):
    if User.query.get_or_404({'id':get_jwt_identity()}).is_admin == False:
        abort(401)
    user = User.query.get_or_404({'id' : user_id})
    tag = Tag.query.get_or_404({'id' : tag_id})
    if tag.owned_by is not None:
        abort(401, 'The tag is owned by another user')
    user.tag_id = tag_id
    db.session.commit()
    return user.serialize()


@app.route('/files/file_category/<category_id>', methods = ['GET'])
def category_files(category_id):
    file_list = []
    category = File_category.query.get_or_404({'id' : category_id})
    for files in category.files:
        file_list.append(files.serialize())
    return jsonify(file_list)


#Used to add a user, returns a token in order to immediately log in the signed-up user.
#the password entered is hashed and stored for security
@app.route('/sign-up', methods = ['POST'])
def sign_up():
    post = request.get_json()
    if post["pnr"] == "" or not pnr_format_check(post["pnr"]):
        abort(400, "Incorrectly formatted PNR")
    if post["first_name"] == "":
        abort(400, "A first name is required")
    if post["last_name"] == "":
        abort(400, "A last name is required")
    if post["email"] == "" or not email_format_check(post["email"]):
        abort(400, "Incorrectly formatted email")
    if post["password"] == "":
        abort(400, "A password is required")
    if "newsletter" in post:
        if post["newsletter"] is None:
            abort(400, "newsletter must be either true or false if included")
    user = User(pnr=post["pnr"], first_name=post["first_name"], last_name=post["last_name"], email=post["email"], tel=post.get("tel"), zip_code=post.get("zip_code"), district=post.get("district"),address=post.get("address"), password_hash="", newsletter=post.get("newsletter"))
    set_password(user, post["password"])
    db.session.add(user)
    db.session.commit()
    
    msg = Message('Välkommen till Linköpings Atletklubb!', sender='erik.u.larsson@hotmail.se', recipients=[user.email])
    msg.body = "Hej " + user.first_name + "\n\nTack för att du registrerat dig på vår hemsida!\n\nDu kan nu boka in dig på events samt köpa medlemskap.\n\nMed vänliga hälsningar,\nLinköpings atletklubb"
    mail.send(msg)

    token = create_access_token(identity=user.id)
    return {
            "token" : token,
            "user" : user.serialize()
            }


#Used to log in
@app.route('/log-in', methods = ['POST'])
def login():
    post = request.get_json()
    user_db = User.query.filter_by(email=post["email"]).first()
    if user_db is not None:
        if (bcrypt.check_password_hash(user_db.password_hash, post["password"])):
            token = create_access_token(identity=user_db.id)
            return {
                "token" : token,
                "user" : user_db.serialize()
                }
    abort(401)

#Used to reset a password, if the entered mail exists within our database, a password reset link is sent
#The respone 200 is send regardless of if the mail exists or not for security purposes
#When an email is sent a password reset token is hashed and stored for the user, (64 characters)
@app.route("/forgot-password", methods = ['POST'])
def forgot_password():
    if request.method == 'POST':
        r = request.get_json()        
        user_email = r.get('email')
        user = User.query.filter_by(email=user_email).first()
        if user is None:
            return Response("", 200)
        
        token = generate_reset_token()
        db.session.add(Password_reset_tokens(user_id=user.id, token=bcrypt.generate_password_hash(token)))
        db.session.commit()
        
        msg = Message('Password reset request', sender='erik.u.larsson@hotmail.se', recipients=[user.email])
        msg.body = "A request to reset the password of the account connected to this email has been sent to us. To reset your password please click the following link: \n" + "http://localhost:3000/?token=" + token + "\nIf this request was not sent by you, just ignore this mail \n\nWARNING: Do not share the contents of this email." 
        mail.send(msg)

        return Response("", 200)

#Takes a given token from the url link and compares is to the ones hashed for a user. If there is a match
#all tokens are deleted from the user and the password is changed
@app.route("/reset-password", methods = ['POST'])
def reset_password():
    if request.method == 'POST':
        token = request.args.get('token')
        pw = request.get_json().get('new_password')
        rows = Password_reset_tokens.query.all()

        for row in rows:
            if (bcrypt.check_password_hash(row.token, token)):
                new_password = pw
                user = User.query.get({"id": row.user_id})
                set_password(user, new_password)
                db.session.query(Password_reset_tokens).filter_by(user_id=user.id).delete()
                db.session.commit()
                return Response("Password changed.", 200)
        abort(401)

#Sends an email to the recipients. Customizable title and message_body.
@app.route('/send-email')
def index():
    post = request.get_json()
    recipients = post.safe_get(post.get('recipients'))
    title = post.safe_get(post.get('title'))
    message_body = post.safe_get(post.get('message_body'))
    msg = Message(title, sender='erik.u.larsson@hotmail.se', recipients=[recipients])
    msg.body = message_body
    mail.send(msg)
    return Response(200)


#Gets, uploads and deletes images or other files.
@app.route('/images', methods = ['GET', 'POST', 'DELETE'])
#TODO POST DELETE admin only
def image():
    file_path = request.form.get("file_path")
    if request.method == 'GET':
        image_url = storage.child(file_path).get_url('3c1ebbeb-1b80-4a34-99c2-e2fe6bdbe9d2')
        return image_url
    if request.method == 'POST':
        upload = request.files['image']
        temp = tempfile.NamedTemporaryFile(delete=False)
        upload.save(temp.name)
        storage.child(file_path).put(temp.name)
        os.remove(temp.name)
        image_url = storage.child(file_path).get_url('3c1ebbeb-1b80-4a34-99c2-e2fe6bdbe9d2')
        return image_url
    if request.method == 'DELETE':
        storage.delete(file_path, '3c1ebbeb-1b80-4a34-99c2-e2fe6bdbe9d2')
        return Response(200)

# Creates a payment intent through stripe.
@app.route('/create-payment-intent', methods=['POST'])
@jwt_required()
def create_payment():
    try:
        data = request.get_json()
        uid = get_jwt_identity()
        # Create a PaymentIntent with the order amount and currency
        intent = stripe.PaymentIntent.create(
            metadata={ # TODO: Include user e-mail.
                'uid': uid,
                'pid': data['id'],
                'type': data['type']
            },
            amount=calculate_order_amount(data),
            currency='sek',
            automatic_payment_methods={
                'enabled': True,
            },
        )
        return jsonify({
            'clientSecret': intent['client_secret']
        })
    except Exception as e:
        return jsonify(error=str(e)), 403

#Called when a payment succeeds, validates the client secret and retrieves info about the order,
#if everything is correct, the product is added to the user and a payment is logged in the payment history
@app.route('/payment-success', methods=['GET'])
def payment_success():
    pi = request.args.get('payment_intent')

    intent = stripe.PaymentIntent.retrieve(pi)

    if intent.status != 'succeeded':
        return Response(400)

    user_id = intent.metadata['uid']
    product_id = intent.metadata['pid']
    type = intent.metadata['type']

    user = User.query.get_or_404({'id' : user_id})

    if (type == "membership"):
        membership = Membership.query.get_or_404({'id' : product_id})
        membership_link = Has_membership.query.filter_by(user_id=user_id, membership_id=product_id).first()
        if membership_link is not None:
            db.session.delete(membership_link)
        membership_link = Has_membership(user_id=user_id, membership_id=product_id)
        membership_link.buy_now()
        db.session.add(membership_link)
    elif (type == "event"):
        event = Event.query.get_or_404({'id' : product_id})
        if event.last_booking_datetime is not None:
            if event.last_booking_datetime < timezone.localize(datetime.now()):
                abort(401, "The last booking date of this event has passed")
        event_link = Booked_events.query.filter_by(user_id=user_id, event_id=product_id).first()
        if event_link is not None:
            abort(403, "This user is already booked on this event")
        event_link = Booked_events(user_id=user_id, event_id=product_id) 
        if event.available_spots is not None:
            if event.available_spots <= 0:
                abort(403, "The event is fully booked")
            event.available_spots -= 1
        db.session.add(event_link)

    payment = Payments(amount=intent.amount, payee=user_id, payment_time=timezone.localize(datetime.now()), product_id=product_id, product_type=type)
    db.session.add(payment)

    db.session.commit()

    return redirect("http://localhost:3000/?paymentsuccess=true&productId=" + product_id + "&type=" + type, code=302) # TODO: Change host

@app.route("/")
def client():
    return app.send_static_file("client.html")

#Resets the database in order to easily streamline testing. Admin only
@app.route("/reset-db", methods=['POST'])
@jwt_required()
def reset_db():
    from db_test_setup import fill_db
    if (User.query.get_or_404({'id':get_jwt_identity()}).is_admin):
        fill_db()
        return('', http.HTTPStatus.OK)
    abort(404)

if __name__ == "__main__":
    app.run(debug=True, port=3000) 




