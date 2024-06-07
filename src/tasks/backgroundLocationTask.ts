import {
    Accuracy,
    hasStartedLocationUpdatesAsync,
    startLocationUpdatesAsync,
    stopLocationUpdatesAsync
} from 'expo-location'

import * as TaskManager from 'expo-task-manager';

import { saveStorageLocation } from '../libs/asyncStorage/locationStorage';

export const BACKGROUND_TASK_NAME = 'location-tracking';

TaskManager.defineTask(BACKGROUND_TASK_NAME, async ({ data, error }: any) => {

    console.log("Entrou na definiçao da TaskManager");

    try {

        if (error) {
            throw error
        }

        if (data) {

            const { coords, timestamp } = data.locations[0];

            const currentLocation = {
                latitude: coords.latitude,
                longitude: coords.longitude,
                timestamp
            }

            await saveStorageLocation(currentLocation);
        }

    } catch (error) {
        console.log(error)
        stopLocationTask();
    }

})

export async function startLocationTask() {

    try {

        console.log("Executou função startLocationTask");

        const hasStarted = await hasStartedLocationUpdatesAsync(BACKGROUND_TASK_NAME)

        console.log("hasStarted start: ", hasStarted);

        if (hasStarted) {
            console.log("Entrou no if verificando se existe a const hasStarted - chamando a função stopLocationTask");
            await stopLocationTask();
        }

        console.log("inicia a tarefa de fato pela função startLocationUpdateAsync");
        await startLocationUpdatesAsync(BACKGROUND_TASK_NAME, {
            accuracy: Accuracy.Highest,
            distanceInterval: 1,
            timeInterval: 1000
        })

    } catch (error) {
        console.log(error)
    }

}

export async function stopLocationTask() {

    try {

        console.log("Entrou na função stopLocationTask");

        const hasStarted = await hasStartedLocationUpdatesAsync(BACKGROUND_TASK_NAME)
        console.log("hasStarted stop: ", hasStarted);

        if (hasStarted) {
            console.log("Entrou no if que verifica se ja tem a const hasStarted");
            await stopLocationUpdatesAsync(BACKGROUND_TASK_NAME)
        }

    } catch (error) {
        console.log()
    }
}