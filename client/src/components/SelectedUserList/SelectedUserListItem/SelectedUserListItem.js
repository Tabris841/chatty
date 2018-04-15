import React from 'react';
import PropTypes from 'prop-types';
import Avatar from 'material-ui/Avatar';

const SelectedUserListItem = props => {
  return (
    <div>
      <Avatar>{props.username}</Avatar>
    </div>
  );
};

SelectedUserListItem.prototype = {
  user: PropTypes.shape({
    id: PropTypes.number,
    username: PropTypes.string
  }),
  remove: PropTypes.func
};

export default SelectedUserListItem;
