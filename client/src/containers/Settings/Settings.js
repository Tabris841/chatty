import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { graphql, compose } from 'react-apollo';
import {
  TextField,
  Button,
  Typography,
  LinearProgress,
  Avatar
} from 'material-ui';
import { withStyles } from 'material-ui/styles/index';

import styleSheet from './Settings.scss';

import USER_QUERY from '../../graphql/user.query';
import { logout } from '../../actions/auth.actions';
import Auxiliary from '../../hoc/Auxiliary/Auxiliary';
import AppBar from '../../components/AppBar/AppBar';

const styles = theme => ({
  avatar: {
    width: 50,
    height: 50
  },
  button: {
    margin: theme.spacing.unit,
    width: 200
  },
  inputInstructions: {
    color: '#777',
    padding: 15,
    alignSelf: 'center'
  },
});

class Settings extends Component {
  logout = () => {
    this.props.dispatch(logout());
  };

  updateUsername = username => {
    console.log('TODO: update username');
  };

  render() {
    const { loading, user, classes } = this.props;

    return (
      <Auxiliary>
        <AppBar title={'Settings'} showGoBack={false} />
        {loading || !user ? (
          <LinearProgress />
        ) : (
          <div className="settings-container">

            <div className="user-container">
              <div className="user-inner">
                <Avatar className={classes.avatar} src="https://reactjs.org/logo-og.png" />
                <div className="edit-text">edit</div>
              </div>
              <Typography className={classes.inputInstructions}>
                Enter your name and add an optional profile picture
              </Typography>
            </div>

            <TextField
              id="group-subject"
              placeholder={user.username}
              onChange={this.updateUsername}
              margin="normal"
              defaultValue={user.username}
            />

            <Typography align="center" variant="headline">
              EMAIL
            </Typography>
            <Typography align="center" variant="subheading">
              {user && user.email}
            </Typography>
            <Button
              className={classes.button}
              color="primary"
              onClick={this.logout}
            >
              Logout
            </Button>
          </div>
        )}

        <style jsx>{styleSheet}</style>
      </Auxiliary>
    );
  }
}

Settings.propTypes = {
  classes: PropTypes.object.isRequired,
  auth: PropTypes.shape({
    loading: PropTypes.bool,
    jwt: PropTypes.string
  }).isRequired,
  dispatch: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  user: PropTypes.shape({
    username: PropTypes.string
  })
};

const userQuery = graphql(USER_QUERY, {
  skip: ownProps => !ownProps.auth || !ownProps.auth.jwt,
  options: ({ auth }) => ({
    variables: { id: auth.id },
    fetchPolicy: 'cache-only'
  }),
  props: ({ data: { loading, user } }) => ({
    loading,
    user
  })
});

const mapStateToProps = ({ auth }) => ({
  auth
});

export default compose(connect(mapStateToProps), userQuery)(
  withStyles(styles)(Settings)
);
