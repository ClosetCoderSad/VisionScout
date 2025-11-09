"""
Connect to both Voxel devices, ensure WiFi connection, start streams, and display them.

This script:
1. Connects to devices (serial first, then BLE)
2. Ensures both are on WiFi
3. Starts MJPG streams on ports 9000 and 9001
4. Shows both streams side by side
5. Press 'q' to quit

Usage:
    python3 yolo/tests/stream_both_init.py --ssid YOUR_SSID --password YOUR_PASS
"""

import sys
import os
import time
import threading
import cv2
import numpy as np
import socket
import struct
import argparse
from typing import Optional, Dict, Tuple, List

# Add parent dir to path so we can import voxel_sdk
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from voxel_sdk.serial import SerialVoxelTransport
from voxel_sdk.ble import BleVoxelTransport
from voxel_sdk.device_controller import DeviceController

# Device settings
SERIAL_PORT = '/dev/cu.usbmodem101'
BLE_NAME = 'voxel'

# Stream settings
STREAM_PORTS = [9000, 9001]  # Left and right stream ports
WINDOW_NAME = "Voxel Streams"
FRAME_WIDTH = 640  # Each stream
FRAME_HEIGHT = 480

class StreamReceiver:
    """Handles receiving and decoding frames from one MJPG stream."""
    
    def __init__(self, port: int):
        self.port = port
        self.latest_frame: Optional[np.ndarray] = None
        self.latest_timestamp = 0.0
        self.running = False
        self.connected = False
        self._lock = threading.Lock()
    
    def _recv_exact(self, sock: socket.socket, length: int) -> Optional[bytes]:
        """Read exactly length bytes or return None if connection closed."""
        chunks = []
        remaining = length
        while remaining > 0:
            chunk = sock.recv(remaining)
            if not chunk:
                return None
            chunks.append(chunk)
            remaining -= len(chunk)
        return b"".join(chunks)

    def get_frame(self) -> Tuple[Optional[np.ndarray], float]:
        """Get the latest frame and its timestamp. Thread-safe."""
        with self._lock:
            return self.latest_frame, self.latest_timestamp

    def _update_frame(self, frame: Optional[np.ndarray]):
        """Update the latest frame. Thread-safe."""
        with self._lock:
            self.latest_frame = frame
            self.latest_timestamp = time.time()

    def receive_frames(self):
        """Main receive loop - runs in its own thread."""
        while self.running:
            try:
                # Try to connect/reconnect
                sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
                sock.settimeout(5.0)  # Timeout for connect and recv
                sock.connect(('localhost', self.port))
                self.connected = True
                print(f"Connected to stream on port {self.port}")

                while self.running:
                    # Read 8-byte header
                    header = self._recv_exact(sock, 8)
                    if not header:
                        print(f"Stream {self.port}: Connection closed")
                        break

                    # Verify magic and get length
                    if header[:4] != b"VXL0":
                        print(f"Stream {self.port}: Invalid magic in header")
                        break

                    frame_len = struct.unpack(">I", header[4:])[0]
                    if frame_len <= 0 or frame_len > 5 * 1024 * 1024:
                        print(f"Stream {self.port}: Invalid frame length {frame_len}")
                        break

                    # Read and decode the JPEG frame
                    jpeg_data = self._recv_exact(sock, frame_len)
                    if not jpeg_data:
                        print(f"Stream {self.port}: Failed reading frame data")
                        break

                    frame_array = np.frombuffer(jpeg_data, dtype=np.uint8)
                    frame = cv2.imdecode(frame_array, cv2.IMREAD_COLOR)
                    if frame is not None:
                        # Resize to target size
                        frame = cv2.resize(frame, (FRAME_WIDTH, FRAME_HEIGHT))
                        self._update_frame(frame)

            except (socket.error, ConnectionError) as e:
                print(f"Stream {self.port}: Connection error: {e}")
                self.connected = False
                if self.running:
                    time.sleep(1.0)  # Wait before retry
                continue

            finally:
                try:
                    sock.close()
                except Exception:
                    pass

    def start(self):
        """Start the receiver thread."""
        self.running = True
        threading.Thread(target=self.receive_frames, daemon=True).start()

    def stop(self):
        """Stop the receiver thread."""
        self.running = False


