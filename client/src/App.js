import React, { Component } from 'react';
import { Route, Switch, Redirect } from 'react-router-dom';
import Paper from 'material-ui/Paper';

import styleSheet from './App.scss';

import CenteredTabs from './components/Navigation/Navigation';
import Groups from './containers/Groups/Groups';
import Messages from './containers/Messages/Messages';
import NewGroup from './containers/NewGroup/NewGroup';

class App extends Component {
  render() {
    return (
      <Paper>
        <main>
          <Switch>
            <Route path="/messages" component={Messages} />
            <Route path="/new-group" component={NewGroup} />
            <Route path="/">
              <div className="main-container">
                <Switch>
                  <Route path="/chats" component={Groups} />
                  <Route path="/settings" render={() => <div>Settings</div>} />
                  <Redirect to="/chats" />
                </Switch>
                <CenteredTabs />
              </div>
            </Route>
            <Redirect to="/" />
          </Switch>
        </main>

        <style jsx>{styleSheet}</style>
      </Paper>
    );
  }
}

export default App;
