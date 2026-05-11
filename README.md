<p align="center">
  <svg width="150" height="150" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="wifi-s-grad" x1="50" y1="10" x2="50" y2="90" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stop-color="#60A5FA" />
        <stop offset="50%" stop-color="#3B82F6" />
        <stop offset="100%" stop-color="#1E3A8A" />
      </linearGradient>
      <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="0" stdDeviation="3" flood-color="#3B82F6" flood-opacity="0.5" />
      </filter>
    </defs>
    <g stroke="url(#wifi-s-grad)" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" filter="url(#glow)">
      <path d="M 20,35 C 30,15 70,15 80,35 L 50,55" />
      <path d="M 80,65 C 70,85 30,85 20,65 L 50,45" />
    </g>
  </svg>
</p>

<h1 align="center" style="font-family: 'Arial Black', Impact, sans-serif; font-size: 3rem; letter-spacing: 4px; color: #2ecc71;">
  SWEENEX
</h1>

<h3 align="center">WiFi-Based 3D Human Tracking System</h3>

<p align="center">
  <b>Real-time 3D human pose estimation from WiFi Channel State Information (CSI) — using an ESP32 and your existing home routers. No camera. No wearable. No cloud. Just radio waves.</b>
</p>

<p align="center">
  <a href="#features">
    <img src="https://img.shields.io/badge/Architecture-CNN%20%2B%20Transformer-blue?style=for-the-badge&logo=databricks" alt="Architecture" />
  </a>
  <a href="#machine-learning-model">
    <img src="https://img.shields.io/badge/Keypoints-COCO%2017-orange?style=for-the-badge&logo=codeforces" alt="Keypoints" />
  </a>
  <a href="#hardware-requirements">
    <img src="https://img.shields.io/badge/Hardware-ESP32-success?style=for-the-badge&logo=espressif" alt="ESP32" />
  </a>
  <a href="#web-interface">
    <img src="https://img.shields.io/badge/Web-Next.js%2013-black?style=for-the-badge&logo=next.js" alt="Next.js" />
  </a>
</p>

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Hardware Requirements](#-hardware-requirements)
- [Machine Learning Model](#-machine-learning-model)
- [System Architecture](#-system-architecture)
- [Getting Started](#-getting-started)
  - [1. ESP32 Setup](#1-esp32-setup)
  - [2. Server Setup](#2-server-setup)
  - [3. Web Interface Setup](#3-web-interface-setup)
- [Usage & Testing](#-usage--testing)
- [Troubleshooting](#-troubleshooting)
- [License](#-license)

---

## 📡 Overview

**SWEENEX** redefines human activity tracking by transforming standard WiFi signals into a powerful 3D vision system. By analyzing how human bodies interact with and distort WiFi signals (Channel State Information - CSI), SWEENEX can reconstruct a full 17-keypoint 3D skeleton in real time. 

By utilizing an ESP32 to sniff packets and an ONNX-powered ML model containing Spatial CNNs and Temporal Transformer Encoders, SWEENEX achieves a Mean Per Joint Position Error (MPJPE) of just `93.7 mm`—without ever turning on a camera.


---

## ✨ Features

- 🕵️‍♂️ **100% Privacy-Preserving**: No cameras, no lenses. Operates entirely through walls and physical barriers using 2.4/5GHz radio waves.
- ⚡ **High-Speed Edge Inference**: Runs locally at `>= 80 Hz` sampling rates with optimized hardware and software handling.
- 📡 **Multi-Router Aggregation**: Gathers and synchronizes CSI data dynamically from multiple routers (up to 3 recommended) for rich spatial diversity.
- 🧠 **Advanced ML Pipeline**: Employs the `sweenex_pose_v2_multi_router` model combining spatial CNNs with temporal Transformer encoders.
- 🌐 **Interactive 3D Web App**: A stunning, responsive Next.js + React dashboard visualizing the predicted 3D skeletal data in real time, built with `@tweenjs` for smooth animations.

---

## 🛠 Hardware Requirements

To run SWEENEX seamlessly, ensure your physical environment meets the following specifications:

| Component | Specification | Description |
| :--- | :--- | :--- |
| **Data Collector** | **ESP32** NodeMCU | Must support monitor mode to extract CSI. |
| **Data Cable** | USB Data Cable | Must be a data-capable cable (not charge-only). |
| **Signal Sources** | **3x WiFi Routers** | Set to **HT40 mode**. The system uses 52 subcarriers dynamically. |
| **Processing Unit** | PC / Laptop | Required for ONNX model inference and running the local Next.js server. |

> **Note**: The ESP32 relies on the `CH340` or `CP210x` driver depending on your board. Ensure it is installed on your server machine.

---

## 🧠 Machine Learning Model

SWEENEX leverages a sophisticated deep learning architecture. Here are the specifications of the core engine (`model_info.json`):

<details>
<summary><b>View Model Details <code>(sweenex_pose_v2_multi_router)</code></b></summary>
<br>

- **Version**: `2.0.0`
- **Architecture**: CNN (Spatial feature extraction) + Transformer Encoder (Temporal processing)
- **Dataset**: MM-Fi (Trained on 40 unique subjects)
- **Performance**: `93.7 mm` MPJPE (Mean Per Joint Position Error)
- **Input Tensor**: `csi_tensor` with shape `[1, 1, 100, -1]`. The feature dimension dynamically adjusts to `n_routers * 52`.
- **Output Tensors**: 
  - `keypoints_3d`: Shape `[1, 17, 3]` (COCO 17 keypoints format, Coordinates in meters).
  - `confidences`: Shape `[1, 17]` (Range 0.0 - 1.0).
- **Requirements**: Window Size = `100`, Sampling Rate = `100 Hz`.
- **ONNX Opset**: `17`

</details>

---

## 🚀 Getting Started

### 1. ESP32 Setup

1. Flash your ESP32 with the custom SWEENEX firmware.
2. Ensure the `channel_hopper.c` configuration matches the channels used by your 3 target routers.
3. Connect the ESP32 to your PC using a high-speed USB data cable.

### 2. Server Setup (Python)

The server handles serial data extraction from the ESP32, parses JSON packets, and executes the ONNX inference.

```bash
# Navigate to the server directory
cd server

# Create a virtual environment and install dependencies
python -m venv venv
source venv/bin/activate  # On Windows use: venv\Scripts\activate
pip install -r requirements.txt
```

### 3. Web Interface Setup (Next.js)

The frontend is built on **Next.js** and leverages packages like `@tweenjs/tween.js` for smooth 3D interpolation and `stats.js` for performance monitoring.

```bash
# Navigate to the web directory
cd web

# Install dependencies
npm install

# Start the development server
npm run dev
```
Your dashboard will be live at `http://localhost:3000`.

---

## 🕹 Usage & Testing

### Testing the ESP32 Connection
Before running the full system, verify that the ESP32 is reading packets at the correct speed (`>= 80 Hz` required, `100 Hz` recommended). SWEENEX includes a built-in diagnostic tool.

Run the `test_connection.py` script:

```bash
python scripts/test_connection.py --port /dev/ttyUSB0 --duration 10
```
*(Note: On Windows, use `--port COM3` or whichever COM port is assigned to the CH340 chip).*

**Expected Output:**
```text
Testing ESP32 connection on /dev/ttyUSB0 for 10s...

  10s — 950 packets — 95.0 Hz — 3 routers

==================================================
Test Results (10s):
  Total packets : 950
  Sampling rate : 95.0 Hz  ✓
  Parse errors  : 0
  Routers seen  : 3

Router details:
  AA:BB:CC:DD:EE:11  →  350 packets (36.8%)
  AA:BB:CC:DD:EE:22  →  320 packets (33.6%)
  AA:BB:CC:DD:EE:33  →  280 packets (29.4%)

✓ Connection OK! Server is ready to run.
```

### Starting the System
Once the connection is verified:
1. Start the inference server: `python main.py` (or your entry point).
2. Ensure the Next.js web application is running (`npm run dev`).
3. Open the web interface to view the live 3D tracking.

---

## 🩺 Troubleshooting

If `test_connection.py` fails or returns `✗ Ada masalah. Cek firmware ESP32 dan channel_hopper.c`:

- **Port Cannot Open**: Ensure the ESP32 is not opened in another serial monitor (like Arduino IDE). Verify the `CH340` driver is installed.
- **Low Sampling Rate (< 80 Hz)**: Check if you are using a charge-only USB cable. Use a proper Data cable. 
- **Not Seeing 3 Routers**: Verify that the MAC addresses (BSSIDs) and channels in the ESP32 firmware match your actual home routers. 
- **Parse Errors**: Make sure the ESP32 baudrate is explicitly set to `921600`.

---

## 📜 License

This project is licensed under the MIT License.

---
<p align="center">
  <i>Designed and developed by the SWEENEX Team. Bringing radio-wave vision to life.</i>
</p>