import clsx from "clsx";
import React, { useState } from "react";
import {
  Grid,
  IconButton,
  makeStyles,
  Tooltip,
  Typography,
} from "@material-ui/core";
import { Delete, Add } from "@material-ui/icons";

const useStyles = makeStyles((theme) => {
  let borderColor;
  let borderColorHover;
  switch (theme.palette.type) {
    case "light": {
      borderColor = "rgba(0, 0, 0, 0.12)";
      borderColorHover = "rgba(103, 146, 255, 1)";
      break;
    }
    case "dark": {
      borderColor = "rgba(255, 255, 255, 0.12)";
      borderColorHover = "rgba(147, 176, 251, 1)";
      break;
    }
  }
  return {
    imageCard: {
      padding: theme.spacing(0.63),
      flex: "0 1 160px",
      margin: theme.spacing(1.25),
      overflow: "hidden",
      "&:hover": {
        cursor: "pointer",
      },
    },

    imageCard_image: {
      border: "1px solid",
      background: theme.palette.background.default,
      borderColor: borderColor,
      height: theme.spacing(22.5),
      width: theme.spacing(18.75),
      overflow: "hidden",
      position: "relative",
      borderRadius: theme.shape.borderRadius,
      "&:hover": {
        borderColor: borderColorHover,
        boxShadow: `0 0 0 ${theme.spacing(0.63)}px ${
          theme.palette.primary.light
        }`,
      },
    },

    actionButtons: {
      position: "absolute",
      top: theme.spacing(1.25),
      right: theme.spacing(1.25),
      marginLeft: "auto",
      width: theme.spacing(3.75),
      opacity: 0,
      transition: "all .2s",
      pointerEvents: "none",
    },

    show: {
      pointerEvents: "all",
      opacity: 1,
    },

    imageActionIcon: {
      color: theme.palette.secondary.main,
    },

    add_icon: {
      height: theme.spacing(1.88),
      width: theme.spacing(1.88),
    },

    buttonIcon: {
      padding: 0,
      height: theme.spacing(3),
      width: theme.spacing(3),
      background: theme.palette.background.default,
      "&:hover": {
        background: theme.palette.background.default,
      },
    },

    image: {
      width: theme.spacing(18.75),
      height: theme.spacing(22.5),
      objectFit: "cover",
    },

    imageCard_title: {
      marginTop: theme.spacing(1),
      maxWidth: "100%",
      "& p": {
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
        lineHeight: `${theme.spacing(2)}px`,
        fontFamily: "SB Sans UI, SB Sans Display, Open Sans, Helvetica",
        fontSize: theme.spacing(1.38),
      },
    },
  };
});
export interface AddImageModalItemProps {
  id: string;
  src: string;
  name: string;
  addImage: (src: string) => void;
  onDeleteImage: (id: string) => void;
}

export const AddImageModalItem = ({
  id,
  src,
  name,
  addImage,
  onDeleteImage,
}: AddImageModalItemProps) => {
  const classes = useStyles();
  const [isShowControls, setShowControls] = useState(false);

  const deleteImage = () => onDeleteImage(id);

  return (
    <Grid
      container
      direction="column"
      wrap="nowrap"
      alignItems="center"
      className={classes.imageCard}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
      onClick={() => addImage(src)}
    >
      <Grid
        item
        container
        direction="column"
        justify="space-between"
        alignItems="center"
        className={classes.imageCard_image}
      >
        <Grid
          container
          tabIndex={-1}
          className={clsx(classes.actionButtons, {
            [classes.show]: isShowControls,
          })}
          justify="center"
          alignItems="center"
          direction="column"
          spacing={1}
        >
          <Grid item>
            <Tooltip title="Удалить">
              <IconButton
                className={classes.buttonIcon}
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  deleteImage();
                }}
              >
                <Delete className={classes.imageActionIcon} />
              </IconButton>
            </Tooltip>
          </Grid>
          <Grid item>
            <Tooltip title="Добавить">
              <IconButton className={classes.buttonIcon}>
                <Add
                  className={clsx(classes.imageActionIcon, classes.add_icon)}
                />
              </IconButton>
            </Tooltip>
          </Grid>
        </Grid>
        <img src={`/gateway${src}`} alt="SberCRM" className={classes.image} />
      </Grid>
      <Grid item className={classes.imageCard_title}>
        <Typography color="textSecondary">{name}</Typography>
      </Grid>
    </Grid>
  );
};
