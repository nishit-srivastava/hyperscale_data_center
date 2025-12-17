
Raspberry Pi Ip 192.168.29.64

Server ip 


Rack A Telmetry 
access token dbgh5l4z14nfwelfd70z

Rack B

token anjutlm67oiegbxbk0h1

Rack C

token svngr613xtq8072xa97i

Rack D

token d3badznaypit2z7xqg4x

sudo apt update
sudo apt install -y mosquitto-clients


netsh advfirewall firewall add rule name="Allow ICMPv4 Inbound" dir=in action=allow protocol=icmpv4
netsh advfirewall firewall add rule name="Allow MQTT 1883" dir=in action=allow protocol=TCP localport=1883
netsh advfirewall firewall add rule name="Allow ThingsBoard HTTP" dir=in action=allow protocol=TCP localport=8080
netsh advfirewall firewall add rule name="Allow Docker Ports" dir=in action=allow protocol=TCP localport=1883,8080,8883


port forwarding

netsh interface portproxy add v4tov4 `
listenaddress=0.0.0.0 listenport=8080 `
connectaddress=172.23.106.87 connectport=9090


netsh interface portproxy add v4tov4 `
listenaddress=0.0.0.0 listenport=1883 `
connectaddress=172.23.106.87 connectport=1883

test
mosquitto_pub -d -h 192.168.29.21 -p 1883 -t v1/devices/me/telemetry -u "dbgh5l4z14nfwelfd70z" -m '{"alive":true}'
