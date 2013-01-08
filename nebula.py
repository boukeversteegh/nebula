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
		localpath = os.path.join(librarypath, *trail)
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
				path = "/".join(trail)
				response['data'] = {
					"files":	files,
					"folders":	folders,
					"path":		"/" + path if len(trail) > 0 else path,
					"folder":	trail[-1] if len(trail) > 0 else "",
					"trail":	trail
				}
				return json.dumps(response)

	# SEE
	# http://docs.cherrypy.org/dev/refman/_cpreqbody.html
	def PUT(self, *trail, **kwargs):
		response = {}
		success = True
		try:
			upfile = cherrypy.request.params['upfile']
			localpath = os.path.join(librarypath, *trail)
			f = open(localpath, 'w+b')
			f.write(upfile.fullvalue())
		except Exception as e:
			success = False
			response['error'] = "Error writing file: " + repr(e)
			cherrypy.log("*******ERROR********\n" + repr(e))
			
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
		
	def POST(self, *trail, **params):
		cherrypy.response.headers['Content-Type'] = "application/json"
		
		localpath = os.path.join(librarypath, *trail)
		response = {}
		success = True
		if 'action' not in params:
			success = False
			response['error'] = "Missing parameter: action"
		else:
			if params['action'] == 'mkdir':
				try:
					if os.path.exists(localpath):
						raise("Path already exists")
					os.mkdir(localpath)
				except Exception as e:
					success = False
					response['error'] = e.strerror
					
		response['success'] = success
		return json.dumps(response)

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
    
	#def put(self):
	#	cherrypy.request.processRequestBody = True
    
	#cherrypy.tools.put = Tool('before_request_body', put)
	cherrypy.quickstart(nebula, '/', conf)
