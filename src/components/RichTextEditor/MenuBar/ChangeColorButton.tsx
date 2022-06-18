import clsx from "clsx";
import React, { useState } from "react";
import { Editor } from "@tiptap/core";
import { MenuButton } from "./MenuButton";
import { hex2rgb } from "../../../helpers";
import { Button, Grid, makeStyles } from "@material-ui/core";

const mainColors: Array<string[]> = [
  [
    "#000000",
    "#434343",
    "#666666",
    "#999999",
    "#B7B7B7",
    "#CCCCCC",
    "#D9D9D9",
    "#EFEFEF",
    "#F3F3F3",
    "#FFFFFF",
  ],
  [
    "#980000",
    "#FF0000",
    "#FF9900",
    "#FFFF00",
    "#00F0F0",
    "#00FFFF",
    "#4A86E8",
    "#0000FF",
    "#9900FF",
    "#FF00FF",
  ],
];

const oddColors: Array<string[]> = [
  [
    "#E6B8AF",
    "#F4CCCC",
    "#FCE5CD",
    "#FFF2CC",
    "#D9EAD3",
    "#D0E0E3",
    "#C9DAF8",
    "#CFE2F3",
    "#D9D2E9",
    "#EAD1DC",
  ],
  [
    "#DD7E6B",
    "#EA9999",
    "#F9CB9C",
    "#FFE599",
    "#B6D7A8",
    "#A2C4C9",
    "#A4C2F4",
    "#9FC5E8",
    "#B4A7D6",
    "#D5A6BD",
  ],
  [
    "#CC4125",
    "#E06666",
    "#F6B26B",
    "#FFD966",
    "#93C47D",
    "#76A5AF",
    "#6D9EEB",
    "#6FA8DC",
    "#8E7CC3",
    "#C27BA0",
  ],
  [
    "#A61C00",
    "#CC0000",
    "#E69138",
    "#F1C232",
    "#6AA84F",
    "#45818E",
    "#3C78D8",
    "#3D85C6",
    "#674EA7",
    "#A64D79",
  ],
  [
    "#85200C",
    "#990000",
    "#B45F06",
    "#BF9000",
    "#38761D",
    "#134F5C",
    "#1155CC",
    "#0B5394",
    "#351C75",
    "#733554",
  ],
  [
    "#5B0F00",
    "#660000",
    "#783F04",
    "#7F6000",
    "#274E13",
    "#0C343D",
    "#1C4587",
    "#073763",
    "#20124D",
    "#4C1130",
  ],
];
const useStyles = makeStyles((theme) => ({
  changeColorSelector: {
    gap: theme.spacing(1),
  },
  changeColorSelectorButton: {
    flexGrow: 1,
    height: theme.spacing(4),
  },
  changeColorTableMain: {
    marginTop: theme.spacing(1),
    maxWidth: theme.spacing(30),
    gap: theme.spacing(1),
  },

  changeColorTableOdd: {
    marginTop: theme.spacing(1),
    maxWidth: theme.spacing(30),
  },
  changeColorCell: {
    width: theme.spacing(3),
    height: theme.spacing(3),
    boxSizing: "border-box",
    "&:hover": {
      outline: `1px solid ${theme.palette.common.black}`,
      zIndex: 1,
    },
  },
  changeColorCellSelected: {
    outline: `2px solid ${theme.palette.primary.main}`,
    zIndex: 1,
  },
}));

export default function ChangeColorButton(editor: Editor) {
  const [mode, setMode] = useState("background");
  const classes = useStyles();

  const textColor = editor.getAttributes("textStyle").color;
  const isColorActive = (color: string): boolean =>
    editor.isActive(mode === "background" ? "highlight" : "textStyle", {
      color,
    }) ||
    (mode === "text" && hex2rgb(color) === textColor);

  const changeColor = (color: string) => {
    mode === "text"
      ? editor.chain().focus().setColor(color).run()
      : editor.chain().focus().toggleHighlight({ color }).run();
  };

  // Render table preview when selection out of table
  const ColorTable = ({
    setIsShowChildFalse,
  }: Parameters<
    Exclude<
      React.ComponentProps<typeof MenuButton>["childrenMenus"],
      React.ReactNode[] | undefined
    >
  >[0]) => {
    return [
      <div key="colorTable">
        <Grid container className={classes.changeColorSelector}>
          <Button
            type="button"
            onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.stopPropagation();
              setMode("background");
            }}
            className={classes.changeColorSelectorButton}
            color="primary"
            aria-pressed={mode === "background"}
          >
            Фон
          </Button>
          <Button
            type="button"
            onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.stopPropagation();
              setMode("text");
            }}
            className={classes.changeColorSelectorButton}
            color="primary"
            aria-pressed={mode === "text"}
          >
            Текст
          </Button>
        </Grid>
        <Grid container className={classes.changeColorTableMain}>
          {mainColors.map((row, idx) => (
            <Grid key={idx} item container>
              {row.map((color, cIdx) => (
                <Grid
                  item
                  key={`chColMain cell[${idx} ${cIdx}]`}
                  className={clsx(classes.changeColorCell, {
                    [classes.changeColorCellSelected]: isColorActive(color),
                  })}
                  style={{ backgroundColor: color }}
                  onClick={() => {
                    changeColor(color);
                    setIsShowChildFalse();
                  }}
                ></Grid>
              ))}
            </Grid>
          ))}
        </Grid>
        <Grid container className={classes.changeColorTableOdd}>
          {oddColors.map((row, idx) => (
            <Grid container item key={idx}>
              {row.map((color, cIdx) => (
                <Grid
                  item
                  key={`chColOdd cell[${idx} ${cIdx}]`}
                  className={clsx(classes.changeColorCell, {
                    [classes.changeColorCellSelected]: isColorActive(color),
                  })}
                  style={{ backgroundColor: color }}
                  onClick={() => {
                    changeColor(color);
                    setIsShowChildFalse();
                  }}
                ></Grid>
              ))}
            </Grid>
          ))}
        </Grid>
      </div>,
    ];
  };

  return (
    <MenuButton
      icon="brush"
      tooltip="Изменить цвет/фон текста"
      childrenMenus={ColorTable}
      disabled={!editor.isEditable}
    />
  );
}
