all: test

venv: Makefile requirements-dev.txt
	rm -rf venv
	virtualenv venv --python=python3
	venv/bin/pip install -r requirements-dev.txt
	venv/bin/pre-commit install -f --install-hooks

.PHONY: test
test: venv build
	# Run unit tests + coverage
	npm test
	# Run pre-commit hooks
	venv/bin/pre-commit run --all-files

start: dist
	npm start

build: node_modules
	./node_modules/.bin/babel -d dist src --no-comments
	cp src/*.json dist/

node_modules:
	npm install

coveralls: coverage node_modules
	cat ./coverage/lcov.info | ./node_modules/coveralls/bin/coveralls.js

.PHONY: jsdoc
jsdoc: node_modules
	./node_modules/.bin/jsdoc LentilDI/lib/lentil.js -c .jsdoc.json -r -d jsdoc

eslint: node_modules
	node_modules/.bin/eslint .

eslint-fix: node_modules
	node_modules/.bin/eslint --fix .

clean:
	rm -rf dist
	rm -rf coverage
	rm -rf .nyc_output
	rm -rf jsdoc
	rm -rf node_modules
	rm -rf venv