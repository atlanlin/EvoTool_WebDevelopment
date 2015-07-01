import socket

#The IP address of the EyeVision system
UDP_IP = '127.0.0.1'

#Standard PConlan udp port
UDP_PORT = 5952

#PConLan command
#021;<CmdName>;<ParType>;<ParName>;<Value>#
CmdName = 'EVO BarCode'
ParType = '2' # 0 = String, 1 = Double, 2 = Long
ParName = 'General.Enabled'
Value = 0
cmd = '#021;' + CmdName + ';' + ParType + ';' + ParName + ';' + str(Value) + '#'

#Open socket
sock = socket.socket(socket.AF_INET,socket.SOCK_DGRAM)

#Sends the command
sock.sendto(cmd, (UDP_IP, UDP_PORT))
print 'command send to the EyeVision system : ' + cmd

sock.settimeout(5) # 5 sec

#Read the response on the socket
resp, addr = sock.recvfrom(64) # max 64 byte
print addr,resp
