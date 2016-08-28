import sys, os 
sys.path.append(os.path.realpath('..'))

from ItemToItemUtilities import *

def test1():
	R = [['A','B'], ['C','D','E'], ['A','E'], ['F'],['F','D','A'],['B','E','F']]
	Q = [['A'], ['B','E'], ['A','B','C','D','E','F'],['C','F'],['G'],['G','C'],['G','F']]
	R_rate = [3,5,2.5,5,4,1]
	rate = rate_i(R, Q, R_rate, 'cos_sim')
	print 'cos_sim',rate
	rate = rate_i(R, Q, R_rate, 'jaccard_sim')
	print 'jaccard_sim',rate

test1()
