import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Slide,
  styled,
  keyframes
} from '@mui/material';
import {
  Close as CloseIcon,
  CheckCircle,
  LocalFlorist
} from '@mui/icons-material';
import { motion } from 'framer-motion';

// 花朵飘落动画
const flowerFall = keyframes`
  0% {
    transform: translateY(-100px) rotate(0deg);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  100% {
    transform: translateY(100px) rotate(360deg);
    opacity: 0;
  }
`;

// 花朵装饰元素
const FlowerDecoration = styled(Box)(({ theme }) => ({
  position: 'absolute',
  width: '8px',
  height: '8px',
  color: '#D4AF37',
  animation: `${flowerFall} 2s ease-in-out infinite`,
  pointerEvents: 'none',
  zIndex: -1,
}));

interface FlowerIconProps {
  delay: number;
  left: string;
}

const FlowerIcon: React.FC<FlowerIconProps> = ({ delay, left }) => (
  <FlowerDecoration
    sx={{
      left,
      animationDelay: `${delay}s`,
      fontSize: { xs: '14px', sm: '16px' }
    }}
  >
    🌸
  </FlowerDecoration>
);

// 通知容器样式
const NotificationContainer = styled(Box)(({ theme }) => ({
  position: 'fixed',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  zIndex: 9999,
  pointerEvents: 'auto',
}));

const NotificationBox = styled(motion.div)(({ theme }) => ({
  background: 'linear-gradient(135deg, #1B3A2B 0%, #2A5F4E 100%)',
  border: `2px solid #D4AF37`,
  borderRadius: '16px',
  padding: '20px 24px',
  minWidth: '280px',
  maxWidth: '360px',
  boxShadow: `
    0 8px 32px rgba(27, 58, 43, 0.3),
    0 4px 12px rgba(212, 175, 55, 0.2),
    inset 0 1px 0 rgba(244, 228, 193, 0.1)
  `,
  position: 'relative',
  overflow: 'hidden',
}));

const ContentBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
  position: 'relative',
  zIndex: 1,
}));

const IconWrapper = styled(Box)(({ theme }) => ({
  width: '48px',
  height: '48px',
  background: 'linear-gradient(135deg, #D4AF37, #F4E4C1)',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  boxShadow: '0 4px 12px rgba(212, 175, 55, 0.3)',
}));

const TextBox = styled(Box)(({ theme }) => ({
  flex: 1,
  minWidth: 0,
}));

const CloseButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  top: '8px',
  right: '8px',
  color: '#F4E4C1',
  opacity: 0.7,
  '&:hover': {
    opacity: 1,
    backgroundColor: 'rgba(244, 228, 193, 0.1)',
  },
  width: '32px',
  height: '32px',
  padding: 0,
}));

interface AddedToCartNotificationProps {
  open: boolean;
  productName?: string;
  onClose: () => void;
  autoHideDuration?: number;
}

const AddedToCartNotification: React.FC<AddedToCartNotificationProps> = ({
  open,
  productName,
  onClose,
  autoHideDuration = 2500
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (open) {
      setIsVisible(true);

      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300); // 等待退出动画完成
      }, autoHideDuration);

      return () => clearTimeout(timer);
    }
  }, [open, autoHideDuration, onClose]);

  if (!open) return null;

  return (
    <NotificationContainer>
      <Slide in={isVisible} direction="down" timeout={300}>
        <NotificationBox
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 25
          }}
        >
          {/* 花朵装饰背景 */}
          <FlowerIcon delay={0} left="20%" />
          <FlowerIcon delay={0.3} left="40%" />
          <FlowerIcon delay={0.6} left="60%" />
          <FlowerIcon delay={0.9} left="80%" />

          <ContentBox>
            <IconWrapper>
              <CheckCircle
                sx={{
                  color: '#1B3A2B',
                  fontSize: '28px',
                  fontWeight: 'bold'
                }}
              />
            </IconWrapper>

            <TextBox>
              <Typography
                variant="h6"
                sx={{
                  color: '#D4AF37',
                  fontWeight: 'bold',
                  fontSize: '16px',
                  mb: 0.5,
                  lineHeight: 1.3
                }}
              >
                已加入购物车 🌺
              </Typography>

              {productName && (
                <Typography
                  variant="body2"
                  sx={{
                    color: '#F4E4C1',
                    opacity: 0.9,
                    fontSize: '13px',
                    lineHeight: 1.4
                  }}
                >
                  {productName}
                </Typography>
              )}
            </TextBox>
          </ContentBox>

          <CloseButton onClick={onClose} size="small">
            <CloseIcon fontSize="small" />
          </CloseButton>
        </NotificationBox>
      </Slide>
    </NotificationContainer>
  );
};

export default AddedToCartNotification;