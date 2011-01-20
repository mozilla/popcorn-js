
PREFIX = .
BUILD_DIR = ${PREFIX}/build
DIST_DIR = ${PREFIX}/dist


RHINO ?= java -jar ${BUILD_DIR}/js.jar

CLOSURE_COMPILER = ${BUILD_DIR}/google-compiler-20100917.jar

# minify
MINJAR ?= java -jar ${CLOSURE_COMPILER}

# source
POPCORN_SRC = ${PREFIX}/popcorn.js

# distribution files
POPCORN_DIST = ${DIST_DIR}/popcorn.js
POPCORN_MIN = ${DIST_DIR}/popcorn.min.js

all: popcorn min lint
	@@echo "Popcorn build complete."

${DIST_DIR}:
	@@mkdir -p ${DIST_DIR}
	

popcorn: ${POPCORN_DIST}
p: ${POPCORN_DIST}

${POPCORN_DIST}: ${POPCORN_SRC} | ${DIST_DIR}
	@@echo "Building" ${POPCORN_DIST}

	@@cat ${POPCORN_SRC} > ${POPCORN_DIST};	
	

min: ${POPCORN_MIN}

${POPCORN_MIN}: ${POPCORN_DIST}
	@@echo "Building" ${POPCORN_MIN}

	@@head -11 ${POPCORN_DIST} > ${POPCORN_MIN}
	@@${MINJAR} --js ${POPCORN_DIST} --warning_level QUIET --js_output_file ${POPCORN_MIN}.tmp
	@@cat ${POPCORN_MIN}.tmp >> ${POPCORN_MIN}
	@@rm -f ${POPCORN_MIN}.tmp	
	

lint: ${POPCORN_DIST}
	@@echo "Checking Popcorn against JSLint..."
	@@${RHINO} build/jslint-check.js	
	
clean:
	@@echo "Removing Distribution directory:" ${DIST_DIR}
	@@rm -rf ${DIST_DIR}

	

# Make sure $JSSHELL points to your js shell binary in .profile or .bashrc
TOOLSDIR= ${PREFIX}/tools

# Most targets use commands that need a js shell path specified
JSSHELL ?= $(error Specify a valid path to a js shell binary in ~/.profile: export JSSHELL=C:\path\js.exe or /path/js)

check: check-lint

check-lint:
	${TOOLSDIR}/jslint.py ${JSSHELL} popcorn.js



PLUGINS_DIR = ${PREFIX}/plugins
PLUGINS_DIST = ${DIST_DIR}/popcorn.plugins.js
PLUGINS_MIN = ${DIST_DIR}/popcorn.plugins.min.js


PLUGINS_SRC = ${PLUGINS_DIR}/attribution/popcorn.attribution.js\
    ${PLUGINS_DIR}/flickr/popcorn.flickr.js\
    ${PLUGINS_DIR}/footnote/popcorn.footnote.js\
    ${PLUGINS_DIR}/googlemap/popcorn.googlemap.js\
    ${PLUGINS_DIR}/googlenews/popcorn.googlenews.js\
    ${PLUGINS_DIR}/image/popcorn.image.js\
    ${PLUGINS_DIR}/lowerthird/popcorn.lowerthird.js\
    ${PLUGINS_DIR}/subtitle/popcorn.subtitle.js\
    ${PLUGINS_DIR}/tagthisperson/popcorn.tagthisperson.js\
    ${PLUGINS_DIR}/twitter/popcorn.twitter.js\
    ${PLUGINS_DIR}/webpage/popcorn.webpage.js\
    ${PLUGINS_DIR}/wikipedia/popcorn.wikipedia.js


plugins: ${PLUGINS_DIST}


${PLUGINS_DIST}: ${PLUGINS_SRC} | ${DIST_DIR}
	@@echo "Building" ${PLUGINS_DIST}

	@@cat ${PLUGINS_SRC} > ${PLUGINS_DIST};	
	

pluginsmin: ${PLUGINS_MIN}

${PLUGINS_MIN}: ${PLUGINS_DIST}
	@@echo "Building" ${PLUGINS_MIN}

	@@head -0 ${PLUGINS_DIST} > ${PLUGINS_MIN}
	@@${MINJAR} --js ${PLUGINS_DIST} --warning_level QUIET --js_output_file ${PLUGINS_MIN}.tmp
	@@cat ${PLUGINS_MIN}.tmp >> ${PLUGINS_MIN}
	@@rm -f ${PLUGINS_MIN}.tmp	



