import { Theme, type ThemeOverride } from "@lms/shared";
import { FONT_OPTIONS } from "../theme.js";

export function ThemeOverrideFields({
  value,
  onChange,
}: {
  value: ThemeOverride;
  onChange: (next: ThemeOverride) => void;
}) {
  const base = Theme.default();

  function setField<K extends keyof ThemeOverride>(key: K, fieldValue: ThemeOverride[K] | undefined) {
    const next = { ...value };
    if (fieldValue === undefined) delete next[key];
    else next[key] = fieldValue;
    onChange(next);
  }

  return (
    <div className="theme-fields">
      <div className="theme-field">
        <label>
          <input
            type="checkbox"
            checked={value.primaryColor === undefined}
            onChange={(e) => setField("primaryColor", e.target.checked ? undefined : base.primaryColor)}
          />
          Match site default accent color
        </label>
        {value.primaryColor !== undefined && (
          <input
            type="color"
            value={value.primaryColor}
            onChange={(e) => setField("primaryColor", e.target.value)}
          />
        )}
      </div>

      <div className="theme-field">
        <label>
          <input
            type="checkbox"
            checked={value.backgroundColor === undefined}
            onChange={(e) => setField("backgroundColor", e.target.checked ? undefined : base.backgroundColor)}
          />
          Match site default background color
        </label>
        {value.backgroundColor !== undefined && (
          <input
            type="color"
            value={value.backgroundColor}
            onChange={(e) => setField("backgroundColor", e.target.value)}
          />
        )}
      </div>

      <div className="theme-field">
        <label>
          <input
            type="checkbox"
            checked={value.fontFamily === undefined}
            onChange={(e) => setField("fontFamily", e.target.checked ? undefined : base.fontFamily)}
          />
          Match site default font
        </label>
        {value.fontFamily !== undefined && (
          <select value={value.fontFamily} onChange={(e) => setField("fontFamily", e.target.value)}>
            {FONT_OPTIONS.map((font) => (
              <option key={font.value} value={font.value}>
                {font.label}
              </option>
            ))}
          </select>
        )}
      </div>
    </div>
  );
}
