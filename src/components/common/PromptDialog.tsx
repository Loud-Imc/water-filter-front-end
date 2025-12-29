import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
} from '@mui/material';

interface PromptDialogProps {
    open: boolean;
    title: string;
    message: string;
    initialValue?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm: (value: string) => void;
    onCancel: () => void;
    inputType?: string;
}

const PromptDialog: React.FC<PromptDialogProps> = ({
    open,
    title,
    message,
    initialValue = '',
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    onConfirm,
    onCancel,
    inputType = 'text',
}) => {
    const [value, setValue] = useState(initialValue);

    useEffect(() => {
        if (open) {
            setValue(initialValue);
        }
    }, [open, initialValue]);

    const handleConfirm = () => {
        onConfirm(value);
    };

    return (
        <Dialog open={open} onClose={onCancel} maxWidth="sm" fullWidth>
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>
                <TextField
                    autoFocus
                    margin="dense"
                    label={message}
                    type={inputType}
                    fullWidth
                    variant="standard"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                            handleConfirm();
                        }
                    }}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onCancel} color="inherit">
                    {cancelLabel}
                </Button>
                <Button onClick={handleConfirm} variant="contained" color="primary">
                    {confirmLabel}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default PromptDialog;
