# Make sure $JSSHELL points to your js shell binary in .profile or .bashrc
TOOLSDIR=./tools

check: check-lint

check-lint:
	${TOOLSDIR}/jslint.py ${JSSHELL} popcorn.js

# Most targets use commands that need a js shell path specified
JSSHELL ?= $(error Specify a valid path to a js shell binary in ~/.profile: export JSSHELL=C:\path\js.exe or /path/js)

