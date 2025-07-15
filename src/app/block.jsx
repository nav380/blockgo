export default function Block({ block }) {
    return (
      <div className="grid gap-1" style={{
        gridTemplateColumns: `repeat(${block[0]?.length || 1}, 30px)`
      }}>
        {block.flat().map((cell, idx) => (
          <div
            key={idx}
            className={`w-[30px] h-[30px] rounded ${
              cell ? 'bg-blue-400' : 'bg-transparent'
            }`}
          ></div>
        ))}
      </div>
    );
  }
  