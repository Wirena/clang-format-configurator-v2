#!/bin/bash

EXECSTART="$(pwd)/clang-format-configurator"
WORKINGDIR=$(pwd)
USER=""
SERVICEFILE="clang-format-configurator.service"

echo "Configure systemd service file"

echo "Enter ExecStart command or leave it blank to set the default value: ${EXECSTART}"

read EXECSTART_INPUT

if [ "" != "${EXECSTART_INPUT}" ]; then
    EXECSTART="${EXECSTART_INPUT}"
fi

echo "Enter WorkingDirectory value or leave it blank to set the default value: ${WORKINGDIR}"

read WORKINGDIR_INPUT

if [ "" != "${WORKINGDIR_INPUT}" ]; then
    WORKINGDIR="${WORKINGDIR_INPUT}"
fi

echo "Enter User name: ${USER}"

read USER

if [ "" == "${USER}" ]; then
    echo "Empty username entered\nAbort"
    exit 1
fi

echo "[Unit]
Description=Clang Format Configurator Server

[Service]
Type=simple
ExecStart=${EXECSTART}
Restart=always
WorkingDirectory=${WORKINGDIR}
User=${USER}

[Install]
WantedBy=multi-user.target" > ${SERVICEFILE}

echo -e "\nDone\n"

cat ${SERVICEFILE}
