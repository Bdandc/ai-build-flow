import React from "react";
import { SafeAreaView, Text, Pressable } from "react-native";
import { StatusBar } from "expo-status-bar";
export default function App() {
  return (
    <SafeAreaView style={{ flex:1, alignItems:"center", justifyContent:"center" }}>
      <Text style={{ fontSize:20, marginBottom:16 }}>AI Build Flow – Mobile</Text>
      <Pressable onPress={() => console.log("Hello from mobile")}
        style={{ paddingHorizontal:16, paddingVertical:10, backgroundColor:"black", borderRadius:8 }}>
        <Text style={{ color:"white" }}>Tap me</Text>
      </Pressable>
      <StatusBar style="auto" />
    </SafeAreaView>
  );
}
