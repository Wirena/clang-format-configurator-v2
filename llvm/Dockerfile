FROM debian:bullseye-slim

WORKDIR /workdir
COPY ./requirements.txt ./requirements.txt
RUN apt update && apt upgrade -y \
    && apt install -y cmake \
    gcc g++ ninja-build git python3 python3-pip \
    && pip3 install -r requirements.txt

COPY ./prepare.sh ./prepare.sh
COPY ./build-config.py ./build-config.py