import { Meteor } from 'meteor/meteor';
import React, { Component } from 'react';
import { Container, Header, Segment, Message, Accordion, Button, Icon } from 'semantic-ui-react';
import { Link } from 'react-router';

import GamestateComp from '../imports/GamestateComp';
import RegisterForm from './imports/RegisterForm';

const { eventYear } = Meteor.settings.public;

class RegisterInner extends Component {
  render() {

    const { ready, gamestate } = this.props;

    if (!ready) return <Loading />;

    let content = null;

    if (gamestate.registration) {
      content = (
        <Segment basic>
          <RegisterForm />
        </Segment>
      );
    } else {
      content = (
        <Message
          info size='large'
          header='Registration is Closed'
          content={`The ${eventYear} Great Puzzle Hunt registration is now closed.`}
        />
      );
    }

    return (
      <Container>
        <br/>
        {content}
      </Container>
    );
  }
}

Register = GamestateComp(RegisterInner);
