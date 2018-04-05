import React from 'react';
import { ApolloClient } from 'apollo-client';
import { ApolloLink } from 'apollo-link';
import { ApolloProvider } from 'react-apollo';
import { composeWithDevTools } from 'redux-devtools-extension';
import { createHttpLink } from 'apollo-link-http';
import { createStore, combineReducers, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import { ReduxCache, apolloReducer } from 'apollo-cache-redux';
import ReduxLink from 'apollo-link-redux';
import { onError } from 'apollo-link-error';

import createHistory from 'history/createBrowserHistory';
import { Route, Switch, Link } from 'react-router-dom';

import {
  ConnectedRouter,
  routerReducer,
  routerMiddleware,
} from 'react-router-redux';

const URL = 'localhost:3000'; // set your comp's url here

// Create a history of your choosing (we're using a browser history in this case)
const history = createHistory();

// Build the middleware for intercepting and dispatching navigation actions
const middleware = [routerMiddleware(history)];

const store = createStore(
  combineReducers({
    apollo: apolloReducer,
    router: routerReducer,
  }),
  {}, // initial state
  composeWithDevTools(applyMiddleware(...middleware)),
);

const cache = new ReduxCache({ store });

const reduxLink = new ReduxLink(store);

const errorLink = onError((errors) => {
  console.log(errors);
});

const httpLink = createHttpLink({ uri: `http://${URL}/graphql` });

const link = ApolloLink.from([reduxLink, errorLink, httpLink]);

export const client = new ApolloClient({
  link,
  cache,
});

const Home = () => (
  <div>
    <h2>Home</h2>
  </div>
);

const About = () => (
  <div>
    <h2>About</h2>
  </div>
);

const App = () => {
  return (
    <ApolloProvider client={client}>
      <Provider store={store}>
        <ConnectedRouter history={history}>
          <div>
            <ul>
              <li>
                <Link to="/">Home</Link>
              </li>
              <li>
                <Link to="/about">About</Link>
              </li>
            </ul>
            <Switch>
              <Route path="/" component={Home} exact />
              <Route path="/about" component={About} exact />
            </Switch>
          </div>
        </ConnectedRouter>
      </Provider>
    </ApolloProvider>
  );
};

export default App;
