import React, { useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DraggableStopProps, DragItem, ItemTypes } from '@/types/types';

// Draggable Stop component
const DraggableStop : React.FC<DraggableStopProps> = ({ 
  day, 
  period, 
  index, 
  stop, 
  updateStop, 
  removeStop, 
  toggleNotes, 
  showNotes, 
  setSelectedDay, 
  setSelectedSlot, 
  setSelectedEntryIndex, 
  setShowTimePicker, 
  moveStop 
}) => {
  const ref = useRef(null);
  
  const [{ isDragging }, drag] = useDrag<DragItem, unknown, { isDragging: boolean }>({
    type: ItemTypes.STOP,
    item: { day, period, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });
  
  const [, drop] = useDrop<DragItem>({
    accept: ItemTypes.STOP,
    hover(item, monitor) {
      if (!ref.current) {
        return;
      }
      
      // Don't replace items with themselves
      if (item.day !== day || item.period !== period || item.index === index) {
        return;
      }
      
      // Move the stop
      moveStop(item.day, item.period, item.index, index);
      
      // Update the item's index for further interactions
      item.index = index;
    },
  });
  
  drag(drop(ref));
  
  return (
    <div 
      ref={ref} 
      className="mb-2 p-2 border rounded" 
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      <div className="flex items-center space-x-2 mb-2">
        {/* Drag handle */}
        <div className="cursor-move px-2">=</div>
        
        <Input
          placeholder={`Stop name`}
          value={stop.name}
          onChange={(e) => updateStop(day, period, index, "name", e.target.value)}
          className="flex-grow"
        />

        <div className="min-w-[120px]">
          <p className="text-xs mb-1">Time: {stop.time || "None"}</p>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setSelectedDay(day);
              setSelectedSlot(period);
              setSelectedEntryIndex(index);
              setShowTimePicker(true);
            }}
          >
            Set Time
          </Button>
        </div>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => removeStop(day, period, index)}
        >
          X
        </Button>
      </div>

      <div className="flex items-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => toggleNotes(day, period, index)}
        >
          {showNotes[`${day}-${period}-${index}`] ? "Hide Notes" : "Add Notes"}
        </Button>
      </div>

      {showNotes[`${day}-${period}-${index}`] && (
        <Input
          placeholder="Notes"
          value={stop.notes}
          onChange={(e) => updateStop(day, period, index, "notes", e.target.value)}
          className="mt-2"
        />
      )}
    </div>
  );
};
export default DraggableStop;
