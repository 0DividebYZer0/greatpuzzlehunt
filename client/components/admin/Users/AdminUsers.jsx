import { Meteor } from 'meteor/meteor';
import React, { Component } from 'react';
import { Grid, Container, Input, Menu, Icon, Label } from 'semantic-ui-react';

import DebounceSearch from '../../imports/DebounceSearch';
import AdminUserListTracker from './imports/AdminUserListTracker';

AdminUsers = class AdminUsers extends Component {
  constructor(props) {
    super(props);
    this.state = {
      search: '',
    };
  }

  render() {
    const { search } = this.state;

    return (
      <Container>
        <PuzzlePageTitle title='Admin: Users'/>

        <Grid stackable>

          <Grid.Row>
            <Grid.Column>
              <DebounceSearch
                fluid
                icon='search'
                placeholder='Search by Name or Email'
                delay={350}
                onSearch={(search) => this.setState({ search })}
              />
            </Grid.Column>
          </Grid.Row>

          <Grid.Row>
            <Grid.Column>
              <AdminUserListTracker search={search} />
            </Grid.Column>
          </Grid.Row>

        </Grid>

      </Container>
    );
  }
}
