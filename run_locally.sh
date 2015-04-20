#!/bin/bash

vagrant up
vagrant ssh -c 'export PORT=5000; export DEBUG=True; python /vagrant/manager.py runserver'
