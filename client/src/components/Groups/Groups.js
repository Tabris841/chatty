import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Route, Switch } from 'react-router-dom';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import { graphql, compose } from 'react-apollo';
import List from 'material-ui/List';
import Divider from 'material-ui/Divider';
import { LinearProgress } from 'material-ui/Progress';

import Group from './Group/Group';
import Messages from '../Messages/Messages';
import AppBar from '../AppBar/AppBar';
import { USER_QUERY } from '../../graphql/user.query';

class Groups extends Component {
  render() {
    const { loading, user } = this.props;
    let userChatGroups = null;

    if (user) {
      userChatGroups = user.groups.map(item => {
        return (
          <div key={item.id}>
            <Group
              group={item}
              goToMessages={() => this.props.goToMessages(item)}
            />
            <Divider />
          </div>
        );
      });
    }

    const groups = (
      <div>
        <AppBar title="Chats" />
        {loading && <LinearProgress />}
        <List>{userChatGroups}</List>
      </div>
    );

    return (
      <Switch>
        <Route path="/chats/messages" component={Messages} />
        <Route path="/" render={() => groups} />
      </Switch>
    );
  }
}

Groups.propTypes = {
  goToMessages: PropTypes.func,
  loading: PropTypes.bool,
  user: PropTypes.shape({
    id: PropTypes.number.isRequired,
    email: PropTypes.string.isRequired,
    groups: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired
      })
    )
  })
};

const userQuery = graphql(USER_QUERY, {
  options: () => ({ variables: { id: 1 } }), // fake the user for now
  props: ({ data: { loading, user } }) => ({
    loading,
    user
  })
});

const mapDispatchToProps = dispatch => {
  return {
    goToMessages: group =>
      dispatch(
        push('/chats/messages', { groupId: group.id, title: group.name })
      )
  };
};

export default compose(userQuery, connect(null, mapDispatchToProps))(Groups);
