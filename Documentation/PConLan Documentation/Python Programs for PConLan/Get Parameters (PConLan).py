import socket

#The IP address of the EyeVision system
UDP_IP = '127.0.0.1'

#Standard PConlan udp port
UDP_PORT = 5952

#The IP of the interface to listen for packets, empty address listens on all
UDP_IP_RECV = ''

#Standard port for extended response
UDP_PORT_RECV = 4558

#PConLan command
#023;<CmdName>;<ParType>;<ParName>#
CmdName = 'EVO BarCode'
ParType = '2' # 0 = String, 1 = Double, 2 = Long
ParName = 'General.Enabled'
cmd = '#023;' + CmdName + ';' + ParType + ';' + ParName + '#'

#Open socket to send command
sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
sock.settimeout(5) # 5 sec

#Open socket to receive extended response
listenSock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)

#Make it listen for packets from the defined IP
listenSock.bind((UDP_IP_RECV, UDP_PORT_RECV))
listenSock.settimeout(5) # 5 sec

#Sends the command
sock.sendto(cmd, (UDP_IP, UDP_PORT))
print 'command send to the EyeVision system : ',cmd

#Read the response on the socket
try:
    resp, addr = sock.recvfrom(64) # max 64 byte
    print 'response : ',addr,resp
except socket.timeout:
    print 'sock timed out'

#Read the extended response on the additional socket
try:
    resp, addr = listenSock.recvfrom(1024)
    print 'response : ', addr,resp
except socket.timeout:
    print 'listenSock timed out'
