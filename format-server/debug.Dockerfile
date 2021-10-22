FROM golang:1.16
WORKDIR /go/src/github.com/Wirena/clang-format-configurator-v2
EXPOSE 8080 2345
RUN go install github.com/go-delve/delve/cmd/dlv@v1.7.2
ADD . /go/src/github.com/Wirena/clang-format-configurator-v2

CMD ["dlv", "debug", "./cmd/clang-format-server/", "--headless", "--listen=:2345", "--api-version=2", "--log"]