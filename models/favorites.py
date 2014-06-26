#coding: utf-8
from modelbase import ModelBase

class FavoriteModel(ModelBase):
  def __init__(self):
    self.name = "favorites"
    super(FavoriteModel, self).__init__()

  def add(self, user_id, song_id):
    fav = self.collection.insert({
                                  "user_id": ModelBase.get_oid(user_id),
                                  "song_id": song_id
                                 })
    return str(fav)

  def get_all(self, user_id):
    favorites = self.collection.find({"user_id": ModelBase.get_oid(user_id)}, {"song_id": 1})
    return ModelBase.cursor2list(favorites)

  def remove(self, user_id, record_id):
    record = self.collection.find_one(ModelBase.get_oid(record_id))
    if str(record["user_id"]) == user_id:
        self.collection.remove(record)
        return True
    return False
