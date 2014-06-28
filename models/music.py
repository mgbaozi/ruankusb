#coding: utf-8
from modelbase import ModelBase

class MusicModel(ModelBase):
  def __init__(self):
    self.name = "music"
    super(MusicModel, self).__init__()

  def get_rep(self, song_id):
    result = self.collection.find_one({"song_id": song_id})
    if not result:
      return None, None
    return result["lrc"], result["song_info"]

  def set_rep(self, song_id, lrc, song_info):
    result = self.collection.find_one({"song_id": song_id})
    if result:
      result.update({"lrc": lrc, "song_info": song_info})
      return self.collection.update(result)
    self.collection.insert({
                            "song_id": song_id,
                            "lrc": lrc,
                            "song_info": song_info 
                          })

