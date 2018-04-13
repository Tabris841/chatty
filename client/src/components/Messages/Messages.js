import React, { Component } from 'react';
import PropTypes from 'prop-types';
import randomColor from 'randomcolor';
import { connect } from 'react-redux';
import { graphql, compose } from 'react-apollo';
import { LinearProgress } from 'material-ui/Progress';

import styleSheet from './Messages.scss';

import Message from './Message/Message';
import AppBar from '../AppBar/AppBar';
import GROUP_QUERY from '../../graphql/group.query';

class Messages extends Component {
  constructor(props) {
    super(props);
    const usernameColors = {};
    if (props.group && props.group.users) {
      props.group.users.forEach(user => {
        usernameColors[user.username] = randomColor();
      });
    }
    this.state = {
      usernameColors
    };
  }

  componentWillReceiveProps(nextProps) {
    const usernameColors = {};
    // check for new messages
    if (nextProps.group) {
      if (nextProps.group.users) {
        // apply a color to each user
        nextProps.group.users.forEach(user => {
          usernameColors[user.username] =
            this.state.usernameColors[user.username] || randomColor();
        });
      }
      this.setState({
        usernameColors
      });
    }
  }

  render() {
    const { loading, group } = this.props;
    let messages = null;

    if (group) {
      messages = group.messages
        .slice()
        .reverse()
        .map(item => {
          return (
            <Message
              key={item.id}
              color={this.state.usernameColors[item.from.username]}
              isCurrentUser={item.from.id === 1} // for now until we implement auth
              message={item}
            />
          );
        });
    }

    return (
      <div className="container">
        <AppBar title={this.props.title} />
        {loading && <LinearProgress />}
        {messages}

        <style jsx>{styleSheet}</style>
      </div>
    );
  }
}

Messages.proptypes = {
  title: PropTypes.string.isRequired,
  group: PropTypes.shape({
    messages: PropTypes.array,
    users: PropTypes.array
  }),
  loading: PropTypes.bool
};

const groupQuery = graphql(GROUP_QUERY, {
  options: ownProps => {
    return {
      variables: {
        groupId: ownProps.location.state.groupId
      }
    };
  },
  props: ({ data: { loading, group } }) => ({
    loading,
    group
  })
});

const mapStateToProps = state => {
  return {
    // TODO: improve getting the title
    title: state.router.location.state ? state.router.location.state.title : ''
  };
};

export default compose(groupQuery, connect(mapStateToProps))(Messages);
