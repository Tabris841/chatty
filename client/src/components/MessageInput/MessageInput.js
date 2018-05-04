import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Paper, TextField, Grid, Button } from 'material-ui';
import SendIcon from '@material-ui/icons/Send';

class MessageInput extends Component {
  state = {
    message: ''
  };

  handleChange = event => {
    this.setState({
      message: event.target.value
    });
  };

  send = () => {
    this.props.send(this.state.message);
    this.setState({
      message: ''
    });
    this.textInput.blur();
  };

  render() {
    return (
      <Paper>
        <Grid container alignItems="center">
          <Grid item xs={1} />
          <Grid item xs={7}>
            <TextField
              inputRef={ref => (this.textInput = ref)}
              fullWidth
              margin="normal"
              placeholder="Placeholder"
              value={this.state.message}
              onChange={this.handleChange}
            />
          </Grid>
          <Grid item xs={1} />
          <Grid item xs={2}>
            <Button variant="fab" mini color="primary" onClick={this.send}>
              <SendIcon />
            </Button>
          </Grid>
          <Grid item xs={1} />
        </Grid>
      </Paper>
    );
  }
}

MessageInput.propTypes = {
  send: PropTypes.func.isRequired
};

export default MessageInput;
