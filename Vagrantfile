# -*- mode: ruby -*-
# vi: set ft=ruby :

VAGRANTFILE_API_VERSION = "2"

$provision = <<SCRIPT
#!/usr/bin/env bash
set -eu

apt-get update
apt-get install -y -q python-dev python-pip mongodb-server

# memmove hack
# https://bugs.launchpad.net/ubuntu/+source/python2.7/+bug/1238244
echo '#define HAVE_MEMMOVE 1' >>/usr/include/python2.7/pyconfig.h

cd /vagrant
pip install -r requirements.txt
SCRIPT

Vagrant.configure(VAGRANTFILE_API_VERSION) do |config|
  config.vm.box = "ubuntu/trusty64"
  config.vm.hostname = "apidev"
  config.ssh.forward_agent = true
  config.vm.network "forwarded_port", guest: 5000, host: 5000
  config.vm.provision "shell", inline: $provision
  config.vm.provider "virtualbox" do |vb|
    vb.customize ["modifyvm", :id, "--memory", "1024"]
  end
end