def connect_wifi(controllers: List[DeviceController], ssid: str, password: str) -> bool:
    """Connect both devices to WiFi. Return True if both connected successfully."""
    try:
        # First, get our host's network info to ensure we're on same subnet
        host_ip = None
        try:
            # Try to get IP by connecting to a public DNS
            temp_sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
            temp_sock.connect(("8.8.8.8", 80))
            host_ip = temp_sock.getsockname()[0]
            temp_sock.close()
            print(f"Host IP: {host_ip}")
        except Exception as e:
            print(f"Warning: Could not determine host IP: {e}")
            
        for i, ctrl in enumerate(controllers):
            print(f"\nConnecting device #{i+1} to WiFi...")
            
            # First try disconnecting to clear any stale connections
            try:
                ctrl.execute_device_command('wifi_client_disconnect')
                time.sleep(1)
            except Exception:
                pass
                
            # Connect to WiFi
            res = ctrl.execute_device_command(f'wifi_client_connect:{ssid}|{password}')
            print(f"WiFi result:", res)
            
            if isinstance(res, dict):
                if res.get('error'):
                    print(f"Error connecting device #{i+1} to WiFi")
                    return False
                elif res.get('ip'):
                    dev_ip = res.get('ip')
                    print(f"Device #{i+1} got IP: {dev_ip}")
                    if host_ip:
                        print(f"Host IP: {host_ip}")
                        host_parts = host_ip.split('.')
                        dev_parts = dev_ip.split('.')
                        if host_parts[:2] != dev_parts[:2]:
                            print(f"Warning: Device #{i+1} ({dev_ip}) appears to be on different subnet than host ({host_ip})")
            
            time.sleep(3)  # Give WiFi more time to establish
            
            # Verify connection with status check
            status = ctrl.execute_device_command('wifi_client_status')
            print(f"WiFi status:", status)
            if isinstance(status, dict) and status.get('error'):
                print(f"Device #{i+1} WiFi status check failed")
                return False
                
        return True
    except Exception as e:
        print(f"Error connecting to WiFi: {e}")
        return False


def get_network_info() -> dict:
    """Get network information including host IP and gateway."""
    info = {'host_ip': None, 'gateway': None}
    
    try:
        # Get host IP
        temp_sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        temp_sock.connect(("8.8.8.8", 80))
        info['host_ip'] = temp_sock.getsockname()[0]
        temp_sock.close()
        
        # Try to get gateway
        import subprocess
        if sys.platform == "darwin":  # macOS
            try:
                result = subprocess.run(['netstat', '-nr'], capture_output=True, text=True)
                for line in result.stdout.split('\n'):
                    if 'default' in line:
                        parts = line.split()
                        if len(parts) > 1:
                            info['gateway'] = parts[1]
                            break
            except Exception as e:
                print(f"Warning: Could not determine gateway: {e}")
    except Exception as e:
        print(f"Warning: Could not determine network info: {e}")
    
    return info

