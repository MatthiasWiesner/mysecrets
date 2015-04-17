#!/bin/bash

vagrant up
vagrant ssh -c 'export PORT=5000; python /vagrant/manager.py runserver'
