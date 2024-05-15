import { useRef, useState } from 'react';
import { TextInput, ScrollView, Alert } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import { useNavigation } from '@react-navigation/native';

import { useUser } from '@realm/react';
import { useRealm } from '../../libs/realm';
import { Historic } from '../../libs/realm/schemas/Historic';

import { Container, Content } from './styles';

import { Header } from '../../components/Header';
import { LicensePlateInput } from '../../components/LIcensePlateInput';
import { TextAreaInput } from '../../components/TextAreaInput';
import { Button } from '../../components/Button';

import { licensePlateValidate } from '../../utils/licensePlateValidate';

export function Departure() {

  const [description, setDescription] = useState('');
  const [licensePlate, setLicensePlate] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  const realm = useRealm();
  const user = useUser();

  const { goBack } = useNavigation();

  const descriptionRef = useRef<TextInput>(null);
  const licensePlateRef = useRef<TextInput>(null);

  function handleDepartureRegister() {

    try {

      if (!licensePlateValidate(licensePlate)) {
        licensePlateRef.current?.focus();
        return Alert.alert("Placa inválida", "A placa é inválida. Por favor informe uma placa correta do veículo.");
      }

      if (description.trim().length === 0) {
        descriptionRef.current?.focus();
        return Alert.alert("Finalidade", "Por favor, informe a finalidade da utilização do veículo.");
      }

      setIsRegistering(true);

      realm.write(() => {
        realm.create('Historic', Historic.generate({
          user_id: user!.id,
          license_plate: licensePlate.toUpperCase(),
          description
        }));
      });

      Alert.alert("Saída", "Saída do veículo registrada com sucesso.");
      setIsRegistering(false);
      goBack();

    } catch (error) {
      console.error(error);
      Alert.alert("Erro", "Não foi possível registrar a saída do veículo.");
      setIsRegistering(false);
    }



  }

  return (
    <Container>

      <Header title='Saída' />

      <KeyboardAwareScrollView extraHeight={150}>
        <ScrollView>
          <Content>
            <LicensePlateInput
              ref={licensePlateRef}
              label='Placa do veículo'
              placeholder='BRA123'
              onSubmitEditing={() => descriptionRef.current?.focus()}
              returnKeyType='next'
              onChangeText={setLicensePlate}
            />
            
            <TextAreaInput
              ref={descriptionRef}
              label='Finalidade'
              placeholder='Vou utilizar o veículo para...'
              onSubmitEditing={handleDepartureRegister}
              returnKeyType='send'
              blurOnSubmit
              onChangeText={setDescription}
            />

            <Button
              title='Registrar Saída'
              onPress={handleDepartureRegister}
              isLoading={isRegistering}
            />
          </Content>
        </ScrollView>
      </KeyboardAwareScrollView>

    </Container>
  );
}