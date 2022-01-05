FROM golang:1.17.2-bullseye
WORKDIR /go/src/github.com/Wirena/clang-format-configurator-v2
EXPOSE 8080 2345

ADD llvm-10/bin/clang-format llvm-10/bin/clang-format

RUN mv ./llvm-10/bin/clang-format ./llvm-10//bin/clang-format-10 && \
export PATH=$PATH:/go/src/github.com/Wirena/clang-format-configurator-v2/llvm-10/bin/

RUN echo "deb http://deb.debian.org/debian sid main" >> /etc/apt/sources.list \
&& echo "deb http://deb.debian.org/debian buster-backports main" >> /etc/apt/sources.list \
&& echo "deb http://deb.debian.org/debian buster main" >> /etc/apt/sources.list \
&& echo "deb http://deb.debian.org/debian stretch-backports main" >> /etc/apt/sources.list \
&& echo "deb http://deb.debian.org/debian stretch main" >> /etc/apt/sources.list \
&& apt update
RUN apt -y install clang-format-13 clang-format-12 clang-format-11 clang-format-9 clang-format-8 libtinfo5

RUN go install github.com/go-delve/delve/cmd/dlv@v1.7.2

COPY . .

CMD ["dlv", "debug", "./cmd/clang-format-configurator/", "--headless", "--listen=:2345", "--api-version=2", "--log"]