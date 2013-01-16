import os.path
import glob
import eyed3
import eyed3.mp3
import json

global cherrypy

class Metadata:
	id3tags = [
		'version',
		'bpm',
		'title',
		'artist',
		'album',
		'track_num',
		##'play_count',
		'publisher',
		'cd_id',
		#'images',
		##'original_release_date',
		##'recording_date',
		#'encoding_date',
		#'tagging_date',
		#'lyrics',
		'disc_num',
		#'popularities',
		#'genre',
		'commercial_url',
		#'audio_file_url',
		'audio_source_url',
		'artist_url',
		'internet_radio_url',
		'payment_url',
		'publisher_url',
		#'unique_file_ids',
		'terms_of_use',
		#'chapters',
		#'table_of_contents'
	]
	
	def __init__(self, cp, userconf, conf=None):
		global cherrypy
		cherrypy = cp;
		self.userconf = userconf
		self.cache = {}
	
	def default(self, *trail):
		if trail in self.cache and (not 'Cache-Control' in cherrypy.request.headers or cherrypy.request.headers['Cache-Control'] not in ['max-age=0', 'no-cache']):
			response = self.cache[trail]
			response['cached'] = True
			response['headers'] = cherrypy.request.headers
		else:
			localpath = os.path.join(self.userconf['librarypath'], *trail)
			response = {'success': True}
		
			if os.path.exists(localpath):
				# FILE
				if os.path.isfile(localpath):
					metadata = self._getFileMetadata(trail)
					metadata["parent"] = "/" + "/".join(trail[0:-1])
					metadata["path"] = os.path.join("/", *trail)
					response['data'] = metadata
				# DIRECTORY
				else:
					files = []
					folders = []
					for item in glob.glob(localpath + '/*'):
						basename = os.path.basename(item)
						if os.path.isdir(item):
							folders.append(basename)
						else:
							filemetadata = self._getFileMetadata(trail+tuple([basename]))
							files.append(filemetadata)
					files.sort()
					folders.sort()
					path = "/".join(trail)
					response['data'] = {
						"files":	files,
						"folders":	folders,
						"path":		"/" + path if len(trail) > 0 else path,
						"folder":	trail[-1] if len(trail) > 0 else "",
						"trail":	trail,
						"parent":	"/" + "/".join(trail[0:-1])
					}
			else:
				response['success'] = False
				response['error'] = "Path '%s' doesn't exist" % '/'.join(trail)
			self.cache[trail] = response
		return json.dumps(response)
	default.exposed = True
		
	def _getFileMetadata(self, trail):
		localpath = os.path.join(self.userconf['librarypath'], *trail)
		if eyed3.mp3.isMp3File(localpath):
			audiofile = eyed3.load(localpath)
			id3 = {}
			if audiofile.tag:
				for tagname in Metadata.id3tags:
					tagvalue = getattr(audiofile.tag, tagname)
					if tagvalue:
						id3[tagname] = tagvalue
			
			#tag['release_date'] = audiofile.tag.best_release_date
		else:
			id3 = None
		metadata = {
			"id3":    id3,
			"file":	  trail[-1] if len(trail) > 0 else ""
		}
		return metadata
