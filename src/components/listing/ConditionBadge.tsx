export function ConditionBadge({ condition }: { condition: string }) {
  const colors: Record<string, string> = {
    Mint: 'bg-emerald-500/20 text-emerald-400',
    Excellent: 'bg-blue-500/20 text-blue-400',
    Good: 'bg-yellow-500/20 text-yellow-400',
    Fair: 'bg-zinc-500/20 text-zinc-400',
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${colors[condition] || 'bg-zinc-500/20'}`}>
      {condition}
    </span>
  );
}
