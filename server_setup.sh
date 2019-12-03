#!/bin/bash

if [[ $EUID -ne 0 ]]; then
   echo "This script must be run as root" 
   exit 1
fi

apt update;
#apt dist-upgrade -y;
apt install nodejs -y;
apt install mongodb -y;
apt install apache2 -y;
apt install mysql-server -y;
systemctl enable mongodb;
systemctl start mongodb;
apt install nginx -y;
ufw allow 'Nginx Full';
cd Twitter_Clone/Back_End;
apt-get install postfix -y; # for mailing verification services 
apt install redis-server -y; # cuz it is better than memecache, rememebr to edit the port in /etc/redis.conf from bind 127.0.0.1 to 0.0.0.0 to allow connections from outside the localhost
nano /etc/redis/redis.conf;
ufw allow 6379/tcp;
setsebool -P httpd_can_network_connect 1; # do this on red hat, centos, and fedora
mv ./twitter_clone_balancer.conf /etc/nginx/sites-available/default;
nginx -s reload;
systemctl reload nginx;
mv ./mongod.conf /etc/mongod.conf
iptables -A INPUT -p tcp --dport 27017 -j ACCEPT;
iptables -A INPUT -p tcp --dport 27019 -j ACCEPT;
iptables -A INPUT -p tcp --dport 3000 -j ACCEPT;
iptables -A INPUT -p tcp --dport 3001 -j ACCEPT;
iptables -A INPUT -p tcp --dport 3002 -j ACCEPT;
iptables -A INPUT -p tcp --dport 3003 -j ACCEPT;
systemctl restart mongodb;
# paste in this line fater the data base is created:
# use Twitter_Clone
# db.items.createIndex({content: "text"});
mongo;

