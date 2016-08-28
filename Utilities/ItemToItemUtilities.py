#inputs for the first 3 methods are:
#F1 =['indian', 'coffee']
# F2 = ['coffee']
# Fj = [F1]
# rates = [3]
def sqrt(n):
	return float(n)**.5

#method 1
def cos_sim(F1,F2,rate_j):
	return float(len([f for f in F1 if f in F2])) / (sqrt(len(F1))*sqrt(len(F2)))

#method 2
def jaccard_sim(F1,F2,rate_j):
	temp = len([f for f in F1 if f in F2])
	return float(temp)/(len(F1) + len(F2) - temp)

def similarity_func(F1,F2,rate_j,simtype):
	if simtype == 'cos_sim':
		return cos_sim(F1,F2,rate_j)
	elif simtype == 'jaccard_sim':
		return jaccard_sim(F1,F2,rate_j)
	else:
		raise ValueError('Wrong simtype.')

#Fj is array of array of string, Fi is array of string, rate_j is array of float
def rate_i(Fi,Fj,rates,simtype):
	rate = []

	if (simtype == 'cos_sim' or simtype == 'jaccard_sim') and len(rates) == len(Fj) :
		i=0
		numerator =  0.0
		denomenator = 0.0
		for val in Fj:
			simvalue = similarity_func(val,Fi,i,simtype)
			numerator += (simvalue*rates[i])
			denomenator+=simvalue
			i+=1
		if(denomenator):
	 		return(numerator/denomenator)
		else:
			return(3) #return 3 if is 0
		#floats
	else:
		raise ValueError('Wrong simtype or bad lengths of Fj and rates')

def test():
	F1 =['indian', 'coffee']
	F2 = ['coffee']
	Fj = [F1]
	rates = [3]
	print rate_i(Fj,F2,rates,'jaccard_sim')
	print rate_i(Fj,F2,rates,'cos_sim')




