import { Container, Title, Slogam} from './styles';

import backgroundImg from '../../assets/background.png';

import { Button } from '../../components/Button';

export function SignIn() {
  return (
    <Container source={backgroundImg}>
      <Title>Ignite Fleet</Title>
      <Slogam>Gestão de uso de veículos</Slogam>

      <Button title='Entrar com o google' />

    </Container>
  );
}


