.PHONY: all
all: test

.PHONY: test
test: node_modules
	npm test

build: node_modules clean
	node_modules/.bin/babel -d build wafflebot --no-comments
	cp wafflebot/*.json build/

node_modules:
	npm install

.PHONY: eslint
eslint:
	node_modules/.bin/eslint .

.PHONY: clean
clean:
	rm -rf build