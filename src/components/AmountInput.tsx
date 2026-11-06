import { formatUnits } from "viem";
import { TOKEN_SYMBOL } from "@/lib/foxysium-constants";

export default function AmountInput({
  id,
  label,
  value,
  onChange,
  max,
  decimals = 18,
  symbol = `$${TOKEN_SYMBOL}`,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  max?: bigint;
  decimals?: number;
  symbol?: string;
}) {
  return (
    <div>
      <div className="flex justify-between">
        <label className="label" htmlFor={id}>
          {label}
        </label>
        {max !== undefined && (
          <span className="text-[14px] text-haze num">
            Available {Number(formatUnits(max, decimals)).toLocaleString("en-US", { maximumFractionDigits: 2 })}
          </span>
        )}
      </div>
      <div className="flex items-center gap-2 field !p-1.5 !pl-3.5">
        <input
          id={id}
          inputMode="decimal"
          autoComplete="off"
          placeholder="0.0"
          className="flex-1 min-w-0 bg-transparent outline-none text-xl font-bold num"
          value={value}
          onChange={(e) => {
            const v = e.target.value.replace(",", ".");
            if (/^\d*\.?\d*$/.test(v)) onChange(v);
          }}
        />
        <span className="text-haze font-semibold">{symbol}</span>
        {max !== undefined && (
          <button type="button" className="btn btn-sm btn-ghost !min-h-[34px]" onClick={() => onChange(formatUnits(max, decimals))}>
            Max
          </button>
        )}
      </div>
    </div>
  );
}
