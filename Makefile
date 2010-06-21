# Make sure $JSSHELL points to your js shell binary in .profile or .bashrc
TOOLSDIR=./tools

all: release

create-release: clean
	mkdir ./release

# Version number used in naming release files.
VERSION ?= $(error Specify a version for your release (e.g., VERSION=0.5))

release: release-files zipped

release-files: popcorn yui release-docs

zipped: release-files
	gzip -c ./release/popcorn-${VERSION}.min.js > ./release/popcorn-${VERSION}.min.js.gz
	find ./release -print | zip -j ./release/popcorn.js-${VERSION}.zip -@

release-docs: create-release
	cp AUTHORS ./release
	cat README | sed -e 's/@VERSION@/${VERSION}/' > ./release/README
	cp LICENSE ./release
	cp CHANGELOG ./release

pretty: create-release
	${TOOLSDIR}/jsbeautify.py ${JSSHELL} popcorn.js > ./release/popcorn-${VERSION}.js.tmp
# check for any parsing errors in pretty version of popcorn.js
	${JSSHELL} -f ${TOOLSDIR}/fake-dom.js -f ./release/popcorn-${VERSION}.js.tmp
	cat ./release/popcorn-${VERSION}.js.tmp | sed -e 's/@VERSION@/${VERSION}/' > ./release/popcorn-${VERSION}.js
	rm -f ./release/popcorn-${VERSION}.js.tmp

popcorn: create-release
	cp popcorn.js ./release/popcorn-${VERSION}.js.tmp
# check for any parsing errors in popcorn.js
	${JSSHELL} -f ${TOOLSDIR}/fake-dom.js -f ./release/popcorn-${VERSION}.js.tmp
	cat ./release/popcorn-${VERSION}.js.tmp | sed -e 's/@VERSION@/${VERSION}/' > ./release/popcorn-${VERSION}.js
	rm -f ./release/popcorn-${VERSION}.js.tmp

yui: create-release
#	java -jar ${TOOLSDIR}/yui/yuicompressor-2.4.2.jar --nomunge popcorn.js -o ./release/popcorn-${VERSION}.min.js
	java -jar ${TOOLSDIR}/yui/yuicompressor-2.4.2.jar popcorn.js -o ./release/popcorn-${VERSION}.min.js
# check for any parsing errors in compiled version of popcorn.js
	${JSSHELL} -f ${TOOLSDIR}/fake-dom.js -f ./release/popcorn-${VERSION}.min.js

check: check-lint

check-lint:
	${TOOLSDIR}/jslint.py ${JSSHELL} popcorn.js

# Most targets use commands that need a js shell path specified
JSSHELL ?= $(error Specify a valid path to a js shell binary in ~/.profile: export JSSHELL=C:\path\js.exe or /path/js)

clean:
	rm -fr ./release
