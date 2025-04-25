import React, { useState, useEffect } from 'react';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { db } from '@/firebaseConfig';
import { ref, set, get, remove } from 'firebase/database';
import { useSession } from '@/AuthContext';

interface SaveButtonProps {
  item: any;
  itemType: 'attraction' | 'accommodation' | 'event';
}

const SaveButton: React.FC<SaveButtonProps> = ({ item, itemType }) => {
  const { user } = useSession();
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Generate a unique ID based on the item type and its properties
  const getItemId = () => {
    switch (itemType) {
      case 'attraction':
        return item.id || `attraction-${item.Name}`;
      case 'accommodation':
        return `accommodation-${item["Property Reg Number"]}`;
      case 'event':
        return `event-${item.id}`;
      default:
        return null;
    }
  };

  const itemId = getItemId();

  // Check if the item is already saved
  useEffect(() => {
    const checkIfSaved = async () => {
      if (!user || !itemId) {
        setIsLoading(false);
        return;
      }

      // Sanitize the itemId to remove invalid Firebase path characters
      const sanitisedId = typeof itemId === 'string'
        ? itemId.replace(/[.#$/[\]]/g, '_')
        : itemId;

      try {
        const savedItemRef = ref(db, `User/${user.uid}/saved/${itemType}s/${sanitisedId}`);
        const snapshot = await get(savedItemRef);
        setIsSaved(snapshot.exists());
      } catch (error) {
        console.error('Error checking if item is saved:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkIfSaved();
  }, [user, itemId, itemType]);

  const handleSave = async () => {
    if (!user || !itemId) {
      return;
    }

    setIsLoading(true);

    try {
      const savedItemRef = ref(db, `User/${user.uid}/saved/${itemType}s/${itemId}`);

      if (isSaved) {
        // Remove item if already saved
        await remove(savedItemRef);
        setIsSaved(false);
      } else {
        // Save the item
        await set(savedItemRef, {
          ...item,
          savedAt: new Date().toISOString(),
        });
        setIsSaved(true);
      }
    } catch (error) {
      console.error('Error saving item:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant={isSaved ? "secondary" : "outline"}
      size="sm"
      onClick={handleSave}
      disabled={isLoading}
      className="flex items-center gap-1"
    >
      {isSaved ? (
        <>
          <BookmarkCheck className="h-4 w-4" /> Saved
        </>
      ) : (
        <>
          <Bookmark className="h-4 w-4" /> Save
        </>
      )}
    </Button>
  );
};

export default SaveButton;