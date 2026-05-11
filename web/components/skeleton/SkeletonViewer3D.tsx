"use client";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { SkeletonViewerProps } from "./types";
const JOINT_COLOR    = 0x00d4ff;
const BONE_COLOR     = 0x3b82f6;
const LOW_CONF_COLOR = 0xff4444;
const CONF_THRESHOLD = 0.5;
export function SkeletonViewer3D({
  keypoints, confidences, connections,
  width = 600, height = 500,
}: SkeletonViewerProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<{
    renderer:  THREE.WebGLRenderer;
    scene:     THREE.Scene;
    camera:    THREE.PerspectiveCamera;
    joints:    THREE.Mesh[];
    bones:     THREE.Line[];
    animId:    number;
    angleX:    number;
    angleY:    number;
  } | null>(null);
  // ── Init Three.js scene (hanya sekali) ─────────────────────────
  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;
    const W = el.clientWidth  || width;
    const H = el.clientHeight || height;
    const scene    = new THREE.Scene();
    scene.background = new THREE.Color(0x0f172a);
    const camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 100);
    camera.position.set(0, 1.5, 4);
    camera.lookAt(0, 1, 0);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    el.appendChild(renderer.domElement);
    // Grid helper
    scene.add(new THREE.GridHelper(4, 10, 0x1e3a5f, 0x1e3a5f));
    // Lighting
    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const dl = new THREE.DirectionalLight(0xffffff, 1);
    dl.position.set(5, 10, 5);
    scene.add(dl);
    // Joint spheres (17 buah)
    const joints: THREE.Mesh[] = [];
    for (let i = 0; i < 17; i++) {
      const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.04, 8, 8),
        new THREE.MeshStandardMaterial({
          color:             JOINT_COLOR,
          emissive:          JOINT_COLOR,
          emissiveIntensity: 0.4,
        })
      );
      scene.add(mesh);
      joints.push(mesh);
    }
    // Bone lines
    const bones: THREE.Line[] = [];
    for (const [a, b] of connections) {
      const geo  = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(), new THREE.Vector3()
      ]);
      const line = new THREE.Line(
        geo,
        new THREE.LineBasicMaterial({ color: BONE_COLOR })
      );
      scene.add(line);
      bones.push(line);
    }
    // Drag-to-rotate
    let isDragging = false;
    let prevX = 0, prevY = 0;
    let angleX = 0, angleY = 0;
    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevX = e.clientX; prevY = e.clientY;
      el.style.cursor = "grabbing";
    };
    const onMouseUp   = () => { isDragging = false; el.style.cursor = "grab"; };
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      angleY += (e.clientX - prevX) * 0.008;
      angleX += (e.clientY - prevY) * 0.008;
      angleX  = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, angleX));
      prevX   = e.clientX; prevY = e.clientY;
      camera.position.x = 4 * Math.sin(angleY) * Math.cos(angleX);
      camera.position.y = 1.5 + 4 * Math.sin(angleX);
      camera.position.z = 4 * Math.cos(angleY) * Math.cos(angleX);
      camera.lookAt(0, 1, 0);
      if (stateRef.current) {
        stateRef.current.angleX = angleX;
        stateRef.current.angleY = angleY;
      }
    };
    el.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mouseup",   onMouseUp);
    window.addEventListener("mousemove", onMouseMove);
    // Animate loop
    let animId: number = 0;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();
    stateRef.current = { renderer, scene, camera, joints, bones, animId, angleX: 0, angleY: 0 };
    return () => {
      cancelAnimationFrame(animId);
      renderer.dispose();
      el.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mouseup",   onMouseUp);
      window.removeEventListener("mousemove", onMouseMove);
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
    };
  }, [connections, width, height]);
  // ── Update skeleton saat keypoints berubah ──────────────────────
  useEffect(() => {
    if (!stateRef.current || !keypoints.length) return;
    const { joints, bones } = stateRef.current;
    // Update joint positions & colors
    keypoints.forEach(([x, y, z], i) => {
      if (!joints[i]) return;
      joints[i].position.set(x, y, z);
      const conf = confidences[i] ?? 0;
      (joints[i].material as THREE.MeshStandardMaterial).color.setHex(
        conf >= CONF_THRESHOLD ? JOINT_COLOR : LOW_CONF_COLOR
      );
    });
    // Update bone lines
    connections.forEach(([a, b], i) => {
      if (!keypoints[a] || !keypoints[b] || !bones[i]) return;
      const pts = [
        new THREE.Vector3(...(keypoints[a] as [number, number, number])),
        new THREE.Vector3(...(keypoints[b] as [number, number, number])),
      ];
      bones[i].geometry.setFromPoints(pts);
    });
  }, [keypoints, confidences, connections]);
  return (
    <div
      ref={mountRef}
      style={{ width: "100%", height: `${height}px`, cursor: "grab" }}
    />
  );
}
