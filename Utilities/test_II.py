import csv
filename = '../Datasets/test-10-fold.txt'
with open(filename,'w') as f:
	spamreader = f.reader(csvfile, delimiter=',')
	for row in spamreader:
		print row
dict = {}
