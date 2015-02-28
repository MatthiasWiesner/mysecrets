#!/usr/bin/env bash

set -eu

apt-get update
apt-get install -y -q python-dev python-pip mongodb-server

# memmove hack :(
# https://bugs.launchpad.net/ubuntu/+source/python2.7/+bug/1238244
echo '#define HAVE_MEMMOVE 1' >>/usr/include/python2.7/pyconfig.h

cd /vagrant
pip install -r requirements.txt