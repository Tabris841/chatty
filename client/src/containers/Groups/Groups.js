import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import { graphql, compose } from 'react-apollo';
import { withStyles } from 'material-ui/styles';
import { LinearProgress, List } from 'material-ui';

import styleSheet from './Groups.scss';

import Group from '../../components/Group/Group';
import AppBar from '../../components/AppBar/AppBar';
import Auxiliary from '../../hoc/Auxiliary/Auxiliary';
import { USER_QUERY } from '../../graphql/user.query';

const styles = {
  root: {
    height: '85.5vh'
  }
};

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
          </div>
        );
      });
    }

    return (
      <Auxiliary>
        <AppBar title="Chats" goNext={this.props.goToNewGroup} goNextTitle={'New Group'}/>
        {(loading || !user) && <LinearProgress/>}
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
        name: PropTypes.string.isRequired,
      }),
    ),
  }),
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
      dispatch(push('/messages', { groupId: group.id, title: group.name })),
    goToNewGroup: () => dispatch(push('/new-group'))
  };
};

export default compose(userQuery, connect(null, mapDispatchToProps))(
  withStyles(styles)(Groups)
);
