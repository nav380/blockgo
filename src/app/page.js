'use client';

import { useEffect, useState, useRef } from 'react';
import Grid from './grid';
import Block from './block';

export default function Home() {
  const gridSize = 20; // taller grid
  const gridWidth = 20;
  const [grid, setGrid] = useState(Array(gridSize * gridWidth).fill(0));
  const [currentBlock, setCurrentBlock] = useState({ shape: [], x: 3, y: 0 });
  const [gameOver, setGameOver] = useState(false);
  const intervalRef = useRef(null);

  const blocks = [
    [[1, 1, 1, 1]],                  // I
    [[1, 1], [1, 1]],                // O
    [[0, 1, 0], [1, 1, 1]],          // T
    [[1, 0, 0], [1, 1, 1]],          // L
    [[0, 0, 1], [1, 1, 1]],          // J
    [[1, 1, 0], [0, 1, 1]],          // S
    [[0, 1, 1], [1, 1, 0]],          // Z
    [[1, 1, 1], [1, 0, 0]],          // Big L (4 block)
    [[1, 1, 1], [0, 0, 1]],          // Reverse Big L
    [[1, 1, 1], [0, 1, 0]],          // Plus shape
    [[0, 1, 0], [1, 1, 1], [0, 1, 0]],// Fat T
    [[1, 1, 1, 0], [0, 0, 1, 1]],    // ZigZag extended
    [[1, 1, 1, 1, 1]],               // Long 5-block line
    [[1], [1], [1], [1], [1]],       // Vertical 5-block line
    [[1, 1, 1], [0, 1, 1]],          // Hook shape
    [[0, 1, 1], [1, 1, 0]],          // Reverse hook
    [[1, 0], [1, 1], [1, 0]],        // Small fork
    [[0, 1], [1, 1], [0, 1]],        // Reverse small fork
  ];


  // Create a new falling block
  function spawnBlock() {
    const shape = blocks[Math.floor(Math.random() * blocks.length)];
    setCurrentBlock({ shape, x: 3, y: 0 });
  }

  // Merge block into grid
  function mergeBlock(tempGrid, shape, x, y) {
    const newGrid = [...tempGrid];
    for (let row = 0; row < shape.length; row++) {
      for (let col = 0; col < shape[row].length; col++) {
        if (shape[row][col]) {
          const index = (y + row) * gridWidth + (x + col);
          newGrid[index] = 1;
        }
      }
    }
    return newGrid;
  }

  // Check collision
  function hasCollision(shape, x, y) {
    for (let row = 0; row < shape.length; row++) {
      for (let col = 0; col < shape[row].length; col++) {
        if (shape[row][col]) {
          const newX = x + col;
          const newY = y + row;
          if (
            newX < 0 || newX >= gridWidth || newY >= gridSize ||
            grid[newY * gridWidth + newX]
          ) {
            return true;
          }
        }
      }
    }
    return false;
  }

  // Lock block into grid
  function lockBlock() {
    // Merge the current block into the grid
    let mergedGrid = mergeBlock(grid, currentBlock.shape, currentBlock.x, currentBlock.y);

    // Clear any full rows and get updated grid
    let { grid: clearedGrid, rowsCleared } = clearFullRows(mergedGrid, gridWidth, gridSize);

    setGrid(clearedGrid);

    // OPTIONAL: update score
    if (rowsCleared > 0) {
      console.log(`Cleared ${rowsCleared} rows!`);
      // setScore(prev => prev + rowsCleared * 100);
    }

    // Check if new block can spawn (if not, game over)
    if (hasCollision(currentBlock.shape, 3, 0)) {
      setGameOver(true);
      clearInterval(intervalRef.current);
    } else {
      spawnBlock();
    }
  }


  // Clear full rows
  function clearRows(tempGrid) {
    let newGrid = [...tempGrid];
    for (let y = 0; y < gridSize; y++) {
      const row = newGrid.slice(y * gridWidth, (y + 1) * gridWidth);
      if (row.every(cell => cell === 1)) {
        newGrid.splice(y * gridWidth, gridWidth);
        newGrid.unshift(...Array(gridWidth).fill(0));
      }
    }
    setGrid(newGrid);
  }

  // Move block down
  function drop() {
    if (!hasCollision(currentBlock.shape, currentBlock.x, currentBlock.y + 1)) {
      setCurrentBlock(prev => ({ ...prev, y: prev.y + 1 }));
    } else {
      lockBlock();
    }
  }

  // Rotate block
  function rotate(shape) {
    return shape[0].map((_, i) => shape.map(row => row[i]).reverse());
  }

  // Handle keyboard controls
  function handleKeyDown(e) {
    if (gameOver) return;
    if (e.key === 'ArrowLeft') {
      if (!hasCollision(currentBlock.shape, currentBlock.x - 1, currentBlock.y)) {
        setCurrentBlock(prev => ({ ...prev, x: prev.x - 1 }));
      }
    } else if (e.key === 'ArrowRight') {
      if (!hasCollision(currentBlock.shape, currentBlock.x + 1, currentBlock.y)) {
        setCurrentBlock(prev => ({ ...prev, x: prev.x + 1 }));
      }
    } else if (e.key === 'ArrowDown') {
      drop();
    } else if (e.key === 'ArrowUp') {
      const rotated = rotate(currentBlock.shape);
      if (!hasCollision(rotated, currentBlock.x, currentBlock.y)) {
        setCurrentBlock(prev => ({ ...prev, shape: rotated }));
      }
    }
  }

  // Start falling
  useEffect(() => {
    if (!gameOver) {
      intervalRef.current = setInterval(drop, 500);
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      clearInterval(intervalRef.current);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentBlock, grid, gameOver]);

  // Start game
  useEffect(() => {
    spawnBlock();
  }, []);

  // Combine grid and falling block for render
  const displayGrid = mergeBlock(grid, currentBlock.shape, currentBlock.x, currentBlock.y);

  return (
    <main className="flex flex-col md:flex-row gap-8 items-start justify-center min-h-screen bg-gray-900 p-6 text-white">
      {/* Game Board */}
      <div className="flex flex-col items-center">
        <h1 className="text-3xl font-bold mb-4 text-cyan-400">Block Go !!</h1>
        {gameOver && (
          <div className="text-red-500 text-xl mb-4 font-semibold">
            Game Over!
          </div>
        )}
        <Grid grid={displayGrid} gridWidth={gridWidth} />
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl shadow-lg hover:scale-105 transition"
        >
          Restart
        </button>
      </div>

      {/* Sidebar */}
      <div className="flex flex-col items-center bg-gray-800 p-4 rounded-xl shadow-lg w-48">
        <h2 className="text-xl font-semibold mb-2 text-green-400">Next Shape</h2>
        <Block block={currentBlock.shape} />
        <h3 className="text-lg font-semibold mt-6 text-yellow-300">Controls</h3>
        <ul className="text-sm mt-2 space-y-1">
          <li>⬅️ Left Arrow - Move Left</li>
          <li>➡️ Right Arrow - Move Right</li>
          <li>⬆️ Up Arrow - Rotate</li>
          <li>⬇️ Down Arrow - Soft Drop</li>
          <li>␣ Space - Hard Drop</li>
        </ul>
      </div>
    </main>

  );
}

function clearFullRows(grid, gridWidth, gridHeight) {
  let newGrid = [...grid];
  let rowsCleared = 0;

  // Loop through each row from bottom up
  for (let row = gridHeight - 1; row >= 0; row--) {
    const rowStart = row * gridWidth;
    const rowEnd = rowStart + gridWidth;
    const rowCells = newGrid.slice(rowStart, rowEnd);

    // Check if row is completely filled
    const isFull = rowCells.every(cell => cell === 1);

    if (isFull) {
      rowsCleared++;

      // Remove the full row
      newGrid.splice(rowStart, gridWidth);

      // Add a new empty row at the top
      newGrid.unshift(...Array(gridWidth).fill(0));

      // Since rows moved down, check same row index again
      row++;
    }
  }

  return { grid: newGrid, rowsCleared };
}
