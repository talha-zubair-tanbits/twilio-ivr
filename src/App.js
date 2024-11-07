import React, { useState, useEffect } from "react";
import axios from "axios";
import { Device } from "@twilio/voice-sdk";

function App() {
  const [device, setDevice] = useState(null);
  const [status, setStatus] = useState("Initializing...");
  const [connection, setConnection] = useState(null);

  const [token, setToken] = useState(null);

  const initializeCommunication = async (token) => {
    try {
      const clientIdentity = "sales"; // Make sure to replace with actual client identity
      console.log("Requesting token for identity:", clientIdentity);
      // Initialize the Twilio Device with the token
      const newDevice = new Device(token, {
        debug: true,
      });
      console.log("newdddd", newDevice.eventNames());
      newDevice.on("ready", () => {
        console.log("Twilio Device is ready to receive calls.");
        setStatus("Ready to receive calls!");
        setDevice(newDevice);
      });
      newDevice.on("error", (error) => {
        console.error("Twilio Device error:", error.message);
        setStatus(`Error: ${error.message}`);
      });

      newDevice.on("incoming", (conn) => {
        console.log("Incoming call from:", conn.parameters.From);
        setStatus("Incoming call...");
        setConnection(conn);
      });
    } catch (error) {
      console.error("Error loading token or initializing device:", error);
      setStatus("Failed to load token or initialize device");
    }
  };
  // useEffect hook with async function
  useEffect(() => {
    if (token) {
      initializeCommunication(token);
    }
  }, [token]);

  useEffect(() => {
    getToken().then((response) => {
      console.log(response);
      setToken(response);
    });
  }, []);

  // Handlers for accepting and rejecting calls
  const acceptCall = () => {
    if (connection) {
      console.log("Accepting call from:", connection.parameters.From);
      connection.accept();
      setStatus("Call in progress");
      connection.once("disconnect", () => {
        console.log("Call disconnected.");
        setStatus("Call ended");
        setConnection(null); // Clear the connection after the call ends
      });
    }
  };

  const rejectCall = () => {
    if (connection) {
      console.log("Rejecting call from:", connection.parameters.From);
      connection.reject();
      setStatus("Call rejected");
      setConnection(null); // Clear the connection after rejecting the call
    }
  };

  return (
    <div>
      <h1>Twilio Client Application</h1>
      <p>Status: {status}</p>
      {connection && (
        <div>
          <button onClick={acceptCall}>Accept Call</button>
          <button onClick={rejectCall}>Reject Call</button>
        </div>
      )}
    </div>
  );
}

export default App;

async function getToken() {
  try {
    const response = await axios.get(
      `https://twilio-ivr-be-production.up.railway.app/token?identity=${encodeURIComponent(
        "sales"
      )}`
    );
    const token = response.data.token;
    return token;
  } catch (error) {
    console.error("Failed to retrieve token:", error.message);
    // Handle or throw the error depending on your error handling policy
    throw new Error("Could not retrieve the token: " + error.message);
  }
}
