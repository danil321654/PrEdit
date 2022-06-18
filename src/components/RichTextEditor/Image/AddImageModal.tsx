import AddImageModalUpload from "./AddImageModalUpload";
import React, { ChangeEvent, ReactElement, useEffect, useState } from "react";
import { imagesPerPage } from "../../../constants";
import { useDispatch, useSelector } from "react-redux";
import { AddImageModalItem } from "./AddImageModalItem";
import { PrintFormsImageParams } from "../../../records";
import { convertToValidFileName, resizeImage } from "../../../helpers";
import {
  Backdrop,
  CircularProgress,
  Dialog,
  DialogTitle,
  Grid,
  makeStyles,
} from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  modalPaper: {
    margin: "auto",
  },
  imageListWrapper: {
    position: "relative",
    height: "100%",
    minHeight: theme.spacing(75),
  },
  imageList: {
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(1.875),
    overflow: "auto",
    borderRight: `1px solid ${theme.palette.grey[100]}`,
    boxSizing: "border-box",
    flexWrap: "wrap",
    maxHeight: theme.spacing(70),
  },
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    zIndex: theme.zIndex.modal + 201,
    color: theme.palette.primary.main,
    backgroundColor:
      theme.palette.type === "light"
        ? "rgba(0, 0, 0, 0.1)"
        : "rgba(0, 0, 0, 0.5)",
  },
}));
export interface AddImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  addImage: (url: string) => void;
}

interface ILoads {
  progress: number;
  isDownloaded: boolean;
  error: string | null;
}

const validExtFile = ["jpeg", "jpg", "png"];

export const AddImageModal = ({
  addImage,
  onClose,
  isOpen,
}: AddImageModalProps): ReactElement<AddImageModalProps> | null => {
  const classes = useStyles();
  const imagesData: PrintFormsImageParams[] = [];
  const allImagesLoaded = true;
  const [loads, setLoads] = useState<Record<string, ILoads>>({});
  const dispatch = useDispatch();
  const isLoading = false;
  useEffect(() => {
    if (isOpen) {
      // dispatch(printFormsImagesFetchAction.request({ page: 0 }));
    }
  }, [dispatch, isOpen]);

  const addImageAndCloseModal = (url: string): void => {
    addImage(url);
    onClose();
  };

  const deleteImageHandle = (imageId: string) => {
    // dispatch(printFormsImagesDeleteAction.request({ imageId }));
  };

  const changeLoads = (
    key: string,
    progress: number,
    isDownloaded: boolean,
    error: string | null
  ): void => {
    setLoads((prev) => ({
      ...prev,
      [key]: {
        progress,
        isDownloaded,
        error,
      },
    }));
  };

  const markIsCompleted = (key: string) => {
    changeLoads(key, 100, true, null);
  };

  const markIsError = (key: string) => (err: string) => {
    changeLoads(key, 0, false, err);
  };

  const loadImage =
    (keyExists: string | null) => async (e: ChangeEvent<HTMLInputElement>) => {
      const input = e.target;
      if (!input.files) return;
      const fileSrc = input.files[0];
      const resizedImage = await resizeImage(fileSrc);
      const buffer = await resizedImage.arrayBuffer();
      const key: string = keyExists || new Date().getTime().toString();

      const extFile = fileSrc.name
        .substring(fileSrc.name.lastIndexOf(".") + 1, fileSrc.name.length)
        .toLowerCase();
      if (!validExtFile.includes(extFile))
        return changeLoads(key, 0, false, "Формат файла не поддерживается");
      // dispatch(
      //   printFormsImagesCreateAction.request({
      //     name: convertToValidFileName(fileSrc.name),
      //     body: buffer,
      //     onUploadProgress: (progressEvent: any) => {
      //       const percent = Math.round(
      //         (progressEvent.loaded * 100) / progressEvent.total
      //       );
      //       changeLoads(key, percent, false, null);
      //     },
      //     markIsCompleted: () => markIsCompleted(key),
      //     markIsError: markIsError(key),
      //   })
      // );
      // Меняет value у input, чтобы onChange сработал при последующей загрузке того же файла
      input.value = "";
    };

  const scrollHandle = (e: React.UIEvent<HTMLDivElement>) => {
    const eventTarget = e.target as HTMLDivElement;

    if (
      !allImagesLoaded &&
      !isLoading &&
      (eventTarget.scrollTop + eventTarget.clientHeight) /
        eventTarget.scrollHeight >
        0.77
    ) {
      const currentPage = Math.floor(imagesData.length / imagesPerPage);
      // dispatch(
      //   printFormsImagesFetchAction.request({
      //     page: currentPage,
      //   })
      // );
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth="md"
      PaperProps={{ className: classes.modalPaper }}
      fullWidth
    >
      <DialogTitle>Добавить изображение</DialogTitle>
      <Grid
        container
        justify="space-between"
        wrap="nowrap"
        className={classes.imageListWrapper}
        onScroll={scrollHandle}
      >
        <Backdrop open={isLoading} className={classes.backdrop}>
          <CircularProgress color="inherit" />
        </Backdrop>
        <Grid container wrap="wrap" className={classes.imageList}>
          {imagesData.map(
            (image) =>
              !!image.src && (
                <AddImageModalItem
                  key={image.id}
                  id={image.id}
                  src={image.src}
                  name={image.name}
                  addImage={addImageAndCloseModal}
                  onDeleteImage={deleteImageHandle}
                />
              )
          )}
          {Object.keys(loads)
            .filter((key) => !loads[key]?.isDownloaded)
            .map((key) => (
              <AddImageModalUpload
                key={key}
                progress={loads[key].progress}
                error={loads[key].error}
                loadImage={loadImage(key)}
              />
            ))}
          {/* if exists error then exists button add*/}
          {!Object.keys(loads).find((key) => loads[key]?.error) && (
            <AddImageModalUpload loadImage={loadImage(null)} progress={0} />
          )}
        </Grid>
      </Grid>
    </Dialog>
  );
};
