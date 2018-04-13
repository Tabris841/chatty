import GraphQLDate from 'graphql-date';

import { Group, Message, User } from './connectors';

export const Resolvers = {
  Date: GraphQLDate,
  Query: {
    group(_, args) {
      return Group.find({ where: args });
    },
    messages(_, args) {
      return Message.findAll({
        where: args,
        order: [['createdAt', 'DESC']]
      });
    },
    user(_, args) {
      return User.findOne({ where: args });
    }
  },
  Mutation: {
    createMessage(_, { text, userId, groupId }) {
      return Message.create({
        userId,
        text,
        groupId
      });
    },
    createGroup(_, createGroupInput) {
      const { name, userIds } = createGroupInput.group;

      return User.findOne({
        where: { id: '1' }
      }).then(user => {
        return user
          .getFriends({ where: { id: { $in: userIds } } })
          .then(friends =>
            Group.create({ name }).then(group =>
              group.addUsers([user, ...friends]).then(() => {
                group.users = [user, ...friends]; // eslint-disable-line
                return group;
              })
            )
          );
      });
    },
    deleteGroup(_, { id, user }) {
      return Group.findOne({
        where: { id },
        include: [
          {
            model: User,
            where: { id: user.id }
          }
        ]
      }).then(group =>
        group
          .getUsers()
          .then(users => group.removeUsers(users))
          .then(() => Message.destroy({ where: { groupId: group.id } }))
          .then(() => group.destroy())
      );
    },
    leaveGroup(_, { id }) {
      return Group.findOne({
        where: { id },
        include: [
          {
            model: User,
            where: { id: '1' }
          }
        ]
      }).then(group => {
        if (!group) {
          Promise.reject(new Error('No group found'));
        }

        return group
          .removeUser('1')
          .then(() => group.getUsers())
          .then(users => {
            // if the last user is leaving, remove the group
            if (!users.length) {
              group.destroy();
            }
            return { id };
          });
      });
    },
    updateGroup(_, updateGroupInput) {
      const { id, name } = updateGroupInput.group;

      return Group.findOne({
        where: { id },
        include: [
          {
            model: User,
            where: { id: '1' }
          }
        ]
      }).then(group => group.update({ name }));
    }
  },
  Group: {
    users(group) {
      return group.getUsers();
    },
    messages(group) {
      return Message.findAll({
        where: { groupId: group.id },
        order: [['createdAt', 'DESC']]
      });
    }
  },
  Message: {
    to(message) {
      return message.getGroup();
    },
    from(message) {
      return message.getUser();
    }
  },
  User: {
    messages(user) {
      return Message.findAll({
        where: { userId: user.id },
        order: [['createdAt', 'DESC']]
      });
    },
    groups(user) {
      return user.getGroups();
    },
    friends(user) {
      return user.getFriends();
    }
  }
};
export default Resolvers;
