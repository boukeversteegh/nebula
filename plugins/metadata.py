import os.path
import eyed3
import eyed3.mp3
import pyinotify
import asyncore
import eventhandler

try:
	import simplejson as json
except ImportError:
	import json

global cherrypy

class PyInotifyHandler(pyinotify.ProcessEvent):
	def __init__(self, events):
		self.events = events

	def process_IN_CREATE(self, event):
		self.events.trigger('localfile.CHANGE', event.pathname)

	def process_IN_DELETE(self, event):
		self.events.trigger('localfile.CHANGE', event.pathname)

	def process_IN_MOVED_FROM(self, event):
		self.events.trigger('localfile.CHANGE', event.pathname)

	def process_IN_MOVED_TO(self, event):
		self.events.trigger('localfile.CHANGE', event.pathname)

class Metadata:
	id3tags = [
		'version', 'bpm', 'title', 'artist', 'album', 'track_num', 'publisher','cd_id',
		'disc_num',
		'commercial_url', 'audio_source_url', 'artist_url', 'internet_radio_url', 'payment_url', 'publisher_url',
		#'genre',
		##'play_count',
		#'images',
		##'original_release_date',
		##'recording_date',
		#'encoding_date',
		#'tagging_date',
		#'lyrics',
		#'popularities',
		#'audio_file_url',
		#'unique_file_ids',
		# 'terms_of_use',
		#'chapters',
		#'table_of_contents'
	]
	
	def __init__(self, settings):
		global cherrypy
		global nebula
		nebula			= settings['nebula']
		cherrypy		= settings['cherrypy'];
		self.userconf	= settings['userconf']
		self.events		= settings['events']
		self.cache		= {}
		
		try:
			# Setup PyInotify (Linux Only)
			pyinotifyhandler	= PyInotifyHandler(self.events)
			watchmanager		= pyinotify.WatchManager()
			watchmask			= pyinotify.IN_DELETE | pyinotify.IN_CREATE | pyinotify.IN_MOVED_FROM | pyinotify.IN_MOVED_TO
			notifier 			= pyinotify.ThreadedNotifier(watchmanager, pyinotifyhandler)
			notifier.start()

			watchmanager.add_watch(self.userconf['librarypath'], watchmask, rec=True)

			self.pyinotifyhandler = pyinotifyhandler
			
			# Make sure notifier thread is killed on exiting Nebula
			cherrypy.engine.subscribe('exit', lambda: notifier.stop())
		except pyinotify.InotifyBindingNotFoundError:
			# Inotify not supported (Windows, Mac)
			pass

		def file_CHANGE(trail):
			# Delete file metadata from cache
			if trail in self.cache:
				del self.cache[trail]
				
			# Delete parent directory from cache
			parentdir = trail[:-1]
			if parentdir in self.cache:
				del self.cache[parentdir]

		def localfile_CHANGE(localpath):
			libpath = self.userconf['librarypath']
			if localpath.startswith(libpath):
				path = localpath[len(libpath)+1:]
				trail = tuple(path.split('/'))
				self.events.trigger('file.CHANGE', trail)
					
		def folder_CHANGE(trail):
			if trail in self.cache:
				del self.cache[trail]
			
		self.events.bind('file.CHANGE', file_CHANGE)
		self.events.bind('folder.CHANGE', folder_CHANGE)
		self.events.bind('localfile.CHANGE', localfile_CHANGE)
		nebula.search.add(**{"path":u"/test.mp3", "title":u"test","artist":u"test","mimetype":u"audio/mpeg"})
		nebula.search.commit()
	
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
				self.addToIndex(metadata)

			# DIRECTORY
			if os.path.isdir(localpath):
				if cacheDirs and trail in self.cache:
					response = self.cache[trail]
					response['cached'] = True
				else:
					files	= []
					folders	= []
					for item in os.listdir(localpath):
						item		= os.path.join(localpath, item)
						basename	= os.path.basename(item)
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
								_indexfile = filemetadata.copy()
								_indexfile['path'] = "/".join(trail) + "/" + basename
								self.addToIndex(_indexfile)
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
					self.commitToIndex()
			
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
			if audiofile.info is None:
				info = None
			else:
				m, s = divmod(audiofile.info.time_secs, 60)
				h, m = divmod(m, 60)
				if h > 0:
					durationstr = "%d:%02d:%02d" % (h, m, s)
				else:
					durationstr = "%2d:%02d" % (m, s)
					
				info = {
					"duration":		audiofile.info.time_secs,
					"durationstr" : durationstr
				}
			mimetype = 'audio/mpeg';
		else:
			id3		= None
			info	= None
			mimetype = None
		
		metadata = {
			"id3":		id3,
			"info":		info,
			"file":		trail[-1] if len(trail) > 0 else "",
			"mimetype":	mimetype
		}
		return metadata

	def addToIndex(self, metadata):
		document = {}
		document["path"]		= unicode(metadata["path"])
		document["mimetype"]	= metadata["mimetype"]
		if metadata["id3"]:
			document["id3"]		= metadata["id3"]
			# Add indexes
			for tag in ["title", "artist", "album"]:
				if tag in metadata["id3"]:
					document[tag] = unicode(metadata["id3"][tag])
		nebula.search.add(**document)

	def commitToIndex(self):
		nebula.search.commit()
