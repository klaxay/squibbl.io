import { useEffect, useRef, useState } from "react";

const Canvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);
  const lastPos = useRef<{ x: number; y: number } | null>(null); // Store last position

  useEffect(() => {
    // Initialize WebSocket
    socketRef.current = new WebSocket("ws://localhost:5000");

    socketRef.current.onmessage = (event: MessageEvent) => {
      const data = JSON.parse(event.data);

      if (data.type === "draw") {
        drawLine(data.x0, data.y0, data.x1, data.y1, data.color, false);
      } else if (data.type === "clear") {
        clearCanvas(false); // Clear without emitting another event
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
    }
  }, []);

  const drawLine = (
    x0: number,
    y0: number,
    x1: number,
    y1: number,
    color: string,
    emit: boolean = true
  ) => {
    const ctx = ctxRef.current;
    if (!ctx) return;

    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.stroke();

    if (!emit) return;
    socketRef.current?.send(
      JSON.stringify({ type: "draw", x0, y0, x1, y1, color })
    );
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    lastPos.current = { x: e.clientX, y: e.clientY }; // Store initial position
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    lastPos.current = null; // Reset last position
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !lastPos.current) return;

    drawLine(lastPos.current.x, lastPos.current.y, e.clientX, e.clientY, "black");

    lastPos.current = { x: e.clientX, y: e.clientY }; // Update last position
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

  return (
    <>
      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseUp={stopDrawing}
        onMouseMove={draw}
        style={{ background: "white" }}
      />
      <button onClick={() => clearCanvas()}>CLEAR</button>
    </>
  );
};

export default Canvas;
