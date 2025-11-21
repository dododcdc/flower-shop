import React from 'react';
import { Box, SvgIcon, useTheme } from '@mui/material';
import { motion } from 'framer-motion';

interface FlowerPatternProps {
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  size?: number;
}

const FlowerPattern: React.FC<FlowerPatternProps> = ({
  position = 'top-left',
  size = 200
}) => {
  const theme = useTheme();

  const getPositionStyles = () => {
    switch (position) {
      case 'top-left':
        return { top: -50, left: -50 };
      case 'top-right':
        return { top: -50, right: -50 };
      case 'bottom-left':
        return { bottom: -50, left: -50 };
      case 'bottom-right':
        return { bottom: -50, right: -50 };
      default:
        return { top: -50, left: -50 };
    }
  };

  return (
    <Box
      sx={{
        position: 'absolute',
        ...getPositionStyles(),
        width: size,
        height: size,
        opacity: 0.1,
        pointerEvents: 'none',
        zIndex: 0,
      }}
    >
      <SvgIcon
        component={motion.svg}
        initial={{ rotate: 0 }}
        animate={{ rotate: 360 }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        viewBox="0 0 100 100"
        sx={{
          width: '100%',
          height: '100%',
          color: theme.palette.primary.main,
        }}
      >
        {/* Intricate Flower Pattern */}
        {[0, 30, 60, 90, 120, 150].map((rotation, index) => (
          <g key={index} transform={`rotate(${rotation} 50 50)`}>
            <motion.path
              d="M50 25 C52 20, 58 20, 60 25 C62 30, 60 35, 55 37 C52 38, 48 38, 45 37 C40 35, 38 30, 40 25 C42 20, 48 20, 50 25"
              fill={theme.palette.primary.main}
              opacity={0.3}
              initial={{ scale: 0.8 }}
              animate={{ scale: [0.8, 1.2, 0.8] }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
                delay: index * 0.3,
              }}
            />
          </g>
        ))}

        {/* Outer Petals */}
        {[15, 45, 75, 105, 135, 165, 195, 225, 255, 285, 315, 345].map((rotation, index) => (
          <g key={index} transform={`rotate(${rotation} 50 50)`}>
            <path
              d="M50 35 C52 30, 58 30, 60 35 C62 40, 60 45, 55 47 C52 48, 48 48, 45 47 C40 45, 38 40, 40 35 C42 30, 48 30, 50 35"
              fill={theme.palette.primary.light}
              opacity={0.2}
            />
          </g>
        ))}

        {/* Center Circle */}
        <circle
          cx="50"
          cy="50"
          r="15"
          fill="none"
          stroke={theme.palette.primary.main}
          strokeWidth="1"
          opacity={0.4}
        />

        <circle
          cx="50"
          cy="50"
          r="8"
          fill={theme.palette.primary.main}
          opacity={0.3}
        />

        {/* Decorative Lines */}
        {[0, 45, 90, 135].map((rotation) => (
          <line
            key={rotation}
            x1="50"
            y1="50"
            x2="50"
            y2="15"
            stroke={theme.palette.primary.main}
            strokeWidth="1"
            opacity={0.2}
            transform={`rotate(${rotation} 50 50)`}
          />
        ))}
      </SvgIcon>
    </Box>
  );
};

export default FlowerPattern;