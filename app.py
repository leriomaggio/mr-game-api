#This file initialises the FLask app and sets resource locations (URLs)

#Import
from flask import Flask, render_template #Flask app 
from flask_restful import Api #Flask REST API
from flask_cors import CORS #For local testing

#Importing resources called by requests or startup
from resources.simulation import *
from resources.init import *

#Initialise app
app = Flask(__name__, template_folder='interface') #Flask APP
api = Api(app) #Flask REST API
CORS(app) #CORS for local testing

#Initialise data
Start_Values()

#Resource locations
api.add_resource(View_Node_Single, '/simulation/singleNode/<string:node>')
api.add_resource(View_Node, '/simulation/<string:centerNode>')
api.add_resource(View_Data, '/simulation')
api.add_resource(Intervene, '/intervene')
#api.add_resource(Reset, '/reset')
api.add_resource(Init_Buttons, '/init_buttons')
api.add_resource(Update, '/update')
#api.add_resource(View_DataNormal, '/simulation/normal')

#Only runs if current file is main (prevents feedback loops?)
if __name__ == '__main__':
	app.run(port=5000, debug=True)