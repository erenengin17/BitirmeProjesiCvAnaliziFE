import React from "react";
import { Tag } from "antd";

export default function SelectableTagGroup({
  title,
  options = [],
  selectedValues = [],
  onChange,
}) {
  const toggleValue = (value) => {
    const exists = selectedValues.includes(value);

    if (exists) {
      onChange(selectedValues.filter((item) => item !== value));
    } else {
      onChange([...selectedValues, value]);
    }
  };

  return (
    <div style={{ marginBottom: 20 }}>
      <div
        style={{
          fontWeight: 600,
          marginBottom: 10,
          color: "#111827",
          fontSize: 15,
        }}
      >
        {title}
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
        {options.map((item) => {
          const isSelected = selectedValues.includes(item);

          return (
            <Tag
              key={item}
              onClick={() => toggleValue(item)}
              style={{
                cursor: "pointer",
                padding: "8px 14px",
                borderRadius: 999,
                fontSize: 14,
                userSelect: "none",
                border: isSelected ? "1px solid #3940c1" : "1px solid #d9e1f2",
                background: isSelected ? "rgba(57,64,193,0.10)" : "#fff",
                color: isSelected ? "#3940c1" : "#4b5563",
                fontWeight: isSelected ? 600 : 500,
                transition: "all 0.2s ease",
              }}
            >
              {item}
            </Tag>
          );
        })}
      </div>
    </div>
  );
}