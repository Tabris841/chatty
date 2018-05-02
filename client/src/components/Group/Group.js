import React from 'react';
import PropTypes from 'prop-types';
import { ListItem, ListItemText } from 'material-ui/List';
import { Avatar } from 'material-ui';
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight';
import moment from 'moment/moment';

import styleSheet from './Group.scss';

// format createdAt with moment
const formatCreatedAt = createdAt =>
  moment(createdAt).calendar(null, {
    sameDay: '[Today]',
    nextDay: '[Tomorrow]',
    nextWeek: 'dddd',
    lastDay: '[Yesterday]',
    lastWeek: 'dddd',
    sameElse: 'DD/MM/YYYY'
  });

const Group = props => {
  const { id, name, messages } = props.group;
  const edgesLength = messages.edges.length;

  return (
    <ListItem key={id} button onClick={props.goToMessages} divider={true}>
      <Avatar src="https://reactjs.org/logo-og.png" />
      <ListItemText>
        <div className="group-name">{name}</div>
        <div className="group-username">
          {edgesLength ? `${messages.edges[0].node.from.username}:` : ''}
        </div>
        <div className="group-text">{edgesLength ? messages.edges[0].node.text : ''}</div>
      </ListItemText>
      <div>
        <div className="group-last-update">
          {edgesLength ? formatCreatedAt(messages.edges[0].node.createdAt) : ''}
        </div>
        <KeyboardArrowRight />
      </div>

      <style jsx>{styleSheet}</style>
    </ListItem>
  );
};

Group.propTypes = {
  goToMessages: PropTypes.func.isRequired,
  group: PropTypes.shape({
    id: PropTypes.number,
    name: PropTypes.string,
    messages: PropTypes.shape({
      edges: PropTypes.arrayOf(
        PropTypes.shape({
          cursor: PropTypes.string,
          node: PropTypes.object
        })
      )
    })
  })
};

export default Group;
