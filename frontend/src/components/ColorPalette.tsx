import React from "react";

type ColorPaletteProps = {
  selectedColor: string;
  onColorChange: (color: string) => void;
};

const colors: string[] = [
  "#000000", "#FF0000", "#00FF00", "#0000FF",
  "#FFFF00", "#FFA500", "#800080", "#A52A2A",
  "#00FFFF", "#FFC0CB", "#808080", "#FFFFFF"
];

const ColorPalette: React.FC<ColorPaletteProps> = ({
  selectedColor,
  onColorChange
}) => {
  return (
    <div className="flex flex-wrap gap-2 p-2 bg-white shadow-md rounded-xl max-w-sm">
      {colors.map((color) => (
        <button
          key={color}
          className={`w-6 h-6 rounded-full border-2 transition-all duration-150 ${
            selectedColor === color ? "border-black scale-110" : "border-transparent"
          }`}
          style={{ backgroundColor: color }}
          onClick={() => onColorChange(color)}
        />
      ))}
    </div>
  );
};

export default ColorPalette;
