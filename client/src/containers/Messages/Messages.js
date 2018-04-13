import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import randomColor from 'randomcolor';
import { connect } from 'react-redux';
import { graphql, compose } from 'react-apollo';
import { LinearProgress } from 'material-ui/Progress';

import styleSheet from './Messages.scss';

import Message from '../../components/Message/Message';
import MessageInput from '../../components/MessageInput/MessageInput';
import AppBar from '../../components/AppBar/AppBar';
import GROUP_QUERY from '../../graphql/group.query';
import CREATE_MESSAGE_MUTATION from '../../graphql/create-message.mutation';

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

  send = text => {
    this.props
      .createMessage({
        groupId: this.props.location.state.groupId,
        userId: 1, // faking the user for now
        text
      })
      .then(() => {
        this.scrollToBottom();
      });
  };

  scrollToBottom = () => {
    const scrollHeight = this.messagesRef.scrollHeight;
    const height = this.messagesRef.clientHeight;
    const maxScrollTop = scrollHeight - height;
    ReactDOM.findDOMNode(this.messagesRef).scrollTop =
      maxScrollTop > 0 ? maxScrollTop : 0;
  };

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
        <div
          className="messages"
          ref={ref => {
            this.messagesRef = ref;
          }}
        >
          {messages}
        </div>
        <MessageInput send={this.send} />

        <style jsx>{styleSheet}</style>
      </div>
    );
  }
}

Messages.proptypes = {
  createMessage: PropTypes.func,
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

const createMessageMutation = graphql(CREATE_MESSAGE_MUTATION, {
  props: ({ mutate }) => ({
    createMessage: ({ text, userId, groupId }) =>
      mutate({
        variables: { text, userId, groupId },
        optimisticResponse: {
          __typename: 'Mutation',
          createMessage: {
            __typename: 'Message',
            id: -1, // don't know id yet, but it doesn't matter
            text, // we know what the text will be
            createdAt: new Date().toISOString(), // the time is now!
            from: {
              __typename: 'User',
              id: 1, // still faking the user
              username: 'Justyn.Kautzer' // still faking the user
            },
            to: {
              __typename: 'Group',
              id: groupId
            }
          }
        },
        update: (store, { data: { createMessage } }) => {
          // Read the data from our cache for this query.
          const groupData = store.readQuery({
            query: GROUP_QUERY,
            variables: {
              groupId
            }
          });
          // Add our message from the mutation to the end.
          groupData.group.messages.unshift(createMessage);
          // Write our data back to the cache.
          store.writeQuery({
            query: GROUP_QUERY,
            variables: {
              groupId
            },
            data: groupData
          });
        }
      })
  })
});

const mapStateToProps = state => {
  return {
    // TODO: improve getting the title
    title: state.router.location.state ? state.router.location.state.title : ''
  };
};

export default compose(
  groupQuery,
  createMessageMutation,
  connect(mapStateToProps)
)(Messages);
