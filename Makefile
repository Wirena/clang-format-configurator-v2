build-server:
	go build -v format-server/cmd/clang-format-server/

set-debug:
	cp -f format-server/debug.Dockerfile format-server/Dockerfile

set-release:
	cp -f format-server/release.Dockerfile format-server/Dockerfile

clean:
	-rm format-server/clang-format-server Dockerfile
