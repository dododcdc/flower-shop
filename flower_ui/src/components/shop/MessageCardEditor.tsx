import React, { useState } from 'react';
import {
    Box,
    TextField,
    Typography,
    RadioGroup,
    FormControlLabel,
    Radio,
    Paper,
    Grid,
    useTheme,
} from '@mui/material';
import { motion } from 'framer-motion';

// 卡片风格定义
const CARD_STYLES = [
    {
        id: 'simple',
        name: '简约白',
        bg: '#ffffff',
        textColor: '#333333',
        fontFamily: '"Ma Shan Zheng", cursive', // 假设引入了手写体，如果没有则回退
        border: '1px solid #e0e0e0',
        shadow: '0 4px 12px rgba(0,0,0,0.05)',
    },
    {
        id: 'romantic',
        name: '浪漫粉',
        bg: 'linear-gradient(135deg, #fff0f5 0%, #ffe4e1 100%)',
        textColor: '#d45d79',
        fontFamily: '"Ma Shan Zheng", cursive',
        border: 'none',
        shadow: '0 8px 24px rgba(255, 182, 193, 0.3)',
    },
    {
        id: 'business',
        name: '商务金',
        bg: '#1B3A2B',
        textColor: '#D4AF37',
        fontFamily: '"Noto Serif SC", serif',
        border: '2px solid #D4AF37',
        shadow: '0 8px 24px rgba(27, 58, 43, 0.4)',
    },
];

interface MessageCardEditorProps {
    content: string;
    sender: string;
    onContentChange: (value: string) => void;
    onSenderChange: (value: string) => void;
}

const MessageCardEditor: React.FC<MessageCardEditorProps> = ({
    content,
    sender,
    onContentChange,
    onSenderChange,
}) => {
    const [selectedStyle, setSelectedStyle] = useState(CARD_STYLES[0]!);

    const handleStyleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const styleId = event.target.value;
        const style = CARD_STYLES.find((s) => s.id === styleId);
        if (style) {
            setSelectedStyle(style);
        }
    };

    return (
        <Grid container spacing={4}>
            {/* 左侧：编辑区域 */}
            <Grid size={{ xs: 12, md: 6 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <Box>
                        <Typography variant="subtitle2" gutterBottom>
                            选择卡片风格
                        </Typography>
                        <RadioGroup row value={selectedStyle.id} onChange={handleStyleChange}>
                            {CARD_STYLES.map((style) => (
                                <FormControlLabel
                                    key={style.id}
                                    value={style.id}
                                    control={
                                        <Radio
                                            sx={{
                                                color: style.id === 'business' ? '#1B3A2B' : style.textColor,
                                                '&.Mui-checked': {
                                                    color: style.id === 'business' ? '#1B3A2B' : style.textColor,
                                                },
                                            }}
                                        />
                                    }
                                    label={style.name}
                                />
                            ))}
                        </RadioGroup>
                    </Box>

                    <TextField
                        label="祝福语"
                        multiline
                        rows={4}
                        placeholder="写下您想说的话..."
                        value={content}
                        onChange={(e) => onContentChange(e.target.value)}
                        fullWidth
                        helperText={`${content.length}/200`}
                    />

                    <TextField
                        label="署名"
                        placeholder="例如：爱你的 Tom"
                        value={sender}
                        onChange={(e) => onSenderChange(e.target.value)}
                        fullWidth
                    />
                </Box>
            </Grid>

            {/* 右侧：预览区域 */}
            <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="subtitle2" gutterBottom sx={{ textAlign: 'center' }}>
                    卡片预览
                </Typography>
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        minHeight: 300,
                        bgcolor: '#f5f5f5',
                        borderRadius: 2,
                        p: 2,
                        backgroundImage: 'radial-gradient(#e0e0e0 1px, transparent 1px)',
                        backgroundSize: '20px 20px',
                    }}
                >
                    <motion.div
                        layout
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    >
                        <Paper
                            elevation={0}
                            sx={{
                                width: 320,
                                height: 220,
                                p: 4,
                                background: selectedStyle.bg,
                                border: selectedStyle.border,
                                boxShadow: selectedStyle.shadow,
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                position: 'relative',
                                overflow: 'hidden',
                            }}
                        >
                            {/* 装饰元素 */}
                            <Box
                                sx={{
                                    position: 'absolute',
                                    top: -20,
                                    right: -20,
                                    width: 100,
                                    height: 100,
                                    borderRadius: '50%',
                                    background: 'rgba(255,255,255,0.1)',
                                    zIndex: 0,
                                }}
                            />

                            <Typography
                                variant="body1"
                                sx={{
                                    color: selectedStyle.textColor,
                                    fontFamily: selectedStyle.fontFamily,
                                    fontSize: '18px',
                                    lineHeight: 1.6,
                                    whiteSpace: 'pre-wrap',
                                    zIndex: 1,
                                    minHeight: 100,
                                }}
                            >
                                {content || '（请输入祝福语）'}
                            </Typography>

                            <Typography
                                variant="body2"
                                sx={{
                                    color: selectedStyle.textColor,
                                    fontFamily: selectedStyle.fontFamily,
                                    fontSize: '16px',
                                    textAlign: 'right',
                                    mt: 2,
                                    zIndex: 1,
                                    fontStyle: 'italic',
                                }}
                            >
                                —— {sender || '（署名）'}
                            </Typography>
                        </Paper>
                    </motion.div>
                </Box>
            </Grid>
        </Grid>
    );
};

export default MessageCardEditor;
