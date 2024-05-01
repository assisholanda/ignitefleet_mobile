import { Container, Content } from './styles';

import { useNavigation } from '@react-navigation/native';

import { HomeHeader } from '../../components/HomeHeader';
import { CarStatus } from '../../components/CarStatus';

export function Home() {

  const { navigate } = useNavigation();

  function handleRegisterMoviment() {
      navigate('departure');
  }

  return (
    <Container>
      <HomeHeader />

      <Content>
        <CarStatus onPress={handleRegisterMoviment} />
      </Content>

    </Container>
  );
}