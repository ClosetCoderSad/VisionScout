"""
Utilities for testing Voxel device streaming functionality.
"""

import socket
import subprocess
import time
from typing import Dict, List, Optional, Tuple
from voxel_sdk import DeviceController

def get_network_info() -> Dict[str, Optional[str]]:
    """
    Get network information including host IP and gateway.
    Returns dict with 'host_ip' and 'gateway' keys.
    """
    info = {'host_ip': None, 'gateway': None}
    
    try:
        # Get host IP via UDP socket
        temp_sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        temp_sock.connect(("8.8.8.8", 80))
        info['host_ip'] = temp_sock.getsockname()[0]
        temp_sock.close()
        
        # Get gateway on macOS
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

def connect_devices() -> Optional[List[DeviceController]]:
    """
    Connect to both Voxel devices (serial first, then BLE).
    Returns list of [serial_ctrl, ble_ctrl] or None on failure.
    """
    try:
        print("Looking for serial device...")
        serial_ctrl = DeviceController(transport_type="serial")
        if not serial_ctrl.connect():
            print("Failed to connect serial device")
            return None
            
        print("\nLooking for BLE device...")
        ble_ctrl = DeviceController(transport_type="ble")
        if not ble_ctrl.connect():
            print("Failed to connect BLE device")
            serial_ctrl.disconnect()
            return None
            
        return [serial_ctrl, ble_ctrl]
        
    except Exception as e:
        print(f"Error connecting devices: {e}")
        return None

def setup_wifi(controllers: List[DeviceController], ssid: str, password: str) -> bool:
    """
    Connect both devices to WiFi. More robust than simple connect.
    Returns True if both connected successfully.
    """
    try:
        net_info = get_network_info()
        print(f"Host network info: {net_info}")
        
        for i, ctrl in enumerate(controllers):
            print(f"\nConnecting device #{i+1} to WiFi...")
            
            # First disconnect to clear any stale connections
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
                    if net_info['host_ip']:
                        host_parts = net_info['host_ip'].split('.')
                        dev_parts = dev_ip.split('.')
                        if host_parts[:2] != dev_parts[:2]:
                            print(f"Warning: Device #{i+1} ({dev_ip}) appears to be on different subnet than host ({net_info['host_ip']})")
            
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

def start_device_stream(ctrl: DeviceController, port: int, device_num: int) -> bool:
    """
    Start MJPG stream on a single device with intelligent IP selection and retry.
    Returns True if stream started successfully.
    """
    # Get potential target IPs
    net_info = get_network_info()
    ips_to_try = []
    if net_info['host_ip']:
        ips_to_try.append(net_info['host_ip'])
    if net_info['gateway']:
        ips_to_try.append(net_info['gateway'])
    ips_to_try.extend(["172.20.10.10", "172.20.10.1", ""])  # Known working IPs + empty
    
    # Stop any existing stream
    try:
        ctrl.execute_device_command('rdmp_stop')
        time.sleep(0.5)
    except Exception:
        pass
        
    # Try each IP
    for ip in ips_to_try:
        if not ip:
            print("Trying default IP (empty string)...")
        else:
            print(f"Trying IP: {ip}")
            
        try:
            res = ctrl.execute_device_command(f'rdmp_stream:{ip}|{port}')
            print(f"Stream result:", res)
            
            if device_num == 0:  # Serial device
                raw = str(res.get('raw_response', '')).lower() if isinstance(res, dict) else ''
                if not raw or 'camera' in raw:
                    print("Serial device appears to be starting stream...")
                    return True
            else:  # BLE device
                if not (isinstance(res, dict) and res.get('error')):
                    return True
                if 'Failed to connect to remote host' not in str(res.get('error', '')):
                    print("BLE device error - stopping attempts")
                    break
        except Exception as e:
            print(f"Error with IP {ip}: {e}")
        
        time.sleep(0.5)  # Brief pause between attempts
    
    print(f"Failed to start stream on device #{device_num+1}")
    return False

def cleanup_devices(controllers: List[DeviceController]) -> None:
    """
    Clean shutdown of devices - stop streams and disconnect.
    """
    for ctrl in controllers:
        try:
            ctrl.execute_device_command('rdmp_stop')
            time.sleep(0.5)
            ctrl.disconnect()
        except Exception:
            pass