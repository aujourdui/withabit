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
import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  deleteDoc, 
  updateDoc, 
  query, 
  orderBy,
  onSnapshot
} from "firebase/firestore";
import { ensureAnonymousAuth, db } from "./firebase";

export default function App() {
  const [habits, setHabits] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newHabitName, setNewHabitName] = useState("");
  const [loading, setLoading] = useState(true);
  const [userID, setUserID] = useState(null);
  const [completedToday, setCompletedToday] = useState({});

  useEffect(() => {
    initializeApp();
  }, []);

  const loadTodayCompletions = (uid) => {
    try {
      const today = new Date().toISOString().split("T")[0];
      const recordsRef = collection(db, `users/${uid}/records`);
      
      // Real-time listener for today's completions
      const unsubscribe = onSnapshot(recordsRef, (querySnapshot) => {
        const todayCompletions = {};
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.date === today) {
            todayCompletions[data.habitId] = true;
          }
        });
        setCompletedToday(todayCompletions);
      }, (error) => {
        console.error("Error loading today's completions:", error);
      });

      return unsubscribe;
    } catch (error) {
      console.error("Error setting up completions listener:", error);
    }
  };

  const initializeApp = async () => {
    try {
      const uid = await ensureAnonymousAuth();
      setUserID(uid);
      loadHabits(uid);
      loadTodayCompletions(uid);
    } catch (error) {
      console.error("Failed to initialize app:", error);
      Alert.alert(
        "初期化エラー",
        "アプリの初期化に失敗しました。ネットワーク接続を確認してください。"
      );
      setLoading(false);
    }
  };

  const loadHabits = (uid) => {
    try {
      const habitsRef = collection(db, `users/${uid}/habits`);
      const q = query(habitsRef, orderBy("createdAt", "asc"));
      
      // Real-time listener for habits
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const habitsData = [];
        querySnapshot.forEach((doc) => {
          habitsData.push({
            id: doc.id,
            ...doc.data()
          });
        });
        setHabits(habitsData);
        setLoading(false);
      }, (error) => {
        console.error("Error loading habits:", error);
        Alert.alert(
          "データ読み込みエラー",
          "データの読み込みに失敗しました。ネットワーク接続を確認してください。"
        );
        setLoading(false);
      });

      return unsubscribe;
    } catch (error) {
      console.error("Error setting up habits listener:", error);
      setLoading(false);
    }
  };

  const addHabit = async () => {
    if (!newHabitName.trim() || !userID) return;

    try {
      const habitId = Date.now().toString();
      const habitRef = doc(db, `users/${userID}/habits/${habitId}`);
      
      await setDoc(habitRef, {
        name: newHabitName.trim(),
        totalCount: 0,
        createdAt: new Date(),
      });

      setNewHabitName("");
      setModalVisible(false);
    } catch (error) {
      console.error("Error adding habit:", error);
      Alert.alert(
        "追加エラー",
        "習慣の追加に失敗しました。もう一度お試しください。"
      );
    }
  };

  const markAsCompleted = async (habitId) => {
    if (!userID) return;

    const today = new Date().toISOString().split("T")[0];
    
    // Check if already completed today using state
    if (completedToday[habitId]) {
      return; // Already completed today
    }
    
    try {
      // Add completion record
      const recordRef = doc(db, `users/${userID}/records/${habitId}_${today}`);
      await setDoc(recordRef, {
        habitId,
        date: today,
        completedAt: new Date(),
      });

      // Update habit total count
      const habitRef = doc(db, `users/${userID}/habits/${habitId}`);
      const habit = habits.find(h => h.id === habitId);
      if (habit) {
        await updateDoc(habitRef, {
          totalCount: habit.totalCount + 1,
        });
      }
    } catch (error) {
      console.error("Error marking habit as completed:", error);
      Alert.alert(
        "完了エラー",
        "習慣の完了記録に失敗しました。もう一度お試しください。"
      );
    }
  };

  const deleteHabit = async (habitId) => {
    if (!userID) return;

    Alert.alert("習慣を削除", "本当に削除しますか？", [
      { text: "キャンセル", style: "cancel" },
      {
        text: "削除",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteDoc(doc(db, `users/${userID}/habits/${habitId}`));
          } catch (error) {
            console.error("Error deleting habit:", error);
            Alert.alert(
              "削除エラー",
              "習慣の削除に失敗しました。もう一度お試しください。"
            );
          }
        },
      },
    ]);
  };

  const getTodayStatus = (habit) => {
    return completedToday[habit.id] || false;
  };

  const isAllHabitsCompleted = () => {
    if (habits.length === 0) return false;
    return habits.every((habit) => getTodayStatus(habit));
  };

  const getHabitStats = () => {
    const total = habits.length;
    const completed = habits.filter((habit) => getTodayStatus(habit)).length;
    const remaining = total - completed;
    return { total, completed, remaining };
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

  const stats = getHabitStats();

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.loadingText}>読み込み中...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>withabit</Text>
      <Text style={styles.subtitle}>習慣とともに生きよう</Text>

      {stats.total > 0 && (
        <View style={styles.statsContainer}>
          <Text style={styles.statsText}>
            今日の進捗: {stats.completed}/{stats.total} 
            {stats.remaining > 0 && ` (残り${stats.remaining}個)`}
          </Text>
        </View>
      )}

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
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 18,
    color: "#666",
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
    marginBottom: 10,
  },
  statsContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 15,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#4a90e2",
  },
  statsText: {
    fontSize: 16,
    color: "#333",
    textAlign: "center",
    fontWeight: "600",
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