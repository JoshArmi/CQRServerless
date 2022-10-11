unittest:
	npm run unit-test

test:
	npm test

build:
	sam build

deploy: build
	sam deploy --no-fail-on-empty-changeset
