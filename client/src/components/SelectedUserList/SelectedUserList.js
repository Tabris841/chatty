import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import GridList from 'material-ui/GridList';

import SelectedUserListItem from './SelectedUserListItem/SelectedUserListItem';

const styles = theme => ({
  root: {
    display: 'flex',
    flexWrap: 'wrap',
    overflow: 'hidden',
    backgroundColor: theme.palette.background.paper,
  },
  gridList: {
    flexWrap: 'nowrap',
    padding: '12px 12px 0',
    // Promote the list into his own layer on Chrome. This cost memory but helps keeping high FPS.
    transform: 'translateZ(0)',
  },
});

const SelectedUserList = (props) => {
  const { data, remove, classes } = props;

  return (
    <div className={classes.root}>
      <GridList className={classes.gridList}>
        {data.map(user => <SelectedUserListItem key={user.id} user={user} remove={remove}/>)}
      </GridList>
    </div>
  )

};

SelectedUserList.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object),
  remove: PropTypes.func,
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(SelectedUserList);
