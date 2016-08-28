import random as r
import numpy as np 
import sys

#modifies: nothing
def transform_index_to_matrix_index(i,mat):
    return ( int(i)/mat.shape[1], int(i) % mat.shape[1])
def writeMatrixToFile(my_data,filestream):
    i=0
    while i < my_data.shape[0]:
        for j in range(my_data.shape[1]):
            if ~(np.isnan(my_data[i,j])) :
                filestream.write(str(my_data[i,j]))
            if not (j == (my_data.shape[1]-1)):
                filestream.write(',')
        filestream.write('\n')
        i+=1


if __name__ == "__main__":
    RANDOM_SEED = 2
    from numpy import genfromtxt
    filename_data = 'recommenderdata.csv'
    trainingdatafile = filename_data[:-4] +'_trainingdata' + '.csv' #output a csv
    testdatafile = filename_data[:-4] +'_testdata' + '.csv' #output x,y pairs,  0 indexing the matrix row
    ground_truth_testfile = 'ground_truth.csv' #output x,y,true value

    file1 = open('../Datasets/'+trainingdatafile, 'w')
    file2 = open('../Datasets/'+testdatafile, 'w')
    file3 = open('../Datasets/'+ground_truth_testfile, 'w')

    my_data = genfromtxt('../Datasets/'+filename_data, delimiter=',')
    my_data = my_data[1:]
    my_data = np.matrix(my_data)
    my_data = my_data[:,2:]
    NUMBER_OF_USERS = my_data.shape[1]
    fraction_TRAINDATA = 0.7

    firstrowstr = ''
    i=0
    while True:
        firstrowstr += 'U'
        i+=1
        firstrowstr += str(i)
        if i == NUMBER_OF_USERS:
            break
        firstrowstr +=','
    file1.write(firstrowstr +'\n')
    file2.write('x,y\n') #what to test
    file3.write('x,y,value\n') # ground truth

    np.random.seed(RANDOM_SEED)
    r.seed(RANDOM_SEED)
    number_of_nonnans = np.count_nonzero(~np.isnan(my_data))
    NUMBER_TRAINDATA = int(number_of_nonnans * fraction_TRAINDATA)
    NUMBER_TESTDATA = number_of_nonnans - NUMBER_TRAINDATA
    SAMPLE_INDICES = np.random.choice(my_data.shape[0]*my_data.shape[1], size=(my_data.shape[0]*my_data.shape[1]), replace=False, p=None) #same without replacement
    removed_trainingdata_count= 0
    #write the ground truth and the test matrix
    i = 0
    while removed_trainingdata_count < NUMBER_TESTDATA:
        sample_index = SAMPLE_INDICES[i]
        rowstr = '' #is a string

        matrix_index = transform_index_to_matrix_index(sample_index,my_data)
        sample_value = my_data[matrix_index[0],matrix_index[1]]
        if ~(np.isnan(sample_value )):
            my_data[matrix_index[0],matrix_index[1]] = np.nan #write over it in my_data
            rowstr  = str(matrix_index[0]) +',' + str(matrix_index[1])
            file2.write(rowstr + '\n')
            rowstr+=( ',' + str(sample_value))
            file3.write(rowstr+'\n') #ground truth
            removed_trainingdata_count +=1

        i+=1 #guaranteeed to reach NUMBER_TRAINDATA
        

    #write the training matrix to the file
    writeMatrixToFile(my_data,file1)

    file1.close()
    file2.close()
    file3.close()





