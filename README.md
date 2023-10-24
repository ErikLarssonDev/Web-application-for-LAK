# Web application

Web application project used for bachelor thesis.

# Commands used for setup of virtual env(inside the "server" folder)
python3 -m venv venv
source venv/bin/activate

# Commands to start venv
source venv/bin/activate

# Installs in server folder
pip install -r requirements.txt

# Updates requirements.txt
pip freeze > requirements.txt

# How to reset the database from the termidal
python db_reset.py

# How to initiate a test environment with the inputs from the test.py file
python test.py
python main.py