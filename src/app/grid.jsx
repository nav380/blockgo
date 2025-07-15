export default function Grid({ grid, gridWidth }) {
    return (
        <div
        className="grid gap-[2px] bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 p-2 rounded-2xl shadow-2xl border border-gray-600"
        style={{
          gridTemplateColumns: `repeat(${gridWidth}, 32px)`,
          gridTemplateRows: `repeat(${grid.length / gridWidth}, 32px)`
        }}
      >
        {grid.map((cell, idx) => (
          <div
            key={idx}
            className={`w-[32px] h-[32px] rounded-lg border ${
              cell
                ? 'bg-gradient-to-br from-blue-400 to-blue-600 shadow-inner border-blue-300'
                : 'bg-gray-800 border-gray-700'
            }`}
          ></div>
        ))}
      </div>
      
    );
  }
  