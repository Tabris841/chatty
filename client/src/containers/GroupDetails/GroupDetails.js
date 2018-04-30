import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { graphql, compose } from 'react-apollo';
import Avatar from 'material-ui/Avatar';

import styleSheet from './GroupDetails.scss';

import GROUP_QUERY from '../../graphql/group.query';
import USER_QUERY from '../../graphql/user.query';
import DELETE_GROUP_MUTATION from '../../graphql/delete-group.mutation';
import LEAVE_GROUP_MUTATION from '../../graphql/leave-group.mutation';
import AppBar from '../../components/AppBar/AppBar';

class GroupDetails extends Component {
  render() {
    const { group, loading } = this.props;

    return (
      <div>
        <AppBar title={'Group Info'} />

        <div className="group-subject-container">
          <div className="group-icon-container">
            <Avatar className="" src="https://reactjs.org/logo-og.png" />
            <div>edit</div>
          </div>
          <div>{group.name}</div>
        </div>

        <style jsx>{styleSheet}</style>
      </div>
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
  navigation: PropTypes.shape({
    dispatch: PropTypes.func,
    state: PropTypes.shape({
      params: PropTypes.shape({
        title: PropTypes.string,
        id: PropTypes.number
      })
    })
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
            variables: { id: 1 }
          }); // fake for now

          // Add our message from the mutation to the end.
          data.user.groups = data.user.groups.filter(
            g => deleteGroup.id !== g.id
          );

          // Write our data back to the cache.
          store.writeQuery({
            query: USER_QUERY,
            variables: { id: 1 }, // fake for now
            data
          });
        }
      })
  })
});

const leaveGroupMutation = graphql(LEAVE_GROUP_MUTATION, {
  props: ({ ownProps, mutate }) => ({
    leaveGroup: ({ id, userId }) =>
      mutate({
        variables: { id, userId },
        update: (store, { data: { leaveGroup } }) => {
          // Read the data from our cache for this query.
          const data = store.readQuery({
            query: USER_QUERY,
            variables: { id: 1 }
          }); // fake for now

          // Add our message from the mutation to the end.
          data.user.groups = data.user.groups.filter(
            g => leaveGroup.id !== g.id
          );

          // Write our data back to the cache.
          store.writeQuery({
            query: USER_QUERY,
            variables: { id: 1 }, // fake for now
            data
          });
        }
      })
  })
});

export default compose(groupQuery, deleteGroupMutation, leaveGroupMutation)(
  GroupDetails
);
