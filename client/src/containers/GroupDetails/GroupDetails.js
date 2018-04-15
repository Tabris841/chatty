import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { graphql, compose } from 'react-apollo';

import GROUP_QUERY from '../graphql/group.query';
import USER_QUERY from '../graphql/user.query';
import DELETE_GROUP_MUTATION from '../graphql/delete-group.mutation';
import LEAVE_GROUP_MUTATION from '../graphql/leave-group.mutation';

class GroupDetails extends Component {
  deleteGroup = () => {
    this.props
      .deleteGroup(this.props.navigation.state.params.id)
      .then(() => {
        this.props.navigation.dispatch(resetAction);
      })
      .catch(e => {
        console.log(e); // eslint-disable-line no-console
      });
  };

  leaveGroup = () => {
    this.props
      .leaveGroup({
        id: this.props.navigation.state.params.id,
        userId: 1
      }) // fake user for now
      .then(() => {
        this.props.navigation.dispatch(resetAction);
      })
      .catch(e => {
        console.log(e); // eslint-disable-line no-console
      });
  };

  keyExtractor = item => item.id.toString();
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
    variables: { groupId: ownProps.navigation.state.params.id }
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
