import React from 'react';
import moment from 'moment';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import Card, { CardHeader, CardContent } from 'material-ui/Card';
import Avatar from 'material-ui/Avatar';
import Typography from 'material-ui/Typography';

import styleSheet from './Message.scss';

const styles = theme => ({
  card: {
    flex: 1,
    borderRadius: 6
  },
  myMessage: {
    backgroundColor: '#dcf8c6'
  }
});

const Message = props => {
  const { color, message, isCurrentUser, classes } = props;
  const cardClassName = () => {
    let names = [classes.card];
    if (isCurrentUser) names.push(classes.myMessage);

    return names.join(' ');
  };

  return (
    <div className="message">
      {isCurrentUser ? <div className="messages-spacer" /> : null}
      <Card className={cardClassName()}>
        <CardHeader
          avatar={
            <Avatar style={{ backgroundColor: color }}>
              {message.from.username.substring(0, 1)}
            </Avatar>
          }
          title={message.from.username}
          subheader={moment(message.createdAt).format('h:mm A')}
        />
        <CardContent>
          <Typography paragraph>{message.text}</Typography>
        </CardContent>
      </Card>
      {!isCurrentUser ? <div className="messages-spacer" /> : null}

      <style jsx>{styleSheet}</style>
    </div>
  );
};

Message.propTypes = {
  color: PropTypes.string.isRequired,
  message: PropTypes.shape({
    createdAt: PropTypes.string.isRequired,
    from: PropTypes.shape({
      username: PropTypes.string.isRequired
    }),
    text: PropTypes.string.isRequired
  }),
  isCurrentUser: PropTypes.bool.isRequired
};

export default withStyles(styles)(Message);
