PREFIX = .
BUILD_DIR = ${PREFIX}/build
DIST_DIR = ${PREFIX}/dist
PLUGINS_DIR = ${PREFIX}/plugins
PARSERS_DIR = ${PREFIX}/parsers
PLAYERS_DIR = ${PREFIX}/players
EFFECTS_DIR = $(PREFIX)/effects
MODULES_DIR = $(PREFIX)/modules
WRAPPERS_DIR = $(PREFIX)/wrappers
IE8_DIR = $(PREFIX)/ie8

# Version number used in naming release files. Defaults to git commit sha.
VERSION ?= $(shell git show -s --pretty=format:%h)

RHINO ?= java -jar ${BUILD_DIR}/js.jar

CLOSURE_COMPILER = ${BUILD_DIR}/google-compiler-20100917.jar
compile = @@${MINJAR} $(1) \
	                    --compilation_level SIMPLE_OPTIMIZATIONS \
	                    --js_output_file $(2)

# minify
MINJAR ?= java -jar ${CLOSURE_COMPILER}

# source
POPCORN_SRC = ${PREFIX}/popcorn.js

# distribution files
POPCORN_DIST = ${DIST_DIR}/popcorn.js
POPCORN_MIN = ${DIST_DIR}/popcorn.min.js

# modules
MODULES_DIST = ${DIST_DIR}/popcorn.modules.js
MODULES_MIN = ${DIST_DIR}/popcorn.modules.min.js

# wrappers
WRAPPERS_DIST = ${DIST_DIR}/popcorn.wrappers.js
WRAPPERS_MIN = ${DIST_DIR}/popcorn.wrappers.min.js

# plugins
PLUGINS_DIST = ${DIST_DIR}/popcorn.plugins.js
PLUGINS_MIN = ${DIST_DIR}/popcorn.plugins.min.js

# plugins
PARSERS_DIST = ${DIST_DIR}/popcorn.parsers.js
PARSERS_MIN = ${DIST_DIR}/popcorn.parsers.min.js

# players
PLAYERS_DIST = ${DIST_DIR}/popcorn.players.js
PLAYERS_MIN = ${DIST_DIR}/popcorn.players.min.js

# effects
EFFECTS_DIST = $(DIST_DIR)/popcorn.effects.js
EFFECTS_MIN = $(DIST_DIR)/popcorn.effects.min.js

# Grab all popcorn.<plugin-name>.js files from plugins dir
PLUGINS_SRC := $(filter-out %unit.js, $(shell find ${PLUGINS_DIR} -name 'popcorn.*.js' -print))

# Grab all popcorn.<plugin-name>.js files from parsers dir
PARSERS_SRC := $(filter-out %unit.js, $(shell find ${PARSERS_DIR} -name 'popcorn.*.js' -print))

# Grab all popcorn.<player-name>.js files from players dir
PLAYERS_SRC := $(filter-out %unit.js, $(shell find ${PLAYERS_DIR} -name 'popcorn.*.js' -print))

# Grab all popcorn.<effect-name>.js files from effects dir
EFFECTS_SRC := $(filter-out %unit.js, $(shell find $(EFFECTS_DIR) -name 'popcorn.*.js' -print))

# Grab all popcorn.<Module-name>.js files from modules dir
MODULES_SRC := $(filter-out %unit.js, $(shell find $(MODULES_DIR) -name 'popcorn.*.js' -print))

# Grab all popcorn.<wrapper-name>.js files from modules dir
WRAPPERS_SRC := $(filter-out %unit.js, $(shell find $(WRAPPERS_DIR) -name 'popcorn.*.js' -print))

# Grab all popcorn.<plugin-name>.unit.js files from plugins dir
PLUGINS_UNIT := $(shell find ${PLUGINS_DIR} -name 'popcorn.*.unit.js' -print)

# Grab all popcorn.<parser-name>.unit.js files from parsers dir
PARSERS_UNIT := $(shell find ${PARSERS_DIR} -name 'popcorn.*.unit.js' -print)

# Grab all popcorn.<player-name>.unit.js files from players dir
PLAYERS_UNIT := $(shell find ${PLAYERS_DIR} -name 'popcorn.*.unit.js' -print)

# Grab all popcorn.<effects>.unit.js files from effects dir
EFFECTS_UNIT := $(shell find $(EFFECTS_DIR) -name 'popcorn.*.unit.js' -print)

