import clsx from 'clsx'
import React, { ReactNode } from 'react'
import { Chevron } from '../../../images/icons'
import { Grid, makeStyles, Paper } from '@material-ui/core'

const useStyles = makeStyles((theme) => ({
  menuButtonTrigger: {
    borderRadius: '0 3px 3px 0',
    height: '100%',
    opacity: 0.4,
    cursor: 'pointer',
    width: theme.spacing(1.5),
    '&:hover:not([disabled])': {
      backgroundColor:
        theme.palette.type === 'light'
          ? '#dcdcdc'
          : theme.palette.text.secondary,
      opacity: 1,
      outline: 0,
    },
    '& svg': {
      width: theme.spacing(1),
      fill:
        theme.palette.type === 'light' ? '#4c4c4c' : theme.palette.text.primary,
      color:
        theme.palette.type === 'light' ? '#4c4c4c' : theme.palette.text.primary,
    },
  },
  subMenu: {
    position: 'absolute',
    top: '100%',
    boxShadow: theme.shadows[4],
    maxHeight: theme.spacing(37.5),
    padding: theme.spacing(1),
    overflow: 'auto',
    fontSize: theme.typography.body1.fontSize,
    background: theme.palette.background.paper,
    zIndex: theme.zIndex.modal + 2,
    minWidth: 'max-content',
    borderRadius: 0,
  },
  blockMenu: {
    display: 'inline-flex',
    flex: '0 0 auto',
    flexDirection: 'column',
    width: '100%',
  },
  centerMenu: {
    display: 'flex',
    justifyContent: 'center',
  },
  inlineMenu: {
    display: 'inline-flex',
    flex: '0 0 auto',
  },
}))

interface Props {
  open?: boolean
  toggleChild(): void
  isInlineMenu?: boolean
  centerChildren?: boolean
  showChevron?: boolean
  children: ReactNode
}

const MenuBtnChild: React.FC<Props> = ({
  children,
  open,
  toggleChild,
  isInlineMenu,
  centerChildren,
  showChevron = true,
}) => {
  const classes = useStyles()

  return (
    <>
      <Grid
        container
        justify="center"
        alignItems="center"
        className={classes.menuButtonTrigger}
        onClick={toggleChild}
      >
        {showChevron && <Chevron />}
      </Grid>
      {open && (
        <Paper
          className={clsx(classes.subMenu, {
            [classes.centerMenu]: centerChildren,
          })}
          onClick={toggleChild}
        >
          <div
            className={isInlineMenu ? classes.inlineMenu : classes.blockMenu}
          >
            {children}
          </div>
        </Paper>
      )}
    </>
  )
}

export default MenuBtnChild
