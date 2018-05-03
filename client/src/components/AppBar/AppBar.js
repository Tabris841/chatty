import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import { connect } from 'react-redux';
import { goBack, push } from 'react-router-redux';
import {
  Toolbar,
  Typography,
  IconButton,
  Button,
  AppBar as MaterialAppBar
} from 'material-ui';
import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft';

import styleSheet from './AppBar.scss';

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
  const {
    classes,
    goNext,
    goNextTitle,
    goBack,
    title,
    groupId,
    titleLinkHandler
  } = props;

  return (
    <div className={classes.root}>
      <MaterialAppBar position="static" color="default">
        <Toolbar>
          <IconButton
            color="inherit"
            className={classes.goBackButton}
            onClick={goBack}
          >
            <KeyboardArrowLeft />
          </IconButton>
          <Typography variant="title" color="inherit" className={classes.flex}>
            {groupId ? (
              <span
                className="title-link"
                onClick={() => titleLinkHandler(groupId)}
              >
                {title}
              </span>
            ) : (
              title
            )}
          </Typography>
          {goNext &&
            goNextTitle && (
              <Button color="inherit" onClick={goNext}>
                {goNextTitle}
              </Button>
            )}
        </Toolbar>
      </MaterialAppBar>

      <style jsx>{styleSheet}</style>
    </div>
  );
};

AppBar.proptypes = {
  title: PropTypes.string.isRequired,
  groupId: PropTypes.number,
  goBack: PropTypes.func.isRequired,
  goNext: PropTypes.func,
  titleLinkHandler: PropTypes.func,
  goNextTitle: PropTypes.string,
  classes: PropTypes.object.isRequired
};

const mapDispatchToProps = dispatch => {
  return {
    goBack: () => dispatch(goBack()),
    titleLinkHandler: id => dispatch(push('/group-details', { id }))
  };
};

export default connect(null, mapDispatchToProps)(withStyles(styles)(AppBar));
