import numpy as np
import random as r


class MyError(Exception):
    def __init__(self, value):
       self.value = value
    def __str__(self):
        return repr(self.value)

class ExampleGenerator(object):
	def __init__(self,val_min_list,val_max_list,discrete_or_continuous_list):
		self.val_min_list = val_min_list
		self.val_max_list = val_max_list
		self.discrete_or_continuous_list = discrete_or_continuous_list # 'discrete' or 'continuous'
		#all of the above have same length
	def generate_example(self):
		ex = np.zeros(len(self.val_min_list))
		for i in range(len(ex)):
			try:
				localmin=self.val_min_list[i]
				localmax=self.val_max_list[i]
				if self.discrete_or_continuous_list[i] == 'discrete':
					ex[i] = r.randint(localmin,localmax)
				elif self.discrete_or_continuous_list[i] == 'continuous':
					ex[i] = np.random.uniform(localmin,localmax)
				else: 
					raise MyError(0)
			except MyError as e:
				print 'Not labelled as discrete or continuous!'
		return ex



# #example use
# # values are [country_or_city,temperature_in_Farenheit]
# eg = ExampleGenerator([0,-10],[1,110],['discrete','continuous'])
# print eg.generate_example()





			