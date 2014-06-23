import logging
logging.basicConfig()
from songinfo import SongInfo


info = SongInfo()
info.get_info("http://douban.fm/?start=1485878g30ecg0&cid=3485878")
