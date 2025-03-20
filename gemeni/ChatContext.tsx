'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { ChatMessage, TripContext, sendMessage } from '@/gemeni/services';
import { useSession } from '@/AuthContext';

interface ChatContextType {
    messages: ChatMessage[];
    isLoading: boolean;
    tripContext: TripContext | null;
    setTripContext: (context: TripContext) => void;
    sendUserMessage: (message: string) => Promise<void>;
    clearMessages: () => void;
}
interface ChatProviderProps { children: ReactNode; }

const ChatContext = createContext<ChatContextType | undefined>(undefined);


export function ChatProvider({ children }: ChatProviderProps) {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const [tripContext, setTripContextState] = useState<TripContext | null>(null);

    const { user } = useSession();

    //to fix rerendering issue
    // using useCallback to prevent recreation of function on every render
    const setTripContext = useCallback((context: TripContext) => {
        setTripContextState(context);
        
        // Add welcome message when trip context is set
        setMessages([
            {
                role: 'assistant',
                content: `Hello ${user?.displayName || 'traveler'}, I'm here to help you buckle up for ${context.title}. How can I help you today?`
            }
        ]);
    }, [user?.displayName]);

    const sendUserMessage = async (message: string) => {
        if (!tripContext) {
            console.error('Trip context not set');
            return;
        }

        // Add user message to the chat
        const userMessage: ChatMessage = { role: 'user', content: message };
        setMessages(prev => [...prev, userMessage]);
        setIsLoading(true);

        try {
            // Get a response from Gemini
            const response = await sendMessage(message, tripContext);

            // Add assistant response to the chat
            const assistantMessage: ChatMessage = { role: 'assistant', content: response };
            setMessages(prev => [...prev, assistantMessage]);
        } catch (error) {
            console.error('Error getting response:', error);

            // Add error message
            const errorMessage: ChatMessage = {
                role: 'assistant',
                content: 'Sorry, I ran into an error. Please try again later.'
            };

            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    // Use useCallback for clearMessages too
    const clearMessages = useCallback(() => {
        if (tripContext) {
            setMessages([
                {
                    role: 'assistant',
                    content: `Hello ${user?.displayName || 'traveler'}, I'm here to help you buckle up for ${tripContext.title}. How can I help you today?`
                }
            ]);
        } else {
            setMessages([]);
        }
    }, [tripContext]);

    const contextValue = {
        messages,
        isLoading,
        tripContext,
        setTripContext,
        sendUserMessage,
        clearMessages
    };

    return (
        <ChatContext.Provider value={contextValue}>
            {children}
        </ChatContext.Provider>
    );
}

export function useChat() {
    const context = useContext(ChatContext);
    if (context === undefined) {
        throw new Error('useChat must be used within a ChatProvider');
    }
    return context;
}