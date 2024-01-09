FROM debian:bookworm-slim

WORKDIR /workdir

RUN apt update && apt upgrade -y \
    && apt install -y cmake \
    gcc g++ ninja-build git python3 python3-pip

COPY ./requirements.txt ./requirements.txt
RUN mv /usr/lib/python3.11/EXTERNALLY-MANAGED /usr/lib/python3.11/EXTERNALLY-MANAGED.old
RUN pip3 install -r requirements.txt

COPY ./prepare.sh ./prepare.sh
COPY ./build-config.py ./build-config.py
