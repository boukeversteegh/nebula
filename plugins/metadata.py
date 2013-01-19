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
	
	def __init__(self, settings):
		global cherrypy
		cherrypy = settings['cherrypy'];
		self.userconf = settings['userconf']
		self.cache = {}
		self.events = settings['events']
		
		def file_CHANGE(trail):
			# Delete file metadata from cache
			if trail in self.cache:
				del self.cache[trail]
				
			# Delete parent directory from cache
			parentdir = trail[:-1]
			if parentdir in self.cache:
				del self.cache[parentdir]
					
		def folder_CHANGE(trail):
			if trail in self.cache:
				del self.cache[trail]
			
		self.events.bind('file.CHANGE', file_CHANGE)
		self.events.bind('folder.CHANGE', folder_CHANGE)
	
	def default(self, *trail):
		cherrypy.response.headers['Content-Type'] = "application/json"
		localpath = os.path.join(self.userconf['librarypath'], *trail)
		response = {'success': True}
		
		cacheDirs = True
	
		if os.path.exists(localpath):
			doCache = self._doCache()
			# FILE
			if os.path.isfile(localpath):
				if trail in self.cache and doCache:
					metadata = self.cache[trail]
					response['cached'] = True
				else:
					metadata = self._getFileMetadata(trail)
					self.cache[trail] = metadata
				metadata["parent"] = "/" + "/".join(trail[0:-1])
				metadata["path"] = os.path.join("/", *trail)
				response['data'] = metadata
			
			# DIRECTORY
			if os.path.isdir(localpath):
				if cacheDirs and trail in self.cache:
					response = self.cache[trail]
					response['cached'] = True
				else:
					files = []
					folders = []
					for item in glob.glob(localpath + '/*'):
						basename = os.path.basename(item)
						if os.path.isdir(item):
							folders.append(basename)
						else:
							cacheid = trail+(item,)
							if cacheid in self.cache and doCache:
								filemetadata = self.cache[cacheid]
								filemetadata['cached'] = True
							else:
								filemetadata = self._getFileMetadata(trail+tuple([basename]))
								self.cache[cacheid] = filemetadata
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
					self.cache[trail] = response
			
		else:
			response['success'] = False
			response['error'] = "Path '%s' doesn't exist" % '/'.join(trail)
		return json.dumps(response)
	default.exposed = True
	
	
	def _doCache(self):
		# Enable caching by browser
		clientSideCache = False
		
		if clientSideCache:
			# Cache filemetadata on client for 5 minutes
			cherrypy.response.headers['Cache-Control'] = 'max-age=%d, private' % (60*10)
			doCache = cherrypy.request.headers.get('Cache-Control') not in ['max-age=0', 'no-cache']
		else:
			doCache = True
			
		return doCache
		
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
			m, s = divmod(audiofile.info.time_secs, 60)
			h, m = divmod(m, 60)
			if h > 0:
				durationstr = "%d:%02d:%02d" % (h, m, s)
			else:
				durationstr = "%2d:%02d" % (m, s)
				
			info = {
				"duration":	audiofile.info.time_secs,
				"durationstr" : durationstr
			}
		else:
			id3 = None
			info = None
		
		metadata = {
			"id3":		id3,
			"info":		info,
			"file":		trail[-1] if len(trail) > 0 else ""
		}
		return metadata
