Nebula
======

Social music server

![files](https://github.com/boukeversteegh/nebula/raw/master/docs/screenshots/files.png "Files view")

How to run
==========

```bash
python nebula.py $LIBRARYPATH $PORT
```
```bash
# For example
mkdir ~/library
python nebula.py ~/library 8006
```

Then visit `http://localhost:8006` in your webbrowser.

Requirements
============
* [Python 2.7](http://www.python.org/download/)
* Python Modules (can be installed using `easy_install`)
  * [cherrypy](http://download.cherrypy.org/cherrypy/3.2.2/): Webserver

Optional
========
* Python Modules
  * [simplejson](https://github.com/simplejson/simplejson): Faster JSON module than built-in
  * [eyed3](http://eyed3.nicfit.net/): Module for reading ID3-tags from MP3 files (Now built-in. Delete lib/eyed3 to use system module instead.)

Pivotal Tracker
===============

For issues and features, please see: https://www.pivotaltracker.com/projects/744593
