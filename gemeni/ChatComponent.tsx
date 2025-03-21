'use client';

import { useState, useRef, useEffect, useCallback, SetStateAction } from 'react';
import { useChat } from '@/gemeni/ChatContext';
import { Send, X, Loader, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TripType } from '@/types/types';

// 
// 
//      CHAT COMPONENT ITSELD
// 
// 
interface ChatComponentProps {
    onClose?: () => void;
    isOpen: boolean;
}

export const ChatComponent = ({ onClose, isOpen }: ChatComponentProps) => {
    const { messages, isLoading, sendUserMessage } = useChat();
    const [inputValue, setInputValue] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const [shouldScroll, setShouldScroll] = useState(true);

    // Auto-scroll to bottom on new messages, only if we should scroll
    // https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoView#examples
    useEffect(() => {
        if (shouldScroll && messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, shouldScroll]);

    // Focus input when chat opens
    useEffect(() => {
        if (isOpen && inputRef.current) {
            setTimeout(() => {
                inputRef.current?.focus();
            }, 100);
        }
    }, [isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (inputValue.trim() === '' || isLoading) return;
        
        const messageToSend = inputValue;
        setInputValue('');
        setShouldScroll(true);
        
        await sendUserMessage(messageToSend);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed bottom-0 right-0 mb-4 mr-4 w-80 sm:w-96 h-[500px] bg-white rounded-lg shadow-lg flex flex-col z-50">
            {/* Chat header */}
            <div className="p-4 border-b flex justify-between items-center bg-emerald-600 text-white rounded-t-lg">
                <h3 className="font-semibold">Trip Assistant</h3>
                <Button
                    onClick={onClose}
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-white hover:bg-emerald-700"
                >
                    <X size={18} />
                </Button>
            </div>

            {/* Chat messages */}
            <div 
                className="flex-1 overflow-y-auto p-4 space-y-4"
                onScroll={() => {
                    // When user scrolls manually, stop auto-scrolling
                    if (messagesEndRef.current) {
                        const chatContainer = messagesEndRef.current.parentElement;
                        if (chatContainer) {
                            const isAtBottom = 
                                chatContainer.scrollHeight - chatContainer.scrollTop <= chatContainer.clientHeight + 100;
                            setShouldScroll(isAtBottom);
                        }
                    }
                }}
            >
                {messages.map((message, index) => (
                    <div
                        key={index}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-[80%] rounded-lg p-3 ${message.role === 'user'
                                ? 'bg-emerald-600 text-white rounded-tr-none'
                                : 'bg-gray-100 text-gray-800 rounded-tl-none'
                                }`}
                        >
                            {message.content}
                        </div>
                    </div>
                ))}

                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-gray-100 text-gray-800 rounded-lg rounded-tl-none p-3">
                            <Loader className="h-5 w-5 animate-spin" />
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input form */}
            <form onSubmit={handleSubmit} className="p-3 border-t flex items-center">
                <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e: { target: { value: SetStateAction<string>; }; }) => setInputValue(e.target.value)}
                    placeholder="Ask about your trip..."
                    className="flex-1 border rounded-l-md py-2 px-3 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    disabled={isLoading}
                />
                <Button
                    type="submit"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-none rounded-e-lg py-2 px-4 h-full"
                    disabled={isLoading || inputValue.trim() === ''}
                >
                    <Send size={18} />
                </Button>
            </form>
        </div>
    );
};
// 
// 
//      BUTTON COMPONENT
// 
// 


interface ChatButtonProps {
    trip: TripType;
}

// Fixed ChatButton Component
export const ChatButton = ({ trip }: ChatButtonProps) => {
    const [isChatOpen, setIsChatOpen] = useState(false);
    const { setTripContext } = useChat();
    const [hasSetContext, setHasSetContext] = useState(false);

    // Extract location from trip data
    const extractTripLocation = (): string => {
        // Try to determine the main location from the trip title or the first stop
        if (trip.days && Object.keys(trip.days).length > 0) {
            // Look through all days and time periods to find location names
            for (const dayNum in trip.days) {
                const day = trip.days[dayNum];
                for (const period of ['morning', 'afternoon', 'evening']) {
                    const stops = day[period as keyof typeof day];
                    if (stops && Array.isArray(stops) && stops.length > 0) {
                        for (const stop of stops) {
                            if (stop.name && stop.name.trim() !== '') {
                                return stop.name.split(',')[0]; // Use first part before comma
                            }
                        }
                    }
                }
            }
        }
        
        // Fall back to the trip title
        return trip.title;
    };

    // Extract all stops from the trip
    const extractTripStops = (): string[] => {
        const stops: string[] = [];
        
        if (trip.days) {
            for (const dayNum in trip.days) {
                const day = trip.days[dayNum];
                for (const period of ['morning', 'afternoon', 'evening']) {
                    const periodStops = day[period as keyof typeof day];
                    if (periodStops && Array.isArray(periodStops)) {
                        for (const stop of periodStops) {
                            if (stop.name && stop.name.trim() !== '') {
                                stops.push(stop.name);
                            }
                        }
                    }
                }
            }
        }
        
        return stops;
    };

    // Set trip context only when chat is first opened
    useEffect(() => {
        if (isChatOpen && !hasSetContext && trip) {
            const location = extractTripLocation();
            const stops = extractTripStops();
            
            setTripContext({
                title: trip.title,
                startDate: trip.start_date,
                endDate: trip.end_date,
                location: location,
                stops: stops,
                notes: trip.notes
            });
            
            setHasSetContext(true);
        }
    }, [isChatOpen, hasSetContext, trip]);

    const toggleChat = () => {
        setIsChatOpen(!isChatOpen);
        
        // Reset context flag when closing chat
        if (isChatOpen) {
            setHasSetContext(false);
        }
    };

    return (
        <>
            <Button
                onClick={toggleChat}
                className="fixed bottom-4 right-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full p-4 shadow-lg z-40"
                aria-label="Open chat assistant"
            >
                <MessageSquare size={24} />
            </Button>
            
            <ChatComponent 
                isOpen={isChatOpen} 
                onClose={() => {
                    setIsChatOpen(false);
                    setHasSetContext(false);
                }} 
            />
        </>
    );
};