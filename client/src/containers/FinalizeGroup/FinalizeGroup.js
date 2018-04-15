import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { graphql, compose } from 'react-apollo';
import update from 'immutability-helper';
import { map } from 'lodash';

import { USER_QUERY } from '../graphql/user.query';
import CREATE_GROUP_MUTATION from '../graphql/create-group.mutation';
import SelectedUserList from '../../components/SelectedUserList/SelectedUserListItem';

class FinalizeGroup extends Component {
  constructor(props) {
    super(props);

    const { selected } = props.navigation.state.params;

    this.state = {
      selected
    };
  }

  componentDidMount() {
    this.refreshNavigation(this.state.selected.length && this.state.name);
  }

  componentWillUpdate(nextProps, nextState) {
    if (
      (nextState.selected.length && nextState.name) !==
      (this.state.selected.length && this.state.name)
    ) {
      this.refreshNavigation(nextState.selected.length && nextState.name);
    }
  }

  pop = () => {
    this.props.navigation.goBack();
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

  create = () => {
    const { createGroup } = this.props;

    createGroup({
      name: this.state.name,
      userId: 1, // fake user for now
      userIds: map(this.state.selected, 'id')
    })
      .then(res => {
        this.props.navigation.dispatch(goToNewGroup(res.data.createGroup));
      })
      .catch(error => {
        Alert.alert('Error Creating New Group', error.message, [
          { text: 'OK', onPress: () => {} }
        ]);
      });
  };

  refreshNavigation(ready) {
    const { navigation } = this.props;
    navigation.setParams({
      mode: ready ? 'ready' : undefined,
      create: this.create
    });
  }
}

FinalizeGroup.propTypes = {
  createGroup: PropTypes.func.isRequired,
  navigation: PropTypes.shape({
    dispatch: PropTypes.func,
    goBack: PropTypes.func,
    state: PropTypes.shape({
      params: PropTypes.shape({
        friendCount: PropTypes.number.isRequired
      })
    })
  })
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
  options: ownProps => ({
    variables: {
      id: ownProps.navigation.state.params.userId
    }
  }),
  props: ({ data: { loading, user } }) => ({
    loading,
    user
  })
});

export default compose(userQuery, createGroupMutation)(FinalizeGroup);
