# Choqok
Protobuf codec for NodeJS projects.
Choqok is a sparrow in the Sistan dialect, but when it be the name of this project, it creates a very handy NodeJS protobuf codec for you. You can write the proto files and their codes then get its codec simply.

# How to use
Choqok gets proto files and delivers you one NodeJS application:
- Clone project:
	```
	git clone https://github.com/mohsenmoqadam/Choqok.git
	```
- Now chane directoy and run Choqok:
	```
	cd Choqok
	npm start
	```
When you run Choqok, it creates a NodeJS application in `./codec` directory. You can move it anywhere you like or set the created application path in the configuration file. Furthermore 
 you can set proto files path and application parameters by editing `etc/config.json`. Notice that these configurations consumed by Choqok for creating a NodeJS application.
- Run created NodeJS application:
	```
	cd codec
	npm start 
	```
 Congratulations your codec works. if you are familiar with Protobuf see `app.js`. I wrote a simple example of how to use the codec. 
