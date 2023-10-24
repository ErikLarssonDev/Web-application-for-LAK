from base import db
from main import app
from classes import *
from main import str_date
from main import str_datetime

with app.app_context():
    db.drop_all()
    db.create_all()

    #Tests the User class.
    user_1 = User(pnr = "19990315-2339", first_name = "Erik", last_name = "Larsson", email = "erik.u.larsson1@gmail.com", password_hash = "test", newsletter=True)
    user_2 = User(pnr = "20000315-2539", first_name = "Elias", last_name = "Leijonmarck", email = "elias@test.se", password_hash = "test", newsletter=True)
    user_3 = User(pnr = "20000722-2739", first_name = "August", last_name = "Svensson", email = "august@test.se", password_hash = "test", newsletter=False)
    user_4 = User(pnr = "19990722-2738", first_name = "Siri", last_name = "Selander", email = "siri@test.se", password_hash = "test", newsletter=False)

    db.session.add(user_1)
    db.session.add(user_2)
    db.session.add(user_3)
    db.session.add(user_4)
    db.session.commit()

    # Tests the Membership class.
    membership_1 = Membership(title ="Årsmedlemskap", description = "Medlemskap år 2022.", price = 150, duration = 12)
    membership_2 = Membership(title ="Gymkort 6 månader", description = "Träna hur mycket du vill!", price = 800, duration = 6)
    membership_3 = Membership(title ="Gymkort 12 månader", description = "Träna hur mycket du vill!", price = 1500, duration = 12)

    db.session.add(membership_1)
    db.session.add(membership_2)
    db.session.add(membership_3)
    db.session.commit()

    # Tests the Event class
    #TODO Fix None functionality for events available_spots
    event_1 = Event(title = "Grillkväll", description = "En trevlig grillkväll i sommarvärmen.", price = 0, start_datetime = str_date("2022-04-10"), end_datetime = str_date("2022-06-24"), available_spots = None)
    event_3 = Event(title = "Grillkväll2", description = "En trevlig grillkväll i sommarvärmen.", price = 0, start_datetime = str_date("2022-04-10"), end_datetime = str_date("2022-06-24"), available_spots = None)
    event_4 = Event(title = "Grillkväll3", description = "En trevlig grillkväll i sommarvärmen.", price = 0, start_datetime = str_date("2022-04-10"), end_datetime = str_date("2022-06-24"), available_spots = None)
    event_2 = Event(title = "Tävling", description = "Den som lyfter mest är bäst.", price = 100, start_datetime = str_date("2022-08-30"), end_datetime = str_date("2022-09-30"), available_spots = 20)
    event_5 = Event(title = "Tävling2", description = "Den som lyfter mest är bäst.", price = 100, start_datetime = str_date("2022-04-11"), end_datetime = str_date("2022-04-05"), available_spots = 20)
    event_6 = Event(title = "Tävling2", description = "Den som lyfter mest är bäst.", price = 100, start_datetime = str_date("2022-04-12"), end_datetime = str_date("2022-09-30"), available_spots = 20)
    event_7 = Event(title = "Tävling2", description = "Den som lyfter mest är bäst.", price = 100, start_datetime = str_date("2022-04-13"), end_datetime = str_date("2022-09-30"), available_spots = 20)
    event_8 = Event(title = "Tävling2", description = "Den som lyfter mest är bäst.", price = 100, start_datetime = str_date("2022-04-14"), end_datetime = str_date("2022-09-30"), available_spots = 20)
    event_9 = Event(title = "Tävling2", description = "Den som lyfter mest är bäst.", price = 100, start_datetime = str_date("2022-04-15"), end_datetime = str_date("2022-09-30"), available_spots = 20)
    event_10 = Event(title = "Tävling2", description = "Den som lyfter mest är bäst.", price = 100, start_datetime = str_date("2022-04-16"), end_datetime = str_date("2022-09-30"), available_spots = 20)
    event_11 = Event(title = "Tävling2", description = "Den som lyfter mest är bäst.", price = 100, start_datetime = str_date("2022-04-17"), end_datetime = str_date("2022-09-30"), available_spots = 20)

    db.session.add(event_1)
    db.session.add(event_2)
    db.session.add(event_3)
    db.session.add(event_4)
    db.session.add(event_5)
    db.session.add(event_6)
    db.session.add(event_7)
    db.session.add(event_8)
    db.session.add(event_9)
    db.session.add(event_10)
    db.session.add(event_11)

    
    db.session.add(event_5)
    db.session.commit()
   
    # Tests the Post class
    post_1 = Post(title = "First post", description = "The first post on the site. Denna är väldigt lång för att testa hur det går med för långa posts. Jag har inte silver och inte guld. Inget du kan få. Det jag äger ligger blottat för din syn. Mina händer är tomma men hjärtat fullt. Av nåt du inte ser.Så jag har nånting som är mera värt ändå För om du tappar modet och faller ner på knä Kan du vila här hos mig. Som en klippa i stormen att luta dig mot. Och jag sviker aldrig dig. Jag ska följa dig genom eld och vatten Över land och hav. Jag ska älska dig tills hjärtat slutar slå Från det högsta berg. Till det djupaste av dalar ska jag gå. Genom tid och rum Ja, alla mina dagar ska du få", posted_by = 1, post_time = str_datetime("2022-03-15 12:00:00"))
    post_2 = Post(title = "Second post", description = "The second post on the site.", posted_by = 2, post_time = str_datetime("2022-03-15 13:00:00"))
    post_3 = Post(title = "Third post", description = "The third post on the site.", posted_by = 1, post_time = str_datetime("2023-06-25 12:00:00"))

    db.session.add(post_1)
    db.session.add(post_2)
    db.session.add(post_3)
    db.session.commit()

    # Tests the Has_membership links class
    link_1 = Has_membership(user_id = 1, membership_id = 1)
    link_1.buy_now()
    link_2 = Has_membership(user_id = 1, membership_id = 2)
    link_2.buy_now()
    link_3 = Has_membership(user_id = 2, membership_id = 1)
    link_3.buy_now()

    db.session.add(link_1)
    db.session.add(link_2)
    db.session.add(link_3)
    db.session.commit()

    # Tests the Booked_event links class
    event_link_1 = Booked_events(user_id = 1, event_id = 1)
    event_link_2 = Booked_events(user_id = 1, event_id = 2) 
    event_link_3 = Booked_events(user_id = 2, event_id = 1)

    db.session.add(event_link_1)
    db.session.add(event_link_2)
    db.session.add(event_link_3)
    db.session.commit()

    #Tests the Association_data class

    Association1 = Association_data(id = 1, name = "Linköpings Atletklubb", address = "Rydsvägen 1a", zip_code= "58431", district = "Linköping",facebook = "https://www.facebook.com/NordicWellnessLinkopingDjurgarden/", instagram = "https://www.instagram.com/nordicwellnessdjurgarden/", email = "email@gmail.com", tel = "0701177111")
    Association1.primary_color = "#14213d"
    Association1.secondary_color = "#fca311"
    db.session.add(Association1)

    # Tests the Opening_hour class
    opening_hour_day_1 = Opening_hour(day = 1, open_time= "8", close_time = "20")
    opening_hour_day_2 = Opening_hour(day = 2, open_time= "9", close_time = "21")
    opening_hour_day_3 = Opening_hour(day = 3, open_time= "10", close_time = "22")
    opening_hour_day_4 = Opening_hour(day = 4, open_time= "11", close_time = "23")
    opening_hour_day_5 = Opening_hour(day = 5, open_time= "12", close_time = "24")
    opening_hour_day_6 = Opening_hour(day = 6, open_time= "13", close_time = "11")
    opening_hour_day_7 = Opening_hour(day = 7, open_time= "14", close_time = "12")

    db.session.add(opening_hour_day_1)
    db.session.add(opening_hour_day_2)
    db.session.add(opening_hour_day_3)
    db.session.add(opening_hour_day_4)
    db.session.add(opening_hour_day_5)
    db.session.add(opening_hour_day_6)
    db.session.add(opening_hour_day_7)
    db.session.commit()


    # Tests the Board_member class
    ordforande = Board_member(name="Ellen Svensson", title="Ordförande", email="ordforande@lak.se")
    kassor = Board_member(name="Tomas", title="Kassör", email="kassor@lak.se")
    medlemsansvarig = Board_member(name="Tobias", title="Medlemsansvarig", email="medlem@lak.se")
    gymansvarig = Board_member(name="Henrik Podeus", title="Gymansvarig", email="gym@lak.se")
    db.session.add(ordforande)
    db.session.add(kassor)
    db.session.add(gymansvarig)
    db.session.add(medlemsansvarig)
    db.session.commit()

    #Tests the Board_member class
    club_record_1 = Club_record(id = 1, record_holder_id = 1, category = "Mens Squat", accomplishment = "1337 kg")
    club_record_2 = Club_record(id = 2, record_holder_id = 1, category = "Mens Bench", accomplishment = "1998 kg")
    club_record_3 = Club_record(id = 3, record_holder_id = 2, category = "Mens 60 seconds dips", accomplishment = "360 st")

    db.session.add(club_record_1)
    db.session.add(club_record_2)
    db.session.add(club_record_3)
    db.session.commit()

    #Tests the file-category class
    file_category_1 = File_category(id = 1, name = "year-protocol")
    file_category_2 = File_category(id = 2, name = "feature-image")
    file_category_3 = File_category(id = 3, name = "board-member-image")
    file_category_4 = File_category(id = 4, name = "policy-file")

    db.session.add(file_category_1)
    db.session.add(file_category_2)
    db.session.add(file_category_3)
    db.session.add(file_category_4)
    db.session.commit()


    #Tests faq class
    faq_1 = Faq(question="question1", answer="answer1")
    faq_2 = Faq(question="question2", answer="answer2")
    faq_3 = Faq(question="question3", answer="answer3")
    faq_4 = Faq(question="question4", answer="answer4")
    faq_5 = Faq(question="question5", answer="answer5")

    db.session.add(faq_1)
    db.session.add(faq_2)
    db.session.add(faq_3)
    db.session.add(faq_4)
    db.session.add(faq_5)
    db.session.commit()
    #TODO add Tests the Standard_page class