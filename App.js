import React, { useState, useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function App() {
  const [habits, setHabits] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newHabitName, setNewHabitName] = useState("");

  useEffect(() => {
    loadHabits();
  }, []);

  const loadHabits = async () => {
    try {
      const savedHabits = await AsyncStorage.getItem("habits");
      if (savedHabits) {
        setHabits(JSON.parse(savedHabits));
      }
    } catch (error) {
      console.error("Error loading habits:", error);
      Alert.alert(
        "データ読み込みエラー",
        "データの読み込みに失敗しました。アプリを再起動してください。"
      );
    }
  };

  const saveHabits = async (habitsToSave) => {
    try {
      await AsyncStorage.setItem("habits", JSON.stringify(habitsToSave));
    } catch (error) {
      console.error("Error saving habits:", error);
      Alert.alert(
        "データ保存エラー",
        "データの保存に失敗しました。ストレージ容量を確認してください。"
      );
    }
  };

  const addHabit = () => {
    if (newHabitName.trim()) {
      const newHabit = {
        id: Date.now().toString(),
        name: newHabitName.trim(),
        totalCount: 0,
        completionDates: [],
      };
      const updatedHabits = [...habits, newHabit];
      setHabits(updatedHabits);
      saveHabits(updatedHabits);
      setNewHabitName("");
      setModalVisible(false);
    }
  };

  const markAsCompleted = (habitId) => {
    const today = new Date().toISOString().split("T")[0];
    const updatedHabits = habits.map((habit) => {
      if (habit.id === habitId) {
        const alreadyCompleted = habit.completionDates.includes(today);
        if (!alreadyCompleted) {
          return {
            ...habit,
            totalCount: habit.totalCount + 1,
            completionDates: [...habit.completionDates, today],
          };
        }
      }
      return habit;
    });
    setHabits(updatedHabits);
    saveHabits(updatedHabits);
  };

  const deleteHabit = (habitId) => {
    Alert.alert("習慣を削除", "本当に削除しますか？", [
      { text: "キャンセル", style: "cancel" },
      {
        text: "削除",
        style: "destructive",
        onPress: () => {
          const updatedHabits = habits.filter((habit) => habit.id !== habitId);
          setHabits(updatedHabits);
          saveHabits(updatedHabits);
        },
      },
    ]);
  };

  const getTodayStatus = (habit) => {
    const today = new Date().toISOString().split("T")[0];
    return habit.completionDates.includes(today);
  };

  const isAllHabitsCompleted = () => {
    if (habits.length === 0) return false;
    return habits.every((habit) => getTodayStatus(habit));
  };

  const renderHabitItem = ({ item }) => {
    const completedToday = getTodayStatus(item);

    return (
      <View style={styles.habitItem}>
        <View style={styles.habitInfo}>
          <Text style={styles.habitName}>{item.name}</Text>
          <Text style={styles.habitCount}>累計: {item.totalCount}日</Text>
        </View>
        <View style={styles.habitActions}>
          <TouchableOpacity
            style={[
              styles.checkButton,
              completedToday && styles.completedButton,
            ]}
            onPress={() => markAsCompleted(item.id)}
            disabled={completedToday}
          >
            <Text
              style={[
                styles.checkButtonText,
                completedToday && styles.completedButtonText,
              ]}
            >
              {completedToday ? "✓ 完了" : "今日やった？"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => deleteHabit(item.id)}
          >
            <Text style={styles.deleteButtonText}>削除</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>withabit</Text>
      <Text style={styles.subtitle}>習慣とともに生きよう</Text>

      {isAllHabitsCompleted() && (
        <View style={styles.completionMessage}>
          <Text style={styles.completionText}>🎉</Text>
          <Text style={styles.completionText}>今日の習慣は全て完了しました。</Text>
          <Text style={styles.completionText}>お疲れ様でした！</Text>
        </View>
      )}

      <FlatList
        data={habits}
        renderItem={renderHabitItem}
        keyExtractor={(item) => item.id}
        style={styles.habitList}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            まだ習慣がありません。{"\n"}「+」ボタンで習慣を追加しましょう！
          </Text>
        }
      />

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.addButtonText}>+ 習慣を追加</Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>新しい習慣を追加</Text>
            <TextInput
              style={styles.textInput}
              placeholder="習慣名を入力（例：スクワット）"
              value={newHabitName}
              onChangeText={setNewHabitName}
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setModalVisible(false);
                  setNewHabitName("");
                }}
              >
                <Text style={styles.cancelButtonText}>キャンセル</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={addHabit}>
                <Text style={styles.saveButtonText}>追加</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    paddingTop: 50,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    color: "#4a90e2",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    color: "#666",
    marginBottom: 30,
  },
  completionMessage: {
    backgroundColor: "#d4edda",
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 10,
    borderColor: "#c3e6cb",
    borderWidth: 1,
    alignItems: "center",
  },
  completionText: {
    fontSize: 18,
    color: "#155724",
    textAlign: "center",
    marginBottom: 5,
    fontWeight: "bold",
  },
  habitList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  habitItem: {
    backgroundColor: "white",
    padding: 20,
    marginBottom: 15,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  habitInfo: {
    marginBottom: 15,
  },
  habitName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  habitCount: {
    fontSize: 14,
    color: "#666",
  },
  habitActions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  checkButton: {
    backgroundColor: "#4a90e2",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    flex: 1,
    marginRight: 10,
  },
  completedButton: {
    backgroundColor: "#5cb85c",
  },
  checkButtonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
  },
  completedButtonText: {
    color: "white",
  },
  deleteButton: {
    backgroundColor: "#d9534f",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 25,
  },
  deleteButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  emptyText: {
    textAlign: "center",
    color: "#666",
    fontSize: 16,
    marginTop: 50,
    lineHeight: 24,
  },
  addButton: {
    backgroundColor: "#4a90e2",
    margin: 20,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  addButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    margin: 20,
    padding: 30,
    borderRadius: 10,
    width: "80%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 15,
    borderRadius: 5,
    marginBottom: 20,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cancelButton: {
    backgroundColor: "#ccc",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
    flex: 1,
    marginRight: 10,
  },
  cancelButtonText: {
    textAlign: "center",
    color: "#333",
  },
  saveButton: {
    backgroundColor: "#4a90e2",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
    flex: 1,
  },
  saveButtonText: {
    textAlign: "center",
    color: "white",
    fontWeight: "bold",
  },
});
