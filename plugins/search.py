try:
	import simplejson as json
except ImportError:
	import json

import tempfile

import whoosh
import whoosh.index
from whoosh.fields import *
from whoosh.qparser import QueryParser, MultifieldParser
from whoosh.writing import BufferedWriter

class Search:
	exposed = True
	
	def __init__(self, settings):
		global cherrypy
		cherrypy = settings['cherrypy']
		self.userconf = settings['userconf']
		self.initWhoosh()

	def initWhoosh(self):
		indexdir = tempfile.mkdtemp()

		schema = Schema(
			path	= ID(stored=True),
			mimetype= STORED,
			artist	= TEXT,
			title	= TEXT,
			album	= TEXT,
			id3		= STORED
		)

		index = whoosh.index.create_in(indexdir, schema)
		writer = BufferedWriter(index, period=10, limit=100)
		self.writer = writer
		self.index = index


	def default(self, field, querystring):
		querystring = unicode(querystring)
		with self.index.searcher() as searcher:
		
			if field == "all":
				qparser = MultifieldParser(["artist", "title", "album"], self.index.schema)
			else:
				qparser	= QueryParser(field, self.index.schema)
				
			query = qparser.parse(querystring)
			results	= searcher.search(query)
			files = []
			for result in results:
				jresult = {}
				for key in result:
					jresult[key] = result[key]
				files.append(jresult)
		response = {
			"data":		{
				"files":	files
			},
			"success":	True
		}
		return json.dumps(response)

	default.exposed = True

	def add(self, **fields):
		self.writer.add_document(**fields)

	def commit(self):
		self.writer.commit()
