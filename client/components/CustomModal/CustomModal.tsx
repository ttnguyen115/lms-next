import { Box, Modal } from "@mui/material";
import React from "react";

type Props = {
    open: boolean;
    setOpen: (open: boolean) => void;
    activeItem: number;
    component: any;
    setRoute?: (route: string) => void;
};

const CustomModal: React.FC<Props> = ({
    open,
    setOpen,
    activeItem,
    setRoute,
    component: Component,
}) => {
    return (
        <Modal
            open={open}
            onClose={() => setOpen(false)}
            disableScrollLock
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >
            <Box className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[450px] bg-white dark:bg-slate-900 rounded-[8px] shadow p-4 outline-none">
                <Component setOpen={setOpen} setRoute={setRoute} />
            </Box>
        </Modal>
    );
};

export default CustomModal;
