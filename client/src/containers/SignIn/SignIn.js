import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { graphql, compose } from 'react-apollo';
import { connect } from 'react-redux';
import { withStyles } from 'material-ui/styles';
import { TextField, Button, Typography, Snackbar } from 'material-ui';
import { replace } from 'react-router-redux';

import styleSheet from './SignIn.scss';

import { setCurrentUser } from '../../actions/auth.actions';
import LOGIN_MUTATION from '../../graphql/login.mutation';
import SIGNUP_MUTATION from '../../graphql/signup.mutation';
import AppBar from '../../components/AppBar/AppBar';
import Auxiliary from '../../hoc/Auxiliary/Auxiliary';

const styles = theme => ({
  container: {
    display: 'flex',
    flexWrap: 'wrap',
    flexDirection: 'column',
    alignItems: 'center'
  },
  textField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    width: 300
  },
  button: {
    margin: theme.spacing.unit
  }
});

function capitalizeFirstLetter(string) {
  return string[0].toUpperCase() + string.slice(1);
}

class SignIn extends Component {
  state = {
    view: 'login'
  };

  componentWillReceiveProps(nextProps) {
    if (nextProps.auth.jwt) {
      this.props.goToSettings();
    }
  }

  login = () => {
    const { email, password } = this.state;

    this.setState({
      loading: true
    });

    this.props
      .login({ email, password })
      .then(({ data: { login: user } }) => {
        this.props.setCurrentUser(user);
        // this.setState({
        //   loading: false,
        // });
      })
      .catch(error => {
        this.setState({
          loading: false,
          message: `${capitalizeFirstLetter(this.state.view)} ${error.message}`,
          open: true
        });
      });
  };

  signup = () => {
    this.setState({
      loading: true
    });
    const { email, password } = this.state;
    this.props
      .signup({ email, password })
      .then(({ data: { signup: user } }) => {
        this.props.setCurrentUser(user);
        // this.setState({
        //   loading: false,
        // });
      })
      .catch(error => {
        this.setState({
          loading: false,
          message: `${capitalizeFirstLetter(this.state.view)} ${error.message}`,
          open: true
        });
      });
  };

  handleChange = name => event => {
    this.setState({
      [name]: event.target.value
    });
  };

  switchView = () => {
    this.setState({
      view: this.state.view === 'signup' ? 'login' : 'signup'
    });
  };

  handleClose = () => {
    this.setState({ open: false });
  };

  render() {
    const { classes, auth } = this.props;
    const { view, loading, open, message } = this.state;

    return (
      <Auxiliary>
        <AppBar title={'Chatty'} showGoBack={false} />
        <div className="login-container">
          <form className={classes.container} autoComplete="off">
            <TextField
              type="email"
              placeholder={'Email'}
              margin="normal"
              onChange={this.handleChange('email')}
              className={classes.textField}
            />
            <TextField
              type="password"
              placeholder={'Password'}
              margin="normal"
              onChange={this.handleChange('password')}
              className={classes.textField}
            />
            <Button
              className={classes.button}
              disabled={loading || !!auth.jwt}
              onClick={this[view]}
            >
              {view === 'signup' ? 'Sign up' : 'Login'}
            </Button>
          </form>
          <Typography align="center" gutterBottom={true}>
            {view === 'signup' ? 'Already have an account?' : 'New to Chatty?'}
            <Button color="primary" onClick={this.switchView}>
              {view === 'login' ? 'Sign up' : 'Login'}
            </Button>
          </Typography>
        </div>

        <Snackbar
          message={message}
          open={open}
          autoHideDuration={3000}
          onClose={this.handleClose}
        />

        <style jsx>{styleSheet}</style>
      </Auxiliary>
    );
  }
}

SignIn.propTypes = {
  classes: PropTypes.object.isRequired,
  auth: PropTypes.shape({
    loading: PropTypes.bool,
    jwt: PropTypes.string
  }),
  goToSettings: PropTypes.func.isRequired,
  login: PropTypes.func.isRequired,
  signup: PropTypes.func.isRequired
};

const login = graphql(LOGIN_MUTATION, {
  props: ({ mutate }) => ({
    login: ({ email, password }) =>
      mutate({
        variables: { email, password }
      })
  })
});

const signup = graphql(SIGNUP_MUTATION, {
  props: ({ mutate }) => ({
    signup: ({ email, password }) =>
      mutate({
        variables: { email, password }
      })
  })
});

const mapStateToProps = ({ auth }) => ({
  auth
});

const mapDispatchToProps = dispatch => ({
  goToSettings: () => dispatch(replace('/settings')),
  setCurrentUser: user => dispatch(setCurrentUser(user))
});

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  login,
  signup
)(withStyles(styles)(SignIn));