# Grab all popcorn.<module-name>.unit.js files from modules dir
MODULES_UNIT := $(shell find $(MODULES_DIR) -name 'popcorn.*.unit.js' -print)

# Grab all popcorn.<wrapper-name>.unit.js files from modules dir
WRAPPERS_UNIT := $(shell find $(WRAPPERS_DIR) -name 'popcorn.*.unit.js' -print)

# popcorn + plugins
POPCORN_COMPLETE_LIST := --js ${POPCORN_SRC} \
                         $(shell for js in ${MODULES_SRC} ; do echo --js $$js ; done) \
                         $(shell for js in ${WRAPPERS_SRC} ; do echo --js $$js ; done) \
                         $(shell for js in ${EFFECTS_SRC} ; do echo --js $$js ; done) \
                         $(shell for js in ${PLUGINS_SRC} ; do echo --js $$js ; done) \
                         $(shell for js in ${PARSERS_SRC} ; do echo --js $$js ; done) \
                         $(shell for js in ${PLAYERS_SRC} ; do echo --js $$js ; done)
POPCORN_COMPLETE_DIST = ${DIST_DIR}/popcorn-complete.js
POPCORN_COMPLETE_MIN = ${DIST_DIR}/popcorn-complete.min.js

# For IE8 compat we include a subset of all files, known to work with IE8.
POPCORN_IE8_FILES := \
  $(IE8_DIR)/popcorn.ie8.js \
  $(POPCORN_SRC) \
  $(MODULES_DIR)/player/popcorn.player.js \
  $(PLAYERS_DIR)/youtube/popcorn.youtube.js

POPCORN_IE8_DIST = $(DIST_DIR)/popcorn-ie8.js
POPCORN_IE8_MIN = $(DIST_DIR)/popcorn-ie8.min.js

# Create a versioned license header for js files we ship
add_license = cat $(PREFIX)/LICENSE_HEADER | sed -e 's/@VERSION/${VERSION}/' > $(1).__hdr__ ; \
	                    cat $(1).__hdr__ $(1) >> $(1).__tmp__ ; rm -f $(1).__hdr__ ; \
	                    mv $(1).__tmp__ $(1)

# Create a version parameter for Popcorn
add_version = cat $(1) | sed -e 's/@VERSION/${VERSION}/' > $(1).__tmp__ ; \
	                    mv $(1).__tmp__ $(1)

# Run the file through jslint
run_lint = @@$(RHINO) build/jslint-check.js $(1)

all: setup popcorn modules wrappers plugins parsers players effects complete min ie8
	@@echo "Popcorn build complete.  To create a testing mirror, run: make testing."

check: lint lint-plugins lint-parsers lint-players lint-effects lint-modules lint-wrappers

${DIST_DIR}:
	@@mkdir -p ${DIST_DIR}

popcorn: ${POPCORN_DIST}

${POPCORN_DIST}: $(POPCORN_SRC) | $(DIST_DIR)
	@@echo "Building" $(POPCORN_DIST)
	@@cp $(POPCORN_SRC) $(POPCORN_DIST)
	@@$(call add_license, $(POPCORN_DIST))
	@@$(call add_version, $(POPCORN_DIST))

min: setup ${POPCORN_MIN} ${MODULES_MIN} $(WRAPPERS_MIN) ${PLUGINS_MIN} ${PARSERS_MIN} ${PLAYERS_MIN} $(EFFECTS_MIN) ${POPCORN_COMPLETE_MIN}

${POPCORN_MIN}: ${POPCORN_DIST}
	@@echo "Building" ${POPCORN_MIN}
	@@$(call compile, --js $(POPCORN_DIST), $(POPCORN_MIN))
	@@$(call add_license, $(POPCORN_MIN))
	@@$(call add_version, $(POPCORN_MIN))

${POPCORN_COMPLETE_MIN}: ${POPCORN_SRC} ${MODULES_SRC} ${PLUGINS_SRC} ${PARSERS_SRC} $(EFFECTS_SRC) ${DIST_DIR}
	@@echo "Building" ${POPCORN_COMPLETE_MIN}
	@@$(call compile, $(POPCORN_COMPLETE_LIST), $(POPCORN_COMPLETE_MIN))
	@@$(call add_license, $(POPCORN_COMPLETE_MIN))
	@@$(call add_version, $(POPCORN_COMPLETE_MIN))

modules: setup ${MODULES_DIST}

