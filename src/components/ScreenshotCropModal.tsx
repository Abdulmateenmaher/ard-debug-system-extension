import React, { useRef, useState, useEffect } from 'react';
import { 
  Crop, 
  Square, 
  ArrowUpRight, 
  PenTool, 
  Type, 
  Undo, 
  Trash2, 
  Check, 
  X,
  EyeOff
} from 'lucide-react';
import { ImageAttachment } from '../types/qa';
import { useThemeLanguage } from '../context/ThemeLanguageContext';

interface ScreenshotCropModalProps {
  onClose: () => void;
  onSaveCrop: (attachment: ImageAttachment) => void;
  baseImageSrc?: string;
  pageUrl: string;
}

type ToolMode = 'crop' | 'rect' | 'arrow' | 'pen' | 'text' | 'blur';

interface Annotation {
  type: ToolMode;
  color: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  points?: { x: number; y: number }[];
  text?: string;
}

export const ScreenshotCropModal: React.FC<ScreenshotCropModalProps> = ({
  onClose,
  onSaveCrop,
  baseImageSrc,
  pageUrl
}) => {
  const { t } = useThemeLanguage();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [activeTool, setActiveTool] = useState<ToolMode>('rect');
  const [strokeColor, setStrokeColor] = useState<string>('#ef4444'); // Red default (Emergency)
  const [isDrawing, setIsDrawing] = useState(false);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [currentAnnotation, setCurrentAnnotation] = useState<Annotation | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [cropBox, setCropBox] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [cropDescription, setCropDescription] = useState('Screenshot highlight of target bug area');
  const imgRef = useRef<HTMLImageElement | null>(null);

  // Default mock page preview if none provided
  const sourceImage = baseImageSrc || 'https://images.unsplash.com/photo-1556742049-0a67c5574f73?w=1200&auto=format&fit=crop&q=80';

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = sourceImage;
    img.onload = () => {
      imgRef.current = img;
      setImageLoaded(true);
      redrawCanvas();
    };
  }, [sourceImage]);

  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas || !imgRef.current) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(imgRef.current, 0, 0, canvas.width, canvas.height);

    // Draw all completed annotations
    const all = [...annotations, ...(currentAnnotation ? [currentAnnotation] : [])];

    all.forEach(ann => {
      ctx.strokeStyle = ann.color;
      ctx.fillStyle = ann.color;
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';

      if (ann.type === 'rect') {
        const w = ann.endX - ann.startX;
        const h = ann.endY - ann.startY;
        ctx.strokeRect(ann.startX, ann.startY, w, h);
      } else if (ann.type === 'crop') {
        const w = ann.endX - ann.startX;
        const h = ann.endY - ann.startY;
        ctx.setLineDash([6, 6]);
        ctx.strokeStyle = '#38bdf8';
        ctx.strokeRect(ann.startX, ann.startY, w, h);
        ctx.setLineDash([]);
      } else if (ann.type === 'arrow') {
        // Draw line
        ctx.beginPath();
        ctx.moveTo(ann.startX, ann.startY);
        ctx.lineTo(ann.endX, ann.endY);
        ctx.stroke();

        // Draw arrowhead
        const angle = Math.atan2(ann.endY - ann.startY, ann.endX - ann.startX);
        const headlen = 15;
        ctx.beginPath();
        ctx.moveTo(ann.endX, ann.endY);
        ctx.lineTo(ann.endX - headlen * Math.cos(angle - Math.PI / 6), ann.endY - headlen * Math.sin(angle - Math.PI / 6));
        ctx.lineTo(ann.endX - headlen * Math.cos(angle + Math.PI / 6), ann.endY - headlen * Math.sin(angle + Math.PI / 6));
        ctx.closePath();
        ctx.fill();
      } else if (ann.type === 'pen' && ann.points && ann.points.length > 1) {
        ctx.beginPath();
        ctx.moveTo(ann.points[0].x, ann.points[0].y);
        for (let i = 1; i < ann.points.length; i++) {
          ctx.lineTo(ann.points[i].x, ann.points[i].y);
        }
        ctx.stroke();
      } else if (ann.type === 'text') {
        ctx.font = 'bold 16px Inter, sans-serif';
        ctx.fillStyle = '#0f172a';
        const txt = ann.text || 'BUG HERE';
        const metrics = ctx.measureText(txt);
        ctx.fillRect(ann.startX - 4, ann.startY - 18, metrics.width + 8, 24);
        ctx.fillStyle = '#ffffff';
        ctx.fillText(txt, ann.startX, ann.startY);
      } else if (ann.type === 'blur') {
        // Redact box
        const w = ann.endX - ann.startX;
        const h = ann.endY - ann.startY;
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(ann.startX, ann.startY, w, h);
        ctx.fillStyle = '#94a3b8';
        ctx.font = '11px sans-serif';
        ctx.fillText('[REDACTED]', ann.startX + 6, ann.startY + 16);
      }
    });
  };

  useEffect(() => {
    if (imageLoaded) {
      redrawCanvas();
    }
  }, [annotations, currentAnnotation, imageLoaded]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((e.clientY - rect.top) / rect.height) * canvas.height;

    setIsDrawing(true);

    if (activeTool === 'text') {
      const userText = prompt('Enter annotation label text:', 'Critical Bug Area');
      if (userText) {
        setAnnotations(prev => [...prev, {
          type: 'text',
          color: strokeColor,
          startX: x,
          startY: y,
          endX: x,
          endY: y,
          text: userText
        }]);
      }
      setIsDrawing(false);
      return;
    }

    setCurrentAnnotation({
      type: activeTool,
      color: strokeColor,
      startX: x,
      startY: y,
      endX: x,
      endY: y,
      points: activeTool === 'pen' ? [{ x, y }] : undefined
    });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !currentAnnotation) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((e.clientY - rect.top) / rect.height) * canvas.height;

    if (activeTool === 'pen' && currentAnnotation.points) {
      setCurrentAnnotation({
        ...currentAnnotation,
        points: [...currentAnnotation.points, { x, y }]
      });
    } else {
      setCurrentAnnotation({
        ...currentAnnotation,
        endX: x,
        endY: y
      });
    }
  };

  const handleMouseUp = () => {
    if (!isDrawing || !currentAnnotation) return;
    setIsDrawing(false);

    if (currentAnnotation.type === 'crop') {
      const x = Math.min(currentAnnotation.startX, currentAnnotation.endX);
      const y = Math.min(currentAnnotation.startY, currentAnnotation.endY);
      const width = Math.abs(currentAnnotation.endX - currentAnnotation.startX);
      const height = Math.abs(currentAnnotation.endY - currentAnnotation.startY);
      if (width > 20 && height > 20) {
        setCropBox({ x, y, width, height });
      }
    }

    setAnnotations(prev => [...prev, currentAnnotation]);
    setCurrentAnnotation(null);
  };

  const handleUndo = () => {
    setAnnotations(prev => prev.slice(0, -1));
  };

  const handleClear = () => {
    setAnnotations([]);
    setCropBox(null);
  };

  const handleSaveAndAttach = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let finalDataUrl: string;

    if (cropBox) {
      // Export cropped region
      const cropCanvas = document.createElement('canvas');
      cropCanvas.width = cropBox.width;
      cropCanvas.height = cropBox.height;
      const cropCtx = cropCanvas.getContext('2d');
      if (cropCtx) {
        cropCtx.drawImage(
          canvas,
          cropBox.x,
          cropBox.y,
          cropBox.width,
          cropBox.height,
          0,
          0,
          cropBox.width,
          cropBox.height
        );
        finalDataUrl = cropCanvas.toDataURL('image/png');
      } else {
        finalDataUrl = canvas.toDataURL('image/png');
      }
    } else {
      finalDataUrl = canvas.toDataURL('image/png');
    }

    const newAttachment: ImageAttachment = {
      id: 'img_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5),
      dataUrl: finalDataUrl,
      description: cropDescription.trim() || 'Annotated screen crop',
      fileName: `bug_screenshot_${Date.now()}.png`,
      timestamp: new Date().toISOString(),
      cropBox: cropBox || undefined
    };

    onSaveCrop(newAttachment);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[95vh] flex flex-col shadow-2xl text-white overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Crop className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Screenshot Crop &amp; Annotation Studio</h3>
              <p className="text-[11px] text-slate-400 truncate max-w-md">Target: {pageUrl}</p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="w-7 h-7 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="px-6 py-2.5 bg-slate-850 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          
          {/* Tools */}
          <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl">
            <button
              onClick={() => setActiveTool('crop')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-colors ${
                activeTool === 'crop' ? 'bg-indigo-600 text-white font-medium shadow-sm' : 'text-slate-300 hover:bg-slate-700'
              }`}
              title="Crop Area"
            >
              <Crop className="w-3.5 h-3.5" />
              <span>Crop Box</span>
            </button>

            <button
              onClick={() => setActiveTool('rect')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-colors ${
                activeTool === 'rect' ? 'bg-indigo-600 text-white font-medium shadow-sm' : 'text-slate-300 hover:bg-slate-700'
              }`}
              title="Highlight Rectangle"
            >
              <Square className="w-3.5 h-3.5" />
              <span>Highlight Box</span>
            </button>

            <button
              onClick={() => setActiveTool('arrow')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-colors ${
                activeTool === 'arrow' ? 'bg-indigo-600 text-white font-medium shadow-sm' : 'text-slate-300 hover:bg-slate-700'
              }`}
              title="Arrow Pointer"
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>Arrow</span>
            </button>

            <button
              onClick={() => setActiveTool('pen')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-colors ${
                activeTool === 'pen' ? 'bg-indigo-600 text-white font-medium shadow-sm' : 'text-slate-300 hover:bg-slate-700'
              }`}
              title="Freehand Pencil"
            >
              <PenTool className="w-3.5 h-3.5" />
              <span>Draw</span>
            </button>

            <button
              onClick={() => setActiveTool('text')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-colors ${
                activeTool === 'text' ? 'bg-indigo-600 text-white font-medium shadow-sm' : 'text-slate-300 hover:bg-slate-700'
              }`}
              title="Text Label"
            >
              <Type className="w-3.5 h-3.5" />
              <span>Text</span>
            </button>

            <button
              onClick={() => setActiveTool('blur')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-colors ${
                activeTool === 'blur' ? 'bg-indigo-600 text-white font-medium shadow-sm' : 'text-slate-300 hover:bg-slate-700'
              }`}
              title="Redact PII / Sensitive Data"
            >
              <EyeOff className="w-3.5 h-3.5" />
              <span>Redact</span>
            </button>
          </div>

          {/* Color Palettes */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400">Color:</span>
            {[
              { color: '#ef4444', label: 'Emergency (Red)' },
              { color: '#f59e0b', label: 'Warning (Orange)' },
              { color: '#10b981', label: 'Normal (Green)' },
              { color: '#3b82f6', label: 'Info (Blue)' },
              { color: '#ec4899', label: 'Highlight (Pink)' }
            ].map(c => (
              <button
                key={c.color}
                onClick={() => setStrokeColor(c.color)}
                style={{ backgroundColor: c.color }}
                title={c.label}
                className={`w-5 h-5 rounded-full transition-transform ${strokeColor === c.color ? 'ring-2 ring-white scale-110' : 'opacity-80 hover:opacity-100'}`}
              />
            ))}
          </div>

          {/* History Controls */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleUndo}
              disabled={annotations.length === 0}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300"
              title="Undo Last"
            >
              <Undo className="w-4 h-4" />
            </button>
            <button
              onClick={handleClear}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/40 text-slate-300 hover:text-rose-300"
              title="Clear All"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* Canvas Workspace */}
        <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-slate-950/60 min-h-[360px]">
          <canvas
            ref={canvasRef}
            width={960}
            height={540}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            className="border border-slate-700 rounded-xl shadow-xl cursor-crosshair max-w-full max-h-[60vh] object-contain bg-slate-900"
          />
        </div>

        {/* Caption & Attachment Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="w-full sm:w-2/3">
            <input
              type="text"
              placeholder="Add description for this image (e.g. Broken checkout button layout)..."
              value={cropDescription}
              onChange={(e) => setCropDescription(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveAndAttach}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-emerald-600/20 transition-all cursor-pointer"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>Attach Crop to Bug Report</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
