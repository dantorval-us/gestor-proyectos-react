import "./MenuUD.css"
import { useState } from "react";
import { IconButton, ListItemIcon, ListItemText, Menu, MenuItem } from "@mui/material";
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

function MenuUD ({ vertical, onUpdate, onDelete }) {

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClickMenu = async (e) => {
    e.preventDefault();
    setAnchorEl(e.currentTarget);
  };
  
  const handleUpdate = (e) => {
    handleClose(e);
    onUpdate();
  };

  const handleClose = async (e) => {
    e.preventDefault();
    setAnchorEl(null);
  };

  return (
    <>
      <IconButton className="btn-cuadrado" onClick={handleClickMenu}>
        {vertical === true ? <MoreVertIcon /> : <MoreHorizIcon />}
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
      >
        <MenuItem onClick={handleUpdate}>
          <ListItemIcon>
            <EditIcon />
          </ListItemIcon>
          <ListItemText>Renombrar</ListItemText>
        </MenuItem>
        <MenuItem className="eliminar" onClick={onDelete}>
          <ListItemIcon>
            <DeleteIcon />
          </ListItemIcon>
          <ListItemText>Eliminar</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );

};

export default MenuUD;