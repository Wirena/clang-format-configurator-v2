#!/bin/bash

IMAGE_NAME="cfc-debug-image"
CONTAINER_NAME="cfc-debug-cont"
DOCKERFILE_PATH="debug.Dockerfile"

function build() {
    docker build -f ${DOCKERFILE_PATH} . --tag ${IMAGE_NAME}
    return $?
}

function run() {
    docker run -d -p2345:2345 -p8080:8080 --rm --name ${CONTAINER_NAME} ${IMAGE_NAME}
    return $?
}

function stop() {
    docker stop ${CONTAINER_NAME}
    return $?
}

function all() {
    build && run || echo "Something went wrong"
}

WAIT_TIME=40

if [[ "$1" = "--build" || "$1" = "-b" ]]; then
    build
elif [[ "$1" = "--run" || "$1" = "-r" ]]; then
    run
elif [[ "$1" = "--stop" || "$1" = "-s" ]]; then
    stop
elif [[ "$1" = "--all" || "$1" = "-a" ]]; then
    all
else
    echo "Use --wait N as the last arg to give debugger N seconds to start before VS Code will try to attach(${WAIT_TIME} by default)"
    echo "-b --build: build debug image"
    echo "-r --run:   run new debug container, stop one beforehand if it's already running"
    echo "-a --all:   do all of listed above"
    echo "-s --stop:  stop debug container"
    return 0
fi

if [[ $2 = "--wait" ]]; then
    if [[ -n "$3" ]]; then
        WAIT_TIME=$3
    fi
    sleep ${WAIT_TIME}
fi
