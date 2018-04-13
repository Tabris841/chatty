import React, { Component } from 'react';
import { Route, Switch, Redirect } from 'react-router-dom';
import Paper from 'material-ui/Paper';

import styleSheet from './App.scss';

import CenteredTabs from './components/Navigation/Navigation'
import Groups from './components/Groups/Groups';

class App extends Component {
  render() {
    return (
      <Paper>
        <main>
          <Switch>
            <Route path="/chats" component={Groups}/>
            <Route path="/settings" render={() => <div>Settings</div>}/>
            <Redirect to="/chats" />
          </Switch>
        </main>
        <CenteredTabs />

        <style jsx>{styleSheet}</style>
      </Paper>
    );
  }
}

export default App;
