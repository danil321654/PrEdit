import clsx from "clsx";
import React from "react";
import { Add } from "@material-ui/icons";
import {
  Grid,
  IconButton,
  LinearProgress,
  makeStyles,
  Theme,
  Typography,
} from "@material-ui/core";

const useStyles = makeStyles<Theme, { isError: boolean }>((theme) => {
  let borderColor: string;
  let borderColorHover: string;
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
    root: (props) => ({
      margin: theme.spacing(1.88),
      border: "1px dashed",
      borderColor: props.isError ? "red" : borderColor,
      background: props.isError
        ? theme.palette.error.light
        : theme.palette.background.default,
      height: theme.spacing(22.5),
      width: theme.spacing(18.75),
      paddingTop: theme.spacing(8.88),
      borderRadius: theme.shape.borderRadius,
      "&:hover": {
        borderColor: props.isError ? "red" : borderColorHover,
        boxShadow: `0 0 0 ${theme.spacing(0.63)}px ${
          theme.palette.primary.light
        }`,
      },
      fontFamily: "SB Sans Interface",
    }),

    label: {
      fontSize: theme.spacing(1.63),
      lineHeight: `${theme.spacing(2.25)}px`,
    },

    error: {
      padding: theme.spacing(1),
      height: theme.spacing(7),
      width: "100%",
      overflow: "hidden",
      "& p": {
        fontSize: theme.spacing(1.38),
        lineHeight: `${theme.spacing(2)}px`,
      },
    },

    input: {
      display: "none",
    },
    progress: {
      width: theme.spacing(12.75),
      "& .MuiLinearProgress-root": {
        background: theme.palette.text.disabled,
      },
    },
  };
});

export interface AddImageModalUploadProps {
  loadImage?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  progress?: number;
  error?: string | null;
}

const AddImageModalUpload = ({
  loadImage,
  progress,
  error,
}: AddImageModalUploadProps) => {
  const classes = useStyles({ isError: Boolean(error) });

  return (
    <label htmlFor="icon-button-file">
      <Grid className={classes.root} container>
        <Grid
          item
          container
          direction="column"
          alignItems="center"
          alignContent="center"
          spacing={progress !== 0 ? 2 : 0}
        >
          <Grid className={clsx({ [classes.progress]: progress !== 0 })} item>
            {progress === 0 ? (
              <>
                <input
                  className={classes.input}
                  accept=".jpeg, .jpg, .png"
                  id="icon-button-file"
                  type="file"
                  onChange={loadImage}
                />
                <IconButton component="span">
                  <Add height="15px" width="15px" />
                </IconButton>
              </>
            ) : (
              <LinearProgress variant="determinate" value={progress} />
            )}
          </Grid>
          <Grid item>
            <Typography className={classes.label}>
              {progress === 0 ? "Загрузить" : "Загрузка"}
            </Typography>
          </Grid>
          <Grid className={classes.error} item>
            {error && (
              <Typography color="error" align="center">
                {error}
              </Typography>
            )}
          </Grid>
        </Grid>
      </Grid>
    </label>
  );
};

export default AddImageModalUpload;
