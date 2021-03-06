import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import randomColor from 'randomcolor';
import { graphql, compose } from 'react-apollo';
import { LinearProgress } from 'material-ui/Progress';
import update from 'immutability-helper';
import { Buffer } from 'buffer';
import moment from 'moment';
import { find } from 'lodash';
import { connect } from 'react-redux';

import styleSheet from './Messages.scss';

import { wsClient } from '../../index';
import Message from '../../components/Message/Message';
import MessageInput from '../../components/MessageInput/MessageInput';
import AppBar from '../../components/AppBar/AppBar';
import GROUP_QUERY from '../../graphql/group.query';
import CREATE_MESSAGE_MUTATION from '../../graphql/create-message.mutation';
import USER_QUERY from '../../graphql/user.query';
import MESSAGE_ADDED_SUBSCRIPTION from '../../graphql/message-added.subscription';

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

      // we don't resubscribe on changed props
      // because it never happens in our app
      if (!this.subscription) {
        this.subscription = nextProps.subscribeToMore({
          document: MESSAGE_ADDED_SUBSCRIPTION,
          variables: {
            groupIds: [nextProps.location.state.groupId]
          },
          updateQuery: (previousResult, { subscriptionData }) => {
            const newMessage = subscriptionData.data.messageAdded;

            return update(previousResult, {
              group: {
                messages: {
                  edges: {
                    $unshift: [
                      {
                        __typename: 'MessageEdge',
                        node: newMessage,
                        cursor: Buffer.from(newMessage.id.toString()).toString(
                          'base64'
                        )
                      }
                    ]
                  }
                }
              }
            });
          }
        });
      }

      if (!this.reconnected) {
        this.reconnected = wsClient.onReconnected(() => {
          this.props.refetch(); // check for any data lost during disconnect
        }, this);
      }
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.loading === true && !this.props.loading) {
      this.scrollToBottom();
    }

    if (
      prevProps.group &&
      prevProps.group.messages.edges.length > 0 &&
      this.props.group &&
      this.props.group.messages.edges.length > 0
    ) {
      const firstMessageId = this.props.group.messages.edges[0].node.id;
      const prevFirstMessageId = prevProps.group
        ? prevProps.group.messages.edges[0].node.id
        : null;

      if (firstMessageId !== prevFirstMessageId) {
        this.scrollToBottom();
      }
    }
  }

  componentDidMount() {
    this.props.refetch();
    this.scrollToBottom();
  }

  onEndReached = () => {
    if (
      !this.state.loadingMoreEntries &&
      this.props.group.messages.pageInfo.hasNextPage
    ) {
      this.setState({
        loadingMoreEntries: true
      });
      this.props.loadMoreEntries().then(() => {
        this.setState({
          loadingMoreEntries: false
        });
      });
    }
  };

  send = text => {
    this.props
      .createMessage({
        groupId: this.props.location.state.groupId,
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

  handleScroll = e => {
    if (e.target.scrollTop <= 400) {
      this.onEndReached();
    }
  };

  render() {
    const { loading, group } = this.props;
    let messages = null;

    if (group) {
      messages = group.messages.edges
        .slice()
        .reverse()
        .map(({ node: message }) => {
          return (
            <Message
              key={message.id}
              color={this.state.usernameColors[message.from.username]}
              isCurrentUser={message.from.id === this.props.auth.id}
              message={message}
            />
          );
        });
    }

    return (
      <div className="container">
        <AppBar
          title={this.props.location.state.title}
          groupId={this.props.location.state.groupId}
        />
        {loading && <LinearProgress />}
        <div
          className="messages"
          ref={ref => {
            this.messagesRef = ref;
          }}
          onScroll={this.handleScroll}
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
    messages: PropTypes.shape({
      edges: PropTypes.arrayOf(
        PropTypes.shape({
          cursor: PropTypes.string,
          node: PropTypes.object
        })
      ),
      pageInfo: PropTypes.shape({
        hasNextPage: PropTypes.bool,
        hasPreviousPage: PropTypes.bool
      })
    }),
    users: PropTypes.array
  }),
  loading: PropTypes.bool,
  loadMoreEntries: PropTypes.func,
  refetch: PropTypes.func,
  subscribeToMore: PropTypes.func
};

const ITEMS_PER_PAGE = 10;

const groupQuery = graphql(GROUP_QUERY, {
  options: ownProps => ({
    variables: {
      groupId: ownProps.location.state.groupId,
      messageConnection: {
        first: ITEMS_PER_PAGE
      }
    }
  }),
  props: ({
    data: { fetchMore, loading, group, refetch, subscribeToMore }
  }) => ({
    loading,
    group,
    refetch,
    subscribeToMore,
    loadMoreEntries() {
      return fetchMore({
        // query: ... (you can specify a different query.
        // GROUP_QUERY is used by default)
        variables: {
          // load more queries starting from the cursor of the last (oldest) message
          messageConnection: {
            first: ITEMS_PER_PAGE,
            after: group.messages.edges[group.messages.edges.length - 1].cursor
          }
        },
        updateQuery: (previousResult, { fetchMoreResult }) => {
          // we will make an extra call to check if no more entries
          if (!fetchMoreResult) {
            return previousResult;
          }
          // push results (older messages) to end of messages list
          return update(previousResult, {
            group: {
              messages: {
                edges: { $push: fetchMoreResult.group.messages.edges },
                pageInfo: { $set: fetchMoreResult.group.messages.pageInfo }
              }
            }
          });
        }
      });
    }
  })
});

const createMessageMutation = graphql(CREATE_MESSAGE_MUTATION, {
  props: ({ ownProps, mutate }) => ({
    createMessage: message =>
      mutate({
        variables: { message },
        optimisticResponse: {
          __typename: 'Mutation',
          createMessage: {
            __typename: 'Message',
            id: -1, // don't know id yet, but it doesn't matter
            text: message.text, // we know what the text will be
            createdAt: new Date().toISOString(), // the time is now!
            from: {
              __typename: 'User',
              id: ownProps.auth.id,
              username: ownProps.auth.username
            },
            to: {
              __typename: 'Group',
              id: message.groupId
            }
          }
        },
        update: (store, { data: { createMessage } }) => {
          // Read the data from our cache for this query.
          const groupData = store.readQuery({
            query: GROUP_QUERY,
            variables: {
              groupId: message.groupId,
              messageConnection: { first: ITEMS_PER_PAGE }
            }
          });

          // Add our message from the mutation to the end.
          groupData.group.messages.edges.unshift({
            __typename: 'MessageEdge',
            node: createMessage,
            cursor: Buffer.from(createMessage.id.toString()).toString('base64')
          });

          // Write our data back to the cache.
          store.writeQuery({
            query: GROUP_QUERY,
            variables: {
              groupId: message.groupId,
              messageConnection: { first: ITEMS_PER_PAGE }
            },
            data: groupData
          });

          const userData = store.readQuery({
            query: USER_QUERY,
            variables: {
              id: ownProps.auth.id
            }
          });

          // check whether the mutation is the latest message and update cache
          const updatedGroup = find(userData.user.groups, {
            id: message.groupId
          });
          if (
            !updatedGroup.messages.edges.length ||
            moment(updatedGroup.messages.edges[0].node.createdAt).isBefore(
              moment(message.createdAt)
            )
          ) {
            // update the latest message
            updatedGroup.messages.edges[0] = {
              __typename: 'MessageEdge',
              node: createMessage,
              cursor: Buffer.from(createMessage.id.toString()).toString(
                'base64'
              )
            };

            // Write our data back to the cache.
            store.writeQuery({
              query: USER_QUERY,
              variables: {
                id: ownProps.auth.id
              },
              data: userData
            });
          }
        }
      })
  })
});

const mapStateToProps = ({ auth }) => ({
  auth
});

export default compose(
  connect(mapStateToProps),
  groupQuery,
  createMessageMutation
)(Messages);
