import React, { Component } from 'react';
import { Route, Switch, Redirect, withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import { graphql, compose } from 'react-apollo';
import update from 'immutability-helper';
import { map } from 'lodash';
import { Buffer } from 'buffer';
import { connect } from 'react-redux';
import { Paper } from 'material-ui';

import styleSheet from './App.scss';

import CenteredTabs from './components/Navigation/Navigation';
import Groups from './containers/Groups/Groups';
import Messages from './containers/Messages/Messages';
import NewGroup from './containers/NewGroup/NewGroup';
import FinalizeGroup from './containers/FinalizeGroup/FinalizeGroup';
import GroupDetails from './containers/GroupDetails/GroupDetails';
import SignIn from './containers/SignIn/SignIn';
import Settings from './containers/Settings/Settings';

import { USER_QUERY } from './graphql/user.query';
import MESSAGE_ADDED_SUBSCRIPTION from './graphql/message-added.subscription';
import GROUP_ADDED_SUBSCRIPTION from './graphql/group-added.subscription';

import { wsClient } from './index';

class App extends Component {
  componentWillReceiveProps(nextProps) {
    if (!nextProps.user) {
      if (this.groupSubscription) {
        this.groupSubscription();
      }

      if (this.messagesSubscription) {
        this.messagesSubscription();
      }

      // clear the event subscription
      if (this.reconnected) {
        this.reconnected();
      }
    } else if (!this.reconnected) {
      this.reconnected = wsClient.onReconnected(() => {
        this.props.refetch(); // check for any data lost during disconnect
      }, this);
    }

    if (
      nextProps.user &&
      nextProps.user.id === nextProps.auth.id &&
      (!this.props.user ||
        nextProps.user.groups.length !== this.props.user.groups.length)
    ) {
      // unsubscribe from old

      if (typeof this.messagesSubscription === 'function') {
        this.messagesSubscription();
      }
      // subscribe to new
      if (nextProps.user.groups.length) {
        this.messagesSubscription = nextProps.subscribeToMessages();
      }
    }

    if (!this.groupSubscription && nextProps.user) {
      this.groupSubscription = nextProps.subscribeToGroups();
    }
  }

  render() {
    let routes = (
      <Switch>
        <Route path="/sign-in" component={SignIn} />
        <Redirect to="/sign-in" />
      </Switch>
    );

    if (this.props.auth && this.props.auth.jwt) {
      routes = (
        <Switch>
          <Route path="/messages" component={Messages} />
          <Route path="/new-group" component={NewGroup} />
          <Route path="/finalize-group" component={FinalizeGroup} />
          <Route path="/group-details" component={GroupDetails} />
          <Route path="/">
            <div className="main-container">
              <Switch>
                <Route path="/chats" component={Groups} />
                <Route path="/settings" component={Settings} />
                <Redirect to="/chats" />
              </Switch>
              <CenteredTabs />
            </div>
          </Route>
          <Redirect to="/" />
        </Switch>
      );
    }

    return (
      <Paper>
        <main>{routes}</main>

        <style jsx>{styleSheet}</style>
      </Paper>
    );
  }
}

App.propTypes = {
  auth: PropTypes.shape({
    id: PropTypes.number,
    jwt: PropTypes.string
  }),
  refetch: PropTypes.func,
  subscribeToGroups: PropTypes.func,
  subscribeToMessages: PropTypes.func,
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
  skip: ownProps => !ownProps.auth || !ownProps.auth.jwt,
  options: ownProps => ({ variables: { id: ownProps.auth.id } }),
  props: ({ data: { loading, user, refetch, subscribeToMore } }) => ({
    loading,
    user,
    refetch,
    subscribeToMessages() {
      return subscribeToMore({
        document: MESSAGE_ADDED_SUBSCRIPTION,
        variables: {
          groupIds: map(user.groups, 'id')
        },
        updateQuery: (previousResult, { subscriptionData }) => {
          const previousGroups = previousResult.user.groups;
          const newMessage = subscriptionData.data.messageAdded;

          const groupIndex = map(previousGroups, 'id').indexOf(
            newMessage.to.id
          );

          return update(previousResult, {
            user: {
              groups: {
                [groupIndex]: {
                  messages: {
                    edges: {
                      $set: [
                        {
                          __typename: 'MessageEdge',
                          node: newMessage,
                          cursor: Buffer.from(
                            newMessage.id.toString()
                          ).toString('base64')
                        }
                      ]
                    }
                  }
                }
              }
            }
          });
        }
      });
    },
    subscribeToGroups() {
      return subscribeToMore({
        document: GROUP_ADDED_SUBSCRIPTION,
        variables: { userId: user.id },
        updateQuery: (previousResult, { subscriptionData }) => {
          const newGroup = subscriptionData.data.groupAdded;

          return update(previousResult, {
            user: {
              groups: { $push: [newGroup] }
            }
          });
        }
      });
    }
  })
});

const mapStateToProps = ({ auth }) => ({
  auth
});

export default withRouter(compose(connect(mapStateToProps), userQuery)(App));
