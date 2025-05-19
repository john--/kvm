import { useEffect, useState } from "react";
import { createWorker } from 'tesseract.js';

import notifications from "@/notifications";

import ExtractedTextModal from "./popovers/ExtractedTextModal";

export const ExtractText = ({
  videoElement, 
}: {
  videoElement: HTMLVideoElement | null;
}) => {
  const [extractedText, setExtractedText] = useState<string | null>(null);

  const selectTextArea = (videoElementCurrent: HTMLVideoElement | null) => {
    if (!videoElementCurrent) {
      return;
    }

    const selectionCanvas = document.createElement("canvas");
    const selectionContext = selectionCanvas.getContext("2d");
    if (!selectionContext) return;

    let startX = 0;
    let startY = 0;
    let isDragging = false;

    const overlay = document.createElement("div");
    overlay.style.position = "absolute";
    overlay.style.top = "0";
    overlay.style.left = "0";
    overlay.style.width = "100%";
    overlay.style.height = "100%";
    overlay.style.cursor = "crosshair";
    overlay.style.zIndex = "9999";
    overlay.style.background = "rgba(0, 0, 0, 0.2)";
    document.body.appendChild(overlay);

    const selectionBox = document.createElement("div");
    selectionBox.style.position = "absolute";
    selectionBox.style.border = "2px dashed #fff";
    selectionBox.style.background = "rgba(255, 255, 255, 0.3)";
    overlay.appendChild(selectionBox);

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      selectionBox.style.left = `${startX}px`;
      selectionBox.style.top = `${startY}px`;
      selectionBox.style.width = "0px";
      selectionBox.style.height = "0px";
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const currentX = e.clientX;
      const currentY = e.clientY;
      const width = Math.abs(currentX - startX);
      const height = Math.abs(currentY - startY);
      selectionBox.style.left = `${Math.min(startX, currentX)}px`;
      selectionBox.style.top = `${Math.min(startY, currentY)}px`;
      selectionBox.style.width = `${width}px`;
      selectionBox.style.height = `${height}px`;
    };

    const onMouseUp = async () => {
      isDragging = false;

      const rect = selectionBox.getBoundingClientRect();
      const videoRect = videoElementCurrent.getBoundingClientRect();

      const relativeX = rect.left - videoRect.left;
      const relativeY = rect.top - videoRect.top;

      const scaleX = videoElementCurrent.videoWidth / videoRect.width;
      const scaleY = videoElementCurrent.videoHeight / videoRect.height;

      const scaledX = relativeX * scaleX;
      const scaledY = relativeY * scaleY;
      const scaledWidth = rect.width * scaleX;
      const scaledHeight = rect.height * scaleY;

      selectionCanvas.width = scaledWidth;
      selectionCanvas.height = scaledHeight;

      selectionContext.drawImage(
        videoElementCurrent,
        scaledX,
        scaledY,
        scaledWidth,
        scaledHeight,
        0,
        0,
        scaledWidth,
        scaledHeight,
      );

      const imageData = selectionCanvas.toDataURL("image/png");

      try {
        const worker = await createWorker('eng');
        const {
          data: { text },
        } = await worker.recognize(imageData);
        setExtractedText(text);
        await worker.terminate();
      } catch (error) {
        console.error("Error extracting text:", error);
        notifications.error("Failed to extract text.");
      }

      // Remove the overlay
      document.body.removeChild(overlay);
    };

    overlay.addEventListener("mousedown", onMouseDown);
    overlay.addEventListener("mousemove", onMouseMove);
    overlay.addEventListener("mouseup", onMouseUp);
  };

  useEffect(() => {
    notifications.info("Select area to extract text from");
    selectTextArea(videoElement);
  }, [videoElement]);

  return extractedText != null && <ExtractedTextModal extractedText={extractedText} />;
};
