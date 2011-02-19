
PREFIX = .
BUILD_DIR = ${PREFIX}/build
DIST_DIR = ${PREFIX}/dist
PLUGINS_DIR = ${PREFIX}/plugins

RHINO ?= java -jar ${BUILD_DIR}/js.jar

CLOSURE_COMPILER = ${BUILD_DIR}/google-compiler-20100917.jar

# minify
MINJAR ?= java -jar ${CLOSURE_COMPILER}

# source
POPCORN_SRC = ${PREFIX}/popcorn.js

# distribution files
POPCORN_DIST = ${DIST_DIR}/popcorn.js
POPCORN_MIN = ${DIST_DIR}/popcorn.min.js

# plugins
PLUGINS_DIST = ${DIST_DIR}/popcorn.plugins.js
PLUGINS_MIN = ${DIST_DIR}/popcorn.plugins.min.js

# popcorn + plugins
POPCORN_COMPLETE_DIST = ${DIST_DIR/popcorn-complete.js
POPCORN_COMPLETE_MIN = ${DIST_DIR}/popcorn-complete.min.js

# Grab all popcorn.<plugin-name>.js files from plugins dir
PLUGINS_SRC := $(filter-out %unit.js, $(shell find ${PLUGINS_DIR} -name 'popcorn.*.js' -print))


all: lint popcorn plugins min complete
	@@echo "Popcorn build complete."

${DIST_DIR}:
	@@mkdir -p ${DIST_DIR}

popcorn: ${POPCORN_DIST}

${POPCORN_DIST}: ${POPCORN_SRC} | ${DIST_DIR}
	@@echo "Building" ${POPCORN_DIST}
	@@cp ${POPCORN_SRC} ${POPCORN_DIST}

min: ${POPCORN_MIN} ${PLUGINS_MIN}

${POPCORN_MIN}: ${POPCORN_DIST}
	@@echo "Building" ${POPCORN_MIN}
	@@${MINJAR} --js ${POPCORN_DIST} \
	            --compilation_level SIMPLE_OPTIMIZATIONS \
	            --js_output_file ${POPCORN_MIN}

plugins: ${PLUGINS_DIST}

${PLUGINS_MIN}: ${PLUGINS_DIST}
	@@echo "Building" ${PLUGINS_MIN}
	@@${MINJAR} $(shell for js in ${PLUGINS_SRC} ; do echo --js $$js ; done) \
	            --compilation_level SIMPLE_OPTIMIZATIONS \
	            --js_output_file ${PLUGINS_MIN}

${PLUGINS_DIST}: ${PLUGINS_SRC} ${DIST_DIR}
	@@echo "Building ${PLUGINS_DIST}"
	@@cat ${PLUGINS_SRC} > ${PLUGINS_DIST}

complete: ${DIST_DIR}
	@@echo "Building popcorn + plugins"
	@@${MINJAR} --js ${POPCORN_SRC} \
	            $(shell for js in ${PLUGINS_SRC} ; do echo --js $$js ; done) \
	            --compilation_level SIMPLE_OPTIMIZATIONS \
	            --js_output_file ${POPCORN_COMPLETE_MIN}

lint: ${POPCORN_DIST}
	@@echo "Checking Popcorn against JSLint..."
	@@${RHINO} build/jslint-check.js

clean:
	@@echo "Removing Distribution directory:" ${DIST_DIR}
	@@rm -rf ${DIST_DIR}
