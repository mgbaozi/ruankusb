#coding=utf-8

import json
import sys
import os
import inspect

from base.singleton import Singleton

class Config(object):
	"""这里包含所有的配置信息"""
	__metaclass__ = Singleton
	def __init__(self):
		config_dir = os.path.abspath(
				os.path.dirname(inspect.getfile(inspect.currentframe())))
		config_file = config_dir + os.path.sep + "config.json"
		with open(config_file) as fp:
			self._configs = json.load(fp)
		self.conf = {}
		self.conf["database"] = self._configs["database"]

	def get_configs(self): #const
		return self.conf
	
	def get_config(self, name): #const
		return self.conf.get(name)	
