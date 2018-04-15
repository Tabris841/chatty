import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import { graphql, compose } from 'react-apollo';
import { withStyles } from 'material-ui/styles';
import List from 'material-ui/List';
import Divider from 'material-ui/Divider';
import { LinearProgress } from 'material-ui/Progress';

import styleSheet from './Groups.scss';

import Group from '../../components/Group/Group';
import AppBar from '../../components/AppBar/AppBar';
import Auxiliary from '../../hoc/Auxiliary/Auxiliary';
import { USER_QUERY } from '../../graphql/user.query';

const styles = theme => ({
  root: {
    height: '85.5vh'
  }
});

class Groups extends Component {
  render() {
    const { loading, user, classes } = this.props;
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

    return (
      <Auxiliary>
        <AppBar title="Chats" />
        {loading && <LinearProgress />}ssssssssssssss
        <List className={classes.root}>{userChatGroups}</List>

        <style jsx>{styleSheet}</style>
      </Auxiliary>
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
      dispatch(push('/messages', { groupId: group.id, title: group.name }))
  };
};

export default compose(userQuery, connect(null, mapDispatchToProps))(
  withStyles(styles)(Groups)
);
