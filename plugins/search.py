import simplejson as json
import tempfile

import whoosh
import whoosh.index
from whoosh.fields import *
from whoosh.qparser import QueryParser
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
			artist	= TEXT(stored=True),
			title	= TEXT(stored=True),
			album	= TEXT(stored=True)
		)

		index = whoosh.index.create_in(indexdir, schema)
		writer = BufferedWriter(index, period=10, limit=100)
		self.writer = writer
		self.index = index


	def default(self, field, query):
		field = field
		query = unicode(query)
		with self.index.searcher() as searcher:
			query	= QueryParser(field, self.index.schema).parse(query)
			results	= searcher.search(query)
			json = []
			for result in results:
				jresult = {}
				for key in result:
					jresult[key] = result[key]
				json.append(jresult)
			return repr(json)
	default.exposed = True

	def add(self, **fields):
		self.writer.add_document(**fields)

	def commit(self):
		self.writer.commit()