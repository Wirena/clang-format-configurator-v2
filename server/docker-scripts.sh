#!/bin/bash

IMAGE_NAME="clang-format-configurator-debug-image"
CONTAINER_NAME="cfc-debug-cont"
DOCKERFILE_PATH="debug.Dockerfile"

function build-debug() {
    docker build -f ${DOCKERFILE_PATH} . --tag ${IMAGE_NAME}
    return $?
}

function run-debug() {
    docker run -d -p2345:2345 -p8080:8080 --rm --name ${CONTAINER_NAME} ${IMAGE_NAME}
    return $?
}

function all() {
    build-debug && run-debug || echo "Something went wrong"

}

if [[ "$1" = "--build-debug" ]]; then
    build-debug
elif [[ "$1" = "--run-debug" ]]; then
    run-debug
elif [[ "$1" = "--all" ]]; then
    all
fi
