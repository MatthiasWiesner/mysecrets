# -*- mode: ruby -*-
# vi: set ft=ruby :

VAGRANTFILE_API_VERSION = "2"

$provision = <<SCRIPT
#!/usr/bin/env bash
set -eu

apt-get update
apt-get install -y -q python-dev \
                      python-pip \
                      mongodb-server \
                      npm \
                      nodejs-legacy \
                      git
npm install -g bower
npm install -g grunt-cli

cd /vagrant
# load javascript/css dependencies
bower install --allow-root --config.interactive=false
npm install
grunt

# load python dependencies
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
