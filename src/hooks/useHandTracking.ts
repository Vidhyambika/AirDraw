import { useEffect, useRef, useState } from 'react';
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';
import type { AppMode, Point } from '../types';

export const useHandTracking = (
  videoElement: HTMLVideoElement | null,
  onFrame: (mode: AppMode, point: Point | null) => void
) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const landmarkerRef = useRef<HandLandmarker | null>(null);
  const requestRef = useRef<number>(0);
  const callbackRef = useRef(onFrame);
  const smoothedPointRef = useRef<Point | null>(null);

  // Keep callback fresh without re-triggering effect
  useEffect(() => {
    callbackRef.current = onFrame;
  }, [onFrame]);

  useEffect(() => {
    let active = true;
    const init = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
        );
        const handLandmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
            delegate: "GPU"
          },
          runningMode: "VIDEO",
          numHands: 1,
        });
        if (active) {
          landmarkerRef.current = handLandmarker;
          setIsLoaded(true);
        }
      } catch (err) {
        console.error("Failed to load MediaPipe Hand Landmarker", err);
      }
    };
    init();
    return () => {
      active = false;
      if (landmarkerRef.current) {
        landmarkerRef.current.close();
      }
    };
  }, []);

  useEffect(() => {
    if (!isLoaded || !videoElement) return;

    const video = videoElement;
    let lastVideoTime = -1;

    const detect = () => {
      if (video.readyState >= 2 && landmarkerRef.current && video.videoWidth > 0 && video.videoHeight > 0) {
        const startTimeMs = performance.now();
        if (lastVideoTime !== video.currentTime) {
          lastVideoTime = video.currentTime;
          
          try {
            const detections = landmarkerRef.current.detectForVideo(video, startTimeMs);

            if (detections.landmarks && detections.landmarks.length > 0) {
              const landmarks = detections.landmarks[0];
              
              // Key landmarks
              const wrist = landmarks[0];
              const thumbTip = landmarks[4];
              const indexMcp = landmarks[5];
              const indexPip = landmarks[6];
              const indexTip = landmarks[8];
              const middleMcp = landmarks[9];
              const middlePip = landmarks[10];
              const middleTip = landmarks[12];
              const ringPip = landmarks[14];
              const ringTip = landmarks[16];
              const pinkyPip = landmarks[18];
              const pinkyTip = landmarks[20];

              const distance = (p1: any, p2: any) => Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));

              // Normalize coordinates to 0-1 range and flip X because of mirror feed
              const point: Point = { x: 1 - indexTip.x, y: indexTip.y };

              // Gesture detection
              const pinchDist = distance(thumbTip, indexTip);
              const isPinching = pinchDist < 0.05;

              // Check if fingers are extended (tip is higher than pip joint - in Y axis 0 is top, so lower value means higher visually)
              const indexExtended = indexTip.y < indexPip.y;
              const middleExtended = middleTip.y < middlePip.y;
              const ringCurled = ringTip.y > ringPip.y;
              const pinkyCurled = pinkyTip.y > pinkyPip.y;
              
              // In a fist, all fingertips are tucked deeply below the MCP (base) knuckles
              const isFist = indexTip.y > indexMcp.y && middleTip.y > middleMcp.y && ringTip.y > ringMcp.y && pinkyTip.y > pinkyMcp.y;

              const isErasing = indexExtended && middleExtended && ringCurled && pinkyCurled && pinchDist > 0.08;
              const isPaused = isFist;

              let mode: AppMode = 'Hover';
              
              // Prioritize Pause over Pinch so a tightly closed fist doesn't accidentally trigger drawing
              if (isPaused) {
                mode = 'Pause';
              } else if (isPinching) {
                mode = 'Draw';
                // Move coordinate to the midpoint of the pinch for more natural drawing
                point.x = 1 - ((thumbTip.x + indexTip.x) / 2);
                point.y = ((thumbTip.y + indexTip.y) / 2);
              } else if (isErasing) {
                mode = 'Erase';
                // Use midpoint between index and middle fingers for erasing
                point.x = 1 - ((indexTip.x + middleTip.x) / 2);
                point.y = ((indexTip.y + middleTip.y) / 2);
              } else {
                mode = 'Hover';
              }

              // Apply Exponential Moving Average (EMA) smoothing to eliminate jitter
              const SMOOTHING_FACTOR = 0.5; // 0 is completely static, 1 is raw input (no smoothing)
              if (smoothedPointRef.current) {
                // If hand moves unexpectedly far in one frame (e.g. tracking glitch or rapid movement), reset smoothing
                const distFromLast = Math.sqrt(
                  Math.pow(point.x - smoothedPointRef.current.x, 2) + Math.pow(point.y - smoothedPointRef.current.y, 2)
                );
                
                if (distFromLast > 0.2) {
                   smoothedPointRef.current = { ...point };
                } else {
                   point.x = smoothedPointRef.current.x + ((point.x - smoothedPointRef.current.x) * SMOOTHING_FACTOR);
                   point.y = smoothedPointRef.current.y + ((point.y - smoothedPointRef.current.y) * SMOOTHING_FACTOR);
                }
              }
              smoothedPointRef.current = { ...point };

              callbackRef.current(mode, point);
            } else {
              smoothedPointRef.current = null;
              callbackRef.current('Hover', null);
            }
          } catch (e) {
            console.error("Tracking error", e);
          }
        }
      }
      requestRef.current = requestAnimationFrame(detect);
    };

    requestRef.current = requestAnimationFrame(detect);

    return () => {
      cancelAnimationFrame(requestRef.current);
    };
  }, [isLoaded, videoElement]);

  return { isLoaded };
};
