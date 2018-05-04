import React from 'react';
import ReactDOM from 'react-dom';
import { ApolloProvider } from 'react-apollo';
import { ApolloClient } from 'apollo-client';
import { getMainDefinition } from 'apollo-utilities';
import { ApolloLink } from 'apollo-link';
import { createHttpLink } from 'apollo-link-http';
import ReduxLink from 'apollo-link-redux';
import { onError } from 'apollo-link-error';
import { WebSocketLink } from 'apollo-link-ws';
import { setContext } from 'apollo-link-context';
import { createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import { ReduxCache, apolloReducer } from 'apollo-cache-redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import { persistStore, persistCombineReducers } from 'redux-persist';
import { PersistGate } from 'redux-persist/lib/integration/react';
import thunk from 'redux-thunk';
import storage from 'redux-persist/lib/storage'
import createHistory from 'history/createBrowserHistory';
import {
ConnectedRouter,
routerReducer,
routerMiddleware
} from 'react-router-redux';
import { SubscriptionClient } from 'subscriptions-transport-ws';

import './index.css';

import auth from './reducers/auth.reducer';
import { logout } from './actions/auth.actions';

import App from './App';
import registerServiceWorker from './registerServiceWorker';

const URL = 'localhost:3000';

const config = {
  key: 'root',
  storage,
  blacklist: ['apollo'],
};

const reducer = persistCombineReducers(config, {
  apollo: apolloReducer,
  router: routerReducer,
  auth,
});

const history = createHistory();

const middleware = [thunk, routerMiddleware(history)];

const store = createStore(
  reducer,
  {}, // initial state
  composeWithDevTools(applyMiddleware(...middleware))
);

// persistent storage
const persistor = persistStore(store);

const cache = new ReduxCache({ store });

const reduxLink = new ReduxLink(store);

const httpLink = createHttpLink({ uri: `http://${URL}/graphql` });

// middleware for requests
const middlewareLink = setContext((req, previousContext) => {
  // get the authentication token from local storage if it exists
  const { jwt } = store.getState().auth;
  if (jwt) {
    return {
      headers: {
        authorization: `Bearer ${jwt}`,
      },
    };
  }

  return previousContext;
});

// afterware for responses
const errorLink = onError(({ graphQLErrors, networkError }) => {
  let shouldLogout = false;
  if (graphQLErrors) {
    console.log({ graphQLErrors });
    graphQLErrors.forEach(({ message, locations, path }) => {
      console.log({ message, locations, path });
      if (message === 'Unauthorized') {
        shouldLogout = true;
      }
    });

    if (shouldLogout) {
      store.dispatch(logout());
    }
  }
  if (networkError) {
    console.log('[Network error]:');
    console.log({ networkError });
    if (networkError.statusCode === 401) {
      logout();
    }
  }
});

// Create WebSocket client
export const wsClient = new SubscriptionClient(`ws://${URL}/subscriptions`, {
  lazy: true,
  reconnect: true,
  connectionParams() {
    // get the authentication token from local storage if it exists
    return { jwt: store.getState().auth.jwt };
  },
});

const webSocketLink = new WebSocketLink(wsClient);

const requestLink = ({ queryOrMutationLink, subscriptionLink }) =>
  ApolloLink.split(
    ({ query }) => {
      const { kind, operation } = getMainDefinition(query);
      return kind === 'OperationDefinition' && operation === 'subscription';
    },
    subscriptionLink,
    queryOrMutationLink
  );

const link = ApolloLink.from([
  reduxLink,
  errorLink,
  requestLink({
    queryOrMutationLink: middlewareLink.concat(httpLink),
    subscriptionLink: webSocketLink,
  }),
]);

export const client = new ApolloClient({
  link,
  cache
});

const app = (
  <ApolloProvider client={client}>
    <Provider store={store}>
      <PersistGate persistor={persistor}>
        <ConnectedRouter history={history}>
          <App />
        </ConnectedRouter>
      </PersistGate>
    </Provider>
  </ApolloProvider>
);

ReactDOM.render(app, document.getElementById('root'));
registerServiceWorker();
