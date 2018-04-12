import React from 'react';
import PropTypes from 'prop-types';
import { connect } from "react-redux";
import { goBack } from "react-router-redux";
import MaterialAppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import Typography from 'material-ui/Typography';
import IconButton from 'material-ui/IconButton';
import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft';


const AppBar = (props) => {
  return (
    <MaterialAppBar position="static" color="default">
      <Toolbar>
        <IconButton color="inherit" aria-label="Menu" onClick={props.goBack}>
          <KeyboardArrowLeft />
        </IconButton>
        <Typography variant="title" color="inherit">
          {props.title}
        </Typography>
      </Toolbar>
    </MaterialAppBar>
  );
};

AppBar.proptypes = {
  title: PropTypes.string.isRequired,
  goBack: PropTypes.func.isRequired,
};

const mapDispatchToProps = dispatch => {
  return {
    goBack: () => dispatch(goBack()),
  }
};

export default connect(null, mapDispatchToProps)(AppBar);
