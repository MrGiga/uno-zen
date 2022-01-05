#!/bin/bash
cd /var/lib/ghost
npm install && gosu node bower install  && npm install gulp@4.0.2 && gulp watch