import numpy as np
from scipy.sparse import lil_matrix,csr_matrix
from ItemBasedFiltering_Utilities import *

def importDataFromCSV(ground_truth_filename,trainingdata_filename):
    trainingData= None
    testData = None
    shape_0_training=0
    shape_1_training = 0
    shape_0_testing =0
    shape_1_testing = 3
    with open(trainingdata_filename) as f:
        i = 0
        for line in f:
            if i == 0:
                shape_1_training = len(line.strip('\n').split(','))
                i=1
            else:
                shape_0_training +=1
    with open(ground_truth_filename) as f:
        i = 0
        for line in f:
            if i > 0:
                shape_0_testing +=1
            i+=1

    trainingData = lil_matrix((shape_0_training,shape_1_training))
    testData_xy = lil_matrix((shape_0_testing,shape_1_testing-1)).todense()
    testData_values=lil_matrix((shape_0_testing,1)).todense()
    #skip the first line in both of these
    with open(trainingdata_filename) as f:
        i = 0
        for line in f:
            if i > 0: #not the first line in the file
                row = line.strip('\n').split(',')
                j = 0
                for val in row:
                    if val != '':
                        trainingData[i-1,j] = float(val)
                    j+=1
            i+=1


    with open(ground_truth_filename) as f:
        i = 0
        for line in f:
            if i > 0: #not the first line in the file
                row = line.strip('\n').split(',')
                j = 0
                for val in row:
                    if j==0:
                        testData_xy[i-1,j] = int(val)
                    if j==1:
                        testData_xy[i-1,j] = int(val)
                    if j==2:
                        testData_values[i-1,0] = float(val)
                    j+=1
            i+=1
    return (trainingData,testData_xy,testData_values)





if __name__ == "__main__":
        trainingData,testData_xy,testData_values = importDataFromCSV('../Datasets/ground_truth.csv','../Datasets/recommenderdata_trainingdata.csv')
        trainingData = csr_matrix(trainingData)
        ground_truth = np.array(testData_values.T)[0]
        #x:res_id y:user_id
        predicted = np.zeros(len(ground_truth))
        #now make predictions!
        i = 0
        while i < len(predicted):
            user_index = testData_xy[i,0]
            restaurant_index = testData_xy[i,1]
            predicted[i] = pred_usability_wrapper(trainingData,user_index,restaurant_index)
            i+=1
        print 'MSE value: ' + str(MSE(ground_truth,predicted))



