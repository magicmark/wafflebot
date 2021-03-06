export DOCKER_TAG ?= wafflebot-$(USER)

all: test

.PHONY: docker-build
docker-build:
	docker build -t $(DOCKER_TAG) .

.PHONY: docker-run
docker-run: docker-build
	docker run -it --rm --name $(DOCKER_TAG) \
		-v "$(HOME)/.wafflebot":/root/.wafflebot \
		$(DOCKER_TAG)

venv: Makefile requirements-dev.txt
	rm -rf venv
	virtualenv venv --python=python3
	venv/bin/pip install -r requirements-dev.txt
	venv/bin/pre-commit install -f --install-hooks

.PHONY: test
test: venv dist
	# Run unit tests + coverage
	npm test
	# Run pre-commit hooks
	venv/bin/pre-commit run --all-files

start: dist
	npm start

dist: node_modules
	./node_modules/.bin/babel -d dist src --no-comments
	cp src/*.json dist/

node_modules:
	npm install

coveralls: test
	cat ./coverage/lcov.info | ./node_modules/coveralls/bin/coveralls.js

.PHONY: jsdoc
jsdoc: node_modules
	./node_modules/.bin/jsdoc LentilDI/lib/lentil.js -c .jsdoc.json -r -d jsdoc

eslint: node_modules
	node_modules/.bin/eslint .

eslint-fix: node_modules
	node_modules/.bin/eslint --fix .

clean:
	rm -rf .nyc_output
	rm -rf coverage
	rm -rf dist
	rm -rf jsdoc
	rm -rf node_env-default
	rm -rf node_modules
	rm -rf venv
