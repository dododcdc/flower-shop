import React from 'react';
import { Box, useTheme } from '@mui/material';
import LoginForm from './LoginForm';
import { motion } from 'framer-motion';

const LoginPage: React.FC = () => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100%',
        position: 'relative',
        overflow: 'hidden',
        background: `linear-gradient(135deg, ${theme.palette.secondary.dark} 0%, ${theme.palette.secondary.main} 50%, ${theme.palette.primary.dark} 100%)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Dynamic Floating Flowers Background */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          overflow: 'hidden',
          zIndex: 0,
        }}
      >
        {[...Array(60)].map((_, i) => {
          // 30% chance of being a large flower
          const isLarge = Math.random() < 0.3;
          const size = isLarge
            ? Math.random() * 60 + 60 + 'px' // Large: 60px - 120px
            : Math.random() * 20 + 15 + 'px'; // Small: 15px - 35px

          return (
            <Box
              key={i}
              component={motion.div}
              initial={{
                x: Math.random() * 100 + 'vw',
                y: Math.random() * 120 + 'vh',
                opacity: 0,
                scale: 0.5,
                rotate: 0
              }}
              animate={{
                y: [null, Math.random() * -120 + 'vh'],
                opacity: [0, isLarge ? 0.6 : 0.8, isLarge ? 0.6 : 0.8, 0], // Large flowers slightly more transparent
                rotate: 360,
              }}
              transition={{
                duration: Math.random() * 30 + 20,
                repeat: Infinity,
                ease: "linear",
                delay: Math.random() * 10
              }}
              sx={{
                position: 'absolute',
                fontSize: size,
                filter: isLarge ? 'blur(2px)' : 'blur(0.5px)', // Blur large flowers more for depth
                userSelect: 'none',
                zIndex: isLarge ? 0 : 1, // Large flowers in background
              }}
            >
              {['🌹', '🌺', '🌸', '🌼', '🌻', '🌷', '🪷', '🏵️', '💐', '🥀'][Math.floor(Math.random() * 10)]}
            </Box>
          );
        })}
      </Box>

      {/* Gradient Overlay to ensure text readability */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.1) 100%)`,
          backdropFilter: 'blur(3px)',
          zIndex: 0,
        }}
      />

      {/* Main Content Container */}
      <Box
        component={motion.div}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        sx={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          maxWidth: 500,
          mx: 3,
        }}
      >
        <LoginForm />
      </Box>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-20px) rotate(1deg); }
          66% { transform: translateY(20px) rotate(-1deg); }
        }

        @keyframes sparkle {
          0% { transform: translateY(0px) translateX(0px); }
          100% { transform: translateY(-100px) translateX(-50px); }
        }
      `}</style>
    </Box>
  );
};

export default LoginPage;
