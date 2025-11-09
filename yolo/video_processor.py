# video_processor.py
import cv2
import time
import struct
import socket
import numpy as np
from ultralytics import YOLO
from voxel_sdk.device_controller import DeviceController
from voxel_sdk.ble import BleVoxelTransport

# Import from our other project files
import shared_state
from utils import _recv_exact, get_local_ip
import classifier

def setup_stream_connection(device_name="voxel", stream_port=9000):
    """
    Connects to the Voxel device and sets up the TCP listener.
    Returns the transport, filesystem, and the connection socket from the device.
    """
    print("Helper: Connecting to Voxel device...")
    transport = BleVoxelTransport(device_name=device_name)
    transport.connect("")
    
    controller = DeviceController(transport)
    # transport is already connected; expose the controller filesystem helper
    fs = controller.filesystem
    print("Helper: Connected.")

    listener = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    listener.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    listener.bind(("0.0.0.0", stream_port))
    listener.listen(1)
    print(f"Helper: TCP server listening for video on port {stream_port}...")

    my_ip = get_local_ip()
    print(f"Helper: My local IP is {my_ip}. Telling device to connect...")
    response = fs.start_rdmp_stream(my_ip, stream_port)
    if "error" in response:
        raise RuntimeError(f"Device failed to start streaming: {response}")

    listener.settimeout(20.0)
    try:
        conn, addr = listener.accept()
        print(f"Helper: Stream connection received from device: {addr}")
        return transport, fs, conn
    except socket.timeout:
        raise TimeoutError("Timed out waiting for stream connection from device")
    finally:
        listener.close()


def receive_frame(conn):
    """
    Receives a single frame payload from the socket and decodes it.
    Returns the OpenCV frame or None if the stream ends.
    """
    print("Receiving frame header...")
    header = _recv_exact(conn, 8)
    if not header:
        print("No header received")
        return None
    if header[:4] != b"VXL0":
        print(f"Invalid header magic: {header[:4]}")
        return None
    
    frame_len = struct.unpack(">I", header[4:])[0]
    print(f"Expecting frame payload of {frame_len} bytes")
    payload = _recv_exact(conn, frame_len)
    if not payload:
        print("No payload received")
        return None
    
    frame = cv2.imdecode(np.frombuffer(payload, dtype=np.uint8), cv2.IMREAD_COLOR)
    if frame is None:
        print("Failed to decode frame")
        return None
    
    print(f"Successfully decoded frame: {frame.shape}")
    return frame


def video_processing_thread(mode, model=None, device_name="voxel", stream_port=9000):
    """
    Orchestrator for video processing with a two-stage state machine:
    1. CLASSIFYING_CAR: Uses a general model to find and classify a car.
    2. DETECTING_DENTS: Switches to a specialized model for dent detection.
    """
    # --- State Machine and Model Setup ---
    current_mode = "CLASSIFYING_CAR"
    car_detection_model = model  # This is the initial model (e.g., yolov8n.pt)
    dent_detection_model = None  # We will lazy-load this model to save resources.
    # The 'mode' argument from setup.py now defines the *dent* model path.
    DENT_MODEL_PATH = 'yolo11m_car_damage.pt' # A sensible default

    transport, fs, conn = None, None, None
    
    try:
        transport, fs, conn = setup_stream_connection(device_name, stream_port)
        
        while True:
            frame = receive_frame(conn)
            if frame is None:
                print("Background thread: Stream ended."); break

            annotated_frame = frame.copy()

            # --- MAIN STATE MACHINE LOGIC ---
            if current_mode == "CLASSIFYING_CAR":
                with shared_state.lock:
                    shared_state.detection_data['status'] = 'CLASSIFYING_CAR'
                
                results = car_detection_model.predict(frame, conf=0.5, verbose=False)
                annotated_frame = results[0].plot()

                # Find the first confident 'car' detection
                for box in results[0].boxes:
                    class_name = results[0].names[int(box.cls[0])]
                    if class_name == 'car' and box.conf[0] > 0.75:
                        print("Processor: Car detected. Cropping and classifying...")
                        x1, y1, x2, y2 = map(int, box.xyxy[0])
                        car_crop = frame[y1:y2, x1:x2]

                        if car_crop.size > 0:
                            label, confidence = classifier.classify_image(car_crop)
                            print(f"Processor: Classification result: {label} ({confidence:.1f}%)")

                            # --- STATE TRANSITION ---
                            with shared_state.lock:
                                shared_state.detection_data['car_classification']['label'] = label
                                shared_state.detection_data['car_classification']['confidence'] = confidence
                            
                            print("Processor: --- Switching to DENT DETECTION mode ---")
                            current_mode = "DETECTING_DENTS"
                            if dent_detection_model is None:
                                print(f"Processor: Loading dent detection model from '{DENT_MODEL_PATH}'...")
                                dent_detection_model = YOLO(DENT_MODEL_PATH)
                            break # Stop processing other cars in this frame

            elif current_mode == "DETECTING_DENTS":
                with shared_state.lock:
                    shared_state.detection_data['status'] = 'DETECTING_DENTS'

                results = dent_detection_model.predict(frame, conf=0.4, iou=0.3, verbose=False)
                annotated_frame = results[0].plot()

                dent_list = []
                for box in results[0].boxes:
                    dent_list.append({
                        "box": [int(coord) for coord in box.xyxy[0]],
                        "confidence": float(box.conf[0]),
                        "class_name": results[0].names[int(box.cls[0])]
                    })
                with shared_state.lock:
                    shared_state.detection_data['dent_detections'] = dent_list
            
            # --- Update display frame with status text ---
            with shared_state.lock:
                status_text = f"Mode: {shared_state.detection_data['status']}"
                car_text = f"Car: {shared_state.detection_data['car_classification']['label']}"
            cv2.putText(annotated_frame, status_text, (10, 40), cv2.FONT_HERSHEY_SIMPLEX, 1.2, (0, 255, 0), 2)
            if shared_state.detection_data['car_classification']['label']:
                 cv2.putText(annotated_frame, car_text, (10, 80), cv2.FONT_HERSHEY_SIMPLEX, 1.2, (0, 255, 0), 2)

            # --- Update shared state with the final annotated frame ---
            with shared_state.lock:
                shared_state.latest_annotated_frame = np.ascontiguousarray(annotated_frame)

    except Exception as e:
        print(f"An error occurred in the background thread: {e}")
        with shared_state.lock:
            shared_state.detection_data = {"status": "error", "message": str(e)}
    finally:
        # (This finally block remains the same as you provided it)
        print("Background thread: Cleaning up...")
        if conn: conn.close()
        if fs: fs.stop_rdmp_stream()
        if transport and transport.is_connected():
            try: transport.disconnect()
            except Exception as ex: print(f"Warning: transport.disconnect() failed: {ex}")
        print("Background thread: Disconnected and shut down.")