${MODULES_MIN}: ${MODULES_DIST}
	@@echo "Building" ${MODULES_MIN}
	@@$(call compile, $(shell for js in ${MODULES_SRC} ; do echo --js $$js ; done), ${MODULES_MIN})

${MODULES_DIST}: ${MODULES_SRC} ${DIST_DIR}
	@@echo "Building ${MODULES_DIST}"
	@@cat ${MODULES_SRC} > ${MODULES_DIST}

wrappers: setup ${WRAPPERS_DIST}

${WRAPPERS_MIN}: ${WRAPPERS_DIST}
	@@echo "Building ${WRAPPERS_MIN}"
	@@$(call compile, $(shell for js in ${WRAPPERS_SRC} ; do echo --js $$js ; done), ${WRAPPERS_MIN})

${WRAPPERS_DIST}: ${WRAPPERS_SRC) ${DIST_DIR}
	@@echo "Building ${WRAPPERS_DIST}"
	@@cat ${WRAPPERS_SRC} > ${WRAPPERS_DIST}

plugins: ${PLUGINS_DIST}

${PLUGINS_MIN}: ${PLUGINS_DIST}
	@@echo "Building" ${PLUGINS_MIN}
	@@$(call compile, $(shell for js in ${PLUGINS_SRC} ; do echo --js $$js ; done), ${PLUGINS_MIN})

${PLUGINS_DIST}: ${PLUGINS_SRC} ${DIST_DIR}
	@@echo "Building ${PLUGINS_DIST}"
	@@cat ${PLUGINS_SRC} > ${PLUGINS_DIST}

parsers: ${PARSERS_DIST}

${PARSERS_MIN}: ${PARSERS_DIST}
	@@echo "Building" ${PARSERS_MIN}
	@@$(call compile, $(shell for js in ${PARSERS_SRC} ; do echo --js $$js ; done), ${PARSERS_MIN})

${PARSERS_DIST}: ${PARSERS_SRC} ${DIST_DIR}
	@@echo "Building ${PARSERS_DIST}"
	@@cat ${PARSERS_SRC} > ${PARSERS_DIST}

players: ${PLAYERS_DIST}

${PLAYERS_MIN}: ${PLAYERS_DIST}
	@@echo "Building" ${PLAYERS_MIN}
	@@$(call compile, $(shell for js in ${PLAYERS_SRC} ; do echo --js $$js ; done), ${PLAYERS_MIN})

${PLAYERS_DIST}: ${PLAYERS_SRC} ${DIST_DIR}
	@@echo "Building ${PLAYERS_DIST}"
	@@cat ${PLAYERS_SRC} > ${PLAYERS_DIST}

effects: $(EFFECTS_DIST)

$(EFFECTS_MIN): $(EFFECTS_DIST)
	@@echo "Building" $(EFFECTS_MIN)
	@@$(call compile, $(shell for js in $(EFFECTS_SRC) ; do echo --js $$js ; done), $(EFFECTS_MIN))

$(EFFECTS_DIST): $(EFFECTS_SRC) $(DIST_DIR)
	@@echo "Building $(EFFECTS_DIST)"
	@@cat $(EFFECTS_SRC) > $(EFFECTS_DIST)

complete: setup ${POPCORN_SRC} ${MODULES_SRC} ${WRAPPERS_SRC} ${PARSERS_SRC} ${PLUGINS_SRC} ${PLAYERS_SRC} $(EFFECTS_SRC) ${DIST_DIR}
	@@echo "Building popcorn + modules + wrappers + plugins + parsers + players + effects..."
	@@cat ${POPCORN_SRC} ${MODULES_SRC} ${WRAPPERS_SRC} ${PLUGINS_SRC} ${PARSERS_SRC} ${PLAYERS_SRC} $(EFFECTS_SRC) > $(POPCORN_COMPLETE_DIST)
	@@$(call add_license, $(POPCORN_COMPLETE_DIST))
	@@$(call add_version, $(POPCORN_COMPLETE_DIST))

ie8: $(POPCORN_IE8_MIN)

$(POPCORN_IE8_MIN): $(POPCORN_IE8_DIST)
	@@echo "Building" $(POPCORN_IE8_MIN)
	@@$(call compile, --js $(POPCORN_IE8_DIST), $(POPCORN_IE8_MIN))
	@@$(call add_license, $(POPCORN_IE8_MIN))
	@@$(call add_version, $(POPCORN_IE8_MIN))

