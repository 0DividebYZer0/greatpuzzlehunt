import { Meteor } from 'meteor/meteor';
import { isAdmin } from '../../lib/imports/method-helpers.js';

Meteor.users.deny({
  update: () => {
    return true;
  }
});

Meteor.publish(null, function() {
  let currentUser = this.userId;

  if (currentUser) {
    return Meteor.users.find({
      _id: currentUser
    }, {
      fields: {
        emails: 1,
        firstname: 1,
        lastname: 1,
        name: 1,
        roles: 1,
        updatedAt: 1,
      }
    });
  } else {
      return this.ready();
  }
});

Meteor.publish('admin.users', function(){
  return isAdmin() ? Meteor.users.find({}) : [];
});