import socket

#The IP address of the EyeVision system
UDP_IP = '127.0.0.1'

#Standard PConlan udp port
UDP_PORT = 5952

#PConLan command
cmd = '#002#' # start
#cmd = '#003#' # stop
#cmd = '#004#' # stop immediately

#Open socket
sock = socket.socket(socket.AF_INET,socket.SOCK_DGRAM)

#Sends the command
sock.sendto(cmd, (UDP_IP, UDP_PORT))
print 'command send to the EyeVision system : ' + cmd

sock.settimeout(5) # 5 sec

#Read the response on the socket
resp, addr = sock.recvfrom(64) # max 64 byte
print addr,resp