$(POPCORN_IE8_DIST): $(POPCORN_IE8_FILES) $(DIST_DIR)
	@@echo "Building $(POPCORN_IE8_DIST)"
	@@cat $(POPCORN_IE8_FILES) > $(POPCORN_IE8_DIST)
	@@$(call add_license, $(POPCORN_IE8_DIST))
	@@$(call add_version, $(POPCORN_IE8_DIST))

lint:
	@@echo "Checking Popcorn against JSLint..."
	@@$(call run_lint,popcorn.js)

lint-core-tests:
	@@echo "Checking core unit tests against JSLint..."
	@@$(call run_lint,test/popcorn.unit.js)

lint-modules:
	@@echo "Checking all modules against JSLint..."
	@@$(call run_lint,$(MODULES_SRC))

lint-wrappers:
	@@echo "Checking all wrappers against JSLint..."
	@@$(call run_lint,$(WRAPPERS_SRC))

lint-plugins:
	@@echo "Checking all plugins against JSLint..."
	@@$(call run_lint,$(PLUGINS_SRC))

lint-parsers:
	@@echo "Checking all parsers against JSLint..."
	@@$(call run_lint,$(PARSERS_SRC))

lint-players:
	@@echo "Checking all players against JSLint..."
	@@$(call run_lint,$(PLAYERS_SRC))

lint-effects:
	@@echo "Checking all effects against JSLint..."
	@@$(call run_lint,$(EFFECTS_SRC))

lint-modules-tests:
	@@echo "Checking modules unit tests against JSLint..."
	@@$(call run_lint,$(MODULES_UNIT))

lint-wrappers-tests:
	@@echo "Checking wrappers unit tests against JSLint..."
	@@$(call run_lint,$(WRAPPERS_UNIT))

lint-plugin-tests:
	@@echo "Checking plugin unit tests against JSLint..."
	@@$(call run_lint,$(PLUGINS_UNIT))

lint-parser-tests:
	@@echo "Checking parser unit tests against JSLint..."
	@@$(call run_lint,$(PARSERS_UNIT))

lint-effects-tests:
	@@echo "Checking effectsr unit tests against JSLint..."
	@@$(call run_lint,$(EFFECTS_UNIT))

lint-player-tests:
	@@echo "Checking player unit tests against JSLint..."
	@@$(call run_lint,$(PLAYERS_UNIT))

lint-unit-tests: lint-modules-tests lint-wrappers-tests lint-plugin-tests lint-parser-tests lint-player-tests lint-effects-tests
	@@echo "completed"

# Create a mirror copy of the tree in dist/ using popcorn-complete.js
# in place of popcorn.js.
TESTING_MIRROR := ${DIST_DIR}/testing-mirror

# Prefer plugin code in popcorn-complete.js but don't overrwrite *unit.js files
overwrite_js = @@for js in $$(find ${1} \( -name "*.js" -a \! -name "*.unit.js" \)) ; \
                 do echo '/* Stub, see popcorn.js instead */' > $$js ; \
                 done

testing: complete
	@@echo "Building testing-mirror in ${TESTING_MIRROR}"
	@@mkdir -p ${TESTING_MIRROR}
	@@find ${PREFIX} \( -name '.git' -o -name 'dist' \) -prune -o -print | cpio -pd --quiet ${TESTING_MIRROR}
# Remove unneeded files for testing, so it's clear this isn't the tree
	@@rm -fr ${TESTING_MIRROR}/AUTHORS ${TESTING_MIRROR}/LICENSE ${TESTING_MIRROR}/LICENSE_HEADER \
           ${TESTING_MIRROR}/Makefile ${TESTING_MIRROR}/readme.md
	@@touch "${TESTING_MIRROR}/THIS IS A TESTING MIRROR -- READ-ONLY"
	$(call overwrite_js, ${TESTING_MIRROR}/modules)
	$(call overwrite_js, ${TESTING_MIRROR}/plugins)
	$(call overwrite_js, ${TESTING_MIRROR}/players)
	$(call overwrite_js, ${TESTING_MIRROR}/parsers)
	$(call overwrite_js, ${TESTING_MIRROR}/effects)
	@@cp ${POPCORN_COMPLETE_DIST} ${TESTING_MIRROR}/popcorn.js

clean:
	@@echo "Removing Distribution directory:" ${DIST_DIR}
	@@rm -rf ${DIST_DIR}

setup:
	@@echo "Updating submodules..."
	@@git submodule update --init
