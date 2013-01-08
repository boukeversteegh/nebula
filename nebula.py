#!/usr/bin/python
import glob
import os
import cherrypy
import mimetypes
import sys
import simplejson as json

from cherrypy.lib.static import serve_file

class Nebula:

	def metadata(self, *trail):
		localpath = os.path.join(librarypath, *trail)
		response = {'success': True}
		if os.path.isfile(localpath):
			response['data'] = {
				"path": os.path.join("/", *trail),
				"file":	trail[-1] if len(trail) > 0 else ""
			}
		return json.dumps(response)
	metadata.exposed = True

class Files:
	exposed = True
	
	def GET(self, *trail):
		path = '/'.join(trail)
		localpath = os.path.join(librarypath, path)
		if not os.path.exists(localpath):
			return False
		else:
			
			if os.path.isfile(localpath):
				return serve_file(localpath)
			else:
				response = {}
				files = []
				folders = []
				for item in glob.glob(localpath + '/*'):
					basename = os.path.basename(item)
					if os.path.isdir(item):
						folders.append(basename)
					else:
						files.append(basename)
				files.sort()
				folders.sort()
				response['data'] = {
					"files":	files,
					"folders":	folders,
					"path":		"/" + path if len(path) > 0 else path,
					"folder":	trail[-1] if len(trail) > 0 else "",
					"trail":	trail
				}
				return json.dumps(response)

	def PUT(self, *trail, **kwargs):
		response = {}
		success = True
		try:
			content = cherrypy.request.body.read()
			path = '/'.join(trail)
			localpath = os.path.join(librarypath, path)
			f = open(localpath, 'w')
			f.write(content)
			f.close()
		except Exception as e:
			success = False
			response['error'] = "Error writing file: " + e.strerror
			
		response["success"] = success
		return json.dumps(response)
	
	def DELETE(self, *trail):
		localpath = os.path.join(librarypath, *trail)
		response = {}
		success = True
		if os.path.isfile(localpath):
			os.unlink(localpath)
		else:
			success = False
			response['error'] = 'File not found: ' + localpath
			
		response['success'] = success

if __name__ == '__main__':
	nebula = Nebula()
	
	librarypath = sys.argv[1]
	
	nebula.files = Files()
	cherrypy.config.update({
		'server.socket_host': '0.0.0.0', 
		'server.socket_port': int(sys.argv[2])
	}) 
	conf = {
		'/index': {
			'tools.staticfile.on': True,
			'tools.staticfile.filename': os.path.join(os.getcwd(), 'gui/player.html')
		},
		'/browse': {
			'tools.staticfile.on': True,
			'tools.staticfile.filename': os.path.join(os.getcwd(), 'gui/player.html')
		},
		'/play': {
			'tools.staticfile.on': True,
			'tools.staticfile.filename': os.path.join(os.getcwd(), 'gui/player.html')
		},
		'/css': {
			'tools.staticdir.on': True,
			'tools.staticdir.dir': os.path.join(os.getcwd(), 'gui/css')
		},
		'/js': {
			'tools.staticdir.on': True,
			'tools.staticdir.dir': os.path.join(os.getcwd(), 'gui/js')
		},
		'/js/jquery.js': {
			'tools.staticfile.on': True,
			'tools.staticfile.filename': os.path.join(os.getcwd(), 'gui/js/jquery-1.8.3.min.js')
		},
		'/files': {
		    'request.dispatch': cherrypy.dispatch.MethodDispatcher(),
		},
		'/tpl/play': {
			'tools.staticfile.on': True,
			'tools.staticfile.filename': os.path.join(os.getcwd(), 'gui/tpl/play.html')
		},
		'/tpl/browse/files': {
			'tools.staticfile.on': True,
			'tools.staticfile.filename': os.path.join(os.getcwd(), 'gui/tpl/browse/files.html')
		},
    }
						
	cherrypy.quickstart(nebula, '/', conf)
