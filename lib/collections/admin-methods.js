import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { times, random } from 'lodash';
import { requireAdmin, requireVolunteer, notDuringGameplay, NonEmptyString } from '../imports/method-helpers.js';
import { sendTickets } from '../imports/sendTickets';
import { sendReports, sendUsersAndTeams } from '../imports/sendReports';
import { cloneDeep, omit, sum } from 'lodash';

Meteor.methods({
  'admin.transactions.resend'(tx, boughtBy) {
    check(tx, NonEmptyString);
    check(boughtBy, NonEmptyString);
    requireAdmin();
    if (!Meteor.isServer) return true;

    sendTickets(tx, boughtBy);
  },

  'admin.sendReport'() {
    if (Meteor.isClient) return;
    requireAdmin();
    const user = Meteor.users.findOne(this.userId);
    return sendReports(user.email);
  },

  'admin.sendUsersAndTeams'() {
    if (Meteor.isClient) return;
    requireAdmin();
    const user = Meteor.users.findOne(this.userId);
    return sendUsersAndTeams(user.email);
  },

});

if (Meteor.isServer) {

  function makeTestUser(userUnique) {
    const accountType = random(0, 1) ? 'STUDENT' : 'NONSTUDENT';
    const photoPermission = random(0, 100) > 10;
    const email = `${userUnique}@example.com`;
    const age = random(7, 70);

    const userId = Accounts.createUser({
      firstname: `first_${userUnique}`,
      lastname: `last_${userUnique}`,
      email,
      password: `testtest`,
      roles: ['user', 'player'],
      accountType,
      age,
      phone: '111-222-3333',
      address: '1234 Fake St',
      city: 'Cool City',
      state: 'WA',
      zip: '98055',
      ecName: 'ICE name here',
      ecRelationship: 'Reliable friend',
      ecPhone: '222-333-4444',
      ecEmail: `${userUnique}_ICE@example.com`,
      parentGuardian: age < 14 ? `${userUnique} Parent Name` : "",
      photoPermission,
      holdHarmless: true,
      bio: `I am ${userUnique}`,
      lookingForTeam: (random(0, 1) > .5),
    });
    Accounts.addEmail(userId, email, (random(0, 1) > .5));
    return userId;
  }

  Meteor.methods({
    'admin.test.makeTeams'(teamCount) {
      check(teamCount, Number);
      if (!Meteor.isServer) return true;

      if (process.env.NODE_ENV !== 'development' || !Meteor.isServer) {
        throw new Meteor.Error(400, 'This method is unavailable');
      }

      const divisions = [
        'wwu-student',
        'wwu-alumni',
        'highschool',
        'open',
      ];

      // Create Team Iteration
      times(teamCount, (i) => {
        const userCount = random(2, 6);
        const users = new Array(userCount);

        // Create Team's Users Iteration
        times(userCount, (j) => {
          users[j] = makeTestUser(`team${i}_user${j}`);
        });

        // Create some solo users
        times(random(1,3), (j) => {
          makeTestUser(`solo_user_${i}${j}`);
        });

        const now = new Date();
        const team = {
          name: `GPH Test Team ${i}`,
          password: 'testtest',
          owner: users[0],
          createAt: now,
          updatedAt: now,
          destination: '',
          members: users,
          lfm: (userCount < 6),
          division: divisions[random(0,divisions.length)],
        };

        // Create the Team
        const newTeamId = Teams.insert(team, (err) => {
          if (err) {
            throw new Meteor.Error(err.reason);
          }
        });

        const teamOptions = {
          $set: {
            "teamId": newTeamId,
            "updatedAt": new Date(),
          },
        };

        // Update all users to have this teamId.
        Meteor.users.update({ _id: { $in: users } }, teamOptions, { multi: true });
        Meteor.logger.info(`Created team ${i} (${newTeamId}) with ${userCount} member(s)`);
      });
    },

    'admin.test.reset'() {
      if (!Meteor.isServer) return true;
      if (process.env.NODE_ENV !== "development" || !Meteor.isServer) {
        throw new Meteor.Error(400, 'This method is unavailable');
      }

      // Remove Users and Teams
      const usersResult = Meteor.users.remove({});
      const teamsResult = Teams.remove({});

      Meteor.logger.info(`Removed ${usersResult} users...`);
      Meteor.logger.info(`Removed ${teamsResult} teams...`);
    },

    'admin.test.resetPuzzles'() {
      Teams.update({}, {
        $unset: {
          currentPuzzle: true,
          puzzles: true
        },
        $set: {
          hasBegun: false
        }
      }, {
        multi: true
      });

      const puzzles = Puzzles.find().fetch();
      const puzzleCopies = puzzles.map(teamPuzzleCopy);

      return Teams.update({
        puzzles: { $exists: false }
      }, {
        $set: {
          puzzles: puzzleCopies,
          currentPuzzle: null,
          finalScore: 0,
        }
      }, {
        multi: true,
      });
    },

  });
}
