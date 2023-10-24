from base import db
from sqlalchemy import CheckConstraint
from datetime import date, timedelta, datetime, time
from dateutil.relativedelta import relativedelta

#The table used to store users, check-constraints are added at the bottom.
class User(db.Model):
    id     = db.Column(db.Integer, primary_key=True)
    pnr    = db.Column(db.String(13), nullable=False, unique=True) #pnr = ÅÅÅÅMMDD-NNNN
    email  = db.Column(db.String(50), nullable=False, unique=True)
    tel    = db.Column(db.String(10), nullable=True)
    tag_id = db.Column(db.Integer, db.ForeignKey('tag.id'), nullable=True)

    address         = db.Column(db.String(50), nullable=True)
    zip_code        = db.Column(db.String(5), nullable=True)
    district        = db.Column(db.String(50), nullable=True)
    first_name      = db.Column(db.String(30), nullable=False)
    last_name       = db.Column(db.String(30), nullable=False)
    password_hash   = db.Column(db.String, nullable=False)
    newsletter      = db.Column(db.Boolean, default=False, nullable=False) #Default value should be optional for each association
    is_admin        = db.Column(db.Boolean, default=False, nullable=True)

    tag             = db.relationship('Tag', back_populates="owned_by", lazy=True)
    club_records    = db.relationship('Club_record', backref='record_holder', cascade="all,delete", lazy=True, foreign_keys='Club_record.record_holder_id')
    payment_history = db.relationship('Payments', backref='paying_user', lazy=True, foreign_keys='Payments.payee')
    posts           = db.relationship('Post', backref='post_user', lazy=True, foreign_keys='Post.posted_by')
    edited_posts    = db.relationship('Post', backref='edited_post_user', lazy=True, foreign_keys='Post.edited_by')
    booked_events   = db.relationship('Booked_events', cascade="all,delete", backref='event_user', lazy=True)
    password_reset_tokens = db.relationship('Password_reset_tokens', backref='token_user', lazy=True)
    owned_memberships     = db.relationship('Has_membership', cascade="all,delete", backref='membership_user', lazy=True)
    
    __table_args__ = (
        CheckConstraint("pnr REGEXP '^[0-9]{8}-[0-9]{4}$'", name='pnr_format_constraint'),
        CheckConstraint("email REGEXP '^[a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$'", name='email_format_constraint'),
        CheckConstraint("tel REGEXP '^[0-9]{10}$'", name='tel_format_constraint'),
        CheckConstraint("zip_code REGEXP '^[0-9]{5}$'", name='zip_code_format_constraint'),
        )
  
    def _repr_(self):
        return '<User {}: {} {} {} {} {}>'.format(self.id, self.pnr, self.first_name, self.last_name, self.email, self.newsletter, self.is_admin)


    def serialize(self):
        if self.tag is None:
            tag = None
        else:
            tag = self.tag.serialize()
        return dict(id=self.id, pnr=self.pnr, first_name=self.first_name, last_name=self.last_name, email=self.email, tel=self.tel, newsletter=self.newsletter, district=self.district, zip_code=self.zip_code, address=self.address, is_admin=self.is_admin, tag=tag) #tag=self.tag This is not serializable, and should either be serialized first, but i prefer if we do not send it at all since the route users/<id>/tags exists


#Used to store password reset tokens connected to a user, The token is hashed before storage
class Password_reset_tokens(db.Model):
    __table_args__  = (db.UniqueConstraint('token'), )
    user_id         = db.Column(db.Integer, db.ForeignKey('user.id'), primary_key=True, nullable=False)
    token           = db.Column(db.String(128), primary_key=True, nullable=False)

#Stores a payment-history for each user N:1
class Payments(db.Model):
    id              = db.Column(db.Integer, primary_key=True)
    amount          = db.Column(db.Integer, nullable=False)
    payment_time    = db.Column(db.DateTime, nullable=False)
    payee           = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    product_id      = db.Column(db.Integer, nullable=False)
    product_type    = db.Column(db.String(20), nullable=False)

    def serialize(self):
        return dict(id=self.id, amount=self.amount, payment_time=self.payment_time, product_id=self.product_id, product_type=self.product_type, payee=self.payee)
