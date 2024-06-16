import React, { useEffect, useState } from 'react';
import { Alert } from 'react-native';

import dayjs from 'dayjs';

import { useRoute, useNavigation } from '@react-navigation/native';
import { LatLng } from 'react-native-maps';

import { Container, Content, Description, Footer, Label, LicensePlate, AsyncMessage } from './styles';

import { X } from 'phosphor-react-native';

import { Header } from '../../components/Header';
import { Button } from '../../components/Button';
import { ButtonIcon } from '../../components/ButtonIcon';
import { Locations } from '../../components/Locations';
import { LocationInfoProps } from '../../components/LocationInfo';
import { Loading } from '../../components/Loading';
import { Map } from '../../components/Map';

import { BSON } from 'realm';
import { useObject, useRealm } from '../../libs/realm';
import { getLastSyncTimestamp } from '../../libs/asyncStorage/syncStorage';
import { getStorageLocation } from '../../libs/asyncStorage/locationStorage';
import { Historic } from '../../libs/realm/schemas/Historic';

import { stopLocationTask } from '../../tasks/backgroundLocationTask';

import { getAddressLocation } from '../../utils/getAddressLocation';



type RouteParamsProps = {
    id: string;
}

export function Arrival() {

    const [dataNotSynced, setDataNotSynced] = useState(false);
    const [coordinates, setCoordinates] = useState<LatLng[]>([]);
    const [departure, setDeparture] = useState<LocationInfoProps>({} as LocationInfoProps);
    const [arrival, setArrival] = useState<LocationInfoProps | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const route = useRoute();
    const { id } = route.params as RouteParamsProps;
    const { goBack } = useNavigation();

    const historic = useObject(Historic, new BSON.UUID(id) as unknown as string);
    const realm = useRealm();

    const title = historic?.status === 'departure' ? 'Chegada' : 'Detalhes';


    function handleRemoveVehicleUsage() {

        Alert.alert(
            'Cancelar',
            'Cancelar a utilização do veículo?',
            [
                { text: 'Não', style: 'cancel' },
                { text: 'Sim', onPress: () => removeVehicleUsage() },
            ]
        );

    }

    async function removeVehicleUsage() {

        realm.write(() => {
            realm.delete(historic);
        });

        await stopLocationTask();
        goBack();

    }

    async function handleArrivalRegister() {

        try {

            if (!historic) {
                return Alert.alert('Error', 'Não foi possível obter os dados para registrar a chegada do veículo.');
            }

            const locations = await getStorageLocation();

            realm.write(() => {
                historic.status = 'arrival';
                historic.updated_at = new Date();
                historic.coords.push(...locations)
            });

            await stopLocationTask();

            Alert.alert('Chegada', 'Chegada registrada com sucesso.');
            goBack();

        } catch (error) {
            Alert.alert('Error', 'Não foi possível registrar a chegada do veículo.');
        }
    }

    async function getLocationInfo() {

        if (!historic) {
            return;
        }

        const lastSync = await getLastSyncTimestamp();
        const updatedAt = historic!.updated_at.getTime();
        setDataNotSynced(updatedAt > lastSync);

        if (historic?.status === 'departure') {
            const locationsStorage = await getStorageLocation();
            setCoordinates(locationsStorage);
        } else {
            const coords = historic?.coords.map((coord) => {
                return {
                    latitude: coord.latitude,
                    longitude: coord.longitude
                }
            })

            setCoordinates(coords ?? []);
        }

        if (historic?.coords[0]) {

            const departureStreetName = await getAddressLocation(historic?.coords[0]);

            setDeparture({
                label: `Saindo em ${departureStreetName ?? ''}`,
                description: dayjs(new Date(historic?.coords[0].timestamp)).format('DD/MM/YYYY [às] HH:mm')
            });

        }

        if (historic?.status === 'arrival') {

            const lastLocation = historic?.coords[historic?.coords.length - 1];

            const arrivalStreetName = await getAddressLocation(lastLocation);

            setArrival({
                label: `Chegando em ${arrivalStreetName ?? ''}`,
                description: dayjs(new Date(lastLocation.timestamp)).format('DD/MM/YYYY [às] HH:mm')
            });

        }

        setIsLoading(false);

    }

    useEffect(() => {
        getLocationInfo();
    }, [historic]);


    if (isLoading) {
        return (
            <Loading />
        );
    }

    return (
        <Container>

            <Header title={title} />

            {
                coordinates.length > 0 &&
                <Map coordinates={coordinates} />
            }

            <Content>

                <Locations
                    departure={departure}
                    arrival={arrival}
                />


                <Label>Placa do veículo</Label>
                <LicensePlate>{historic?.license_plate}</LicensePlate>

                <Label>Finalidade</Label>
                <Description>{historic?.description}</Description>

            </Content>

            {
                historic?.status === 'departure' &&
                <Footer>
                    <ButtonIcon
                        icon={X}
                        onPress={handleRemoveVehicleUsage}
                    />
                    <Button title='Registrar chegada' onPress={handleArrivalRegister} />
                </Footer>
            }

            {
                dataNotSynced &&
                <AsyncMessage>
                    Sincronização da {historic?.status === 'departure' ? 'partida' : 'chegada'} pendente.
                </AsyncMessage>
            }
        </Container>
    );
}