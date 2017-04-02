import numpy as np
from collections import Counter
#TODO: DELETE THE IMPORT OF CSR_MATRIX NOT NEEDED
from scipy.sparse import csr_matrix
# Prediction function from Lecture 15 IBFNN - Returns a ranking score!
#Inputs: 
#1. numpy array Ruj, size of number of rated items
#2. numpy array SIMij = similarity(i,j), size of number of rated items
# 
# Note:This includes the corner case if i==j because if we rated i high, then we have a high prediction score
#
def pred(Ruj,SIMij):
    if len(Ruj) == 0:
        return float(3)
    return float(np.dot(Ruj,SIMij)/( np.dot(SIMij,np.ones(SIMij.shape)) ))


#Similarity function from Lecture 15 for IBFNN
#Inputs:
#1. R - a scipy.CSR sparse np matrix - rows are users - columns (i and j for restaurants)
#2. i,j are integer indices for the rows of AR
#Notes:
#M is number of Rows
# N is the number of columns
#
#ASSUME: no zero ratings in R
def sim(R,i,j):
    M,N = R.shape
    meanvalues = R.sum(1)
    number_of_non_zeros_per_row = np.zeros(R.sum(1).shape)

    nonzero = R.nonzero() #TODO, for optimization, move this out and call it once
    for val in nonzero[0]:
        number_of_non_zeros_per_row[val][0] +=1

    #will get /0 runtimewarning but it doesn't matter by assumption that no zero ratings
    meanvalues = meanvalues/number_of_non_zeros_per_row #  FOR OPTIMIZATION , MOVE THIS OUTO F THIS FUNCTION 
    #each row is the average rating per user

    

    Rated = Counter()
    rows = nonzero[0]
    cols = nonzero[1]
    for row,col in zip(rows,cols):
        if col == i or col == j:
            if i ==j:
                Rated[row] +=2# same restaurant
            else:
                Rated[row] +=1 # the user has rated one of the restaurants

    RatedByBoth = []
    for key in Rated:
        if Rated[key] == 2:
            RatedByBoth.append(key)
    Ri = R[:,i][RatedByBoth].todense()
    Rj = R[:,j][RatedByBoth].todense()
    RAbar = meanvalues[RatedByBoth]
    RAbar = np.array(RAbar).T[0]
    Ri = np.array(Ri).T[0]
    Rj = np.array(Rj).T[0]
    
    if len(Ri) == 0 and len(Rj) == 0:
        return 0
        
    return float(np.dot(Ri-RAbar,Rj-RAbar) +1)/ ((float(np.sqrt(np.dot(Ri-RAbar,Ri-RAbar) )) * float(np.sqrt(np.dot(Rj-RAbar,Rj-RAbar)))) +1) #added a +1 to not divide by 0

##ground_truth - np array of float
##predicted - np array of float
def MSE(ground_truth,predicted):
    arr = ground_truth - predicted
    return (1/float(len(arr)))*np.dot(arr,arr)

#makes calling pred more natural - as it is done in the math
def pred_usability_wrapper(R,user_index,restaurant_index):
    Ruj = []
    SIMij = []
    row = R[user_index,:].nonzero()[1]
    for val in row:
        if val != restaurant_index: 
            Ruj.append(R[user_index,val])
            SIMij.append(sim(R,restaurant_index,val))
    Ruj = np.array(Ruj)
    SIMij = np.array(SIMij)
    return pred(Ruj,SIMij)
