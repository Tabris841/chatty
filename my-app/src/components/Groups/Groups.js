import React from 'react';
import PropTypes from 'prop-types';
import { Route, Switch } from 'react-router-dom';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import { graphql } from 'react-apollo';
import { times } from 'lodash/util';
import List from 'material-ui/List';
import Divider from 'material-ui/Divider';

import Group from './Group/Group';
import Messages from "../Messages/Messages";
import AppBar from '../AppBar/AppBar';
import { USER_QUERY } from '../../graphql/user.query';

// create fake data to populate our ListView
const fakeData = () => times(100, i => ({
  id: i,
  name: `Group ${i}`,
}));

const Groups = (props) => {
  const mappedGroups = fakeData().map(item => {
    return (
      <div key={item.id}>
        <Group group={item} goToMessages={() => props.goToMessages(item)}/>
        <Divider />
      </div>
    );
  });

  const groups = (
    <div>
      <AppBar title="Chats" />
      <List>{mappedGroups}</List>
    </div>
  );

  return (
    <Switch>
      <Route path="/chats/messages" component={Messages}/>
      <Route path="/" render={() => groups}/>
    </Switch>
  );
};

Groups.propTypes = {
  goToMessages: PropTypes.func,
  loading: PropTypes.bool,
  user: PropTypes.shape({
    id: PropTypes.number.isRequired,
    email: PropTypes.string.isRequired,
    groups: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired,
      }),
    ),
  }),
};

const userQuery = graphql(USER_QUERY, {
  options: () => ({ variables: { id: 1 } }), // fake the user for now
  props: ({ data: { loading, user } }) => ({
    loading, user,
  }),
});

const mapDispatchToProps = dispatch => {
  return {
    goToMessages: (group) => dispatch(push('/chats/messages', { groupId: group.id, title: group.name })),
  }
};

export default connect(null, mapDispatchToProps)(userQuery(Groups));

