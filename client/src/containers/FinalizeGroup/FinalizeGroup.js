import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { graphql, compose } from 'react-apollo';
import { map } from 'lodash';
import update from 'immutability-helper';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import { Snackbar, Avatar, TextField, Typography, Toolbar } from 'material-ui';
import { withStyles } from 'material-ui';

import styleSheet from './FinalizeGroup.scss';

import { USER_QUERY } from '../../graphql/user.query';
import CREATE_GROUP_MUTATION from '../../graphql/create-group.mutation';
import Auxiliary from '../../hoc/Auxiliary/Auxiliary';
import AppBar from '../../components/AppBar/AppBar';
import SelectedUserList from '../../components/SelectedUserList/SelectedUserList';

const styles = {
  toolbar: {
    backgroundColor: '#dbdbdb',
    color: '#777'
  },
  avatar: {
    width: 50,
    height: 50
  },
};

class FinalizeGroup extends Component {
  state = {
    selected: this.props.location.state.selected,
    name: null,
    message: '',
    open: false
  };

  remove = user => {
    const index = this.state.selected.indexOf(user);
    if (~index) {
      const selected = update(this.state.selected, { $splice: [[index, 1]] });
      this.setState({
        selected
      });
    }
  };

  handleChange = event => {
    this.setState({
      name: event.target.value
    });
  };

  onCreateClicked = () => {
    const { createGroup } = this.props;

    createGroup({
      name: this.state.name,
      userId: 1, // fake user for now
      userIds: map(this.state.selected, 'id')
    })
      .then(res => {
        this.props.goToGroups();
      })
      .catch(error => {
        this.setState({
          message: `Error Creating New Group ${error.message}`,
          open: true
        });
      });
  };

  handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    this.setState({ open: false });
  };

  render() {
    const { classes } = this.props;
    const { open, message, selected, name } = this.state;

    let appBar = <AppBar title="New Group" />;

    if (name) {
      appBar = (
        <AppBar
          title="New Group"
          goNext={this.onCreateClicked}
          goNextTitle={'Create'}
        />
      );
    }

    return (
      <Auxiliary>
        {appBar}

        <div className="group-subject-container">
          <div className="group-icon-container">
            <Avatar className={classes.avatar} src="https://reactjs.org/logo-og.png" />
            <div style={{paddingTop: '6px'}}>edit</div>
          </div>
          <TextField
            id="group-subject"
            placeholder="Group Subject"
            helperText="Please provide a group subject and optional group icon"
            onChange={this.handleChange}
            margin="normal"
          />
        </div>

        <Toolbar className={classes.toolbar}>
          <Typography variant="title" color="inherit">
            {`participants: ${selected.length} of ${
              this.props.location.state.friendCount
            }`.toUpperCase()}
          </Typography>
        </Toolbar>

        {selected.length ? (
          <SelectedUserList data={selected} remove={this.remove} />
        ) : null}

        <Snackbar message={message} open={open} onClose={this.handleClose} />

        <style jsx>{styleSheet}</style>
      </Auxiliary>
    );
  }
}

FinalizeGroup.propTypes = {
  createGroup: PropTypes.func.isRequired,
  goToGroups: PropTypes.func.isRequired,
  selected: PropTypes.arrayOf(PropTypes.object),
  friendCount: PropTypes.number
};

const createGroupMutation = graphql(CREATE_GROUP_MUTATION, {
  props: ({ mutate }) => ({
    createGroup: ({ name, userIds, userId }) =>
      mutate({
        variables: { name, userIds, userId },
        update: (store, { data: { createGroup } }) => {
          // Read the data from our cache for this query.
          const data = store.readQuery({
            query: USER_QUERY,
            variables: { id: userId }
          });

          // Add our message from the mutation to the end.
          data.user.groups.push(createGroup);

          // Write our data back to the cache.
          store.writeQuery({
            query: USER_QUERY,
            variables: { id: userId },
            data
          });
        }
      })
  })
});

const userQuery = graphql(USER_QUERY, {
  options: ownProps => {
    return {
      variables: {
        id: ownProps.location.state.userId
      }
    };
  },
  props: ({ data: { loading, user } }) => ({
    loading,
    user
  })
});

const mapDispatchToProps = dispatch => ({
  goToGroups: () => dispatch(push('/chats'))
});

export default compose(
  connect(null, mapDispatchToProps),
  userQuery,
  createGroupMutation
)(withStyles(styles)(FinalizeGroup));
