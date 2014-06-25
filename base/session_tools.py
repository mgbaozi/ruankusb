import memcache
from singleton import Singleton
import uuid
import logging
log = logging.getLogger("session")
log.setLevel(logging.DEBUG)

class SessionTools(object):
  __metaclass__ = Singleton
  def __init__(self):
    self.cache = memcache.Client(['127.0.0.1:11211'])
  
  def login(self, set_cookie, user_id):
    session_id = uuid.uuid4().get_hex()
    self.cache.set(session_id, user_id, 60 * 60)
    log.debug("{1}logged in, session_id = {0}".format(session_id, user_id))
    set_cookie("session_id", session_id)

  def logged_user(self, get_cookie):
    session_id = get_cookie("session_id")
    log.debug("cookie.session_id={0}".format(session_id))
    if session_id:
      user_id = self.cache.get(session_id)
      log.debug("get user_id {}".format(user_id))
      return user_id if user_id else None
    return None

