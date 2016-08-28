data2 = {
	"wings-over-ann-arbor-ann-arbor":"chicken_wings,bbq",
	"rich-j-c-korean-restaurant-ann-arbor-2":"korean",
	"pacific-rim-ann-arbor":"asianfusion",
	"neopapalis-ann-arbor":"salad,pizza,sandwiches",
	"miki-japanese-restaurant-ann-arbor":"japanese,sushi",
	"savas-ann-arbor":"newamerican",
	"university-cafe-ann-arbor":"korean,cafes",
	"brown-jug-ann-arbor":"pizza,tradamerican,bars",
	"good-time-charleys-ann-arbor":"newamerican,pubs",
	"panera-bread-ann-arbor-3":"sandwiches,salad,soup",
	"potbelly-sandwich-shop-ann-arbor-4":"sandwiches",
	"noodles-and-company-ann-arbor-2":"asianfusion,comfortfood,italian",
	"melange-ann-arbor":"asianfusion,lounges",
	"ahmos-gyros-and-deli-ypsilanti":"mediterranean,greek",
	"jamaican-jerk-pit-ann-arbor":"caribbean",
	"the-chop-house-ann-arbor":"steak",
	"amers-delicatessen-ann-arbor":"coffee,vegetarian,sandwiches",
	"the-black-pearl-ann-arbor":"seafood,lounges",
	"pieology-pizzeria-ann-arbor":"pizza",
	"gandy-dancer-restaurant-ann-arbor":"tradamerican",
	"blue-leprechaun-ann-arbor":"bars,irish",
	"backroom-pizza-ann-arbor":"pizza",
	"aventura-ann-arbor":"tapas,spanish,bars",
	"taste-of-india-ann-arbor":"indpak",
	"no-thai-ann-arbor":"thai",
	"sushi-town-ann-arbor":"sushi",
	"subway-ann-arbor-2":"sandwiches,hotdogs",
	"jolly-pumpkin-cafe-and-brewery-ann-arbor-3":"newamerican,breweries,gastropubs",
	"chipotle-mexican-grill-ann-arbor-3":"hotdogs,mexican",
	"grizzly-peak-brewing-company-ann-arbor":"newamerican,breweries",
	"madras-masala-ann-arbor":"indpak",
	"sadako-japanese-restaurant-ann-arbor":"newamerican",
	"mani-osteria-and-bar-ann-arbor":"italian,pizza",
	"jimmy-johns-ann-arbor-3":"sandwiches",
	"isalita-ann-arbor":"mexican",
	"south-u-pizza-ann-arbor":"pizza",
	"buffalo-wild-wings-ann-arbor":"sportsbars,tradamerican,chicken_wings",
	"tomukun-korean-barbeque-ann-arbor":"korean,bbq"};
import csv
with open('data.csv', 'rb') as csvfile:
	spamreader = csv.reader(csvfile, delimiter=',')
	first = 0
	for row in spamreader:
		if first == 0:
			first = 1
		else:
			for i in range(1,6):
				if row[i] != "":
					if(row[0] in data2):
						print "insert into rate values('" + str(i) +"','" + row[0] + "','','" + data2[row[0]] +"',"  + row[i] + ',1);';
					else:
						print "insert into rate values('" + str(i) +"','" + row[0] + "',''," + "''" +","  + row[i] + ',1);';