def start_streams(controllers: List[DeviceController]) -> bool:
    """Start streams on both devices. Return True if both started successfully."""
    try:
        # Get network info first
        net_info = get_network_info()
        print(f"\nNetwork info: {net_info}")
        
        # Start streams on both devices
        for i, ctrl in enumerate(controllers):
            port = STREAM_PORTS[i]
            print(f"\nStarting stream on device #{i+1} (port {port})...")
            
            # Try rdmp_stop first in case there's a stale stream
            try:
                ctrl.execute_device_command('rdmp_stop')
                time.sleep(0.5)
            except Exception:
                pass
                
            # Try IPs in order of likelihood to work
            ips_to_try = []
            if net_info['host_ip']:
                ips_to_try.append(net_info['host_ip'])
            if net_info['gateway']:
                ips_to_try.append(net_info['gateway'])
            ips_to_try.extend(["172.20.10.10", "172.20.10.1", ""])  # Previous working IPs + empty
            
            success = False
            for ip in ips_to_try:
                if not ip:
                    print("Trying default IP (empty string)...")
                else:
                    print(f"Trying IP: {ip}")
                    
                try:
                    res = ctrl.execute_device_command(f'rdmp_stream:{ip}|{port}')
                    print(f"Stream result:", res)
                    
                    if i == 0:  # Serial device
                        raw = str(res.get('raw_response', '')).lower() if isinstance(res, dict) else ''
                        if not raw or 'camera' in raw:
                            print("Serial device appears to be starting stream...")
                            success = True
                            break
                    else:  # BLE device
                        if not (isinstance(res, dict) and res.get('error')):
                            success = True
                            break
                        if 'Failed to connect to remote host' not in str(res.get('error', '')):
                            print("BLE device error - stopping attempts")
                            break
                except Exception as e:
                    print(f"Error with IP {ip}: {e}")
                
                time.sleep(0.5)
            
            if not success:
                print(f"Failed to start stream on device #{i+1}")
                return False
        
        print("\nStreams started - waiting 2s for sockets to open...")
        time.sleep(2)
        return True
        
    except Exception as e:
        print(f"Error starting streams: {e}")
        return False
            host_ip = None
            try:
                # Try to get IP by connecting to a public DNS
                temp_sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
                temp_sock.connect(("8.8.8.8", 80))
                host_ip = temp_sock.getsockname()[0]
                temp_sock.close()
            except Exception:
                # Fallback: try hostname lookup
                for ip in socket.gethostbyname_ex(socket.gethostname())[2]:
                    if not ip.startswith("127."):
                        host_ip = ip
                        break
                        
            # Try a few common options for host IP:
            host_ips = ["172.20.10.10", "172.20.10.1", host_ip, ""]  # Previous IP, gateway, detected, default
            
            success = False
            for try_ip in [ip for ip in host_ips if ip]:  # Filter out empty
                print(f"Trying host IP {try_ip} for stream target...")
                
                try:
                    res = ctrl.execute_device_command(f'rdmp_stream:{try_ip}|{port}')
                    print(f"Stream result (port {port}):", res)
                    
                    if i == 0:  # Serial device
                        raw = str(res.get('raw_response', '')).lower() if isinstance(res, dict) else ''
                        if not raw or 'camera' in raw:  # Accept empty or camera-related messages
                            print("Serial device appears to be starting stream...")
                            success = True
                            break
                    else:  # BLE device
                        if not (isinstance(res, dict) and res.get('error')):
                            success = True
                            break
                        if res.get('error') and 'Failed to connect to remote host' not in str(res['error']):
                            print("BLE device error - stopping attempts")
                            break
                            
                except Exception as e:
                    print(f"Error with IP {try_ip}: {e}")
                
                time.sleep(0.5)  # Brief pause between attempts
            
            if not success:
                print(f"Failed to start stream on device #{i+1}")
                return False
                
        print("\nStreams started - waiting 2s for sockets to open...")
        time.sleep(2)
        return True

    except Exception as e:
        print(f"Error starting streams: {e}")
        return False
            
            if not success:
                print(f"Failed to start stream on device #{i+1}")
                return False

        print("\nStreams started - waiting 2s for sockets to open...")
        time.sleep(2)
        return True

    except Exception as e:
        print(f"Error starting streams: {e}")
        return False
            
            # Try a few common options for host IP:
            host_ips = [
                "172.20.10.10",  # Your IP from earlier
                "172.20.10.1",   # Gateway from BLE device
                host_ip,         # Detected IP
                "",             # Let device use default
            ]
            
            success = False
            for try_ip in [ip for ip in host_ips if ip]:  # Filter out empty
                print(f"Trying host IP {try_ip} for stream target...")
                res = ctrl.execute_device_command(f'rdmp_stream:{try_ip}|{port}')
                print(f"Stream result (port {port}):", res)
                
                if i == 0:  # Serial device
                    if isinstance(res, dict):
                        raw = str(res.get('raw_response', '')).lower()
                        if not raw or 'camera' in raw:  # Accept empty or camera-related messages
                            print("Serial device appears to be starting stream...")
                            success = True
                            break
                        elif not res.get('error'):
                            success = True
                            break
                else:  # BLE device
                    if not (isinstance(res, dict) and res.get('error')):
                        success = True
                        break
                    elif 'Failed to connect to remote host' in str(res.get('error', '')):
                        print("Network error - trying next IP...")
                        # Continue to next IP
                    else:
                        print("BLE device error - stopping attempts")
                        break
                
                time.sleep(0.5)  # Brief pause between attempts
            
            if not success:
                print(f"Failed to start stream on device #{i+1}")
                return False

        print("\nStreams started - waiting 2s for sockets to open...")
        time.sleep(2)
        return True

    except Exception as e:
        print(f"Error starting streams: {e}")
        return False
            
            # For serial device (first one), accept any non-error or camera-init message
            if i == 0:  # Serial
                if isinstance(res, dict):
                    if res.get('error'):
                        raw = str(res.get('raw_response', '')).lower()
                        if not raw or 'camera' in raw:  # Accept empty or camera-related messages
                            print("Serial device appears to be starting stream...")
                            time.sleep(1)  # Give it a moment
                            continue
                    elif not res.get('error'):
                        continue
                    # Other errors - fail
                    return False
            else:  # BLE - require success
                if isinstance(res, dict) and res.get('error'):
                    if 'Failed to connect to remote host' in str(res.get('error', '')):
                        print("Network error - check if host IP is reachable")
                    return False

        print("\nStreams started - waiting 2s for sockets to open...")
        time.sleep(2)
        return True

    except Exception as e:
        print(f"Error starting streams: {e}")
        return False


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--ssid', required=True, help='WiFi SSID')
    parser.add_argument('--password', required=True, help='WiFi password')
    args = parser.parse_args()

    controllers = None
    try:
        # Connect devices and ensure WiFi
        controllers = connect_devices(args.ssid, args.password)
        
        # Start streams
        if not start_streams(controllers):
            print("Failed to start one or both streams. Exiting.")
            return

        print("\nStreams started. Waiting 2s for connections...")
        time.sleep(2)

        # Create window
        cv2.namedWindow(WINDOW_NAME, cv2.WINDOW_NORMAL)
        cv2.moveWindow(WINDOW_NAME, 100, 100)
        
        # Start receivers
        receivers = [StreamReceiver(port) for port in STREAM_PORTS]
        for r in receivers:
            r.start()

        blank = np.zeros((FRAME_HEIGHT, FRAME_WIDTH, 3), dtype=np.uint8)
        while True:
            # Get latest frames
            frames = []
            for i, receiver in enumerate(receivers):
                frame, ts = receiver.get_frame()
                if frame is None:
                    # If no frame, show info text on blank
                    info = blank.copy()
                    text = f"Waiting for stream {STREAM_PORTS[i]}..."
                    if receiver.connected:
                        text += " (Connected)"
                    cv2.putText(info, text,
                              (40, FRAME_HEIGHT//2),
                              cv2.FONT_HERSHEY_SIMPLEX, 0.8,
                              (255, 255, 255), 2)
                    frames.append(info)
                else:
                    # Add port number to frame
                    labeled = frame.copy()
                    port_text = f"Port {STREAM_PORTS[i]}"
                    if i == 0:
                        port_text += " (Serial)"
                    else:
                        port_text += " (BLE)"
                    cv2.putText(labeled, port_text,
                              (10, 30), cv2.FONT_HERSHEY_SIMPLEX,
                              0.8, (0, 255, 0), 2)
                    frames.append(labeled)

            # Combine side by side
            if len(frames) == 2:
                display = np.hstack(frames)
                cv2.imshow(WINDOW_NAME, display)
            
            # Check for quit
            key = cv2.waitKey(1)
            if key == ord('q') or key == 27:  # q or ESC
                print("\nQuitting...")
                break

    except KeyboardInterrupt:
        print("\nInterrupted by user")
    except Exception as e:
        print(f"Error: {e}")

    finally:
        # Clean up
        print("\nCleaning up...")
        
        if 'receivers' in locals():
            for r in receivers:
                r.stop()
        cv2.destroyAllWindows()

        # Stop streams and disconnect
        if controllers:
            for c in controllers:
                try:
                    c.execute_device_command('rdmp_stop')
                    time.sleep(0.5)
                    c.disconnect()
                except Exception as e:
                    print(f"Error during cleanup: {e}")


if __name__ == "__main__":
    main()