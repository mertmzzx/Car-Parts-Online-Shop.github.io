import { useCallback, useMemo, useRef } from "react";

export default function PriceRangeSlider({
  min = 0,
  max = 1000,
  step = 1,
  valueMin,
  valueMax,
  onChange,
  onCommit,
}) {
  const minVal = Math.min(valueMin ?? min, valueMax ?? max);
  const maxVal = Math.max(valueMin ?? min, valueMax ?? max);

  const left = useMemo(() => ((minVal - min) / (max - min)) * 100, [minVal, min, max]);
  const width = useMemo(() => ((maxVal - minVal) / (max - min)) * 100, [minVal, maxVal, min, max]);

  const commit = useCallback(() => {
    onCommit?.(minVal, maxVal);
  }, [minVal, maxVal, onCommit]);

  const handleMinChange = (e) => {
    const v = Number(e.target.value);
    const vClamped = Math.min(v, maxVal);
    onChange?.(vClamped, maxVal);
  };

  const handleMaxChange = (e) => {
    const v = Number(e.target.value);
    const vClamped = Math.max(v, minVal);
    onChange?.(minVal, vClamped);
  };

  const minRef = useRef(null);
  const maxRef = useRef(null);

  return (
    <div className="price-range">
      <div className="pr-track">
        <div
          className="pr-highlight"
          style={{ left: `${left}%`, width: `${width}%` }}
        />
      </div>

      <input
        ref={minRef}
        type="range"
        min={min}
        max={max}
        step={step}
        value={minVal}
        onChange={handleMinChange}
        onMouseUp={commit}
        onTouchEnd={commit}
        onBlur={commit}
        aria-label="Minimum price"
        className="pr-input pr-input-min"
      />

      <input
        ref={maxRef}
        type="range"
        min={min}
        max={max}
        step={step}
        value={maxVal}
        onChange={handleMaxChange}
        onMouseUp={commit}
        onTouchEnd={commit}
        onBlur={commit}
        aria-label="Maximum price"
        className="pr-input pr-input-max"
      />
    </div>
  );
}
