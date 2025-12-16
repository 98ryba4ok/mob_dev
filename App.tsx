import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  Platform,
  BackHandler,
  ToastAndroid,
} from 'react-native';
import { useEffect, useState } from 'react';

import GameScreen from './src/screens/GameScreen';
import WelcomeScreen from './src/screens/WelcomeScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import LeaderboardScreen from './src/screens/LeaderboardScreen';
import RulesScreen from './src/screens/RulesScreen';
import ProgressScreen from './src/screens/ProgressScreen';
import AuthScreen from './src/screens/AuthScreen';
import { authService } from './src/services/auth';

type RootStackParamList = {
  Welcome: undefined;
  Auth: undefined;
  Home: undefined;
  Game: undefined;
  Settings: undefined;
  Leaderboard: undefined;
  Rules: undefined;
  Progress: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

// ================= HOME SCREEN =================

function HomeScreen({ navigation, onLogout }: any) {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    if (Platform.OS === 'android') {
      let backPressed = false;

      const onBackPress = () => {
        if (backPressed) {
          BackHandler.exitApp();
          return true;
        }

        backPressed = true;
        ToastAndroid.show('Нажмите еще раз для выхода', ToastAndroid.SHORT);

        setTimeout(() => {
          backPressed = false;
        }, 1500);

        return true;
      };

      const sub = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress
      );
      return () => sub.remove();
    }
  }, []);

  const loadUser = async () => {
    const currentUser = await authService.getCurrentUser();
    setUser(currentUser);
  };

  const handleLogout = async () => {
    await authService.logout();
    onLogout();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Wordle RN</Text>

      {user && (
        <Text style={styles.userInfo}>
          Привет, {user.username}! Очки: {user.totalScore || 0}
        </Text>
      )}

      <View style={styles.menu}>
        <Pressable
          style={styles.menuButton}
          onPress={() => navigation.navigate('Game')}
        >
          <Text style={styles.menuButtonText}>🎮 Играть</Text>
        </Pressable>

        <Pressable
          style={styles.menuButton}
          onPress={() => navigation.navigate('Progress')}
        >
          <Text style={styles.menuButtonText}>📊 Статистика</Text>
        </Pressable>

        <Pressable
          style={styles.menuButton}
          onPress={() => navigation.navigate('Leaderboard')}
        >
          <Text style={styles.menuButtonText}>🏆 Рейтинг</Text>
        </Pressable>

        <Pressable
          style={styles.menuButton}
          onPress={() => navigation.navigate('Rules')}
        >
          <Text style={styles.menuButtonText}>📖 Правила</Text>
        </Pressable>

        <Pressable
          style={styles.menuButton}
          onPress={() => navigation.navigate('Settings')}
        >
          <Text style={styles.menuButtonText}>⚙️ Настройки</Text>
        </Pressable>

        {user && (
          <Pressable
            style={[styles.menuButton, styles.logoutButton]}
            onPress={handleLogout}
          >
            <Text style={styles.menuButtonText}>🚪 Выйти</Text>
          </Pressable>
        )}
      </View>

      <StatusBar style="auto" />
    </View>
  );
}

// ================= APP =================

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [showWelcome, setShowWelcome] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const authenticated = await authService.isAuthenticated();
    setIsAuthenticated(authenticated);
  };

  const handleWelcomeFinish = () => {
    setShowWelcome(false);
  };

  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
    setShowWelcome(false);
  };

  if (isAuthenticated === null) {
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {showWelcome && !isAuthenticated ? (
          <Stack.Screen name="Welcome">
            {() => <WelcomeScreen onFinish={handleWelcomeFinish} />}
          </Stack.Screen>
        ) : !isAuthenticated ? (
          <Stack.Screen name="Auth">
            {() => <AuthScreen onAuthSuccess={handleAuthSuccess} />}
          </Stack.Screen>
        ) : (
          <>
            <Stack.Screen name="Home">
              {(props) => (
                <HomeScreen
                  {...props}
                  onLogout={() => {
                    setIsAuthenticated(false);
                    setShowWelcome(false);
                  }}
                />
              )}
            </Stack.Screen>

            <Stack.Screen name="Game" component={GameScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
            <Stack.Screen name="Leaderboard" component={LeaderboardScreen} />
            <Stack.Screen name="Rules" component={RulesScreen} />
            <Stack.Screen name="Progress" component={ProgressScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d0d0d',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 20,
  },
  userInfo: {
    fontSize: 16,
    color: '#ccc',
    marginBottom: 30,
  },
  menu: {
    width: '100%',
    maxWidth: 400,
  },
  menuButton: {
    backgroundColor: '#0a84ff',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  logoutButton: {
    backgroundColor: '#e74c3c',
    marginTop: 20,
  },
  menuButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
