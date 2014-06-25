#coding:utf-8
from database import Database
from bson.objectid import ObjectId

class ModelBase(object):
  def __init__(self):
    db = Database()
    self.collection = db.__getattr__(self.name)
  
  def _get_collection(self):
    return self.collection
  
  @staticmethod
  def transform_id(data):
    data["_id"] = str(data["_id"])
    return data
  
  @staticmethod
  def get_oid(_id):
    return ObjectId(_id)
  
  @staticmethod
  def cursor2list(cursor):
    return [ModelBase.transform_id(data) for data in cursor]

  # create subclass and override these for method
  def insert(self, data):
    return self.collection.insert(data)

  def find(self, data=None):
    return self.collection.find(data)

  def update(self, key, data):
    #通过判断返回字典中的n == 1,判断是否更新成功。
    return self.collection.update(key, {"$set":data})

  def remove(self, data):
    return self.collection.remove(data)
