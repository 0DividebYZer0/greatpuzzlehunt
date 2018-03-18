import { Meteor } from 'meteor/meteor';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Table, Message, Icon } from 'semantic-ui-react';
import { reduce } from 'lodash';

import AdminUserTableRow from './AdminUserTableRow';
import AdminUserModal from './AdminUserModal';

class AdminUserTable extends Component {
  constructor(props) {
    super(props);
    this.state = this.stateFromProps(props);
  }

  componentWillReceiveProps(nextProps) {
    this.setState(this.stateFromProps(nextProps));
  }

  stateFromProps(props) {
    const { loading, users } = props;
    const volunteerCount = reduce(users, (acc, user) => {
      if (user.accountType === 'VOLUNTEER') {
        acc += 1;
      }
      return acc;
    }, 0);

    return {
      userCount: users.length,
      volunteerCount,
      playerCount: users.length - volunteerCount,
    };
  }

  render() {
    const { loading, users } = this.props;
    if (loading) return <Loading/>;

    const { userCount, volunteerCount, playerCount, selectedUser } = this.state;

    return (
      <div> {/* outer div for react root component element */}
        <Message icon>
          <Icon name="users" color="green"/>
          <Message.Content>
            <Message.Header>User Summary</Message.Header>
            <strong>Total:</strong> {userCount} &nbsp; <strong>Players:</strong> {playerCount} &nbsp; <strong>Volunteers:</strong> {volunteerCount}
          </Message.Content>
        </Message>
        <Table celled striped>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Created</Table.HeaderCell>
              <Table.HeaderCell>Name</Table.HeaderCell>
              <Table.HeaderCell>Email</Table.HeaderCell>
              <Table.HeaderCell>Team</Table.HeaderCell>
              <Table.HeaderCell>Actions</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {this._mapUsers()}
          </Table.Body>
        </Table>

        <AdminUserModal user={selectedUser} clearUser={() => this.setState({ selectedUser: null })}/>
      </div>
    );
  }

  _mapUsers() {
    const { users } = this.props;
    return users.map((user) => {
      return (
      <AdminUserTableRow
        user={user}
        key={user._id}
        selectUser={() => this._selectUser(user) }
      />);
    });
  }

  _selectUser(user) {
    this.setState({ selectedUser: user });
  }
}

AdminUserTable.propTypes = {
  loading: PropTypes.bool.isRequired,
  users: PropTypes.arrayOf(PropTypes.object),
};

export default AdminUserTable;
