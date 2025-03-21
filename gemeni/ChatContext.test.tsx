import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ChatProvider, useChat } from '@/gemeni/ChatContext';
import { sendMessage } from '@/gemeni/services';
import { useSession } from '@/AuthContext';

// Mock the necessary dependencies
jest.mock('@/gemeni/services', () => ({
  sendMessage: jest.fn(),
  ChatMessage: jest.fn(),
  TripContext: jest.fn(),
}));

jest.mock('@/AuthContext', () => ({
  useSession: jest.fn(),
}));

// Create a test component that uses the useChat hook
const TestChatComponent = () => {
  const { 
    messages, 
    isLoading, 
    tripContext, 
    setTripContext, 
    sendUserMessage, 
    clearMessages 
  } = useChat();

  return (
    <div>
      <div data-testid="loading-state">{isLoading ? 'Loading' : 'Not Loading'}</div>
      <div data-testid="messages-count">{messages.length}</div>
      <div data-testid="trip-context">{tripContext ? tripContext.title : 'No Context'}</div>
      
      {messages.map((msg, index) => (
        <div key={index} data-testid={`message-${index}`}>
          <span data-testid={`role-${index}`}>{msg.role}</span>: 
          <span data-testid={`content-${index}`}>{msg.content}</span>
        </div>
      ))}
      
      <button 
        data-testid="set-context-button" 
        onClick={() => setTripContext({
          title: 'Test Trip',
          startDate: '2025-05-01',
          endDate: '2025-05-07',
          location: 'Dublin',
          stops: ['Temple Bar', 'Trinity College'],
          notes: 'Test notes'
        })}
      >
        Set Context
      </button>
      
      <button 
        data-testid="send-message-button" 
        onClick={() => sendUserMessage('Hello, AI!')}
        disabled={isLoading}
      >
        Send Message
      </button>
      
      <button 
        data-testid="clear-messages-button" 
        onClick={clearMessages}
      >
        Clear Messages
      </button>
    </div>
  );
};

