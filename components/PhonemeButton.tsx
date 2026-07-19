import { getPhonemeHint } from "@/lib/phonemes";

type Props = {
  symbol: string;
  onClick: (symbol: string) => void;
  disabled?: boolean;
};

export default function PhonemeButton({
  symbol,
  onClick,
  disabled = false,
}: Props) {
  const hint = getPhonemeHint(symbol);
  return (
    <button
      type="button"
      className="phoneme-key"
      title={hint}
      aria-label={`${hint}. Add phoneme.`}
      onClick={() => onClick(symbol)}
      disabled={disabled}
    >
      <span>/{symbol}/</span>
      <small>{getPhonemeHint(symbol).split(" — ")[1] ?? symbol}</small>
    </button>
  );
}
