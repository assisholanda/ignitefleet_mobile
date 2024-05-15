import { useEffect, useState } from 'react';
import { Alert, FlatList } from 'react-native';

import { Container, Content, Label, Title } from './styles';

import { useQuery, useRealm } from '../../libs/realm';
import { Historic } from '../../libs/realm/schemas/Historic';

import { useNavigation } from '@react-navigation/native';

import dayjs from 'dayjs';

import { HomeHeader } from '../../components/HomeHeader';
import { CarStatus } from '../../components/CarStatus';
import { HistoricCard, HistoricCardProps } from '../../components/HistoricCard';

export function Home() {

  const [vehiculoInUse, setVehiculoInUse] = useState<Historic | null>(null);
  const [vehiculoHistoric, setVehiculoHistoric] = useState<HistoricCardProps[]>([]);

  const { navigate } = useNavigation();

  const historic = useQuery(Historic);

  const realm = useRealm();


  function handleRegisterMoviment() {

    if (vehiculoInUse?._id) {
      navigate('arrival', { id: vehiculoInUse?._id.toString() });
    } else {
      navigate('departure');
    }
  }

  function fetchVehicleInUse() {

    try {

      const vehicle = historic.filtered("status = 'departure'")[0];
      setVehiculoInUse(vehicle);

    } catch (error) {
      Alert.alert("Veículo em uso", "Erro ao recuperar o veículo em uso.");
      console.log("Erro catch => ", error);
    }

  }

  function fetchHistoric() {

    try {

      const response = historic.filtered("status = 'arrival' SORT(created_at DESC)");

      const formattedHistoric = response.map((item) => {

        return ({
          id: item._id!.toString(),
          licensePlate: item.license_plate,
          isSync: false,
          created: dayjs(item.created_at).format('[Saída em] DD/MM/YYYY [às] HH:mm')
        });

      });

      setVehiculoHistoric(formattedHistoric);

    } catch (error) {
      console.log(error);
      Alert.alert('Error', 'Erro ao tentar recuperar os dados do historico.')
    }

  }

  function handleHistoricDetails(id: string) {
    navigate('arrival', { id });
  }


  useEffect(() => {
    fetchVehicleInUse();
    fetchHistoric();
  }, []);

  useEffect(() => {
    realm.addListener('change', () => fetchVehicleInUse());

    return () => {
      if (realm && !realm.isClosed) {
        realm.removeListener('change', () => fetchVehicleInUse);
      }
    }

  }, []);

  useEffect(() => {
    fetchHistoric();
  }, [historic]);

  return (
    <Container>
      <HomeHeader />

      <Content>

        <CarStatus
          licensePlate={vehiculoInUse?.license_plate}
          onPress={handleRegisterMoviment}
        />

        <Title>Histórico</Title>

        <FlatList
          data={vehiculoHistoric}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: 100
          }}
          ListEmptyComponent={(
            <Label>Nenhum registro de utilização dos veículos.</Label>
          )}
          renderItem={({ item }) => (
            <HistoricCard
              onPress={() => handleHistoricDetails(item.id)}
              data={item}
            />
          )}
        />

      </Content>

    </Container>
  );
}