describe('ChatContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock for useSession
    (useSession as jest.Mock).mockReturnValue({
      user: { uid: 'test-user', displayName: 'Test User' },
      isLoading: false,
    });
    
    // Default mock for sendMessage
    (sendMessage as jest.Mock).mockResolvedValue(
      "I'm here to help with your trip to Dublin. What would you like to know?"
    );
  });

  test('initializes with empty messages and no trip context', () => {
    render(
      <ChatProvider>
        <TestChatComponent />
      </ChatProvider>
    );
    
    expect(screen.getByTestId('messages-count')).toHaveTextContent('0');
    expect(screen.getByTestId('trip-context')).toHaveTextContent('No Context');
    expect(screen.getByTestId('loading-state')).toHaveTextContent('Not Loading');
  });

  test('sets trip context and adds welcome message', async () => {
    render(
      <ChatProvider>
        <TestChatComponent />
      </ChatProvider>
    );
    
    // Click the button to set context
    fireEvent.click(screen.getByTestId('set-context-button'));
    
    // Check if context was set
    expect(screen.getByTestId('trip-context')).toHaveTextContent('Test Trip');
    
    // Check if welcome message was added
    expect(screen.getByTestId('messages-count')).toHaveTextContent('1');
    expect(screen.getByTestId('role-0')).toHaveTextContent('assistant');
    expect(screen.getByTestId('content-0')).toHaveTextContent(/Hello Test User/);
    expect(screen.getByTestId('content-0')).toHaveTextContent(/Test Trip/);
  });

  test('sends user message and receives AI response', async () => {
    render(
      <ChatProvider>
        <TestChatComponent />
      </ChatProvider>
    );
    
    // Set context first (which adds a welcome message)
    fireEvent.click(screen.getByTestId('set-context-button'));
    
    // Send a message (this will add to the existing welcome message)
    fireEvent.click(screen.getByTestId('send-message-button'));
    
    // Check that loading state is set to true initially
    expect(screen.getByTestId('loading-state')).toHaveTextContent('Loading');
    
    // Wait for the response
    await waitFor(() => {
      expect(screen.getByTestId('loading-state')).toHaveTextContent('Not Loading');
    });
    
    // Verify that sendMessage was called with the correct parameters
    expect(sendMessage).toHaveBeenCalledWith(
      'Hello, AI!', 
      expect.objectContaining({ 
        title: 'Test Trip',
        location: 'Dublin'
      })
    );
    
    // Check that messages are displayed - we now have 3 messages:
    // 1. Welcome message from setTripContext
    // 2. User message "Hello, AI!"
    // 3. AI response
    expect(screen.getByTestId('messages-count')).toHaveTextContent('3');
    
    // Verify user message (now at index 1)
    expect(screen.getByTestId('role-1')).toHaveTextContent('user');
    expect(screen.getByTestId('content-1')).toHaveTextContent('Hello, AI!');
    
    // Verify assistant response (now at index 2)
    expect(screen.getByTestId('role-2')).toHaveTextContent('assistant');
    expect(screen.getByTestId('content-2')).toHaveTextContent("I'm here to help with your trip to Dublin");
  });

  test('handles error when sending message fails', async () => {
    // Mock sendMessage to throw an error
    (sendMessage as jest.Mock).mockRejectedValue(new Error('Network error'));
    
    render(
      <ChatProvider>
        <TestChatComponent />
      </ChatProvider>
    );
    
    // Set context first (adds welcome message)
    fireEvent.click(screen.getByTestId('set-context-button'));
    
    // Send a message
    fireEvent.click(screen.getByTestId('send-message-button'));
    
    // Wait for the error to be handled
    await waitFor(() => {
      expect(screen.getByTestId('loading-state')).toHaveTextContent('Not Loading');
    });
    
    // Check that messages are displayed - we now have 3 messages:
    // 1. Welcome message from setTripContext
    // 2. User message "Hello, AI!"
    // 3. Error message
    expect(screen.getByTestId('messages-count')).toHaveTextContent('3');
    
    // Verify the error message (now at index 2)
    expect(screen.getByTestId('role-2')).toHaveTextContent('assistant');
    expect(screen.getByTestId('content-2')).toHaveTextContent(/Sorry, I ran into an error/);
  });

  test('clears messages when clearMessages is called', () => {
    render(
      <ChatProvider>
        <TestChatComponent />
      </ChatProvider>
    );
    
    // Set context (which adds a welcome message)
    fireEvent.click(screen.getByTestId('set-context-button'));
    
    // Send a message
    fireEvent.click(screen.getByTestId('send-message-button'));
    
    // Wait for the response
    waitFor(() => {
      expect(screen.getByTestId('messages-count')).toHaveTextContent('3');
    });
    
    // Clear messages
    fireEvent.click(screen.getByTestId('clear-messages-button'));
    
    // Expect only the welcome message to remain if context exists
    expect(screen.getByTestId('messages-count')).toHaveTextContent('1');
    expect(screen.getByTestId('role-0')).toHaveTextContent('assistant');
    expect(screen.getByTestId('content-0')).toHaveTextContent(/Hello Test User/);
  });

  test('includes user name in welcome message if available', () => {
    // Mock user with displayName
    (useSession as jest.Mock).mockReturnValue({
      user: { uid: 'test-user', displayName: 'Jane Doe' },
      isLoading: false,
    });
    
    render(
      <ChatProvider>
        <TestChatComponent />
      </ChatProvider>
    );
    
    // Set context
    fireEvent.click(screen.getByTestId('set-context-button'));
    
    // Check welcome message content
    expect(screen.getByTestId('content-0')).toHaveTextContent(/Hello Jane Doe/);
  });

  test('uses "traveler" in welcome message if user name is not available', () => {
    // Mock user without displayName
    (useSession as jest.Mock).mockReturnValue({
      user: { uid: 'test-user' },
      isLoading: false,
    });
    
    render(
      <ChatProvider>
        <TestChatComponent />
      </ChatProvider>
    );
    
    // Set context
    fireEvent.click(screen.getByTestId('set-context-button'));
    
    // Check welcome message content
    expect(screen.getByTestId('content-0')).toHaveTextContent(/Hello traveler/);
  });
});