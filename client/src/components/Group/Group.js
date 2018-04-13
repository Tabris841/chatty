import React from 'react';
import PropTypes from 'prop-types';
import { ListItem, ListItemText } from 'material-ui/List';

const Group = props => {
  const { id, name } = props.group;

  return (
    <ListItem key={id} button onClick={props.goToMessages}>
      <ListItemText primary={name} />
    </ListItem>
  );
};

Group.propTypes = {
  goToMessages: PropTypes.func.isRequired,
  group: PropTypes.shape({
    id: PropTypes.number,
    name: PropTypes.string
  })
};

export default Group;
