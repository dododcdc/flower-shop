import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  keyframes,
  styled,
} from '@mui/material';
import {
  Check as CheckIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

// 成功标记容器
const SuccessMarkerContainer = styled(Box)(({ theme }) => ({
  position: 'fixed',
  top: '-40px',
  left: '50%',
  transform: 'translateX(-50%)',
  zIndex: 1000,
  pointerEvents: 'none',
}));

// 成功标记样式
const SuccessMarker = styled(motion.div)(({ theme }) => ({
  background: 'linear-gradient(135deg, #4CAF50, #66BB6A)',
  color: 'white',
  borderRadius: '50%',
  width: '32px',
  height: '32px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: '0 4px 12px rgba(76, 175, 80, 0.4)',
}));

// 数字增加动画容器
const NumberIncreaseContainer = styled(Box)(({ theme }) => ({
  position: 'fixed',
  top: '-20px',
  left: '50%',
  transform: 'translateX(-50%)',
  zIndex: 999,
  pointerEvents: 'none',
}));

// 数字增加样式
const NumberIncrease = styled(motion.div)(({ theme }) => ({
  color: '#4CAF50',
  fontSize: '20px',
  fontWeight: 'bold',
  textShadow: '0 2px 4px rgba(76, 175, 80, 0.3)',
}));

// 添加到购物车的商品缩略图
const ProductThumbnail = styled(motion.div)(({ theme }) => ({
  position: 'fixed',
  width: '40px',
  height: '40px',
  borderRadius: '8px',
  backgroundColor: theme.palette.grey[100],
  border: '2px solid #D4AF37',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '20px',
  pointerEvents: 'none',
  zIndex: 998,
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
}));

interface CartFeedbackProps {
  trigger: boolean;
  productImage?: string;
  productName?: string;
  cartButtonRef?: React.RefObject<HTMLElement>;
}

const CartFeedback: React.FC<CartFeedbackProps> = ({
  trigger,
  productImage,
  productName,
  cartButtonRef,
}) => {
  const [showSuccess, setShowSuccess] = useState(false);
  const [showNumberIncrease, setShowNumberIncrease] = useState(false);
  const [showThumbnail, setShowThumbnail] = useState(false);
  const [thumbnailPosition, setThumbnailPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (trigger && cartButtonRef?.current) {
      const buttonRect = cartButtonRef.current.getBoundingClientRect();

      // 显示商品缩略图动画
      setThumbnailPosition({
        x: buttonRect.left + buttonRect.width / 2 - 20,
        y: buttonRect.top - 50,
      });
      setShowThumbnail(true);

      // 延迟显示成功标记
      setTimeout(() => {
        setShowSuccess(true);
      }, 400);

      // 延迟显示数字增加
      setTimeout(() => {
        setShowNumberIncrease(true);
      }, 200);

      // 清理动画
      setTimeout(() => {
        setShowThumbnail(false);
        setShowSuccess(false);
        setShowNumberIncrease(false);
      }, 1200);
    }
  }, [trigger, cartButtonRef]);

  // 获取花朵emoji
  const getFlowerEmoji = () => {
    if (productName?.includes('玫瑰')) return '🌹';
    if (productName?.includes('百合')) return '🌺';
    if (productName?.includes('康乃馨')) return '🌸';
    if (productName?.includes('向日葵')) return '🌻';
    return '🌺';
  };

  return (
    <>
      {/* 商品缩略图飘向购物车 */}
      {showThumbnail && (
        <ProductThumbnail
          initial={{
            scale: 0.8,
            opacity: 0,
            y: -20
          }}
          animate={{
            scale: 1,
            opacity: 1,
            y: 0
          }}
          exit={{
            scale: 0.6,
            opacity: 0,
            y: 30,
            x: 0
          }}
          transition={{
            duration: 0.8,
            ease: [0.4, 0.0, 0.2, 1],
          }}
          style={{
            left: `${thumbnailPosition.x}px`,
            top: `${thumbnailPosition.y}px`,
          }}
        >
          {getFlowerEmoji()}
        </ProductThumbnail>
      )}

      {/* 成功标记 */}
      {showSuccess && (
        <SuccessMarkerContainer>
          <SuccessMarker
            initial={{ scale: 0, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: -10 }}
            transition={{
              duration: 0.4,
              ease: [0.34, 1.56, 0.64, 1],
            }}
          >
            <CheckIcon sx={{ fontSize: 18 }} />
          </SuccessMarker>
        </SuccessMarkerContainer>
      )}

      {/* 数字增加动画 */}
      {showNumberIncrease && (
        <NumberIncreaseContainer>
          <NumberIncrease
            initial={{ scale: 0.5, opacity: 0, y: 5 }}
            animate={{ scale: 1.2, opacity: 1, y: -5 }}
            exit={{ scale: 0.8, opacity: 0, y: -15 }}
            transition={{
              duration: 0.6,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
          >
            +1
          </NumberIncrease>
        </NumberIncreaseContainer>
      )}
    </>
  );
};

export default CartFeedback;