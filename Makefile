.PHONY: all
all: test

.PHONY: test
test: node_modules
	npm test

.PHONY: start
start: build
	npm start

build: clean node_modules
	node_modules/.bin/babel -d build wafflebot --no-comments
	cp wafflebot/*.json build/

node_modules:
	npm install

coverage: clean node_modules
	npm run coverage
	cat ./coverage/lcov.info | ./node_modules/coveralls/bin/coveralls.js

.PHONY: eslint
eslint:
	node_modules/.bin/eslint .

.PHONY: clean
clean:
	rm -rf build