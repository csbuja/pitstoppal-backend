import sys,os
sys.path.append(os.path.abspath('./Utilities'))
sys.path.append(os.path.abspath('..')) #done so the test works

from scipy.sparse import csr_matrix, lil_matrix
from ItemBasedFiltering_Utilities import *

if len(sys.argv) == 2:
    data_filename = sys.argv[1] # first argument
    M,N = [0,0]  # the dimensions of the lil matrix

    with open(data_filename,'r') as f:
        num_lines = 0

        for line in f:
            if num_lines == 0:
                user_restaurant = line.split(',')
                user_index = int(user_restaurant[0])
                restaurant_index = int(user_restaurant[1])
            if num_lines == 1:
                N = len(line.split(','))
            num_lines +=1
        M = num_lines -1

    R = lil_matrix((M,N))  # Done to rmeove the sparse efficiency warning if we only use csr matrix
    with open(data_filename,'r') as f:
        i = 0
        for line in f:
            arr = line.strip('\n').split(',')
            j=0
            for val in arr:
                if val != '':
                    R[i-1,j] = float(val)
                j+=1
            i +=1

    R = csr_matrix(R).T
    print pred_usability_wrapper(R,user_index,restaurant_index)
