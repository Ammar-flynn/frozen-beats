import { X, Trash2, Music, ListMusic, GripVertical } from "lucide-react";
import { Song } from "../types";
import { useState, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface QueueModalProps {
  isOpen: boolean;
  onClose: () => void;
  queue: Song[];
  currentSong: Song | null;
  currentQueueIndex: number;
  onPlaySong: (song: Song, index: number) => void;
  onRemoveFromQueue: (index: number) => void;
  onClearQueue: () => void;
  onReorderQueue: (startIndex: number, endIndex: number) => void;
}

// Sortable item component
function SortableQueueItem({ 
  song, 
  index, 
  isActive, 
  onPlaySong, 
  onRemoveFromQueue 
}: { 
  song: Song; 
  index: number; 
  isActive: boolean; 
  onPlaySong: (song: Song, index: number) => void; 
  onRemoveFromQueue: (index: number) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: song._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div 
      ref={setNodeRef}
      style={style}
      className={`queue-item ${isActive ? 'active' : ''}`}
      onClick={() => onPlaySong(song, index)}
    >
      <div className="queue-number" {...attributes} {...listeners}>
        <GripVertical size={16} style={{ cursor: 'grab', opacity: 0.5 }} />
        <span>{index + 1}</span>
      </div>
      <img src={song.coverUrl} alt={song.title} className="queue-image" />
      <div className="queue-info">
        <h4>{song.title}</h4>
        <p>{song.artist}</p>
      </div>
      <button 
        onClick={(e) => { 
          e.stopPropagation(); 
          onRemoveFromQueue(index); 
        }} 
        className="remove-from-queue"
      >
        <X size={16} />
      </button>
    </div>
  );
}

export function QueueModal({ 
  isOpen, 
  onClose, 
  queue, 
  currentSong, 
  currentQueueIndex, 
  onPlaySong, 
  onRemoveFromQueue, 
  onClearQueue,
  onReorderQueue
}: QueueModalProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      // Small delay
      setTimeout(() => setIsAnimating(true), 10);
    } else {
      setIsAnimating(false);
      // Wait for animation
      const timer = setTimeout(() => setShouldRender(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleClose = () => {
  onClose();
};

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = queue.findIndex((item) => item._id === active.id);
      const newIndex = queue.findIndex((item) => item._id === over.id);
      onReorderQueue(oldIndex, newIndex);
    }
  };

  if (!shouldRender) return null;

  return (
    <div 
      className={`queue-overlay ${isAnimating ? 'open' : 'close'}`} 
      onClick={handleClose}
    >
      <div 
        className={`queue-slider ${isAnimating ? 'open' : 'close'}`} 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="queue-header">
          <h2>
            <Music size={20} /> 
            Queue ({queue.length})
          </h2>
          <div style={{ display: 'flex', gap: '8px' }}>
            {queue.length > 0 && (
              <button 
                onClick={() => {
                  onClearQueue();
                  handleClose();
                }} 
                className="clear-queue-button"
                title="Clear queue"
              >
                <Trash2 size={20} />
              </button>
            )}
            <button onClick={handleClose} className="close-queue" title="Close">
              <X size={24} />
            </button>
          </div>
        </div>
        
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={queue.map(song => song._id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="queue-content">
              {queue.length === 0 ? (
                <div className="empty-queue">
                  <ListMusic size={48} />
                  <p>Your queue is empty</p>
                  <p style={{ fontSize: '12px', marginTop: '8px' }}>
                    Click the + icon on any song to add it to the queue!
                  </p>
                </div>
              ) : (
                queue.map((song, index) => (
                  <SortableQueueItem
                    key={song._id}
                    song={song}
                    index={index}
                    isActive={index === currentQueueIndex && currentSong?._id === song._id}
                    onPlaySong={onPlaySong}
                    onRemoveFromQueue={onRemoveFromQueue}
                  />
                ))
              )}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
}