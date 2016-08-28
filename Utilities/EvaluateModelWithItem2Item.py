import numpy as np
from scipy.sparse import lil_matrix,csr_matrix
from ItemBasedFiltering_Utilities import *
from ItemToItemUtilities import *

def importDataFromCSV(ground_truth_filename,trainingdata_filename,itemtoitemdataset):
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
    foodtypes = []
    with open(itemtoitemdataset) as f:
        i = 0
        for line in f:
            if (i == 0):
                i = 1
            else:    
                restaurant = line.strip('\n').split('|')
                foodtypes.append(restaurant[1].split(','))

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
    return (trainingData,testData_xy,testData_values,foodtypes)





if __name__ == "__main__":
        trainingData,testData_xy,testData_values,foodtypes = importDataFromCSV('../Datasets/ground_truth.csv','../Datasets/recommenderdata_trainingdata.csv','../Datasets/item_item_dataset.csv')
        trainingData = csr_matrix(trainingData)
                
        ground_truth = np.array(testData_values.T)[0]
        predicted = np.zeros(len(ground_truth))
        #now make predictions!
        user = []
        rate = []
        train_dense = trainingData.todense()
        for i in range(train_dense.shape[1]):
            user.append([foodtypes[a] for a in range(train_dense.shape[0]) if train_dense[a, i] > 0])
            rate.append([train_dense[a,i] for a in range(train_dense.shape[0]) if train_dense[a, i] > 0])
        sim_func1 = 'cos_sim'
        sim_func2 = 'jaccard_sim'
        estimate1 =  [rate_i(foodtypes[int(a[0,0])], user[int(a[0,1])], rate[int(a[0,1])], sim_func1) for a in testData_xy]
        estimate2 = [rate_i(foodtypes[int(a[0,0])], user[int(a[0,1])], rate[int(a[0,1])], sim_func2) for a in testData_xy]
        
        predicted = np.zeros(len(ground_truth))
        #now make predictions!
        i = 0
        while i < len(predicted):
            user_index = testData_xy[i,0]
            restaurant_index = testData_xy[i,1]
            predicted[i] = pred_usability_wrapper(trainingData,user_index,restaurant_index)
            i+=1
        seq = np.arange(0,1.05,0.05)
        print seq
        MSE1 = [MSE(ground_truth, [ a * predicted[i] + (1 - a) * estimate1[i] for i in range(len(ground_truth))]) for a in seq]
        MSE2 = [MSE(ground_truth, [ a * predicted[i] + (1 - a) * estimate2[i] for i in range(len(ground_truth))]) for a in seq]
        idx1 = MSE1.index(min(MSE1))
        idx2 = MSE2.index(min(MSE2))
        print MSE1
        print 'MSE is minizing when alpha = ' + str(seq[idx1]) + ' using ' + sim_func1 + ' : MSE = ' + str(MSE1[idx1])
        print MSE2
        print 'MSE is minizing when alpha = ' + str(seq[idx2]) + ' using ' + sim_func2 + ' : MSE = ' + str(MSE2[idx2])

        
