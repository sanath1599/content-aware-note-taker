import React, { useState, useRef, useEffect } from "react";
import {
  Button,
  TextField,
  Typography,
  Box,
  Grid,
  Container,
  Divider,
  Fab,
  IconButton,
} from "@mui/material";
import { v4 as uuidv4 } from "uuid";
import { Mic, PictureAsPdf, Chat, Close } from "@mui/icons-material";
import axios from "axios";
import Chatbot from "react-chatbot-kit";
import config from "./chatbot/config";
import MessageParser from "./chatbot/MessageParser";
import ActionProvider from "./chatbot/ActionProvider";
import "react-chatbot-kit/build/main.css"


function App() {
  const [uuid, setUuid] = useState("");
  const [file, setFile] = useState(null);
  const [uploadEnable, setUploadEnable] = useState(true);
  const [uuidCheck, setUuidCheck] = useState("Generate / Enter UUID to upload Context");
  const [message, setMessage] = useState("");
  const [textToSpeak, setTextToSpeak] = useState("");
  const [recognition, setRecognition] = useState(null);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false); // State to control chatbot visibility
  const API_URL = process.env.REACT_APP_API_URL;
  const stateRef = React.createRef();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const uuidFromUrl = urlParams.get("uuid");

    if (uuidFromUrl) {
      setUuid(uuidFromUrl);
      setUploadEnable(false);
      setUuidCheck("Upload Context");
    }
  }, []);

  const generateUuid = () => {
    const newUuid = uuidv4();
    setUuid(newUuid);
    setMessage(`Generated UUID: ${newUuid}`);
    setUploadEnable(false);
    setUuidCheck("Upload Context");
    const newUrl = `${window.location.pathname}?uuid=${newUuid}`;
    window.history.replaceState(null, "", newUrl);
  };

  const handleUuidChange = (event) => {
    setUuid(event.target.value);
    if (event.target.value.length > 10) {
      setUploadEnable(false);
      setUuidCheck("Upload Context");
    } else {
      setUploadEnable(true);
      setUuidCheck("Need a longer UUID (At least 10 Char)");
    }
    setMessage("");
    const newUrl = `${window.location.pathname}?uuid=${uuid}`;
    window.history.replaceState(null, "", newUrl);
  };

  const handleFileChange = async (event) => {
    const selectedFile = event.target.files[0];
    const allowedTypes = ["application/pdf"];

    if (selectedFile && allowedTypes.includes(selectedFile.type)) {
      setFile(selectedFile);
      setMessage(`Selected file: ${selectedFile.name}`);

      try {
        const formData = new FormData();
        formData.append("file", selectedFile);
        formData.append("uuid", uuid);

        const response = await axios.post(`${API_URL}/api/notes/createContext`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        setMessage(response.data.message);
      } catch (error) {
        console.error("Error uploading file:", error);
        setMessage("Error uploading file.");
        if (error?.response?.data?.message) setMessage(error.response.data.message);
      }
    } else {
      setMessage("Invalid file type. Please select a valid document.");
    }
  };

  const accumulatedTranscript = useRef("");
  const delayTimer = useRef(null);

  const handleSpeak = () => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Your browser does not support speech recognition.");
      return;
    }

    const recognitionInstance = new window.webkitSpeechRecognition();
    recognitionInstance.continuous = true;
    recognitionInstance.interimResults = true;

    recognitionInstance.onresult = (event) => {
      let transcript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }

      setTextToSpeak(transcript);
      accumulatedTranscript.current = transcript;

      if (delayTimer.current) clearTimeout(delayTimer.current);

      delayTimer.current = setTimeout(() => {
        sendToAPI(accumulatedTranscript.current);
        accumulatedTranscript.current = "";
      }, 3000);
    };

    recognitionInstance.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
    };

    recognitionInstance.onend = () => {
      console.log("Speech recognition service disconnected");
      setRecognition(null);
    };
    recognitionInstance.start();
    setRecognition(recognitionInstance);
  };

  const handleStop = () => {
    if (recognition) {
      recognition.stop();
    }
  };

  const sendToAPI = async (speechText) => {
    try {
      await axios.post(`${API_URL}/api/notes/recordSpeech`, {
        uuid: uuid,
        transcript: speechText
      });
      console.log("Speech data sent successfully:", speechText);
    } catch (error) {
      console.error("Error sending speech data:", error);
    }
  };

  const generatePdf = async () => {
    try {
      const response = await axios.post(`${API_URL}/api/notes/generatePDF`, {
        uuid: uuid,
      }, {
        responseType: 'blob'
      });

      const pdfUrl = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = pdfUrl;
      link.setAttribute("download", "notes.pdf");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  };

  const toggleChatbot = () => {
    setIsChatbotOpen(!isChatbotOpen);
  };

  return (
    <div className="App">
      <header className="App-header">
        {isChatbotOpen && (
          <Box
            sx={{
              position: "fixed",
              bottom: "80px",
              right: "20px",
              width: "300px",
              height: "580px",
              borderRadius: "10px",
              boxShadow: 3,
              backgroundColor: "white",
              zIndex: 10,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            {/* Chatbot Header with Close Icon */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "8px",
                backgroundColor: "#3f51b5",
                color: "white",
                borderTopLeftRadius: "10px",
                borderTopRightRadius: "10px",
              }}
            >
              <Typography variant="h6" sx={{ fontSize: "1rem" }}>
                Chatbot
              </Typography>
              <IconButton size="small" color="inherit" onClick={toggleChatbot}>
                <Close />
              </IconButton>
            </Box>

            {/* Chatbot Body with Message Styling */}
            <Box sx={{ flex: 1, overflowY: "auto", padding: "8px" }}>
              <Chatbot
                config={config}
                actionProvider={ActionProvider}
                messageParser={MessageParser}
                stateRef={stateRef}
                messageStyle={{
                  botMessageBox: {
                    display: "flex",
                    alignItems: "flex-start",
                    backgroundColor: "#e0e0e0",
                    borderRadius: "15px 15px 15px 0px",
                    padding: "10px",
                    marginBottom: "10px",
                    maxWidth: "75%",
                  },
                  userMessageBox: {
                    display: "flex",
                    alignItems: "flex-end",
                    backgroundColor: "#3f51b5",
                    color: "#fff",
                    borderRadius: "15px 15px 0px 15px",
                    padding: "10px",
                    marginBottom: "10px",
                    marginLeft: "auto",
                    maxWidth: "75%",
                  },
                  botAvatarStyle: {
                    marginRight: "8px",
                    width: "24px",
                    height: "24px",
                  },
                  userAvatarStyle: {
                    marginLeft: "8px",
                    width: "24px",
                    height: "24px",
                  },
                }}
              />
            </Box>
          </Box>
        )}
      </header>

      <Container maxWidth="lg" style={{ marginTop: "20px" }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Box p={3} border={1} borderColor="grey.300" borderRadius="8px" bgcolor="grey.50">
              <Typography variant="h5" gutterBottom>
                Configuration Panel
              </Typography>
              <Divider style={{ marginBottom: "16px" }} />

              <Button
                variant="contained"
                color="primary"
                onClick={generateUuid}
                fullWidth
                aria-label="Generate new UUID"
                style={{ marginBottom: "16px" }}
              >
                Generate New UUID
              </Button>

              <TextField
                label="Enter UUID (or generated UUID)"
                variant="outlined"
                fullWidth
                value={uuid}
                onChange={handleUuidChange}
                aria-describedby="uuid-input-description"
                style={{ marginBottom: "16px" }}
              />
              <Typography id="uuid-input-description" variant="body2" color="textSecondary">
                Please enter at least 10 characters for the UUID.
              </Typography>

              <Button
                variant="contained"
                component="label"
                fullWidth
                color="secondary"
                style={{ marginBottom: "16px" }}
                aria-label={uuidCheck}
              >
                {uuidCheck}
                <input
                  type="file"
                  hidden
                  disabled={uploadEnable}
                  accept=".txt, .pdf, .ppt, .pptx, .doc, .docx"
                  onChange={handleFileChange}
                  aria-label="Upload file"
                />
              </Button>

              {message && (
                <Typography color="textSecondary" variant="body1" role="alert">
                  {message}
                </Typography>
              )}
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Box p={3} border={1} borderColor="grey.300" borderRadius="8px" bgcolor="grey.100">
              <Typography variant="h5" gutterBottom>
                Content Aware Note Taker
              </Typography>

              <TextField
                label="Text from Speech"
                variant="outlined"
                fullWidth
                multiline
                rows={4}
                value={textToSpeak}
                onChange={(e) => setTextToSpeak(e.target.value)}
                style={{ marginBottom: "16px" }}
                aria-label="Transcribed text"
              />

              <Button
                variant="contained"
                color="primary"
                onClick={handleSpeak}
                startIcon={<Mic />}
                style={{ marginRight: "8px" }}
                aria-label="Start speech recognition"
              >
                Speak
              </Button>
              <Button
                variant="contained"
                color="secondary"
                onClick={handleStop}
                aria-label="Stop speech recognition"
              >
                Stop
              </Button>

              <Button
                variant="contained"
                color="success"
                onClick={generatePdf}
                startIcon={<PictureAsPdf />}
                disabled={recognition !== null}
                style={{ float: "right", marginTop: "16px" }}
                aria-label="Generate PDF"
              >
                Generate PDF
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Container>

      {/* Floating Action Button for Chatbot */}
      <Fab
        color="primary"
        sx={{ position: "fixed", bottom: 16, right: 16 }}
        onClick={toggleChatbot}
        aria-label="Open chatbot"
      >
        <Chat />
      </Fab>
    </div>
  );
}

export default App;
