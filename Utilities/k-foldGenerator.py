import numpy
import csv
def generate_whole(filename1, filename2):
	f = open(filename2,'w')
	with open(filename1, 'rb') as csvfile:
		spamreader = csv.reader(csvfile, delimiter=',')
		first = 0
		i = 0
		for row in spamreader:
			if first == 0:
				first = 1
				f.write("Res,User,Rate,FoodType\n")
			else:
			#for i in range(1, len(row) - 1):
				print >> f, '\n'.join(str for str in [str(i)+ ',' + str(a) + ',' + row[a] + ',\"' + row[len(row)-1] +'\"'
				for a in range(1, len(row) - 1) if row[a] != ''])
				i += 1
	f.close()
	csvfile.close()
def k_fold(k, filename, test_name, train_name):
	f = open(filename, 'r')
	line_num = f.read().count("\n")-1
	f.close()
	index = numpy.random.choice(line_num, line_num/10, replace = False)
	f_test = open(test_name, 'w')
	f_train = open(train_name, 'w')
	f_test.write("Res,User,Rate,FoodType\n")
	f_train.write("Res,User,Rate,FoodType\n")
	with open(filename, 'rb') as f:
		i = -1
		for line in f:
			if i >= 0:
				if i in index:
					f_test.write(line)
				else:
					f_train.write(line)
			i = i + 1
	f.close()
	f_test.close()
	f_train.close()

filename1 = '../sql/data.csv'
filename2 = '../Datasets/dataset.txt'
k = 10
test_name = '../Datasets/test-'+str(k)+'-fold.txt'
train_name = '../Datasets/train-'+str(k)+'-fold.txt'
generate_whole(filename1,filename2)
k_fold(k, filename2, test_name, train_name)
