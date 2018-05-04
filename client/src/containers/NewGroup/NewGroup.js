import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { groupBy } from 'lodash';
import { graphql, compose } from 'react-apollo';
import update from 'immutability-helper';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import {
  LinearProgress,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  Checkbox,
  Avatar
} from 'material-ui';

import SelectedUserList from '../../components/SelectedUserList/SelectedUserList';
import Auxiliary from '../../hoc/Auxiliary/Auxiliary';
import USER_QUERY from '../../graphql/user.query';
import AppBar from '../../components/AppBar/AppBar';

const sortObject = o =>
  Object.keys(o)
    .sort()
    .reduce((r, k) => ((r[k] = o[k]), r), {});

class NewGroup extends Component {
  constructor(props) {
    super(props);

    this.state = {
      selected: [],
      friends: props.user
        ? groupBy(props.user.friends, friend =>
            friend.username.charAt(0).toUpperCase()
          )
        : []
    };
  }

  componentWillReceiveProps(nextProps) {
    const state = {};
    if (
      nextProps.user &&
      nextProps.user.friends &&
      nextProps.user !== this.props.user
    ) {
      state.friends = sortObject(
        groupBy(nextProps.user.friends, friend =>
          friend.username.charAt(0).toUpperCase()
        )
      );
    }

    if (nextProps.selected) {
      Object.assign(state, {
        selected: nextProps.selected
      });
    }

    this.setState(state);
  }

  onGoNextClicked = () => {
    this.props.finalizeGroup({
      selected: this.state.selected,
      friendCount: this.props.user.friends.length,
      userId: this.props.user.id
    });
  };

  isSelected = user => {
    return !!~this.state.selected.indexOf(user);
  };

  toggle = user => {
    const index = this.state.selected.indexOf(user);
    if (~index) {
      const selected = update(this.state.selected, { $splice: [[index, 1]] });

      return this.setState({
        selected
      });
    }

    const selected = [...this.state.selected, user];

    return this.setState({
      selected
    });
  };

  render() {
    const { user, loading } = this.props;

    let appBar = <AppBar title="New Group" />;

    if (this.state.selected.length > 0) {
      appBar = (
        <AppBar
          title="New Group"
          goNext={this.onGoNextClicked}
          goNextTitle={'Next'}
        />
      );
    }

    const friendsList = Object.keys(this.state.friends).map(key => (
      <div key={key}>
        <h1>{key}</h1>
        {this.state.friends[key].map(friend => {
          return (
            <List key={friend.id}>
              <ListItem dense button onClick={() => this.toggle(friend)}>
                <Avatar style={{ backgroundColor: '#35D9FD' }}>
                  {friend.username.substring(0, 1)}
                </Avatar>
                <ListItemText primary={friend.username} />
                <ListItemSecondaryAction>
                  <Checkbox
                    onChange={() => this.toggle(friend)}
                    checked={this.isSelected(friend)}
                  />
                </ListItemSecondaryAction>
              </ListItem>
            </List>
          );
        })}
      </div>
    ));

    return (
      <Auxiliary>
        {appBar}
        {(loading || !user) && <LinearProgress />}
        {this.state.selected.length ? (
          <SelectedUserList data={this.state.selected} remove={this.toggle} />
        ) : null}
        {friendsList}
      </Auxiliary>
    );
  }
}

NewGroup.propTypes = {
  loading: PropTypes.bool.isRequired,
  user: PropTypes.shape({
    id: PropTypes.number,
    friends: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.number,
        username: PropTypes.string
      })
    )
  }),
  selected: PropTypes.arrayOf(PropTypes.object)
};

const userQuery = graphql(USER_QUERY, {
  options: ownProps => ({ variables: { id: ownProps.auth.id } }),
  props: ({ data: { loading, user } }) => ({
    loading,
    user
  })
});

const mapStateToProps = ({ auth }) => ({
  auth
});

const mapDispatchToProps = dispatch => {
  return {
    finalizeGroup: ({ selected, friendCount, userId }) =>
      dispatch(
        push('/finalize-group', {
          selected,
          friendCount,
          userId
        })
      )
  };
};

export default compose(connect(mapStateToProps, mapDispatchToProps), userQuery)(
  NewGroup
);
