import React, {useState} from "react";
import {Route, Switch, Link} from "react-router-dom";
import clsx from 'clsx';
import { makeStyles, useTheme, StylesProvider, createGenerateClassName } from '@material-ui/core/styles';
import CssBaseline from "@material-ui/core/CssBaseline";
import Drawer from '@material-ui/core/Drawer';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import List from '@material-ui/core/List';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import MenuIcon from '@material-ui/icons/Menu';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import ViewListIcon from '@material-ui/icons/ViewList';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';

const Catalogue = React.lazy(() => import("Catalogue/Catalogue"));
const SignIn = React.lazy(() => import("SignIn/SignIn"));
const MyAccount = React.lazy(() => import("MyAccount/MyAccount"));

const drawerWidth = 240;

const generateClassName = createGenerateClassName({
  seed:'appshell'
});


const renderMFE = (MFE) => {
    return(
        <React.Suspense fallback="Loading...">
            <MFE />
        </React.Suspense>
    )
}

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
      },
      appBar: {
        transition: theme.transitions.create(['margin', 'width'], {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.leavingScreen,
        }),
      },
      appBarShift: {
        width: `calc(100% - ${drawerWidth}px)`,
        marginLeft: drawerWidth,
        transition: theme.transitions.create(['margin', 'width'], {
          easing: theme.transitions.easing.easeOut,
          duration: theme.transitions.duration.enteringScreen,
        }),
      },
      menuButton: {
        marginRight: theme.spacing(2),
      },
      hide: {
        display: 'none',
      },
      drawer: {
        width: drawerWidth,
        flexShrink: 0,
      },
      drawerPaper: {
        width: drawerWidth,
      },
      drawerHeader: {
        display: 'flex',
        alignItems: 'center',
        padding: theme.spacing(0, 1),
        ...theme.mixins.toolbar,
        justifyContent: 'flex-end',
      },
      content: {
        flexGrow: 1,
        padding: theme.spacing(3),
        transition: theme.transitions.create('margin', {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.leavingScreen,
        }),
        marginLeft: -drawerWidth,
      },
      contentShift: {
        transition: theme.transitions.create('margin', {
          easing: theme.transitions.easing.easeOut,
          duration: theme.transitions.duration.enteringScreen,
        }),
        marginLeft: 0,
      },
    
  }));

const Main = () => {
    const [theToken, setToken] = useState("");

    const onRetrieveToken = () => {
        setToken(window.sessionStorage.getItem("token"))
    }

    const classes = useStyles();
    const theme = useTheme();
    const [open, setOpen] = React.useState(false);

    const handleDrawerOpen = () => {
        setOpen(true);
    };

    const handleDrawerClose = () => {
        setOpen(false);
    };

    return(
      <StylesProvider generateClassName={generateClassName}>
          <div className={classes.root}>
              <CssBaseline />
              <AppBar
                  position="fixed"
                  className={clsx(classes.appBar, {
                  [classes.appBarShift]: open,
                  })}>
                  <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        onClick={handleDrawerOpen}
                        edge="start"
                        className={clsx(classes.menuButton, open && classes.hide)}>
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" noWrap>
                        Gadgets shop
                    </Typography>
                  </Toolbar>
              </AppBar>
              <Drawer
                  className={classes.drawer}
                  variant="persistent"
                  anchor="left"
                  open={open}
                  classes={{
                  paper: classes.drawerPaper,
                  }}>
                  <div className={classes.drawerHeader}>
                  <IconButton onClick={handleDrawerClose}>
                      {theme.direction === 'ltr' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
                  </IconButton>
                  </div>
                  <Divider />
                  <List>
                    <ListItem button key="SignIn">
                        <ListItemIcon><ExitToAppIcon/></ListItemIcon>
                        <Link to="/"><ListItemText primary="Sign In" /></Link>
                    </ListItem>
                    <ListItem button key="Catalogue">
                        <ListItemIcon><ViewListIcon/></ListItemIcon>
                        <Link to="/shop"><ListItemText primary="Catalogue" /></Link>
                    </ListItem>
                    <ListItem button key="My Account">
                        <ListItemIcon><AccountCircleIcon/></ListItemIcon>
                        <Link to="/myaccount"><ListItemText primary="My Account" /></Link>
                    </ListItem>
                  </List>
                  <Divider />
                  <Button variant="contained" onClick={onRetrieveToken}>Get Token</Button>           
                  <TextField
                      id="standard-read-only-input"
                      label="Read Only"
                      value={theToken}
                      InputProps={{
                          readOnly: true,
                      }}/>
              </Drawer>
              <main className={clsx(classes.content, {
                      [classes.contentShift]: open,
                  })}>
                  <div className={classes.drawerHeader} />
                  <Switch>
                      <Route exact path="/myaccount" render={_ => renderMFE(MyAccount)}/>
                      <Route path="/shop" render={_ => renderMFE(Catalogue)}/>
                      <Route path="/" render={_ => renderMFE(SignIn)}/>
                  </Switch>                  
              </main>
              
          </div>
        </StylesProvider>)
}

export default Main;