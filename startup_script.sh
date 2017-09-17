#!/usr/bin/env bash

sudo yum update -y
sudo yum install memcached
sudo systemctl enable memcached
sudo systemctl enable memcached
sudo systemctl start memcached

sudo yum install git
sudo curl -sL https://rpm.nodesource.com/setup_8.x | bash -
sudo yum install -y nodejs

cd /opt
sudo git clone https://github.com/mdavis6890/autocomplete2.git

cd /opt/autocomplete2
npm install

cat <<EOF > print.sh
[Unit]
Description=Node.js Example Server
#Requires=After=mysql.service       # Requires the mysql service to run first

[Service]
ExecStart=/bin/node /opt/autocomplete2/app.js
# Required on some systems
#WorkingDirectory=/opt/nodeserver
Restart=always
 # Restart service after 10 seconds if node service crashes
 RestartSec=10
 # Output to syslog
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=nodejs-example
#User=<alternate user>
#Group=<alternate group>
Environment=NODE_ENV=production PORT=80

[Install]
WantedBy=multi-user.target
EOF