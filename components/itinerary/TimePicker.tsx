import React from 'react';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Button } from '@/components/ui/button';

interface TimePickerModalProps {
  onClose: () => void;
  onChangeTime: (time: Date | null) => void;
}

const TimePickerModal: React.FC<TimePickerModalProps> = ({ onClose, onChangeTime }) => {
  return (
    <div className="fixed inset-0 bg-grey bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded-lg">
        <h3 className="mb-2 font-medium">Select Time</h3>
        <DatePicker
          selected={new Date()}
          onChange={onChangeTime}
          showTimeSelect
          showTimeSelectOnly
          timeIntervals={15}
          timeCaption="Time"
          dateFormat="h:mm aa"
          inline
        />
        <div className="mt-2 flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TimePickerModal;