import React, { useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DragItem, ItemTypes, StopType } from '@/types/types';
import PlacesAutocomplete from '@/Maps/PlacesAutocomplete';

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

  const [{ isOver }, drop] = useDrop({
    accept: ItemTypes.STOP,
    hover(item: DragItem) {
      if (!ref.current) return;

      // Only handle items from the same day and period
      if (item.day !== day) return;

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
    }),
  });

  drag(drop(ref));

  const handlePlaceSelect = (placeData: any) => {
    updateStopLocation(day, period, index, placeData);
  };

  return (
    <div
      ref={ref}
      className={`mb-2 p-2 border rounded ${isDragging ? 'opacity-50 bg-gray-100' : ''} ${isOver ? 'border-primary' : ''}`}
    >
      <div className="flex items-center space-x-2 mb-2">
        <div className="cursor-move px-2">=</div>

        <div className="flex-grow">
          <PlacesAutocomplete
            value={stop.name}
            onChange={(value: any) => updateStop(day, period, index, 'name', value)}
            onPlaceSelect={handlePlaceSelect}
            placeholder="Enter location"
          />
          {stop.location && (
            <div className="text-xs text-gray-500 mt-1">
              {stop.address || `Location: ${stop.location.lat.toFixed(5)}, ${stop.location.lng.toFixed(5)}`}
            </div>
          )}
        </div>

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
          {isShowingNotes ? "Hide Notes" : "Add Notes"}
        </Button>
      </div>

      {isShowingNotes && (
        <Input
          placeholder="Notes"
          value={stop.notes}
          onChange={(e: { target: { value: any; }; }) => updateStop(day, period, index, "notes", e.target.value)}
          className="mt-2"
        />
      )}
    </div>
  );
};

export default DraggableStop;