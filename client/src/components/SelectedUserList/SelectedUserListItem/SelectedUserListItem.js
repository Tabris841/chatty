import React from 'react';
import PropTypes from 'prop-types';
import Avatar from 'material-ui/Avatar';
import CloseIcon from '@material-ui/icons/Close';
import { withStyles } from "material-ui";

import styleSheet from './SelectedUserListItem.scss';

const styles = {
  avatar: {
    overflow: 'visible',
    backgroundColor: '#35D9FD',
    margin: 'auto'
  },
  closeIcon: {
    position: 'absolute',
    right: -6,
    top: -1,
    color: 'white',
    background: '#ccc',
    borderRadius: '50%',
    border: '1px solid white',
    fontSize: 14
  }
};

const SelectedUserListItem = props => {
  return (
    <div className="container" onClick={() => props.remove(props.user)}>
      <Avatar className={props.classes.avatar}>
        {props.user.username.substring(0, 1)}
        <CloseIcon className={props.classes.closeIcon}/>
      </Avatar>
      <p>{props.user.username}</p>

      <style jsx>{styleSheet}</style>
    </div>
  );
};

SelectedUserListItem.prototype = {
  user: PropTypes.shape({
    id: PropTypes.number,
    username: PropTypes.string
  }),
  remove: PropTypes.func,
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(SelectedUserListItem);
