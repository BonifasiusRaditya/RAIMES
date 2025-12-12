import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

// Define stat item component for DRY principle
const StatItem = ({ label, value }) => (
  <div className="flex flex-col">
    <span className="text-sm font-semibold text-gray-900">{value}</span>
    <span className="text-xs text-gray-600">{label}</span>
  </div>
);

const TrailCard = React.forwardRef(
  (
    {
      className,
      imageUrl,
      mapImageUrl,
      title,
      location,
      difficulty,
      creators,
      distance,
      elevation,
      duration,
      ...props
    },
    ref
  ) => {
    return (
      <motion.div
        ref={ref}
        className={cn(
          "w-full max-w-sm overflow-hidden rounded-2xl bg-white text-gray-900 shadow-lg",
          className
        )}
        whileHover={{ y: -5, scale: 1.02 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        {...props}
      >
        {/* Top section with background image and content */}
        <div className="relative h-60 w-full">
          <img
            src={imageUrl}
            alt={title}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/30 to-transparent" />
          <div className="absolute bottom-0 left-0 flex w-full items-end justify-between p-4">
            <div className="text-white">
              <h3 className="text-xl font-bold">{title}</h3>
              <p className="text-sm text-white/90">{location}</p>
            </div>
          </div>
        </div>

        {/* Bottom section with trail details */}
        <div className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-raimes-purple">{difficulty}</p>
              <p className="text-xs text-gray-600">{creators}</p>
            </div>
            {/* Simple SVG or image representation of the trail map */}
            <img
              src={mapImageUrl}
              alt="Trail map"
              className="h-10 w-20 object-contain"
            />
          </div>
          <div className="my-4 h-px w-full bg-gray-200" />
          <div className="flex justify-between">
            <StatItem label="Distance" value={distance} />
            <StatItem label="Elevation" value={elevation} />
            <StatItem label="Duration" value={duration} />
          </div>
        </div>
      </motion.div>
    );
  }
);

TrailCard.displayName = "TrailCard";

export { TrailCard };
