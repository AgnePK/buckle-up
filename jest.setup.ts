import "@testing-library/jest-dom";
// Mock for react-dnd drag and drop testing
jest.mock('react-dnd', () => ({
    useDrag: () => [{ isDragging: false }, jest.fn()],
    useDrop: () => [{ isOver: false }, jest.fn()],
    DndProvider: ({ children }: { children: React.ReactNode }) => children
}));
  
  // Mock for react-dnd-html5-backend
  jest.mock('react-dnd-html5-backend', () => ({}));