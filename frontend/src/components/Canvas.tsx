import { useEffect, useRef, useState } from "react";
import ColorPalette from "./ColorPalette";

const Canvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [selectedColor, setSelectedColor] = useState<string>("#000000");
  const socketRef = useRef<WebSocket | null>(null);
  const lastPoints = useRef<{ x: number; y: number }[]>([]); // store stroke points

  useEffect(() => {
    socketRef.current = new WebSocket("ws://localhost:5000");

    socketRef.current.onmessage = (event: MessageEvent) => {
      const data = JSON.parse(event.data);

      if (data.type === "draw") {
        drawSmoothLine(data.path, data.color);
      } else if (data.type === "clear") {
        clearCanvas(false);
      }
    };

    return () => {
      socketRef.current?.close();
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctxRef.current = ctx;
      ctx.lineWidth = 5;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
    }
  }, []);

  const drawSmoothLine = (
    points: { x: number; y: number }[],
    color: string
  ) => {
    const ctx = ctxRef.current;
    if (!ctx || points.length < 3) return;

    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);

    for (let i = 1; i < points.length - 1; i++) {
      const midPoint = {
        x: (points[i].x + points[i + 1].x) / 2,
        y: (points[i].y + points[i + 1].y) / 2,
      };
      ctx.quadraticCurveTo(points[i].x, points[i].y, midPoint.x, midPoint.y);
    }

    ctx.stroke();
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    lastPoints.current = [getMousePos(e)];
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const currentPos = getMousePos(e);
    lastPoints.current.push(currentPos);

    if (lastPoints.current.length >= 3) {
      drawSmoothLine(lastPoints.current, selectedColor);

      socketRef.current?.send(
        JSON.stringify({
          type: "draw",
          path: lastPoints.current,
          color: selectedColor,
        })
      );

      // keep last 2 points for continuity
      lastPoints.current = lastPoints.current.slice(-2);
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    lastPoints.current = [];
  };

  const clearCanvas = (emit: boolean = true) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    if (emit) {
      socketRef.current?.send(JSON.stringify({ type: "clear" }));
    }
  };

  const getMousePos = (
    e: React.MouseEvent<HTMLCanvasElement, MouseEvent>
  ): { x: number; y: number } => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  return (
    <>
      <div className="absolute top-4 left-4 z-10">
        <ColorPalette
          selectedColor={selectedColor}
          onColorChange={setSelectedColor}
        />
        <button
          onClick={() => clearCanvas()}
          className="mt-2 px-4 py-1 bg-red-500 text-white rounded-md"
        >
          CLEAR
        </button>
      </div>
      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        style={{ background: "white", display: "block" }}
      />
    </>
  );
};

export default Canvas;
