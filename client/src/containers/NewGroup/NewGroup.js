import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { groupBy, keys } from 'lodash';
import { graphql, compose } from 'react-apollo';
import update from 'immutability-helper';
import { LinearProgress } from 'material-ui/Progress';

import SelectedUserList from '../../components/SelectedUserList/SelectedUserListItem';
import Auxiliary from '../../hoc/Auxiliary/Auxiliary';
import USER_QUERY from '../graphql/user.query';
import AppBar from '../../components/AppBar/AppBar';

const sortObject = o =>
  Object.keys(o)
    .sort()
    .reduce((r, k) => ((r[k] = o[k]), r), {});

class NewGroup extends Component {
  constructor(props) {
    super(props);

    let selected = [];
    if (this.props.navigation.state.params) {
      selected = this.props.navigation.state.params.selected;
    }

    this.state = {
      selected: selected || [],
      friends: props.user
        ? groupBy(props.user.friends, friend =>
            friend.username.charAt(0).toUpperCase()
          )
        : []
    };
  }

  componentDidMount() {
    this.refreshNavigation(this.state.selected);
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

  componentWillUpdate(nextProps, nextState) {
    if (!!this.state.selected.length !== !!nextState.selected.length) {
      this.refreshNavigation(nextState.selected);
    }
  }

  refreshNavigation(selected) {
    const { navigation } = this.props;
    navigation.setParams({
      mode: selected && selected.length ? 'ready' : undefined,
      finalizeGroup: this.finalizeGroup
    });
  }

  finalizeGroup = () => {
    const { navigate } = this.props.navigation;
    navigate('FinalizeGroup', {
      selected: this.state.selected,
      friendCount: this.props.user.friends.length,
      userId: this.props.user.id
    });
  };

  isSelected = user => {
    return ~this.state.selected.indexOf(user);
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

    return (
      <Auxiliary>
        <AppBar />
        {(loading || !user) && <LinearProgress />}
        {this.state.selected.length ? (
          <SelectedUserList data={this.state.selected} remove={this.toggle} />
        ) : null}
        {keys(this.state.friends).length ? <div>friends list</div> : null}
      </Auxiliary>
    );
  }
}

NewGroup.propTypes = {
  loading: PropTypes.bool.isRequired,
  navigation: PropTypes.shape({
    navigate: PropTypes.func,
    setParams: PropTypes.func,
    state: PropTypes.shape({
      params: PropTypes.object
    })
  }),
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
  options: ownProps => ({ variables: { id: 1 } }), // fake for now
  props: ({ data: { loading, user } }) => ({
    loading,
    user
  })
});

export default compose(userQuery)(NewGroup);
