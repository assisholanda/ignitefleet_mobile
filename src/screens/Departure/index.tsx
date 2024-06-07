import { useEffect, useRef, useState } from 'react';
import { TextInput, ScrollView, Alert } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import { Car } from 'phosphor-react-native';

import { useNavigation } from '@react-navigation/native';

import {
  useForegroundPermissions,
  requestBackgroundPermissionsAsync,
  watchPositionAsync,
  LocationAccuracy,
  LocationSubscription,
  LocationObjectCoords
} from 'expo-location';

import { useUser } from '@realm/react';
import { useRealm } from '../../libs/realm';
import { Historic } from '../../libs/realm/schemas/Historic';

import { startLocationTask } from '../../tasks/backgroundLocationTask';

import { Container, Content, Message } from './styles';

import { Header } from '../../components/Header';
import { LicensePlateInput } from '../../components/LIcensePlateInput';
import { TextAreaInput } from '../../components/TextAreaInput';
import { Button } from '../../components/Button';
import { Loading } from '../../components/Loading';
import { LocationInfo } from '../../components/LocationInfo';
import { Map } from '../../components/Map';

import { licensePlateValidate } from '../../utils/licensePlateValidate';
import { getAddressLocation } from '../../utils/getAddressLocation';



export function Departure() {

  const [description, setDescription] = useState('');
  const [licensePlate, setLicensePlate] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [currentAddress, setCurrentAddress] = useState<string | null>(null);
  const [currentCoords, setCurrentCoords] = useState<LocationObjectCoords | null>(null);

  const [locationForegroundPermission, requestLocationForegroundPermission] = useForegroundPermissions();

  const realm = useRealm();
  const user = useUser();

  const { goBack } = useNavigation();

  const descriptionRef = useRef<TextInput>(null);
  const licensePlateRef = useRef<TextInput>(null);

  async function handleDepartureRegister() {

    try {

      if (!licensePlateValidate(licensePlate)) {
        licensePlateRef.current?.focus();
        return Alert.alert("Placa inválida", "A placa é inválida. Por favor informe uma placa correta do veículo.");
      }

      if (description.trim().length === 0) {
        descriptionRef.current?.focus();
        return Alert.alert("Finalidade", "Por favor, informe a finalidade da utilização do veículo.");
      }

      if(!currentCoords?.latitude && !currentCoords?.longitude) {
        return Alert.alert("Localização", "Não foi possível obter a localização atual. Tente novamente.");
      }

      setIsRegistering(true);

      const backgroundPermissions = requestBackgroundPermissionsAsync();

      if(!backgroundPermissions) {

        setIsRegistering(false);
        return Alert.alert('Localização", "É necessário permitir que o App tenha acesso a localização em segundo plano. Acesse as configurações do dispositivo e habilite "Permitir o tempo todo".');

      }

      await startLocationTask();

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

  useEffect(() => {
    requestLocationForegroundPermission();
  }, []);

  useEffect(() => {

    if (!locationForegroundPermission?.granted) {
      return;
    }

    let subscription: LocationSubscription;

    watchPositionAsync({
      accuracy: LocationAccuracy.High,
      timeInterval: 1000
    }, (location) => {
      setCurrentCoords(location.coords);
      getAddressLocation(location.coords)
        .then((address) => {
          if (address) {
            setCurrentAddress(address);
          }
        }).finally(() => setIsLoadingLocation(false));
    })
      .then((response) => subscription = response);

    return () => {
      if (subscription) {
        subscription.remove();
      }
    };

  }, [locationForegroundPermission]);

  if (!locationForegroundPermission?.granted) {

    return (

      <Container>
        <Header title='Saída' />
        <Message>Você precisa permitir que o aplicativo tenha acesso a localização para utilizar essa funcionalidade. Por favor acesse as configurações do seu dispositivo para conceder essa permissão ao Aplicativo</Message>
      </Container>

    )

  }

  if (isLoadingLocation) {
    return (
      <Loading />
    )
  }

  return (
    <Container>

      <Header title='Saída' />

      <KeyboardAwareScrollView extraHeight={150}>
        <ScrollView>

          { currentCoords && <Map coordinates={[ currentCoords ]} /> }
          
          {/* CODIGO DE TESTE NA MÃO PRA MAIS DE UM MARCADOR 
            
            currentCoords && <Map coordinates={[ 
              { latitude: -23.5657, longitude: -46.6515 },
              { latitude: -23.5694, longitude: -46.6467 }
             ]} /> 
            
          */
          }

          <Content>

            {
              currentAddress &&
              <LocationInfo
                icon={Car}
                label='Localização atual'
                description={currentAddress}
              />
            }

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