#Stores a users posts N:1
class Post(db.Model):
    id           = db.Column(db.Integer, primary_key=True)
    img          = db.Column(db.String, nullable=True)
    title        = db.Column(db.String(50), nullable=False)
    description  = db.Column(db.String, nullable=False)
    post_time    = db.Column(db.DateTime, nullable=False)
    last_edited  = db.Column(db.DateTime, nullable=True)
    posted_by    = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
    edited_by    = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)

    def serialize(self):
        poster = User.query.filter_by(id=self.posted_by).first()
        if poster is not None:
            poster_name = poster.first_name + ' ' + poster.last_name
        else:
            poster_name = None

        editor = User.query.filter_by(id=self.edited_by).first()
        if editor is not None:
            editor_name = editor.first_name + ' ' + editor.last_name
        else:
            editor_name = None
        
        return dict(id=self.id, title=self.title, description=self.description, post_time=self.post_time, last_edited=self.last_edited , posted_by=poster_name, edited_by=editor_name, img=self.img)

#Stores memberships
class Membership(db.Model):
    id          = db.Column(db.Integer, primary_key=True)
    img         = db.Column(db.String, nullable=True)
    title       = db.Column(db.String(50), nullable=False)
    description = db.Column(db.String(500), nullable=False)
    price       = db.Column(db.Integer, nullable=False)
    duration    = db.Column(db.Integer) #Specifies the duration in months
    members     = db.relationship('Has_membership', backref='membership', cascade="all,delete", lazy = True)

    def serialize(self):
        return dict(id=self.id, title=self.title, description=self.description, price=self.price, duration=self.duration, img=self.img)

#Stores events, available_spots = Null means infinite users can be booked on the event
class Event(db.Model):
    id                      = db.Column(db.Integer, primary_key=True)
    img                     = db.Column(db.String, nullable=True)
    title                   = db.Column(db.String(50), nullable=False)
    description             = db.Column(db.String(500), nullable=False)
    price                   = db.Column(db.Integer, nullable=False)
    booked_members          = db.relationship('Booked_events', backref='event', cascade="all,delete", lazy=True)
    start_datetime          = db.Column(db.DateTime, nullable=False)
    end_datetime            = db.Column(db.DateTime, nullable=False)
    last_booking_datetime   = db.Column(db.DateTime, nullable=True)
    available_spots         = db.Column(db.Integer, nullable=True) # If null, then there can be unlimited memebers booked. # TODO Make sure that this works.
    
    def serialize(self):
        return dict(id=self.id, title=self.title, description=self.description, price=self.price, start_datetime=self.start_datetime, end_datetime=self.end_datetime, last_booking_datetime=self.last_booking_datetime, available_spots=self.available_spots, img=self.img)

#Used to link a user to an event N:M
class Booked_events(db.Model): #Relation that handles the relaitonhship between users and events
    user_id  = db.Column(db.Integer, db.ForeignKey('user.id'), primary_key=True, nullable=False)
    event_id = db.Column(db.Integer, db.ForeignKey('event.id'), primary_key=True, nullable=False)
    
    def serialize(self):
        return dict(user=self.user_id, event=self.event_id)

#Used to link a membership to a user N:M
class Has_membership(db.Model): #Relation that handles the relationship between users and memberships
    user_id         = db.Column(db.Integer, db.ForeignKey('user.id'), primary_key=True, nullable=False)
    membership_id   = db.Column(db.Integer, db.ForeignKey('membership.id'), primary_key=True, nullable=False)
    purchase_date   = db.Column(db.Date, nullable = False)
    end_date        = db.Column(db.Date, nullable = False)

    def serialize(self):
        return dict(purchase_date=self.purchase_date, end_date=self.end_date, membership=self.membership_id, user=self.user_id)

    def buy_now(self):
        membership = Membership.query.filter_by(id = self.membership_id).first()
        self.purchase_date = date.today()
        self.end_date = self.purchase_date + relativedelta(months =+ membership.duration)

#Used to store association data, upon further consideration this should not exist since we only ever want to store
#Data about one association
class Association_data(db.Model): #TODO Add constraint, can only be one? #TODO Add email, Phonenumber? 
    id          = db.Column(db.Integer, primary_key=True, nullable=False)
    name        = db.Column(db.String(50), nullable=False)
    address     = db.Column(db.String(50), nullable=True) 
    zip_code    = db.Column(db.String(50), nullable=True)
    district    = db.Column(db.String(50), nullable=True)
    instagram   = db.Column(db.String, nullable=True) #Instagram URL
    facebook    = db.Column(db.String, nullable=True) #Facebook URL
    img           = db.Column(db.String, nullable=True)
    email         = db.Column(db.String, nullable=True)
    tel           = db.Column(db.String, nullable=True)
    primary_color   = db.Column(db.String, nullable=True) #Represents the color scheme of the website
    secondary_color = db.Column(db.String, nullable=True) #should be based on association brand, for example logotype


    __table_args__ = (
        CheckConstraint("email REGEXP '^[a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$'", name='email_format_constraint'),
        CheckConstraint("tel REGEXP '^[0-9]{10}$'", name='tel_format_constraint'),
        CheckConstraint("zip_code REGEXP '^[0-9]{5}$'", name='zip_code_format_constraint'),
    )

    def serialize(self):
        return dict(name=self.name, address=self.address, zip_code=self.zip_code, district=self.district, instagram=self.instagram, 
        facebook=self.facebook, img=self.img,email=self.email, tel=self.tel, primary_color=self.primary_color, secondary_color=self.secondary_color)

