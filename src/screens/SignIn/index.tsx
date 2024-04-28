import { useState } from 'react';
import { Alert } from 'react-native';

import { Container, Title, Slogam} from './styles';

import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { WEB_CLIENT_ID, IOS_CLIENT_ID } from '@env';

import { Realm, useApp } from '@realm/react';

import backgroundImg from '../../assets/background.png';

import { Button } from '../../components/Button';

GoogleSignin.configure({
    scopes: ['email', 'profile'],
    webClientId: WEB_CLIENT_ID,
    iosClientId: IOS_CLIENT_ID,
});

export function SignIn() {

  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const app = useApp();

  async function handleGoogleSignIn() {
      
    try {
      setIsAuthenticating(true);

      const { idToken } = await GoogleSignin.signIn();

      if(idToken) {

        const credentials = Realm.Credentials.jwt(idToken);        
        await app.logIn(credentials);        

      } else {
        Alert.alert("Login", "Não foi possível logar e recuperar seus dados da sua conta Google.");
        setIsAuthenticating(false);
      }
     
      
    } catch (error) {
      console.log(error);
      Alert.alert("Login", "Não foi possível conectar-se a sua conta Google.");
      setIsAuthenticating(false);
    }


  }

  return (
    <Container source={backgroundImg}>
      <Title>Ignite Fleet</Title>
      <Slogam>Gestão de uso de veículos</Slogam>

      <Button 
        title='Entrar com o google' 
        isLoading={isAuthenticating} 
        onPress={handleGoogleSignIn}
      />

    </Container>
  );
}


