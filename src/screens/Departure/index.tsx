import { Container, Content } from './styles';

import { Header } from '../../components/Header';
import { LIcensePlateInput } from '../../components/LIcensePlateInput';
import { TextAreaInput } from '../../components/TextAreaInput';
import { Button } from '../../components/Button';

export function Departure() {
  return (
    <Container>

      <Header title='Saída' />

      <Content>
        <LIcensePlateInput
          label='Placa do veículo'
          placeholder='BRA123'
        />

        <TextAreaInput
          label='Finalidade'
          placeholder='Vou utilizar o veículo para...'
        />

        <Button 
          title='Registrar Saída'
        />
      </Content>



    </Container>
  );
}