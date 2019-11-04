import React from 'react';
import PropTypes from 'prop-types';
import { Keyboard, ActivityIndicator, AsyncStorage } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import {
  Container,
  Form,
  Input,
  SubmitButton,
  List,
  User,
  Avatar,
  Name,
  Bio,
  ProfileButton,
  ProfileButtonText,
} from './styles';
import api from '../../services/api';

export default class Main extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      newUser: '',
      users: [],
      error: null,
      loading: false,
    };
  }

  async componentDidMount() {
    const users = await AsyncStorage.getItem('users');
    if (users) {
      this.setState({ users: JSON.parse(users) });
    }
  }

  componentDidUpdate(_, prevState) {
    const { users } = this.state;
    if (prevState.users !== users) {
      AsyncStorage.setItem('users', JSON.stringify(users));
    }
  }

  handleNavigate = user => {
    const { navigation } = this.props;

    navigation.navigate('User', { user });
  };

  handleAddUser = async () => {
    const { newUser } = this.state;

    this.setState({ loading: true });

    try {
      const respose = await api.get(`/users/${newUser}`);

      const data = {
        name: respose.data.name,
        login: respose.data.login,
        bio: respose.data.bio,
        avatar: respose.data.avatar_url,
      };

      this.setState(prevState => ({
        users: [...prevState.users, data],
        newUser: '',
        loading: false,
        error: null,
      }));
    } catch (err) {
      this.setState({
        loading: false,
        error: err.message,
      });
    }

    Keyboard.dismiss();
  };

  render() {
    const { users, newUser, loading, error } = this.state;
    return (
      <Container>
        <Form>
          <Input
            autoCorrect={false}
            autoCapitalize="none"
            placeholder={error || 'Adicionar usuário'}
            value={newUser}
            onChangeText={text => this.setState({ newUser: text })}
            returnKeyType="send"
            onSubmitEditing={this.handleAddUser}
            error={error}
          />
          <SubmitButton loading={loading} onPress={this.handleAddUser}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <MaterialIcons name="add" size={20} color="#fff" />
            )}
          </SubmitButton>
        </Form>

        <List
          data={users}
          keyExtractor={user => user.login}
          renderItem={({ item }) => (
            <User>
              <Avatar source={{ uri: item.avatar }} />
              <Name>{item.name}</Name>
              <Bio>{item.bio}</Bio>

              <ProfileButton onPress={() => this.handleNavigate(item)}>
                <ProfileButtonText>Ver Perfil</ProfileButtonText>
              </ProfileButton>
            </User>
          )}
        />
      </Container>
    );
  }
}

Main.navigationOptions = {
  title: 'Usuários',
};

Main.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func,
  }).isRequired,
};
