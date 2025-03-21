// Mock for dnd testing since there is a token issue
module.exports = {
    useDrag: () => [{ isDragging: false }, jest.fn()],
    useDrop: () => [{ isOver: false }, jest.fn()],
    DndProvider: ({ children }) => children
  };