"""
commande : sudo pigpiod
"""

import pigpio
import DHT22
import sys
from time import sleep

pi = pigpio.pi()
dht22 = DHT22.sensor(pi,22)
dht22.trigger()

def readDHT22() :
    dht22.trigger()
    humidity = '%.2f' % (dht22.humidity())
    temp = '%.2f' % (dht22.temperature())
    return (humidity , temp)

humidity , temperature = readDHT22()
while float(humidity) < 0:
    humidity , temperature = readDHT22()
    sleep(3)

result = humidity + "S" + temperature
print(result)
sys.stdout.flush()


