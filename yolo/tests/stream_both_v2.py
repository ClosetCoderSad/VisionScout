"""
Connect to both Voxel devices, ensure WiFi connection, start streams, and display them.

This script:
1. Connects to devices (serial first, then BLE)
2. Ensures both are on WiFi
3. Starts MJPG streams on ports 9000 and 9001
4. Shows both streams side by side
5. Press 'q' to quit

Usage:
    python3 stream_both.py --ssid YOUR_SSID --password YOUR_PASS
"""

import sys
import os
import time
import threading
import cv2
import numpy as np
import argparse
from typing import List, Optional, Tuple
from urllib.request import urlopen
import socket

from voxel_sdk import DeviceController
from stream_utils import (
    connect_devices,
    setup_wifi,
    start_device_stream,
    cleanup_devices
)

# Configuration
STREAM_PORTS = [9000, 9001]  # Ports for serial and BLE devices
WINDOW_WIDTH = 640  # Target width for each stream window
WINDOW_HEIGHT = 480  # Target height for each stream window

class StreamReceiver(threading.Thread):
    """Thread class for receiving and displaying MJPG stream."""
    
    def __init__(self, port: int, device_num: int):
        super().__init__()
        self.port = port
        self.device_num = device_num
        self.stream_url = f'http://localhost:{port}'
        self.frame = None
        self.running = True
        self.connected = False
        self.lock = threading.Lock()
    
    def get_frame(self) -> Optional[np.ndarray]:
        """Get the latest frame (thread-safe)."""
        with self.lock:
            return self.frame.copy() if self.frame is not None else None
    
    def stop(self):
        """Stop the receiver thread."""
        self.running = False
    
    def run(self):
        """Main thread loop - receives and stores frames."""
        retries = 0
        max_retries = 5
        
        while self.running and retries < max_retries:
            try:
                # Try to connect to stream
                print(f"\nConnecting to stream #{self.device_num+1} on port {self.port}...")
                stream = urlopen(self.stream_url)
                self.connected = True
                print(f"Connected to stream #{self.device_num+1}")
                
                # Read stream
                bytes_data = b''
                while self.running:
                    bytes_data += stream.read(1024)
                    a = bytes_data.find(b'\xff\xd8')  # JPEG start
                    b = bytes_data.find(b'\xff\xd9')  # JPEG end
                    if a != -1 and b != -1:
                        jpg = bytes_data[a:b+2]
                        bytes_data = bytes_data[b+2:]
                        # Decode and store frame (thread-safe)
                        img = cv2.imdecode(np.frombuffer(jpg, dtype=np.uint8), cv2.IMREAD_COLOR)
                        with self.lock:
                            self.frame = img
                
            except Exception as e:
                print(f"Stream #{self.device_num+1} error: {e}")
                retries += 1
                if retries < max_retries:
                    print(f"Retrying... ({retries}/{max_retries})")
                    time.sleep(2)  # Wait before retry
                else:
                    print(f"Failed to connect to stream #{self.device_num+1} after {max_retries} attempts")
                    break

def main(args):
    """Main entry point for the streaming script."""
    if not args.ssid or not args.password:
        print("Error: WiFi SSID and password are required")
        return
        
    print("\nConnecting to devices...")
    controllers = connect_devices()
    if not controllers or len(controllers) != 2:
        print("Failed to connect required devices")
        return
        
    try:
        # Connect to WiFi
        print("\nSetting up WiFi...")
        if not setup_wifi(controllers, args.ssid, args.password):
            print("Failed to connect devices to WiFi")
            cleanup_devices(controllers)
            return
            
        # Start streams
        print("\nStarting streams...")
        for i, ctrl in enumerate(controllers):
            if not start_device_stream(ctrl, STREAM_PORTS[i], i):
                print("Failed to start streams")
                cleanup_devices(controllers)
                return
        
        # Create stream receivers
        receivers = [
            StreamReceiver(STREAM_PORTS[0], 0),
            StreamReceiver(STREAM_PORTS[1], 1)
        ]
        
        # Start receivers
        for recv in receivers:
            recv.start()
            
        # Wait for streams to initialize
        print("\nWaiting for streams to connect...")
        time.sleep(2)
        
        # Display loop
        print("\nStarting display... Press 'q' to quit")
        cv2.namedWindow('Voxel Streams', cv2.WINDOW_NORMAL)
        
        while True:
            # Get frames from both streams
            frames = [recv.get_frame() for recv in receivers]
            if not any(frames):  # If no frames available yet
                time.sleep(0.1)
                continue
                
            # Create display image
            display_frames = []
            for i, frame in enumerate(frames):
                if frame is not None:
                    # Resize frame to target size
                    resized = cv2.resize(frame, (WINDOW_WIDTH, WINDOW_HEIGHT))
                    # Add device label
                    label = f"Device #{i+1}"
                    cv2.putText(resized, label, (10, 30), 
                              cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
                else:
                    # Create blank frame if stream not available
                    blank = np.zeros((WINDOW_HEIGHT, WINDOW_WIDTH, 3), np.uint8)
                    label = f"Device #{i+1} - No Signal"
                    cv2.putText(blank, label, (10, 30),
                              cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)
                    resized = blank
                display_frames.append(resized)
            
            # Combine frames side by side
            display = np.hstack(display_frames)
            cv2.imshow('Voxel Streams', display)
            
            # Check for quit
            if cv2.waitKey(1) & 0xFF == ord('q'):
                break
        
    except KeyboardInterrupt:
        print("\nInterrupted by user")
    except Exception as e:
        print(f"\nError during streaming: {e}")
    finally:
        # Cleanup
        print("\nCleaning up...")
        for recv in receivers:
            recv.stop()
        for recv in receivers:
            recv.join()
        cleanup_devices(controllers)
        cv2.destroyAllWindows()

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Stream from two Voxel devices')
    parser.add_argument('--ssid', type=str, help='WiFi SSID')
    parser.add_argument('--password', type=str, help='WiFi password')
    args = parser.parse_args()
    main(args)