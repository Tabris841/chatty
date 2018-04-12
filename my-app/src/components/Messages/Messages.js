import React from 'react';
import randomColor from 'randomcolor';
import { connect } from 'react-redux';
import { times } from 'lodash/util';

import styleSheet from './Messages.scss';

import Message from './Message/Message';
import AppBar from '../AppBar/AppBar';
import PropTypes from "prop-types";

const fakeData = () => times(100, i => ({
  // every message will have a different color
  color: randomColor(),
  // every 5th message will look like it's from the current user
  isCurrentUser: i % 5 === 0,
  message: {
    id: i,
    createdAt: new Date().toISOString(),
    from: {
      username: `Username ${i}`,
    },
    text: `Message ${i}`,
  },
}));

const Messages = (props) => {
  const messages = fakeData().map(item => (
    <Message
      key={item.message.id}
      color={item.color}
      isCurrentUser={item.isCurrentUser}
      message={item.message}
    />
  ));

  return (
    <div className="container">
      <AppBar title={props.title} />
      {messages}

      <style jsx>{styleSheet}</style>
    </div>
  )
};

Messages.proptypes = {
  title: PropTypes.string.isRequired
};

const mapStateToProps = state => {
  return {
    // TODO: improve getting the title
    title: state.router.location.state ? state.router.location.state.title : ''
  }
};

export default connect(mapStateToProps)(Messages);