#Stores the associations opening hours, one for each day of the week
class Opening_hour(db.Model): 
    day             = db.Column(db.Integer, primary_key=True, nullable=False) # A number between 1 and 7, 1==Monday, 2==Tuesday and so on. #TODO Add constraint, has to be 7. 
    open_time       = db.Column(db.String, nullable=True, default=None) # == Null if the association is closed on that day.
    close_time      = db.Column(db.String, nullable=True, default=None) # == Null if the association is closed on that day.

    def serialize(self): #Excellent hard-coding 
        if self.day == 1:
            day = "Måndag"
        elif self.day == 2:
            day = "Tisdag"
        elif self.day == 3:
            day = "Onsdag"
        elif self.day == 4:
            day = "Torsdag"
        elif self.day == 5:
            day = "Fredag"
        elif self.day == 6:
            day = "Lördag"
        elif self.day == 7:
            day = "Söndag"
        return dict(day=day, open_time=self.open_time, close_time=self.close_time)

#Used to store information about board members, this is displayed on the "about us" section of the website
class Board_member(db.Model):
    id      = db.Column(db.Integer, primary_key=True, nullable=False)
    name    = db.Column(db.String, nullable=False)
    title   = db.Column(db.String, nullable=False)
    email   = db.Column(db.String, nullable=True) 
    img     = db.Column(db.String, nullable=True)
    
    def serialize(self):
        return dict(id=self.id, name=self.name, title=self.title, email=self.email, img=self.img)

#Not yet implemented but will be used in order to allow associations to add their own pages
class Standard_page(db.Model):
    id      = db.Column(db.Integer, primary_key=True, nullable=False)
    name    = db.Column(db.String, nullable=False) #Should be added to the navbar.

    # Not neccessary if we can store HTML content. TODO Enable HTML_content instead.
    img     = db.Column(db.String, nullable=True) 
    title   = db.Column(db.String, nullable=False)
    text    = db.Column(db.String, nullable=False)
    
    def serialize(self):
        return dict(name=self.name, title=self.title, text=self.text, img=self.img)

# 1:1 relationship between tag and user, tag is used for entrance to the association based on a tag-id
class Tag(db.Model):
    id              = db.Column(db.Integer, primary_key=True, nullable=False)
    active_until    = db.Column(db.Date, nullable=True)
    owned_by        = db.relationship("User", back_populates="tag", uselist=False) 
    
    def serialize(self):
        if self.owned_by is None:
            user_id = None
        else:
            user_id = self.owned_by.id
        return dict(id=self.id, active_until=self.active_until, owned_by=user_id)

# Used to store club records, will be made more advanced, (stored categories and permutations of these)
#If there is time,
class Club_record(db.Model):
    id                  = db.Column(db.Integer, primary_key=True, nullable=False)
    record_holder_id    = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    category            = db.Column(db.String, nullable=False, unique=True) #For example Junior mens bench press, or fastest 100m swimmed
    accomplishment      = db.Column(db.String, nullable=False) #For example 200kilo, or 30 seconds

    def serialize(self):
        record_holder = User.query.get_or_404({'id':self.record_holder_id})
        return dict(id=self.id, record_holder=record_holder.first_name+" "+record_holder.last_name, category=self.category, accomplishment=self.accomplishment)


class File_category(db.Model):
    id        = db.Column(db.Integer, primary_key=True, nullable=False)
    name      = db.Column(db.String, nullable=False, unique=True)
    files     = db.relationship('File', backref='files', lazy=True)

    def serialize(self):
        return dict(id=self.id, name=self.name)

class File(db.Model):
    id          = db.Column(db.Integer, primary_key=True, nullable=False)
    name        = db.Column(db.String, nullable=False)
    src         = db.Column(db.String, nullable=False)
    category    = db.Column(db.String, db.ForeignKey('file_category.name'), nullable=True)


    def serialize(self):
        return dict(id=self.id, name=self.name, src=self.src, category=self.category)

#Used to store FAQs
class Faq(db.Model):
    id          = db.Column(db.Integer, primary_key=True, nullable=False)
    question    = db.Column(db.String, nullable=False)
    answer      = db.Column(db.String, nullable=False)

    def serialize(self):
        return dict(id=self.id, question=self.question, answer=self.answer)
