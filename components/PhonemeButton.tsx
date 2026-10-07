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
  const example = hint.split(" — ")[1] ?? symbol;

  return (
    <button
      type="button"
      className="phoneme-key"
      title={hint}
      onClick={() => onClick(symbol)}
      disabled={disabled}
    >
      <span>/{symbol}/</span>
      <small>{example}</small>
    </button>
  );
}
