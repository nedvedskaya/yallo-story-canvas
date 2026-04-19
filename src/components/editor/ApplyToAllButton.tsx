interface ApplyToAllButtonProps {
  onClick: () => void;
}

const ApplyToAllButton = ({ onClick }: ApplyToAllButtonProps) => (
  <div className="flex items-center justify-end">
    <button
      onClick={onClick}
      className="px-4 py-1.5 rounded-lg text-xs font-medium transition-opacity active:scale-95 active:opacity-80"
      style={{
        background: 'rgba(26,26,46,0.08)',
        border: '1px solid rgba(26,26,46,0.15)',
        color: '#1a1a2e',
      }}
    >
      Применить ко всем
    </button>
  </div>
);

export default ApplyToAllButton;
