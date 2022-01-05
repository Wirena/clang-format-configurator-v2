
build-server:
	cd server && go build -o ./bin/clang-format-configurator -v ./cmd/clang-format-configurator/


clean-llvm:
	cd llvm && ./llvm-stuff.sh clean

get-docs:
	cd llvm && ./llvm-stuff.sh docs

parse-docs: get-docs
	cd llvm && ./parse-docs.py

clean: clean-llvm
	-rm format-server/clang-format-server Dockerfile


run-debug: build-server
	docker-compose up -f docker-compose-debug.yml