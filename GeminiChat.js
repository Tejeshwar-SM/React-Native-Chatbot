import React, { useState, useEffect, useRef } from "react";
import * as GoogleGenerativeAI from "@google/generative-ai";
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import * as Speech from "expo-speech";
import { FontAwesome } from "@expo/vector-icons";
import { Entypo } from "@expo/vector-icons";
import FlashMessage, { showMessage } from "react-native-flash-message";

const GeminiChat = () => {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showStopIcon, setShowStopIcon] = useState(false);

  const flatListRef = useRef(null); // Reference for the FlatList

  const API_KEY = "AIzaSyCc7_hOSQRw4rMtbHHUpZXSM8NFyzb37QI";

  useEffect(() => {
    const startChat = async () => {
      const genAI = new GoogleGenerativeAI.GoogleGenerativeAI(API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const prompt = "hello! ";
      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();
      console.log(text);
      showMessage({
        message: "Welcome to Gemini Chat 🤖",
        description: text,
        type: "info",
        icon: "info",
        duration: 2000,
      });
      setMessages([
        {
          text,
          user: false,
        },
      ]);
    };
    startChat();
  }, []);

  const sendMessage = async () => {
    setLoading(true);
    const userMessage = { text: userInput, user: true };
    setMessages((prevMessages) => [...prevMessages, userMessage]);

    const genAI = new GoogleGenerativeAI.GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const prompt = userMessage.text;
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    setMessages((prevMessages) => [...prevMessages, { text, user: false }]);
    setLoading(false);
    setUserInput(""); // Reset the input field

    if (text && !isSpeaking) {
      Speech.speak(text);
      setIsSpeaking(true);
      setShowStopIcon(true);
    }
  };

  const toggleSpeech = () => {
    if (isSpeaking) {
      Speech.stop();
      setIsSpeaking(false);
    } else {
      Speech.speak(messages[messages.length - 1].text);
      setIsSpeaking(true);
    }
  };

  const ClearMessage = () => {
    setMessages([]);
    setIsSpeaking(false);
  };

  const renderMessage = ({ item }) => (
    <View
      style={[
        styles.messageContainer,
        item.user ? styles.userMessageContainer : styles.botMessageContainer,
      ]}
    >
      <Text
        style={[
          styles.messageText,
          item.user ? styles.userMessageText : styles.botMessageText,
        ]}
      >
        {item.text}
      </Text>
    </View>
  );

  useEffect(() => {
    if (flatListRef.current) {
      flatListRef.current.scrollToEnd({ animated: true }); // Automatically scroll to the bottom
    }
  }, [messages]); // Scroll to the bottom whenever the messages change

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef} // Assign reference to FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={styles.messagesList}
      />
      <View style={styles.inputContainer}>
        <TouchableOpacity style={styles.micIcon} onPress={toggleSpeech}>
          {isSpeaking ? (
            <FontAwesome name="microphone-slash" size={28} color="white" />
          ) : (
            <FontAwesome name="microphone" size={28} color="white" />
          )}
        </TouchableOpacity>
        <TextInput
          placeholder="Type a message"
          onChangeText={setUserInput}
          value={userInput}
          onSubmitEditing={() => {
            sendMessage();
            setUserInput(""); // Reset the text input here after submitting
          }}
          style={styles.input}
          placeholderTextColor="#fff"
        />
        {showStopIcon && (
          <TouchableOpacity style={styles.stopIcon} onPress={ClearMessage}>
            <Entypo name="controller-stop" size={28} color="white" />
          </TouchableOpacity>
        )}
      </View>
      <FlashMessage position={"top"} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f0f0", // Light background for the chat
    marginTop: 50,
    padding: 10,
  },
  messagesList: {
    paddingBottom: 20, // Padding for better message spacing
  },
  messageContainer: {
    maxWidth: "80%",
    marginBottom: 10,
    borderRadius: 10,
    padding: 12,
    marginHorizontal: 15,
  },
  userMessageContainer: {
    backgroundColor: "#4C6B9F", // User's message color
    alignSelf: "flex-end",
  },
  botMessageContainer: {
    backgroundColor: "#B0C7F9", // Bot's message color
    alignSelf: "flex-start",
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
    color: "#fff",
  },
  userMessageText: {
    textAlign: "right",
  },
  botMessageText: {
    textAlign: "left",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    backgroundColor: "#131314",
    borderRadius: 30,
    padding: 10,
  },
  input: {
    flex: 1,
    height: 45,
    borderRadius: 30,
    backgroundColor: "#222",
    color: "white",
    paddingLeft: 15,
    fontSize: 16,
  },
  micIcon: {
    backgroundColor: "#4C6B9F",
    padding: 12,
    borderRadius: 25,
    marginRight: 10,
  },
  stopIcon: {
    backgroundColor: "#E64A19", // Red color for stop icon
    padding: 12,
    borderRadius: 25,
    marginLeft: 10,
  },
});

export default GeminiChat;
