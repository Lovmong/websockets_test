# #!/usr/bin/env python

# import asyncio
# from websockets.sync.client import connect
# import websockets

# def hello():
#     with connect("ws://192.168.137.144:30102") as websocket:
#         websocket.send("Hello world!")
#         message = websocket.recv()
#         print(f"Received: {message}")

# # hello()


# client = websockets.create_connection('ws://192.168.137.144:30102')

# while True:
#     message = client.recv()
#     print(f"Received: {message}")

import websocket
import _thread
import time
import rel

def on_message(ws, message):
    print(message)

def on_error(ws, error):
    print(error)

def on_close(ws, close_status_code, close_msg):
    print("### closed ###")

def on_open(ws):
    print("Opened connection")

if __name__ == "__main__":
    websocket.enableTrace(True)
    ws = websocket.WebSocketApp('ws://192.168.137.244:30102',
                              on_open=on_open,
                              on_message=on_message,
                              on_error=on_error,
                              on_close=on_close)

    ws.run_forever(dispatcher=rel, reconnect=5, skip_utf8_validation=True)  # Set dispatcher to automatic reconnection, 5 second reconnect delay if connection closed unexpectedly
    rel.signal(2, rel.abort)  # Keyboard Interrupt
    rel.dispatch()