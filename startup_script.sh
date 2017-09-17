#!/usr/bin/env bash

curl -sL https://rpm.nodesource.com/setup_8.x | bash -
yum update -y
yum install -y memcached git nodejs

systemctl enable memcached
systemctl start memcached

cd /opt
git clone https://github.com/mdavis6890/autocomplete2.git

cd /opt/autocomplete2
npm install

cd /tmp
cat <<EOF > node.service
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

mv node.service /etc/systemd/system/
systemctl enable node
systemctl start node
