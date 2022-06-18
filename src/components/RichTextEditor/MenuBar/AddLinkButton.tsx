import * as Yup from "yup";
import React, { useState } from "react";
import { Editor } from "@tiptap/core";
import { MenuButton } from "./MenuButton";
import { Field, Form, Formik, FormikConfig } from "formik";
import {
  FormControl,
  Grid,
  makeStyles,
  Button,
  TextField,
  Dialog,
  DialogTitle,
} from "@material-ui/core";
import { Delete } from "@material-ui/icons";

interface AddLinkButtonProps {
  editor: Editor;
}

interface AddLinkFormValues {
  text: string;
  value: string;
}

const useStyles = makeStyles((theme) => ({
  form: {
    padding: theme.spacing(5, 3),
    rowGap: theme.spacing(2),
  },
}));

const linkSchema = Yup.object().shape({
  text: Yup.string()
    .matches(/[^\s+]/, "Ссылка не может состоять только из пробелов")
    .required("Обязательное поле"),
  value: Yup.string()
    .required("Обязательное поле")
    .matches(
      /^((ftp|http|https):\/\/)?(www\.)?([A-Za-zА-Яа-я0-9@]{1}[A-Za-zА-Яа-я0-9\-]*\.?)*\.{1}[A-Za-zА-Яа-я0-9-]{2,8}(\/([\w#!:.?+=&%@!\-\/])*)?/,
      "Значение должно быть ссылкой"
    ),
});

export function AddLinkButton({ editor }: AddLinkButtonProps) {
  const [isDialogOpen, setDialogOpen] = useState(false);
  const classes = useStyles();
  const {
    state: { selection, doc },
  } = editor;
  const {
    from,
    to,
    $anchor,
    ranges: [range],
  } = selection;
  const isTextSelected = range && range.$from !== range.$to;
  const isLinkSelected = editor.isActive("link");

  let currentLink;

  doc.nodesBetween(from, to, (node) => {
    const markLink = node.marks.find(
      (markItem) => markItem.type.name === "link"
    );
    if (isLinkSelected && !isTextSelected && markLink) {
      const linkPos = {
        from: $anchor.pos - $anchor.textOffset,
        to: $anchor.pos - $anchor.textOffset + node.textContent.length,
      };
      editor.chain().focus().setTextSelection(linkPos).run();
    }
    currentLink = markLink?.attrs?.href;
  });
  const initialValues = {
    text: isTextSelected ? doc.textBetween(range.$from.pos, range.$to.pos) : "",
    value: isTextSelected && isLinkSelected && currentLink ? currentLink : "",
  };

  const onSubmit: FormikConfig<AddLinkFormValues>["onSubmit"] = ({
    value,
    text,
  }) => {
    const trimmedValue = value.trim();
    const trimmedText = text.trim();

    const hasProtocol = /^((ftp|http|https):\/\/)/.test(trimmedValue);
    const linkWithProtocol = !hasProtocol
      ? `https://${trimmedValue}`
      : trimmedValue;
    editor
      .chain()
      .focus()
      .deleteSelection()
      .insertContent(`<a href="${linkWithProtocol}">${trimmedText}</a>`)
      .setTextSelection({
        from: from,
        to: from + trimmedText.length,
      })
      .run();
    setDialogOpen(false);
  };

  return (
    <>
      <MenuButton
        icon="link"
        tooltip={`${isLinkSelected ? "Редактирование" : "Создание"} ссылки`}
        onClick={editor.isEditable ? () => setDialogOpen(true) : undefined}
        disabled={!editor.isEditable}
        aria-pressed={isLinkSelected}
      />
      <Dialog
        maxWidth="sm"
        onClose={() => setDialogOpen(false)}
        open={isDialogOpen}
      >
        <DialogTitle>
          {`${isLinkSelected ? "Редактирование" : "Создание"} ссылки`}
        </DialogTitle>
        <Formik
          onSubmit={onSubmit}
          validationSchema={linkSchema}
          initialValues={initialValues}
        >
          {({ handleSubmit, isValid }) => (
            <Form onSubmit={handleSubmit}>
              <Grid container direction="column" className={classes.form}>
                <FormControl fullWidth>
                  <Field
                    name="text"
                    label="Название ссылки"
                    component={TextField}
                    InputProps={{
                      autoFocus: true,
                    }}
                  />
                </FormControl>
                <FormControl fullWidth>
                  <Field
                    name="value"
                    label="Адрес ссылки"
                    component={TextField}
                  />
                </FormControl>
              </Grid>
              <Grid>
                <Grid container wrap="nowrap">
                  {isLinkSelected && (
                    <Grid item>
                      <Button
                        onClick={() => {
                          editor.chain().focus().unsetLink().run();
                          setDialogOpen(false);
                        }}
                        startIcon={<Delete width={24} />}
                      >
                        Удалить
                      </Button>
                    </Grid>
                  )}
                  <Grid container justify="flex-end" spacing={2}>
                    <Grid item>
                      <Button type="reset" onClick={() => setDialogOpen(false)}>
                        Отмена
                      </Button>
                    </Grid>
                    <Grid item>
                      <Button type="submit" color="primary" disabled={!isValid}>
                        Сохранить
                      </Button>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Form>
          )}
        </Formik>
      </Dialog>
    </>
  );
}
