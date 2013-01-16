#!/usr/bin/python
import glob
import os
import cherrypy
import mimetypes
import sys
import simplejson as json
import plugins.metadata
import plugins.files
import plugins.lyrics

class Nebula:
	pass

if __name__ == '__main__':
	nebula = Nebula()
	
	
	librarypath = sys.argv[1]
	
	cherrypy.config.update({
		'server.socket_host': '0.0.0.0', 
		'server.socket_port': int(sys.argv[2])
	})

	userconf = {
		'librarypath':	librarypath 
	}
	
	conf = {
		'/index': {
			'tools.staticfile.on': True,
			'tools.staticfile.filename': os.path.join(os.getcwd(), 'www/index.html')
		},
		'/view': {
			'tools.staticfile.on': True,
			'tools.staticfile.filename': os.path.join(os.getcwd(), 'www/index.html')
		},
		'/www': {
			'tools.staticdir.on': True,
			'tools.staticdir.dir': os.path.join(os.getcwd(), 'www')
		}
    }
    
	nebula.files = plugins.files.Files(cherrypy, userconf, conf)
	nebula.metadata = plugins.metadata.Metadata(cherrypy, userconf)
	nebula.lyrics = plugins.lyrics.Lyrics(cherrypy, userconf, conf)
	
	cherrypy.config.update({
		'server.socket_host': '0.0.0.0', 
		'server.socket_port': int(sys.argv[2])
	})
	
	cherrypy.quickstart(nebula, '/', conf)
