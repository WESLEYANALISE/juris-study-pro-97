
import React from "react";

interface VideoAulasAreasMenuProps {
  areas: string[];
  selectedArea: string;
  onSelectArea: (area: string) => void;
}

const VideoAulasAreasMenu: React.FC<VideoAulasAreasMenuProps> = ({
  areas,
  selectedArea,
  onSelectArea
}) => (
  <div className="flex gap-2 w-full overflow-x-auto py-1 px-1 scrollbar-hide mb-4">
    {areas.map(area => (
      <button
        key={area}
        className={`flex-shrink-0 px-4 py-2 rounded-full border text-[15px] font-semibold transition
          ${selectedArea === area
            ? "bg-[#F07373] text-white border-[#F07373]"
            : "bg-white text-[#F07373] border-[#F07373]"}
          `}
        style={{ minWidth: 80 }}
        onClick={() => onSelectArea(area)}
      >
        {area}
      </button>
    ))}
  </div>
);

export default VideoAulasAreasMenu;
