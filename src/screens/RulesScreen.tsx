import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';

interface RulesScreenProps {
  navigation: any;
}

export default function RulesScreen({ navigation }: RulesScreenProps) {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Правила игры</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Как играть</Text>
          <Text style={styles.text}>
            Цель игры — угадать загаданное слово из 5 букв за ограниченное количество попыток.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Цветовые подсказки</Text>
          <View style={styles.hintRow}>
            <View style={[styles.colorBox, { backgroundColor: '#2ecc71' }]} />
            <Text style={styles.text}>
              <Text style={styles.bold}>Зеленый</Text> — буква угадана правильно и находится на правильной позиции
            </Text>
          </View>
          <View style={styles.hintRow}>
            <View style={[styles.colorBox, { backgroundColor: '#f1c40f' }]} />
            <Text style={styles.text}>
              <Text style={styles.bold}>Желтый</Text> — буква есть в слове, но находится на другой позиции
            </Text>
          </View>
          <View style={styles.hintRow}>
            <View style={[styles.colorBox, { backgroundColor: '#7f8c8d' }]} />
            <Text style={styles.text}>
              <Text style={styles.bold}>Серый</Text> — буквы нет в слове
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Сложность</Text>
          <Text style={styles.text}>
            • <Text style={styles.bold}>Легкая:</Text> 8 попыток{'\n'}
            • <Text style={styles.bold}>Средняя:</Text> 6 попыток{'\n'}
            • <Text style={styles.bold}>Сложная:</Text> 4 попытки
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Подсказки</Text>
          <Text style={styles.text}>
            После второй попытки вы будете получать подсказки о буквах в загаданном слове.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Очки</Text>
          <Text style={styles.text}>
            Вы получаете очки за каждую победу. Чем меньше попыток использовано, тем больше очков!
          </Text>
        </View>

        <Pressable
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Понятно</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d0d0d',
  },
  content: {
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 30,
    textAlign: 'center',
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  text: {
    fontSize: 16,
    color: '#ccc',
    lineHeight: 24,
  },
  bold: {
    fontWeight: '600',
    color: '#fff',
  },
  hintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  colorBox: {
    width: 30,
    height: 30,
    borderRadius: 6,
    marginRight: 12,
  },
  backButton: {
    backgroundColor: '#0a84ff',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

