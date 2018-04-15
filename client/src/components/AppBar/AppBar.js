import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import { connect } from 'react-redux';
import { goBack } from 'react-router-redux';
import MaterialAppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import Typography from 'material-ui/Typography';
import IconButton from 'material-ui/IconButton';
import Button from 'material-ui/Button';
import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft';

const styles = {
  root: {
    flexGrow: 1
  },
  flex: {
    flex: 1
  },
  goBackButton: {
    marginLeft: -12,
    marginRight: 20
  }
};

const AppBar = props => {
  const { classes } = props;

  return (
    <div className={classes.root}>
      <MaterialAppBar position="static" color="default">
        <Toolbar>
          <IconButton
            color="inherit"
            className={classes.goBackButton}
            onClick={props.goBack}
          >
            <KeyboardArrowLeft />
          </IconButton>
          <Typography variant="title" color="inherit" className={classes.flex}>
            {props.title}
          </Typography>
          <Button color="inherit">Placeholder</Button>
        </Toolbar>
      </MaterialAppBar>
    </div>
  );
};

AppBar.proptypes = {
  title: PropTypes.string.isRequired,
  goBack: PropTypes.func.isRequired,
  classes: PropTypes.object.isRequired
};

const mapDispatchToProps = dispatch => {
  return {
    goBack: () => dispatch(goBack())
  };
};

export default connect(null, mapDispatchToProps)(withStyles(styles)(AppBar));
