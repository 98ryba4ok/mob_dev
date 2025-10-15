import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StyleSheet, Text, View, Pressable, Platform, BackHandler, ToastAndroid, Vibration } from 'react-native';
import { useEffect, useRef, useState } from 'react';
import { Image } from 'expo-image';
import { Audio, Video, ResizeMode } from 'expo-av';
import GameScreen from './src/screens/GameScreen';

type RootStackParamList = {
  Home: undefined;
  Game: undefined;
  Media: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
function HomeScreen({ navigation }: { navigation: any }) {
  useEffect(() => {
    if (Platform.OS === 'android') {
      let backPressed = false; // ← переменная объявляется вне обработчика

      const onBackPress = () => {
        if (backPressed) {
          BackHandler.exitApp(); // второе нажатие — выходим
          return true;
        }

        backPressed = true;
        ToastAndroid.show('Tap back again to exit', ToastAndroid.SHORT);

        // через 1.5 секунды сбрасываем состояние
        setTimeout(() => {
          backPressed = false;
        }, 1500);

        return true; // блокируем стандартное поведение
      };

      const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => sub.remove();
    }
  }, []);

  const handleHaptic = () => {
    if (Platform.OS === 'android') {
      Vibration.vibrate(100);
      ToastAndroid.show('Haptic feedback', ToastAndroid.SHORT);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Wordle RN</Text>
      <View style={styles.row}>
        <Pressable style={styles.button} onPress={() => navigation.navigate('Game')}>
          <Text style={styles.buttonText}>Play</Text>
        </Pressable>
        <Pressable style={styles.button} onPress={() => navigation.navigate('Media')}>
          <Text style={styles.buttonText}>Media</Text>
        </Pressable>
      </View>
      <Pressable style={[styles.button, { marginTop: 16 }]} onPress={handleHaptic}>
        <Text style={styles.buttonText}>Android Haptic</Text>
      </Pressable>
      <StatusBar style="auto" />
    </View>
  );
}


function PlaceholderScreen({ title }: { title: string }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
}

function MediaScreen() {
  const videoRef = useRef<Video>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
useEffect(() => {
  return () => {
    sound?.unloadAsync();
  };
}, [sound]);

  useEffect(() => {
    return () => {
      sound?.unloadAsync();
      videoRef.current?.unloadAsync();
    };
  }, [sound]);

  const playSound = async () => {
    try {
      await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
      const { sound: s } = await Audio.Sound.createAsync(
        require('./assets/po_planu.mp3')
      );
      setSound(s);
      await s.setVolumeAsync(1.0);
      await s.playAsync();
    } catch (e: any) {
      if (Platform.OS === 'android') {
        ToastAndroid.show(`Audio error: ${e?.message ?? 'unknown'}`, ToastAndroid.LONG);
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Media</Text>
      <Image
        source={require('./assets/pig.jpeg')}
        style={{ width: 240, height: 160, borderRadius: 12, marginBottom: 16 }}
        contentFit="cover"
        transition={200}
      />
      <Video
        ref={videoRef}
        source={require('./assets/video.mp4')}
        style={{ width: 260, height: 160, backgroundColor: '#000', borderRadius: 12 }}
        useNativeControls
        resizeMode={ResizeMode.CONTAIN}
        isLooping
      />
      <Pressable style={[styles.button, { marginTop: 16 }]} onPress={playSound}>
        <Text style={styles.buttonText}>Play Sound</Text>
      </Pressable>
    </View>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Game" component={GameScreen} />
        <Stack.Screen name="Media" component={MediaScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 24,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    backgroundColor: '#0a7ea4',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
