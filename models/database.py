from config import Config

from pymongo import MongoClient

from base.singleton import Singleton

import logging
log = logging.getLogger("database")

class Database(object):
	__metaclass__ = Singleton
	def __init__(self):
		self.db_config = Config().get_config("database")
		self._connect_db()

	def _connect_db(self):
		connection = MongoClient(self.db_config["address"], self.db_config["port"])
		if connection:
			log.info("Connected Database on " + self.db_config["address"] + ":" + str(self.db_config["port"]))
		self._database = connection.__getattr__(self.db_config["name"])
	
	def __getattr__(self, name):
		return self._database.__getattr__(name)

