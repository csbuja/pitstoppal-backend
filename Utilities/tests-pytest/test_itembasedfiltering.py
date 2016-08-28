import sys, os 
from scipy.sparse import csr_matrix
import numpy as np
sys.path.append(os.path.realpath('..'))

from ItemBasedFiltering_Utilities import *

#Notes:
#1.
#Below is matrix for Test Cases 1 - 4
# Users#R1#R2
# U1   #2 #5
# U2   #3 #0
#2.

class Unbuffered(object):
    def __init__(self, stream):
        self.stream = stream
    def write(self, data):
        self.stream.write(data)
        self.stream.flush()
    def __getattr__(self, attr):
        return getattr(self.stream, attr)

import sys
sys.stdout = Unbuffered(sys.stdout)



#Test Case 1
def test_sim_restaurant1andrestaurant2():
    M = csr_matrix((2,2))
    M[0,0] = 2.0
    M[0,1] = 5.0
    M[1,0] = 3.0
    assert(sim(M,0,1)==-1) 

#Test Case 2
def test_restaurant2andrestaurant2():
    M = csr_matrix((2,2))
    M[0,0] = 2.0
    M[0,1] = 5.0
    M[1,0] = 3.0
    assert(sim(M,1,1)==1)

#Test Case 3
def test_restaurant1andrestaurant1():
    M = csr_matrix((2,2))
    M[0,0] = 2.0
    M[0,1] = 5.0
    M[1,0] = 3.0
    assert(sim(M,0,0)==1)

#Test Case 4
def test_pred_user2restaurant2():
    M = csr_matrix((2,2))
    M[0,0] = 2.0
    M[0,1] = 5.0
    M[1,0] = 3.0
    Ruj = np.array([3])
    SIMij = np.array([sim(M,0,1)]) #just [-1] by Test Case 1

    assert(pred(Ruj,SIMij)==3)

#Test Case 5
def test_mse_1():
    predicted = np.array([1.0,2.0,3.0,3.0,2.0]) 
    ground_truth = np.array([2.0]*3 + [4.0]*2)
    #1/5 * (1 + 0 + 1+1+4) == 7/5
    assert(MSE(ground_truth,predicted)>=float(7)/5) #floating point math error
    assert(MSE(ground_truth,predicted)<=float(8)/5)

#Test Case 6
def test_mse_2():
    #the average predictor
    ground_truth = np.array([1.0]*3+[5.0]*2)
    predicted = np.array([3.0]*5)
    
    assert(MSE(ground_truth,predicted)==4)

#Test Case 7
def test_pred_usability_wrapper_user2restaurant2():
    #note that this is the same test case as test case 4 but with the wrapper
    M = csr_matrix((2,2))
    M[0,0] = 2.0
    M[0,1] = 5.0
    M[1,0] = 3.0
    assert(pred_usability_wrapper(M,1,1)==3)

#Test Case 8
def test_PredictRatings():
    import subprocess
    filename ="testcase8.txt"
    with open(filename, 'w') as f:
        f.write('1,1\n')
        f.write('2.0,5.0\n')
        f.write('3.0,\n')
    proc = subprocess.Popen(['python', '../../PredictRatings.py', filename],stdout=subprocess.PIPE)
    for line in iter(proc.stdout.readline,''):
        assert(float(line.rstrip()) == 3) 
    






