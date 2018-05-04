import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { graphql, compose } from 'react-apollo';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import { withStyles } from 'material-ui/styles';
import Avatar from 'material-ui/Avatar';
import { LinearProgress } from 'material-ui/Progress';
import Button from 'material-ui/Button';
import Toolbar from 'material-ui/Toolbar';
import Typography from 'material-ui/Typography';
import Divider from 'material-ui/Divider';
import List, { ListItem, ListItemText } from 'material-ui/List';

import styleSheet from './GroupDetails.scss';

import GROUP_QUERY from '../../graphql/group.query';
import USER_QUERY from '../../graphql/user.query';
import DELETE_GROUP_MUTATION from '../../graphql/delete-group.mutation';
import LEAVE_GROUP_MUTATION from '../../graphql/leave-group.mutation';
import AppBar from '../../components/AppBar/AppBar';
import Auxiliary from '../../hoc/Auxiliary/Auxiliary';

const styles = {
  button: {
    display: 'block',
    margin: '0 auto'
  },
  toolbar: {
    backgroundColor: '#dbdbdb',
    color: '#777'
  }
};

class GroupDetails extends Component {
  deleteGroup = () => {
    this.props
      .deleteGroup(this.props.group.id)
      .then(() => {
        this.props.goToGroups();
      })
      .catch(e => {
        console.log(e);
      });
  };

  leaveGroup = () => {
    this.props
      .leaveGroup({
        id: this.props.group.id,
        userId: 1
      }) // fake user for now
      .then(() => {
        this.props.goToGroups();
      })
      .catch(e => {
        console.log(e);
      });
  };

  render() {
    const { group, loading, classes } = this.props;
    let participants = null;

    if (group && group.users) {
      participants = group.users.map(item => (
        <Auxiliary key={item.id}>
          <ListItem group={item}>
            <Avatar style={{ backgroundColor: '#35D9FD' }}>
              {item.username.substring(0, 1)}
            </Avatar>
            <ListItemText primary={item.username} />
          </ListItem>
          <Divider />
        </Auxiliary>
      ));
    }

    return (
      <Auxiliary>
        <AppBar title={'Group Info'} />
        {loading ? (
          <LinearProgress />
        ) : (
          <Auxiliary>
            <div className="group-subject-container">
              <div className="group-icon-container">
                <Avatar src="https://reactjs.org/logo-og.png" />
                <div>edit</div>
              </div>
              <div className="group-name-container">
                <span className="group-name">{group.name}</span>
              </div>
            </div>

            <Toolbar className={classes.toolbar}>
              <Typography variant="title" color="inherit">
                {`participants: ${group.users.length}`.toUpperCase()}
              </Typography>
            </Toolbar>

            <List>{participants}</List>

            <Button
              color="primary"
              className={classes.button}
              onClick={this.leaveGroup}
            >
              Leave Group
            </Button>
            <Button
              color="primary"
              className={classes.button}
              onClick={this.deleteGroup}
            >
              Delete Group
            </Button>
          </Auxiliary>
        )}

        <style jsx>{styleSheet}</style>
      </Auxiliary>
    );
  }
}

GroupDetails.propTypes = {
  loading: PropTypes.bool,
  group: PropTypes.shape({
    id: PropTypes.number,
    name: PropTypes.string,
    users: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.number,
        username: PropTypes.string
      })
    )
  }),
  deleteGroup: PropTypes.func.isRequired,
  leaveGroup: PropTypes.func.isRequired
};

const groupQuery = graphql(GROUP_QUERY, {
  options: ownProps => ({
    variables: { groupId: ownProps.location.state.id }
  }),
  props: ({ data: { loading, group } }) => ({
    loading,
    group
  })
});

const deleteGroupMutation = graphql(DELETE_GROUP_MUTATION, {
  props: ({ ownProps, mutate }) => ({
    deleteGroup: id =>
      mutate({
        variables: { id },
        update: (store, { data: { deleteGroup } }) => {
          // Read the data from our cache for this query.
          const data = store.readQuery({
            query: USER_QUERY,
            variables: { id: ownProps.auth.id }
          });

          // Add our message from the mutation to the end.
          data.user.groups = data.user.groups.filter(
            g => deleteGroup.id !== g.id
          );

          // Write our data back to the cache.
          store.writeQuery({
            query: USER_QUERY,
            variables: { id: ownProps.auth.id },
            data
          });
        }
      })
  })
});

const leaveGroupMutation = graphql(LEAVE_GROUP_MUTATION, {
  props: ({ ownProps, mutate }) => ({
    leaveGroup: ({ id }) =>
      mutate({
        variables: { id },
        update: (store, { data: { leaveGroup } }) => {
          // Read the data from our cache for this query.
          const data = store.readQuery({
            query: USER_QUERY,
            variables: { id: ownProps.auth.id }
          });

          // Add our message from the mutation to the end.
          data.user.groups = data.user.groups.filter(
            g => leaveGroup.id !== g.id
          );

          // Write our data back to the cache.
          store.writeQuery({
            query: USER_QUERY,
            variables: { id: ownProps.auth.id },
            data
          });
        }
      })
  })
});

const mapStateToProps = ({ auth }) => ({
  auth,
});

const mapDispatchToProps = dispatch => ({
  goToGroups: () => dispatch(push('/chats'))
});

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  groupQuery,
  deleteGroupMutation,
  leaveGroupMutation,
)(withStyles(styles)(GroupDetails));
