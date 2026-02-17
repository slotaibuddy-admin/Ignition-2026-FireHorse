export default function GenerateButton({ onClick, isLoading }) {
  return (
    <button
      className="fire-button flex items-center gap-3 mx-auto"
      onClick={onClick}
      disabled={isLoading}
    >
      {isLoading ? (
        <>
          <div className="spinner"></div>
          <span>Generating...</span>
        </>
      ) : (
        <span>Generate Cyber Module</span>
      )}
    </button>
  );
}
