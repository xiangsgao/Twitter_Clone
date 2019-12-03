#!/bin/bash

npm install;
cd Back_End;
node ./bin/www 3000 &
node ./bin/www 3001 &
node ./bin/www 3002 &