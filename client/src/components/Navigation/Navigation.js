import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import { withStyles } from 'material-ui/styles';
import BottomNavigation, {
  BottomNavigationAction
} from 'material-ui/BottomNavigation';

const styles = theme => ({
  root: {
    borderTop: '1px solid rgba(0, 0, 0, 0.2)'
  }
});

class Navigation extends Component {
  handleChange = (event, value) => {
    this.props.onTabClick(value);
  };

  render() {
    const { classes } = this.props;

    return (
      <BottomNavigation
        className={classes.root}
        value={this.props.path()}
        onChange={this.handleChange}
        showLabels
      >
        <BottomNavigationAction label="Chats" value={'/chats'} />
        <BottomNavigationAction label="Settings" value={'/settings'} />
      </BottomNavigation>
    );
  }
}

Navigation.propTypes = {
  classes: PropTypes.object.isRequired
};

const mapStateToProps = state => {
  return {
    path: () => {
      const { pathname } = state.router.location;
      const index = pathname.indexOf('/', 1);
      if (index > -1) {
        return pathname.slice(0, index);
      }

      return pathname;
    }
  };
};

const mapDispatchToProps = dispatch => {
  return {
    onTabClick: path => dispatch(push(path))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(
  withStyles(styles)(Navigation)
);
