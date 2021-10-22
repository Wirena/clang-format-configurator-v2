build:
	go build -v ./cmd/clang-format-server/

set-debug:
	copy debug.Dockerfile Dockerfile

set-release:
	copy release.Dockerfile Dockerfile

clean:
	-rm ./clang-format-server Dockerfile


run:
	docker-compose up

.DEFAULT_GOAL := debug