import React, { useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { Button } from '@/components/ui/button';
import { DragItem, ItemTypes, StopType } from '@/types/types';
import PlacesAutocomplete from '@/Maps/PlacesAutocomplete';
import { Clock, NotebookPen, X, GripHorizontal } from 'lucide-react';

type DraggableStopProps = {
  day: number;
  period: "morning" | "afternoon" | "evening";
  index: number;
  stop: StopType;
  updateStop: (day: number, period: any, index: number, field: keyof StopType, value: any) => void;
  removeStop: (day: number, period: any, index: number) => void;
  toggleNotes: (day: number, period: any, index: number) => void;
  showNotes: Record<string, boolean>;
  setSelectedDay: (day: number | null) => void;
  setSelectedSlot: (slot: "morning" | "afternoon" | "evening" | null) => void;
  setSelectedEntryIndex: (index: number | null) => void;
  setShowTimePicker: (show: boolean) => void;
  moveStop: (day: number, period: any, fromIndex: number, toIndex: number) => void;
  updateStopLocation: (day: number, period: any, index: number, placeData: any) => void;
};

// Draggable Stop component
const DraggableStop: React.FC<DraggableStopProps> = ({
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
  moveStop,
  updateStopLocation,
}) => {
  const ref = useRef(null);
  const notesKey = `${day}-${period}-${index}`;
  const isShowingNotes = showNotes[notesKey] || false;

  // Setup drag and drop
  const [{ isDragging }, drag] = useDrag<DragItem, unknown, { isDragging: boolean }>({
    type: ItemTypes.STOP,
    item: { day, period, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [{ isOver, canDrop }, drop] = useDrop({
    accept: ItemTypes.STOP,
    canDrop: (item: DragItem) => {
      // Only allow drops from the same day and period
      return item.day === day && item.period === period;
    },
    hover(item: DragItem) {
      if (!ref.current) return;

      // Only handle items from the same day and period
      if (item.day !== day || item.period !== period) return;

      const dragIndex = item.index;
      const hoverIndex = index;

      // Don't replace items with themselves
      if (dragIndex === hoverIndex) return;

      // Call moveStop to handle the actual array movement
      moveStop(day, period, dragIndex, hoverIndex);

      // Update the index for future drag operations
      item.index = hoverIndex;
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop() && monitor.isOver(),
    }),
  });

  drag(drop(ref));

  const handlePlaceSelect = (placeData: any) => {
    updateStopLocation(day, period, index, placeData);
  };

  // Determine the border class based on drag and drop state
  let borderClass = '';
  if (isDragging) {
    borderClass = 'rounded-xl border border-muted';
  } else if (isOver) {
    if (canDrop) {
      borderClass = 'rounded-xl bg-muted';
    } else {
      borderClass = 'rounded-xl bg-muted border border-destructive';
    }
  }

  return (
    <div
      ref={ref}
      className={`mb-2 p-2 relative rounded-xl ${borderClass}`}
    >
      {/* Mobile layout */}
      <div className="md:hidden my-4">
        <div className="flex items-center w-full">
          <div className="cursor-move px-2">
            <GripHorizontal className="h-4 w-4" />
          </div>
          <div className="flex-grow">
            <PlacesAutocomplete
              value={stop.name}
              onChange={(value: any) => updateStop(day, period, index, 'name', value)}
              onPlaceSelect={handlePlaceSelect}
              placeholder="Enter location"
            />
          </div>
        </div>
        
        <div className="relative">
          {stop.location && (
            <div className="text-xs text-gray-500 ml-10 mt-1 mb-2">
              {stop.address || `Location: ${stop.location.lat.toFixed(5)}, ${stop.location.lng.toFixed(5)}`}
            </div>
          )}
        </div>
        
        <div className="flex justify-end gap-2 mt-4">
          <Button
            onClick={() => {
              setSelectedDay(day);
              setSelectedSlot(period);
              setSelectedEntryIndex(index);
              setShowTimePicker(true);
            }}
            size="sm"
            variant="outline"
            className="bg-card border-gray-300"
          >
            <p className="font-normal">{stop.time || "Set time"}</p>
            <Clock className="ml-2 h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="bg-card border-gray-300"
            onClick={() => toggleNotes(day, period, index)}
          >
            <NotebookPen className="h-4 w-4" />
          </Button>

          <Button
            variant="destructive"
            size="sm"
            onClick={() => removeStop(day, period, index)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Desktop layout */}
      <div className="hidden md:flex md:flex-row md:items-start gap-2 mb-2">
        <div className="md:flex-grow relative">
          <div className="flex items-start">
            <div className="cursor-move px-2 mt-1"><GripHorizontal className="pt-1" /></div>
            <div className="flex-grow w-full">
              <PlacesAutocomplete
                value={stop.name}
                onChange={(value: any) => updateStop(day, period, index, 'name', value)}
                onPlaceSelect={handlePlaceSelect}
                placeholder="Enter location"
              />
            </div>
          </div>
          
          {stop.location && (
            <div className="text-xs text-gray-500 mt-1 ml-12">
              {stop.address || `Location: ${stop.location.lat.toFixed(5)}, ${stop.location.lng.toFixed(5)}`}
            </div>
          )}
        </div>
        <div className="flex gap-2 ml-auto">
          <Button
            onClick={() => {
              setSelectedDay(day);
              setSelectedSlot(period);
              setSelectedEntryIndex(index);
              setShowTimePicker(true);
            }}
            size="sm"
            variant="outline"
            className="bg-card border-gray-300"
          >
            <p className="font-normal">{stop.time || "Set time"}</p>
            <Clock className="ml-2 h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="bg-card border-gray-300"
            onClick={() => toggleNotes(day, period, index)}
          >
            <NotebookPen className="h-4 w-4" />
          </Button>

          <Button
            variant="destructive"
            size="sm"
            onClick={() => removeStop(day, period, index)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {isShowingNotes && (
        <textarea
          name="notes"
          value={stop.notes}
          onChange={(e: { target: { value: any; }; }) => updateStop(day, period, index, "notes", e.target.value)}
          className="md:mt-2 mt-4 mb-2 w-full border border-gray-300 p-2 rounded-sm"
          placeholder='Add your notes here'
        />
      )}
    </div>
  );
}

export default DraggableStop;